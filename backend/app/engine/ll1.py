from typing import Dict, List, Set, Optional, Tuple, Any
import time
from app.engine.grammar import Grammar, Production, EPSILON, END_SYMBOL
from app.engine.first_follow import FirstFollowEngine

class LL1Engine:
    def __init__(self, grammar: Grammar):
        self.grammar = grammar
        self.ff_engine = FirstFollowEngine(grammar)
        self.table: Dict[str, Dict[str, List[Production]]] = {}
        self.conflicts: List[Dict] = []
        self.is_ll1: bool = True
        
        self.build_table()

    def build_table(self):
        # Column headers are terminals + $
        terminals_with_end = sorted(self.grammar.terminals) + [END_SYMBOL]

        for nt in self.grammar.non_terminals:
            self.table[nt] = {t: [] for t in terminals_with_end}

        for prod in self.grammar.productions:
            lhs = prod.lhs
            rhs_first = self.ff_engine.compute_first_of_sequence(prod.rhs)

            # Rule 1: For each terminal a in FIRST(rhs) \ {eps}
            for a in rhs_first:
                if a != EPSILON:
                    if a in self.table[lhs]:
                        self.table[lhs][a].append(prod)

            # Rule 2: If eps in FIRST(rhs), for each b in FOLLOW(lhs)
            if EPSILON in rhs_first:
                for b in self.ff_engine.follow.get(lhs, set()):
                    if b in self.table[lhs]:
                        # Avoid duplicate entries if rule already added
                        if prod not in self.table[lhs][b]:
                            self.table[lhs][b].append(prod)

        # Check conflicts
        for nt in self.grammar.non_terminals:
            for t, prods in self.table[nt].items():
                if len(prods) > 1:
                    self.is_ll1 = False
                    self.conflicts.append({
                        "non_terminal": nt,
                        "terminal": t,
                        "productions": [p.to_dict() for p in prods],
                        "type": "LL(1) Conflict"
                    })

    def parse(self, input_string: str) -> Dict[str, Any]:
        start_time = time.perf_counter()
        
        # Tokenize input string
        tokens = Grammar.tokenize_rhs(input_string)
        if not tokens or tokens == [EPSILON]:
            tokens = []
        input_tokens = [t for t in tokens if t != EPSILON] + [END_SYMBOL]

        # Stack holds tuples: (symbol, node_id)
        # Node ID structure for parse tree building
        node_counter = 0
        
        def create_node(label: str, parent_id: Optional[int] = None) -> Dict:
            nonlocal node_counter
            node_counter += 1
            return {
                "id": node_counter,
                "label": label,
                "children": [],
                "parent_id": parent_id
            }

        root_node = create_node(self.grammar.start_symbol)
        nodes_dict = {root_node["id"]: root_node}

        # Stack initialized with ($ , 0) and (StartSymbol, root_id)
        stack: List[Tuple[str, int]] = [(END_SYMBOL, 0), (self.grammar.start_symbol, root_node["id"])]
        input_ptr = 0

        steps = []
        step_number = 1
        table_lookups = 0
        accepted = False
        error_info = None

        max_steps = 500  # Prevent infinite loop on non-LL(1) or invalid inputs

        while step_number <= max_steps:
            current_input = input_tokens[input_ptr] if input_ptr < len(input_tokens) else END_SYMBOL
            stack_symbols = [s[0] for s in stack]
            remaining_input = " ".join(input_tokens[input_ptr:])

            if not stack:
                error_info = {
                    "position": input_ptr,
                    "token": current_input,
                    "expected": [],
                    "message": "Stack became empty unexpectedly."
                }
                break

            top_symbol, top_node_id = stack[-1]

            # 1. Accept Condition
            if top_symbol == END_SYMBOL and current_input == END_SYMBOL:
                steps.append({
                    "step": step_number,
                    "stack": list(stack_symbols),
                    "input": remaining_input,
                    "action": "ACCEPT",
                    "applied_rule": None
                })
                accepted = True
                break

            # 2. Match Terminal Condition
            if top_symbol == current_input:
                stack.pop()
                input_ptr += 1
                steps.append({
                    "step": step_number,
                    "stack": list(stack_symbols),
                    "input": remaining_input,
                    "action": f"Match '{current_input}'",
                    "applied_rule": None
                })
                step_number += 1
                continue

            # 3. Terminal Mismatch
            if top_symbol not in self.grammar.non_terminals:
                error_info = {
                    "position": input_ptr,
                    "token": current_input,
                    "expected": [top_symbol],
                    "reason": f"Expected terminal '{top_symbol}', but found '{current_input}'",
                    "suggestion": f"Check if symbol '{current_input}' is correct or missing token."
                }
                steps.append({
                    "step": step_number,
                    "stack": list(stack_symbols),
                    "input": remaining_input,
                    "action": f"ERROR: Mismatched terminal '{top_symbol}' vs '{current_input}'",
                    "applied_rule": None
                })
                break

            # 4. Non-terminal Expansion
            table_lookups += 1
            prods = self.table.get(top_symbol, {}).get(current_input, [])

            if not prods:
                expected_terminals = [t for t, rules in self.table.get(top_symbol, {}).items() if len(rules) > 0]
                error_info = {
                    "position": input_ptr,
                    "token": current_input,
                    "expected": expected_terminals,
                    "reason": f"No LL(1) parsing table entry for M[{top_symbol}, '{current_input}']",
                    "suggestion": f"Expected one of: {', '.join(expected_terminals)}"
                }
                steps.append({
                    "step": step_number,
                    "stack": list(stack_symbols),
                    "input": remaining_input,
                    "action": f"ERROR: M[{top_symbol}, '{current_input}'] is empty",
                    "applied_rule": None
                })
                break

            # Choose production (first if no conflict)
            selected_prod = prods[0]
            stack.pop()  # Pop non-terminal

            parent_node = nodes_dict.get(top_node_id)
            child_tuples = []

            # Push RHS symbols onto stack in reverse order
            if selected_prod.is_epsilon:
                child_node = create_node(EPSILON, parent_id=top_node_id)
                nodes_dict[child_node["id"]] = child_node
                if parent_node:
                    parent_node["children"].append(child_node)
            else:
                for sym in selected_prod.rhs:
                    c_node = create_node(sym, parent_id=top_node_id)
                    nodes_dict[c_node["id"]] = c_node
                    if parent_node:
                        parent_node["children"].append(c_node)
                    child_tuples.append((sym, c_node["id"]))

                # Push to stack in reverse
                for sym, nid in reversed(child_tuples):
                    stack.append((sym, nid))

            steps.append({
                "step": step_number,
                "stack": list(stack_symbols),
                "input": remaining_input,
                "action": f"Expand {selected_prod}",
                "applied_rule": selected_prod.to_dict()
            })

            step_number += 1

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        return {
            "accepted": accepted,
            "steps": steps,
            "total_steps": len(steps),
            "table_lookups": table_lookups,
            "execution_time_ms": round(elapsed_ms, 3),
            "parse_tree": root_node if accepted else None,
            "error": error_info
        }

    def to_dict(self):
        # Format table for frontend display
        terminals_with_end = sorted(self.grammar.terminals) + [END_SYMBOL]
        formatted_table = {}
        for nt in self.grammar.non_terminals:
            formatted_table[nt] = {}
            for t in terminals_with_end:
                prods = self.table[nt][t]
                formatted_table[nt][t] = [p.to_dict() for p in prods]

        return {
            "is_ll1": self.is_ll1,
            "terminals": terminals_with_end,
            "non_terminals": self.grammar.non_terminals,
            "table": formatted_table,
            "conflicts": self.conflicts
        }
