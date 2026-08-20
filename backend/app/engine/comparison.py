from typing import Dict, Any
from app.engine.grammar import Grammar
from app.engine.ll1 import LL1Engine
from app.engine.slr import SLREngine

class ComparisonEngine:
    def __init__(self, grammar_text: str, input_string: str):
        self.grammar_text = grammar_text
        self.input_string = input_string
        self.grammar = Grammar(grammar_text)
        self.ll1_engine = LL1Engine(self.grammar)
        self.slr_engine = SLREngine(self.grammar)

    def run_comparison(self) -> Dict[str, Any]:
        ll1_result = self.ll1_engine.parse(self.input_string)
        slr_result = self.slr_engine.parse(self.input_string)

        # Summary Metrics
        metrics = {
            "ll1": {
                "accepted": ll1_result["accepted"],
                "total_steps": ll1_result["total_steps"],
                "table_lookups": ll1_result["table_lookups"],
                "execution_time_ms": ll1_result["execution_time_ms"],
                "is_grammar_ll1": self.ll1_engine.is_ll1,
                "conflicts_count": len(self.ll1_engine.conflicts)
            },
            "slr": {
                "accepted": slr_result["accepted"],
                "total_steps": slr_result["total_steps"],
                "table_lookups": slr_result["table_lookups"],
                "execution_time_ms": slr_result["execution_time_ms"],
                "is_grammar_slr": self.slr_engine.is_slr,
                "conflicts_count": len(self.slr_engine.conflicts)
            }
        }

        # Comparative Summary Explanation
        summary_notes = []
        if ll1_result["accepted"] == slr_result["accepted"]:
            if ll1_result["accepted"]:
                summary_notes.append("Both LL(1) top-down and SLR(1) bottom-up parsers successfully ACCEPTED the input string.")
            else:
                summary_notes.append("Both LL(1) and SLR(1) parsers REJECTED the input string (Syntax Error).")
        else:
            summary_notes.append(f"Discrepancy: LL(1) parser result is {ll1_result['accepted']} while SLR parser result is {slr_result['accepted']}.")

        if not self.ll1_engine.is_ll1 and self.slr_engine.is_slr:
            summary_notes.append("The grammar is SLR(1) but NOT LL(1) (contains LL(1) conflicts or left-recursion). Bottom-up SLR parser is more powerful for this grammar.")
        elif self.ll1_engine.is_ll1 and not self.slr_engine.is_slr:
            summary_notes.append("The grammar is LL(1) but contains SLR conflicts.")

        return {
            "input_string": self.input_string,
            "metrics": metrics,
            "summary_notes": summary_notes,
            "ll1_details": ll1_result,
            "slr_details": slr_result
        }
