from typing import Dict, List, Set, Tuple, Optional, Any
import time
from app.engine.grammar import Grammar, Production, EPSILON, END_SYMBOL
from app.engine.first_follow import FirstFollowEngine

class LR0Item:
    def __init__(self, production: Production, dot_pos: int):
        self.production = production
        self.dot_pos = dot_pos  # 0 to len(rhs)

    @property
    def next_symbol(self) -> Optional[str]:
        if self.dot_pos < len(self.production.rhs):
            sym = self.production.rhs[self.dot_pos]
            if sym == EPSILON:
                return None
            return sym
        return None

    @property
    def is_complete(self) -> bool:
        if self.production.is_epsilon:
            return True
        return self.dot_pos >= len(self.production.rhs)

    def advance(self) -> 'LR0Item':
        return LR0Item(self.production, self.dot_pos + 1)

    def __repr__(self):
        rhs_list = list(self.production.rhs)
        if self.production.is_epsilon:
            rhs_with_dot = "."
        else:
            rhs_list.insert(self.dot_pos, ".")
            rhs_with_dot = " ".join(rhs_list)
        return f"{self.production.lhs} → {rhs_with_dot}"

    def __eq__(self, other):
        if not isinstance(other, LR0Item):
            return False
        return self.production == other.production and self.dot_pos == other.dot_pos

    def __hash__(self):
        return hash((self.production, self.dot_pos))

    def to_dict(self):
        return {
            "rule_id": self.production.rule_id,
            "lhs": self.production.lhs,
            "rhs": list(self.production.rhs),
            "dot_pos": self.dot_pos,
            "representation": str(self),
            "is_complete": self.is_complete
        }


class ItemSet:
    def __init__(self, state_id: int, items: Set[LR0Item]):
        self.state_id = state_id
        self.items = items

    def __eq__(self, other):
        if not isinstance(other, ItemSet):
            return False
        return self.items == other.items

    def __hash__(self):
        return hash(frozenset(self.items))

    def to_dict(self):
        # Sort items cleanly
        sorted_items = sorted(list(self.items), key=lambda item: (item.production.lhs, item.production.rule_id, item.dot_pos))
        return {
            "id": self.state_id,
            "name": f"I{self.state_id}",
            "items": [it.to_dict() for it in sorted_items]
        }


