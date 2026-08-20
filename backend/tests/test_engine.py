import sys
import os

# Add app directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.stdout.reconfigure(encoding='utf-8')

from app.engine.grammar import Grammar
from app.engine.first_follow import FirstFollowEngine
from app.engine.ll1 import LL1Engine
from app.engine.slr import SLREngine
from app.engine.doctor import GrammarDoctorEngine
from app.engine.converter import GrammarConverterEngine
from app.engine.comparison import ComparisonEngine

def test_compiler_engine():
    grammar_text = """
    E -> E + T | T
    T -> T * F | F
    F -> ( E ) | id
    """

    print("=== Testing Grammar Parsing ===")
    g = Grammar(grammar_text)
    print("Start Symbol:", g.start_symbol)
    print("Non-Terminals:", g.non_terminals)
    print("Terminals:", g.terminals)
    assert g.start_symbol == "E"
    assert "E" in g.non_terminals
    assert "id" in g.terminals

    print("\n=== Testing FIRST & FOLLOW ===")
    ff = FirstFollowEngine(g)
    print("FIRST sets:", ff.first)
    print("FOLLOW sets:", ff.follow)
    assert "(" in ff.first["F"] and "id" in ff.first["F"]
    assert "$" in ff.follow["E"] and "+" in ff.follow["E"]

    print("\n=== Testing Grammar Doctor ===")
    doc = GrammarDoctorEngine(g)
    print("Is Clean?", doc.is_clean)
    print("Diagnostics Count:", len(doc.diagnostics))
    # E -> E + T has direct left recursion
    has_lr = any("Left Recursion" in d["category"] for d in doc.diagnostics)
    print("Detected Left Recursion?", has_lr)
    assert has_lr

    print("\n=== Testing Grammar Converter ===")
    conv = GrammarConverterEngine(g)
    transformed_text = conv.get_transformed_grammar_text()
    print("Transformed Grammar:\n" + transformed_text)
    
    # Verify transformed grammar is LL(1)
    trans_g = Grammar(transformed_text)
    ll1_trans = LL1Engine(trans_g)
    print("Transformed Grammar is LL(1)?", ll1_trans.is_ll1)
    assert ll1_trans.is_ll1

    print("\n=== Testing SLR Parser ===")
    slr = SLREngine(g)
    print("Canonical States count:", len(slr.canonical_collection))
    print("Is SLR?", slr.is_slr)
    assert slr.is_slr

    test_cases = [
        ("id + id", True),
        ("id * id", True),
        ("( id + id )", True),
        ("id +", False),
        ("+ id", False)
    ]

    print("\n=== Running Test Cases on SLR ===")
    for input_str, expected in test_cases:
        res = slr.parse(input_str)
        print(f"Input: '{input_str}' => Accepted: {res['accepted']} (Expected: {expected}) in {res['execution_time_ms']} ms")
        assert res["accepted"] == expected

    print("\n=== Running Test Cases on Transformed LL(1) ===")
    for input_str, expected in test_cases:
        res = ll1_trans.parse(input_str)
        print(f"Input: '{input_str}' => Accepted: {res['accepted']} (Expected: {expected}) in {res['execution_time_ms']} ms")
        assert res["accepted"] == expected

    print("\n=== ALL BACKEND ENGINE TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    test_compiler_engine()
