from typing import Dict, Set, List, Tuple
from app.engine.grammar import Grammar, EPSILON, END_SYMBOL

class FirstFollowEngine:
    def __init__(self, grammar: Grammar):
        self.grammar = grammar
        self.first: Dict[str, Set[str]] = {}
        self.follow: Dict[str, Set[str]] = {}
        self.derivation_steps: List[Dict] = []
        
        self.compute_first()
        self.compute_follow()

    def compute_first(self):
        # Initialize
        for t in self.grammar.terminals:
            self.first[t] = {t}
        self.first[EPSILON] = {EPSILON}
        self.first[END_SYMBOL] = {END_SYMBOL}

        for nt in self.grammar.non_terminals:
            self.first[nt] = set()

        changed = True
        iteration = 1
        while changed:
            changed = False
            for prod in self.grammar.productions:
                lhs = prod.lhs
                rhs = prod.rhs

                # Calculate FIRST(rhs)
                rhs_first = self.compute_first_of_sequence(rhs)
                before_size = len(self.first[lhs])
                self.first[lhs].update(rhs_first)
                after_size = len(self.first[lhs])

                if after_size > before_size:
                    changed = True
                    self.derivation_steps.append({
                        "iteration": iteration,
                        "type": "FIRST",
                        "symbol": lhs,
                        "rule": str(prod),
                        "added": list(rhs_first - set(self.first[lhs])),
                        "current_set": list(sorted(list(self.first[lhs])))
                    })
            iteration += 1

    def compute_first_of_sequence(self, sequence: Tuple[str, ...]) -> Set[str]:
        if not sequence or (len(sequence) == 1 and sequence[0] == EPSILON):
            return {EPSILON}

        result = set()
        all_have_epsilon = True

        for sym in sequence:
            if sym not in self.first:
                # If unknown symbol, treat as terminal
                sym_first = {sym}
            else:
                sym_first = self.first[sym]

            result.update(sym_first - {EPSILON})

            if EPSILON not in sym_first:
                all_have_epsilon = False
                break

        if all_have_epsilon:
            result.add(EPSILON)

        return result

    def compute_follow(self):
        for nt in self.grammar.non_terminals:
            self.follow[nt] = set()

        # Rule 1: $ in FOLLOW(start_symbol)
        if self.grammar.start_symbol:
            self.follow[self.grammar.start_symbol].add(END_SYMBOL)
            self.derivation_steps.append({
                "iteration": 0,
                "type": "FOLLOW",
                "symbol": self.grammar.start_symbol,
                "reason": "Start symbol initial $, follow set includes $",
                "current_set": list(sorted(list(self.follow[self.grammar.start_symbol])))
            })

        changed = True
        iteration = 1
        while changed:
            changed = False
            for prod in self.grammar.productions:
                lhs = prod.lhs
                rhs = prod.rhs

                for i, sym in enumerate(rhs):
                    if sym in self.grammar.non_terminals:
                        beta = rhs[i + 1:]
                        beta_first = self.compute_first_of_sequence(beta)

                        before_size = len(self.follow[sym])

                        # Rule 2: FIRST(beta) \ {eps} in FOLLOW(sym)
                        self.follow[sym].update(beta_first - {EPSILON})

                        # Rule 3: If eps in FIRST(beta) or beta is empty, FOLLOW(lhs) in FOLLOW(sym)
                        if EPSILON in beta_first or not beta:
                            self.follow[sym].update(self.follow[lhs])

                        after_size = len(self.follow[sym])
                        if after_size > before_size:
                            changed = True
                            self.derivation_steps.append({
                                "iteration": iteration,
                                "type": "FOLLOW",
                                "symbol": sym,
                                "rule": str(prod),
                                "current_set": list(sorted(list(self.follow[sym])))
                            })
            iteration += 1

    def to_dict(self):
        return {
            "first": {k: list(sorted(list(v))) for k, v in self.first.items() if k in self.grammar.non_terminals},
            "follow": {k: list(sorted(list(v))) for k, v in self.follow.items() if k in self.grammar.non_terminals},
            "steps": self.derivation_steps
        }