class SLREngine:
    def __init__(self, grammar: Grammar):
        self.grammar = grammar
        self.augmented_start = f"{grammar.start_symbol}'" if grammar.start_symbol else "S'"
        
        # Ensure augmented start symbol is unique
        while self.augmented_start in grammar.non_terminals:
            self.augmented_start += "'"

        # Augmented production S' -> S
        self.augmented_production = Production(self.augmented_start, (grammar.start_symbol,), rule_id=0)
        self.all_productions = [self.augmented_production] + grammar.productions
        
        # Build modified grammar for FIRST/FOLLOW calculations
        self.augmented_grammar = self._create_augmented_grammar()
        self.ff_engine = FirstFollowEngine(self.augmented_grammar)

        self.canonical_collection: List[ItemSet] = []
        self.transitions: List[Dict] = []  # {from_state, symbol, to_state}
        self.action_table: Dict[int, Dict[str, List[Dict]]] = {}  # state -> term -> list of actions
        self.goto_table: Dict[int, Dict[str, Optional[int]]] = {}   # state -> non_term -> state
        self.conflicts: List[Dict] = []
        self.is_slr: bool = True

        self.build_automaton()
        self.build_slr_tables()

    def _create_augmented_grammar(self) -> Grammar:
        aug_text = f"{self.augmented_start} -> {self.grammar.start_symbol}\n" + self.grammar.raw_text
        return Grammar(aug_text)

    def closure(self, items: Set[LR0Item]) -> Set[LR0Item]:
        closure_set = set(items)
        changed = True

        while changed:
            changed = False
            new_items = set()

            for item in closure_set:
                next_sym = item.next_symbol
                if next_sym and next_sym in self.grammar.non_terminals:
                    # Find productions for next_sym
                    for prod in self.grammar.get_productions_for(next_sym):
                        new_item = LR0Item(prod, 0)
                        if new_item not in closure_set and new_item not in new_items:
                            new_items.add(new_item)
                            changed = True

            closure_set.update(new_items)

        return closure_set

    def goto(self, items: Set[LR0Item], symbol: str) -> Set[LR0Item]:
        moved_items = set()
        for item in items:
            if item.next_symbol == symbol:
                moved_items.add(item.advance())
        return self.closure(moved_items)

    def build_automaton(self):
        initial_item = LR0Item(self.augmented_production, 0)
        initial_closure = self.closure({initial_item})
        
        start_state = ItemSet(0, initial_closure)
        self.canonical_collection = [start_state]

        all_symbols = sorted(self.grammar.terminals) + sorted(self.grammar.non_terminals)

        i = 0
        while i < len(self.canonical_collection):
            current_state = self.canonical_collection[i]

            for sym in all_symbols:
                goto_items = self.goto(current_state.items, sym)
                if goto_items:
                    # Check if state already exists in canonical collection
                    existing_state = None
                    for state in self.canonical_collection:
                        if state.items == goto_items:
                            existing_state = state
                            break

                    if existing_state is None:
                        new_state_id = len(self.canonical_collection)
                        new_state = ItemSet(new_state_id, goto_items)
                        self.canonical_collection.append(new_state)
                        target_id = new_state_id
                    else:
                        target_id = existing_state.state_id

                    self.transitions.append({
                        "from": current_state.state_id,
                        "to": target_id,
                        "symbol": sym
                    })

            i += 1

    def build_slr_tables(self):
        terminals_with_end = sorted(self.grammar.terminals) + [END_SYMBOL]

        for state in self.canonical_collection:
            sid = state.state_id
            self.action_table[sid] = {t: [] for t in terminals_with_end}
            self.goto_table[sid] = {nt: None for nt in self.grammar.non_terminals}

        # Fill Shift & GOTO entries from transitions
        for trans in self.transitions:
            from_st = trans["from"]
            to_st = trans["to"]
            sym = trans["symbol"]

            if sym in terminals_with_end:
                self.action_table[from_st][sym].append({
                    "type": "shift",
                    "state": to_st,
                    "representation": f"s{to_st}"
                })
            elif sym in self.grammar.non_terminals:
                self.goto_table[from_st][sym] = to_st

        # Fill Reduce & Accept entries
        for state in self.canonical_collection:
            sid = state.state_id
            for item in state.items:
                if item.is_complete:
                    if item.production.lhs == self.augmented_start:
                        # Accept on $
                        self.action_table[sid][END_SYMBOL].append({
                            "type": "accept",
                            "representation": "acc"
                        })
                    else:
                        # Reduce on FOLLOW(lhs)
                        lhs_follow = self.ff_engine.follow.get(item.production.lhs, set())
                        for a in lhs_follow:
                            if a in terminals_with_end:
                                action_entry = {
                                    "type": "reduce",
                                    "production": item.production.to_dict(),
                                    "representation": f"r{item.production.rule_id}"
                                }
                                # Avoid duplicate reduce actions if already added
                                if action_entry not in self.action_table[sid][a]:
                                    self.action_table[sid][a].append(action_entry)

        # Detect Conflicts
        for sid, row in self.action_table.items():
            for term, actions in row.items():
                if len(actions) > 1:
                    self.is_slr = False
                    shift_cnt = sum(1 for a in actions if a["type"] == "shift")
                    reduce_cnt = sum(1 for a in actions if a["type"] == "reduce")
                    conflict_type = "Shift/Reduce Conflict" if (shift_cnt > 0 and reduce_cnt > 0) else "Reduce/Reduce Conflict"

                    self.conflicts.append({
                        "state_id": sid,
                        "terminal": term,
                        "conflict_type": conflict_type,
                        "actions": actions
                    })

    def parse(self, input_string: str) -> Dict[str, Any]:
        start_time = time.perf_counter()

        tokens = Grammar.tokenize_rhs(input_string)
        if not tokens or tokens == [EPSILON]:
            tokens = []
        input_tokens = [t for t in tokens if t != EPSILON] + [END_SYMBOL]

        node_counter = 0
        def create_node(label: str, children: Optional[List[Dict]] = None) -> Dict:
            nonlocal node_counter
            node_counter += 1
            return {
                "id": node_counter,
                "label": label,
                "children": children or []
            }

        # Stack holds alternating (state_id, symbol_or_node)
        # We track stack as parallel lists: states = [0], nodes = [None]
        state_stack: List[int] = [0]
        node_stack: List[Dict] = []
        symbol_stack: List[str] = ["$"]

        input_ptr = 0
        steps = []
        step_number = 1
        table_lookups = 0
        accepted = False
        error_info = None

        max_steps = 500

        while step_number <= max_steps:
            current_state = state_stack[-1]
            current_input = input_tokens[input_ptr] if input_ptr < len(input_tokens) else END_SYMBOL
            remaining_input = " ".join(input_tokens[input_ptr:])
            stack_display = " ".join(f"{sym}_{st}" for sym, st in zip(symbol_stack, state_stack))

            table_lookups += 1
            actions = self.action_table.get(current_state, {}).get(current_input, [])

            if not actions:
                expected = [t for t, acts in self.action_table.get(current_state, {}).items() if len(acts) > 0]
                error_info = {
                    "position": input_ptr,
                    "token": current_input,
                    "expected": expected,
                    "reason": f"Syntax Error at state I{current_state} with lookahead '{current_input}'. No ACTION entry.",
                    "suggestion": f"Expected one of: {', '.join(expected)}"
                }
                steps.append({
                    "step": step_number,
                    "stack": stack_display,
                    "input": remaining_input,
                    "action": f"ERROR: No ACTION[{current_state}, '{current_input}']",
                    "applied_rule": None
                })
                break

            action = actions[0]  # Select first action if no conflict

            # 1. SHIFT Action
            if action["type"] == "shift":
                next_state = action["state"]
                term_node = create_node(current_input)

                state_stack.append(next_state)
                symbol_stack.append(current_input)
                node_stack.append(term_node)
                input_ptr += 1

                steps.append({
                    "step": step_number,
                    "stack": stack_display,
                    "input": remaining_input,
                    "action": f"Shift to I{next_state} (s{next_state})",
                    "applied_rule": None
                })

            # 2. REDUCE Action
            elif action["type"] == "reduce":
                prod_dict = action["production"]
                lhs = prod_dict["lhs"]
                rhs = prod_dict["rhs"]

                # Pop RHS symbols
                children = []
                if rhs == [EPSILON]:
                    children.append(create_node(EPSILON))
                else:
                    pop_count = len(rhs)
                    popped_nodes = []
                    for _ in range(pop_count):
                        state_stack.pop()
                        symbol_stack.pop()
                        popped_nodes.append(node_stack.pop())
                    children = list(reversed(popped_nodes))

                # Create parent non-terminal node
                parent_node = create_node(lhs, children=children)

                # GOTO lookup
                goto_state = state_stack[-1]
                table_lookups += 1
                next_state = self.goto_table.get(goto_state, {}).get(lhs)

                if next_state is None:
                    error_info = {
                        "position": input_ptr,
                        "token": current_input,
                        "expected": [],
                        "reason": f"GOTO Error: No transition for GOTO[{goto_state}, {lhs}]",
                        "suggestion": "Grammar definition may have unreachable states."
                    }
                    break

                state_stack.append(next_state)
                symbol_stack.append(lhs)
                node_stack.append(parent_node)

                steps.append({
                    "step": step_number,
                    "stack": stack_display,
                    "input": remaining_input,
                    "action": f"Reduce by rule #{prod_dict['id']}: {lhs} → {' '.join(rhs)} (r{prod_dict['id']})",
                    "applied_rule": prod_dict
                })

            # 3. ACCEPT Action
            elif action["type"] == "accept":
                steps.append({
                    "step": step_number,
                    "stack": stack_display,
                    "input": remaining_input,
                    "action": "ACCEPT",
                    "applied_rule": None
                })
                accepted = True
                break

            step_number += 1

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        final_tree = node_stack[-1] if accepted and node_stack else None

        return {
            "accepted": accepted,
            "steps": steps,
            "total_steps": len(steps),
            "table_lookups": table_lookups,
            "execution_time_ms": round(elapsed_ms, 3),
            "parse_tree": final_tree,
            "error": error_info
        }

    def to_dict(self):
        terminals_with_end = sorted(self.grammar.terminals) + [END_SYMBOL]
        
        # Format action table
        formatted_action = {}
        for sid in self.action_table:
            formatted_action[sid] = {}
            for t in terminals_with_end:
                acts = self.action_table[sid][t]
                formatted_action[sid][t] = acts

        # Format goto table
        formatted_goto = {}
        for sid in self.goto_table:
            formatted_goto[sid] = self.goto_table[sid]

        return {
            "is_slr": self.is_slr,
            "augmented_start": self.augmented_start,
            "augmented_production": self.augmented_production.to_dict(),
            "terminals": terminals_with_end,
            "non_terminals": self.grammar.non_terminals,
            "states": [st.to_dict() for st in self.canonical_collection],
            "transitions": self.transitions,
            "action_table": formatted_action,
            "goto_table": formatted_goto,
            "conflicts": self.conflicts
        }
