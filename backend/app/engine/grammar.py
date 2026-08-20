import re
from typing import List, Set, Dict, Tuple, Optional

EPSILON = "ε"
END_SYMBOL = "$"

class Production:
    def __init__(self, lhs: str, rhs: Tuple[str, ...], rule_id: int = 0):
        self.lhs = lhs
        self.rhs = rhs  # Tuple of symbols e.g. ("E", "+", "T") or ("ε",)
        self.rule_id = rule_id

    @property
    def is_epsilon(self) -> bool:
        return len(self.rhs) == 1 and self.rhs[0] == EPSILON

    def __repr__(self):
        rhs_str = " ".join(self.rhs)
        return f"{self.lhs} → {rhs_str}"

    def __eq__(self, other):
        if not isinstance(other, Production):
            return False
        return self.lhs == other.lhs and self.rhs == other.rhs

    def __hash__(self):
        return hash((self.lhs, self.rhs))

    def to_dict(self):
        return {
            "id": self.rule_id,
            "lhs": self.lhs,
            "rhs": list(self.rhs),
            "representation": str(self)
        }


class Grammar:
    def __init__(self, raw_text: str):
        self.raw_text = raw_text
        self.productions: List[Production] = []
        self.non_terminals: List[str] = []
        self.terminals: List[str] = []
        self.start_symbol: str = ""
        self.errors: List[str] = []
        
        self._parse_grammar(raw_text)

    def _parse_grammar(self, text: str):
        lines = [line.strip() for line in text.splitlines() if line.strip() and not line.strip().startswith("#")]
        if not lines:
            self.errors.append("Grammar text is empty.")
            return

        lhs_set: Set[str] = set()
        raw_rules: List[Tuple[str, List[str]]] = []
        rule_counter = 1

        for line_num, line in enumerate(lines, 1):
            # Normalize arrows
            normalized = line.replace("→", "->").replace("::=", "->")
            if "->" not in normalized:
                self.errors.append(f"Line {line_num}: Missing production arrow ('->' or '→').")
                continue

            parts = normalized.split("->", 1)
            lhs = parts[0].strip()
            rhs_text = parts[1].strip()

            if not lhs:
                self.errors.append(f"Line {line_num}: Empty left-hand side.")
                continue

            if not lhs_set:
                self.start_symbol = lhs

            if lhs not in self.non_terminals:
                self.non_terminals.append(lhs)
            lhs_set.add(lhs)

            # Split alternatives separated by |
            alternatives = [alt.strip() for alt in rhs_text.split("|")]
            for alt in alternatives:
                if not alt:
                    self.errors.append(f"Line {line_num}: Empty right-hand side alternative.")
                    continue
                
                tokens = self.tokenize_rhs(alt)
                if not tokens:
                    tokens = [EPSILON]
                
                prod = Production(lhs, tuple(tokens), rule_id=rule_counter)
                self.productions.append(prod)
                rule_counter += 1

        # Identify Terminals
        all_rhs_symbols: Set[str] = set()
        for prod in self.productions:
            for sym in prod.rhs:
                if sym != EPSILON:
                    all_rhs_symbols.add(sym)

        self.terminals = [sym for sym in sorted(list(all_rhs_symbols)) if sym not in lhs_set]

    @staticmethod
    def tokenize_rhs(rhs_str: str) -> List[str]:
        # Handle epsilon variants
        lowered = rhs_str.lower().strip()
        if lowered in ["ε", "eps", "epsilon", "''", '""', "λ"]:
            return [EPSILON]

        # Space separated tokens if spaces exist, otherwise tokenize single characters & multichar symbols
        if " " in rhs_str:
            tokens = [t for t in rhs_str.split(" ") if t]
        else:
            # Tokenize sequence without spaces e.g. "id+id" -> ["id", "+", "id"] or "(E)" -> ["(", "E", ")"]
            pattern = r"(id|[A-Za-z0-9_']+|[^\s\w])"
            tokens = re.findall(pattern, rhs_str)

        final_tokens = []
        for tok in tokens:
            if tok.lower() in ["ε", "eps", "epsilon", "''", '""', "λ"]:
                final_tokens.append(EPSILON)
            else:
                final_tokens.append(tok)
        return final_tokens

    def get_productions_for(self, non_terminal: str) -> List[Production]:
        return [p for p in self.productions if p.lhs == non_terminal]

    def to_dict(self):
        return {
            "start_symbol": self.start_symbol,
            "non_terminals": self.non_terminals,
            "terminals": self.terminals,
            "productions": [p.to_dict() for p in self.productions],
            "errors": self.errors,
            "is_valid": len(self.errors) == 0
        }
