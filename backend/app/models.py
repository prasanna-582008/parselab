from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class GrammarRequest(BaseModel):
    grammar_text: str

class ParseRequest(BaseModel):
    grammar_text: str
    input_string: str

class TestSuiteRequest(BaseModel):
    grammar_text: str
    input_strings: List[str]

class PDFReportRequest(BaseModel):
    title: Optional[str] = "ParseLab Compiler Analysis Report"
    grammar_text: str
    input_string: Optional[str] = "id + id"
