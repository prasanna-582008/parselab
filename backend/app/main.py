from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from io import BytesIO
import time

from app.models import GrammarRequest, ParseRequest, TestSuiteRequest, PDFReportRequest
from app.engine.grammar import Grammar
from app.engine.first_follow import FirstFollowEngine
from app.engine.ll1 import LL1Engine
from app.engine.slr import SLREngine
from app.engine.doctor import GrammarDoctorEngine
from app.engine.converter import GrammarConverterEngine
from app.engine.comparison import ComparisonEngine

app = FastAPI(
    title="ParseLab API",
    description="Interactive LL(1) & SLR Parser Laboratory API Engine",
    version="1.0.0"
)

# Enable CORS for frontend Vite app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "app": "ParseLab - LL(1) & SLR Compiler Laboratory"}

@app.post("/api/grammar/analyze")
def analyze_grammar(req: GrammarRequest):
    g = Grammar(req.grammar_text)
    ff = FirstFollowEngine(g)
    doc = GrammarDoctorEngine(g)
    return {
        "grammar": g.to_dict(),
        "first_follow": ff.to_dict(),
        "doctor": doc.to_dict()
    }

@app.post("/api/grammar/transform")
def transform_grammar(req: GrammarRequest):
    g = Grammar(req.grammar_text)
    conv = GrammarConverterEngine(g)
    return conv.to_dict()

@app.post("/api/ll1/generate")
def generate_ll1(req: GrammarRequest):
    g = Grammar(req.grammar_text)
    ff = FirstFollowEngine(g)
    ll1 = LL1Engine(g)
    return {
        "grammar": g.to_dict(),
        "first_follow": ff.to_dict(),
        "ll1": ll1.to_dict()
    }

@app.post("/api/ll1/parse")
def parse_ll1(req: ParseRequest):
    g = Grammar(req.grammar_text)
    ll1 = LL1Engine(g)
    return ll1.parse(req.input_string)

@app.post("/api/slr/generate")
def generate_slr(req: GrammarRequest):
    g = Grammar(req.grammar_text)
    slr = SLREngine(g)
    return {
        "grammar": g.to_dict(),
        "slr": slr.to_dict()
    }

@app.post("/api/slr/parse")
def parse_slr(req: ParseRequest):
    g = Grammar(req.grammar_text)
    slr = SLREngine(g)
    return slr.parse(req.input_string)

@app.post("/api/compare")
def compare_parsers(req: ParseRequest):
    comp = ComparisonEngine(req.grammar_text, req.input_string)
    return comp.run_comparison()

@app.post("/api/test-suite")
def run_test_suite(req: TestSuiteRequest):
    g = Grammar(req.grammar_text)
    ll1 = LL1Engine(g)
    slr = SLREngine(g)

    results = []
    accepted_ll1_cnt = 0
    accepted_slr_cnt = 0

    for input_str in req.input_strings:
        ll1_res = ll1.parse(input_str)
        slr_res = slr.parse(input_str)

        if ll1_res["accepted"]:
            accepted_ll1_cnt += 1
        if slr_res["accepted"]:
            accepted_slr_cnt += 1

        results.append({
            "input_string": input_str,
            "ll1_accepted": ll1_res["accepted"],
            "ll1_steps": ll1_res["total_steps"],
            "ll1_time_ms": ll1_res["execution_time_ms"],
            "slr_accepted": slr_res["accepted"],
            "slr_steps": slr_res["total_steps"],
            "slr_time_ms": slr_res["execution_time_ms"],
            "match": ll1_res["accepted"] == slr_res["accepted"]
        })

    return {
        "total_tests": len(req.input_strings),
        "ll1_passed": accepted_ll1_cnt,
        "slr_passed": accepted_slr_cnt,
        "results": results
    }

@app.post("/api/export/pdf")
def export_pdf_report(req: PDFReportRequest):
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
    except ImportError:
        raise HTTPException(status_code=500, detail="ReportLab library not installed.")

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0F172A")
    )
    h2_style = ParagraphStyle(
        'H2Style',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155")
    )
    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#0F172A")
    )

    story = []

    # Header
    story.append(Paragraph(req.title or "ParseLab Compiler Analysis Report", title_style))
    story.append(Paragraph(f"Generated at: {time.strftime('%Y-%m-%d %H:%M:%S')}", body_style))
    story.append(Spacer(1, 12))

    # Grammar
    story.append(Paragraph("1. Context-Free Grammar", h2_style))
    g = Grammar(req.grammar_text)
    g_lines = req.grammar_text.splitlines()
    for line in g_lines:
        story.append(Paragraph(line, code_style))
    story.append(Spacer(1, 10))

    # FIRST & FOLLOW
    ff = FirstFollowEngine(g)
    story.append(Paragraph("2. FIRST & FOLLOW Sets", h2_style))
    ff_data = [["Non-Terminal", "FIRST Set", "FOLLOW Set"]]
    for nt in g.non_terminals:
        first_set = ", ".join(sorted(list(ff.first.get(nt, set()))))
        follow_set = ", ".join(sorted(list(ff.follow.get(nt, set()))))
        ff_data.append([nt, f"{{ {first_set} }}", f"{{ {follow_set} }}"])

    t_ff = Table(ff_data, colWidths=[100, 200, 200])
    t_ff.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
    ]))
    story.append(t_ff)
    story.append(Spacer(1, 12))

    # Comparison for input string
    story.append(Paragraph(f"3. Parser Execution Benchmark (Input: '{req.input_string}')", h2_style))
    comp = ComparisonEngine(req.grammar_text, req.input_string)
    res = comp.run_comparison()

    comp_data = [
        ["Metric", "LL(1) Parser", "SLR(1) Parser"],
        ["Accepted?", "YES" if res["metrics"]["ll1"]["accepted"] else "NO", "YES" if res["metrics"]["slr"]["accepted"] else "NO"],
        ["Total Steps", str(res["metrics"]["ll1"]["total_steps"]), str(res["metrics"]["slr"]["total_steps"])],
        ["Table Lookups", str(res["metrics"]["ll1"]["table_lookups"]), str(res["metrics"]["slr"]["table_lookups"])],
        ["Execution Time", f"{res['metrics']['ll1']['execution_time_ms']} ms", f"{res['metrics']['slr']['execution_time_ms']} ms"],
        ["Grammar Valid?", "YES" if res["metrics"]["ll1"]["is_grammar_ll1"] else "NO (Conflicts)", "YES" if res["metrics"]["slr"]["is_grammar_slr"] else "NO (Conflicts)"]
    ]

    t_comp = Table(comp_data, colWidths=[150, 175, 175])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#94A3B8")),
    ]))
    story.append(t_comp)

    doc.build(story)
    buffer.seek(0)

    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=parselab_report.pdf"}
    )
