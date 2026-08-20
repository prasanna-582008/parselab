from typing import List, Dict, Set, Tuple, Optional
from app.engine.grammar import Grammar, Production, EPSILON

class GrammarConverterEngine:
    def __init__(self, grammar: Grammar):
        self.original_grammar = grammar
        self.transformed_productions: List[Production] = []
        self.transformations_log: List[Dict] = []
        
        self.convert()

    def convert(self):
        # Step 1: Remove Immediate Left Recursion
        current_prods = list(self.original_grammar.productions)
        non_terminals = list(self.original_grammar.non_terminals)

        new_prods: List[Production] = []
        rule_counter = 1

        for nt in non_terminals:
            nt_prods = [p for p in current_prods if p.lhs == nt]
            alpha_rules = []  # Left recursive: A -> A alpha
            beta_rules = []   # Non-left recursive: A -> beta

            for p in nt_prods:
                if not p.is_epsilon and p.rhs[0] == nt:
                    alpha_rules.append(p.rhs[1:])
                else:
                    beta_rules.append(p.rhs)

            if alpha_rules:
                new_nt = f"{nt}'"
                while new_nt in non_terminals:
                    new_nt += "'"
                
                self.transformations_log.append({
                    "type": "Left Recursion Removal",
                    "non_terminal": nt,
                    "new_non_terminal": new_nt,
                    "description": f"Eliminated direct left recursion on '{nt}' by creating new non-terminal '{new_nt}'."
                })

                # A -> beta A'
                for beta in beta_rules:
                    if beta == (EPSILON,):
                        rhs = (new_nt,)
                    else:
                        rhs = tuple(list(beta) + [new_nt])
                    new_prods.append(Production(nt, rhs, rule_id=rule_counter))
                    rule_counter += 1

                # A' -> alpha A' | eps
                for alpha in alpha_rules:
                    rhs = tuple(list(alpha) + [new_nt])
                    new_prods.append(Production(new_nt, rhs, rule_id=rule_counter))
                    rule_counter += 1

                new_prods.append(Production(new_nt, (EPSILON,), rule_id=rule_counter))
                rule_counter += 1
            else:
                for p in nt_prods:
                    new_prods.append(Production(p.lhs, p.rhs, rule_id=rule_counter))
                    rule_counter += 1

        # Step 2: Apply Left Factoring
        final_prods = self._apply_left_factoring(new_prods)

        self.transformed_productions = final_prods

    def _apply_left_factoring(self, prods: List[Production]) -> List[Production]:
        # Group productions by LHS
        lhs_groups: Dict[str, List[Tuple[str, ...]]] = {}
        for p in prods:
            if p.lhs not in lhs_groups:
                lhs_groups[p.lhs] = []
            lhs_groups[p.lhs].append(p.rhs)

        factored_prods: List[Production] = []
        rule_counter = 1

        for lhs, rhs_list in lhs_groups.items():
            # Find longest common prefix among pairs
            prefix = self._find_longest_common_prefix(rhs_list)
            if prefix and len(prefix) > 0:
                new_nt = f"{lhs}_factored"
                
                self.transformations_log.append({
                    "type": "Left Factoring",
                    "non_terminal": lhs,
                    "prefix": " ".join(prefix),
                    "new_non_terminal": new_nt,
                    "description": f"Factored common prefix '{' '.join(prefix)}' in '{lhs}' rules into '{new_nt}'."
                })

                prefix_len = len(prefix)
                matching = []
                non_matching = []

                for rhs in rhs_list:
                    if len(rhs) >= prefix_len and rhs[:prefix_len] == prefix:
                        matching.append(rhs)
                    else:
                        non_matching.append(rhs)

                # A -> prefix A'
                lhs_rhs = tuple(list(prefix) + [new_nt])
                factored_prods.append(Production(lhs, lhs_rhs, rule_id=rule_counter))
                rule_counter += 1

                for nm in non_matching:
                    factored_prods.append(Production(lhs, nm, rule_id=rule_counter))
                    rule_counter += 1

                # A' -> suffix | eps
                for m in matching:
                    suffix = m[prefix_len:]
                    if not suffix:
                        suffix = (EPSILON,)
                    factored_prods.append(Production(new_nt, suffix, rule_id=rule_counter))
                    rule_counter += 1
            else:
                for rhs in rhs_list:
                    factored_prods.append(Production(lhs, rhs, rule_id=rule_counter))
                    rule_counter += 1

        return factored_prods

    def _find_longest_common_prefix(self, rhs_list: List[Tuple[str, ...]]) -> Optional[Tuple[str, ...]]:
        if len(rhs_list) < 2:
            return None

        # Compare pairs to find prefixes of length >= 1
        for i in range(len(rhs_list)):
            for j in range(i + 1, len(rhs_list)):
                seq1, seq2 = rhs_list[i], rhs_list[j]
                if seq1 and seq2 and seq1[0] == seq2[0] and seq1[0] != EPSILON:
                    # Common prefix found
                    prefix = []
                    for k in range(min(len(seq1), len(seq2))):
                        if seq1[k] == seq2[k]:
                            prefix.append(seq1[k])
                        else:
                            break
                    return tuple(prefix)
        return None

    def get_transformed_grammar_text(self) -> str:
        # Reconstruct text
        lines = []
        lhs_order = []
        lhs_map = {}
        for p in self.transformed_productions:
            if p.lhs not in lhs_map:
                lhs_order.append(p.lhs)
                lhs_map[p.lhs] = []
            lhs_map[p.lhs].append(" ".join(p.rhs))

        for lhs in lhs_order:
            alts = " | ".join(lhs_map[lhs])
            lines.append(f"{lhs} → {alts}")

        return "\n".join(lines)

    def to_dict(self):
        transformed_text = self.get_transformed_grammar_text()
        transformed_g = Grammar(transformed_text)

        return {
            "original_text": self.original_grammar.raw_text,
            "transformed_text": transformed_text,
            "transformations_log": self.transformations_log,
            "transformed_grammar": transformed_g.to_dict()
        }
