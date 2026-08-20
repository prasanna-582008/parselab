from typing import List, Dict, Set, Tuple
from app.engine.grammar import Grammar, Production, EPSILON
from app.engine.first_follow import FirstFollowEngine
from app.engine.ll1 import LL1Engine
from app.engine.slr import SLREngine

class GrammarDoctorEngine:
    def __init__(self, grammar: Grammar):
        self.grammar = grammar
        self.diagnostics: List[Dict] = []
        self.is_clean: bool = True
        
        self.analyze()

    def analyze(self):
        if not self.grammar.productions or self.grammar.errors:
            self.diagnostics.append({
                "severity": "error",
                "category": "Syntax Error",
                "title": "Invalid Grammar Syntax",
                "description": "Grammar contains syntax errors: " + ", ".join(self.grammar.errors),
                "suggestion": "Fix production format (e.g. A -> B C | d)."
            })
            self.is_clean = False
            return

        self._check_duplicate_productions()
        self._check_epsilon_productions()
        self._check_left_recursion()
        self._check_useless_symbols()
        self._check_ll1_conflicts()
        self._check_slr_conflicts()

    def _check_duplicate_productions(self):
        seen = set()
        duplicates = []
        for prod in self.grammar.productions:
            key = (prod.lhs, prod.rhs)
            if key in seen:
                duplicates.append(str(prod))
            else:
                seen.add(key)

        if duplicates:
            self.is_clean = False
            self.diagnostics.append({
                "severity": "warning",
                "category": "Duplicate Productions",
                "title": "Duplicate Productions Detected",
                "description": f"Found {len(duplicates)} duplicate production rule(s): {', '.join(duplicates)}",
                "suggestion": "Remove duplicate production lines."
            })

    def _check_epsilon_productions(self):
        eps_prods = [str(p) for p in self.grammar.productions if p.is_epsilon]
        if eps_prods:
            self.diagnostics.append({
                "severity": "info",
                "category": "Epsilon Productions",
                "title": "ε-Productions Present",
                "description": f"Grammar contains {len(eps_prods)} ε-production(s): {', '.join(eps_prods)}",
                "suggestion": "ε-productions can cause FIRST/FOLLOW conflicts in LL(1) parsers. Check if they can be eliminated if LL(1) parsing is needed."
            })

    def _check_left_recursion(self):
        direct_lr = []
        for prod in self.grammar.productions:
            if not prod.is_epsilon and prod.rhs[0] == prod.lhs:
                direct_lr.append((prod.lhs, str(prod)))

        if direct_lr:
            self.is_clean = False
            rules_str = ", ".join([r[1] for r in direct_lr])
            non_terms = ", ".join(list(set([r[0] for r in direct_lr])))
            self.diagnostics.append({
                "severity": "error",
                "category": "Left Recursion",
                "title": "Direct Left Recursion Detected",
                "description": f"Non-terminals [{non_terms}] contain direct left recursion in rules: {rules_str}",
                "suggestion": "LL(1) top-down parsers will loop infinitely on left-recursive grammars. Use the LL(1) Converter to eliminate left recursion automatically."
            })

    def _check_useless_symbols(self):
        # 1. Reachable symbols starting from start_symbol
        reachable: Set[str] = {self.grammar.start_symbol}
        changed = True
        while changed:
            changed = False
            for prod in self.grammar.productions:
                if prod.lhs in reachable:
                    for sym in prod.rhs:
                        if sym in self.grammar.non_terminals and sym not in reachable:
                            reachable.add(sym)
                            changed = True

        unreachable = [nt for nt in self.grammar.non_terminals if nt not in reachable]
        if unreachable:
            self.is_clean = False
            self.diagnostics.append({
                "severity": "warning",
                "category": "Unreachable Symbols",
                "title": "Unreachable Non-Terminals",
                "description": f"Non-terminals [{', '.join(unreachable)}] cannot be reached from start symbol '{self.grammar.start_symbol}'.",
                "suggestion": "Remove unused non-terminals or update start symbol."
            })

    def _check_ll1_conflicts(self):
        ll1_engine = LL1Engine(self.grammar)
        if not ll1_engine.is_ll1:
            self.is_clean = False
            for conf in ll1_engine.conflicts:
                self.diagnostics.append({
                    "severity": "error",
                    "category": "LL(1) Conflict",
                    "title": f"LL(1) Conflict on M[{conf['non_terminal']}, '{conf['terminal']}']",
                    "description": f"Multiple productions compete for M[{conf['non_terminal']}, '{conf['terminal']}']: " +
                                  " | ".join([p["representation"] for p in conf["productions"]]),
                    "suggestion": "Apply Left Factoring or Left Recursion removal to resolve LL(1) parsing ambiguity."
                })

    def _check_slr_conflicts(self):
        slr_engine = SLREngine(self.grammar)
        if not slr_engine.is_slr:
            self.is_clean = False
            for conf in slr_engine.conflicts:
                self.diagnostics.append({
                    "severity": "error",
                    "category": "SLR Conflict",
                    "title": f"{conf['conflict_type']} at State I{conf['state_id']} on '{conf['terminal']}'",
                    "description": f"State I{conf['state_id']} has ambiguous actions on lookahead symbol '{conf['terminal']}'.",
                    "suggestion": "Grammar is not SLR(1). Consider rewriting production rules or using LR(1)/LALR(1)."
                })

    def to_dict(self):
        return {
            "is_clean": self.is_clean,
            "total_issues": len(self.diagnostics),
            "diagnostics": self.diagnostics
        }
