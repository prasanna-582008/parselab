import axios from 'axios';
import type {
  Grammar,
  FirstFollowData,
  LL1Data,
  SLRData,
  DoctorData,
  TransformData,
  ParseResult,
  CompareResult,
  TestSuiteResponse
} from '../types';

const API_BASE_URL = 'https://parselab-i3tg.onrender.com/api';

export const api = {
  analyzeGrammar: async (grammar_text: string): Promise<{ grammar: Grammar; first_follow: FirstFollowData; doctor: DoctorData }> => {
    const res = await axios.post(`${API_BASE_URL}/grammar/analyze`, { grammar_text });
    return res.data;
  },

  transformGrammar: async (grammar_text: string): Promise<TransformData> => {
    const res = await axios.post(`${API_BASE_URL}/grammar/transform`, { grammar_text });
    return res.data;
  },

  generateLL1: async (grammar_text: string): Promise<{ grammar: Grammar; first_follow: FirstFollowData; ll1: LL1Data }> => {
    const res = await axios.post(`${API_BASE_URL}/ll1/generate`, { grammar_text });
    return res.data;
  },

  parseLL1: async (grammar_text: string, input_string: string): Promise<ParseResult> => {
    const res = await axios.post(`${API_BASE_URL}/ll1/parse`, { grammar_text, input_string });
    return res.data;
  },

  generateSLR: async (grammar_text: string): Promise<{ grammar: Grammar; slr: SLRData }> => {
    const res = await axios.post(`${API_BASE_URL}/slr/generate`, { grammar_text });
    return res.data;
  },

  parseSLR: async (grammar_text: string, input_string: string): Promise<ParseResult> => {
    const res = await axios.post(`${API_BASE_URL}/slr/parse`, { grammar_text, input_string });
    return res.data;
  },

  compareParsers: async (grammar_text: string, input_string: string): Promise<CompareResult> => {
    const res = await axios.post(`${API_BASE_URL}/compare`, { grammar_text, input_string });
    return res.data;
  },

  runTestSuite: async (grammar_text: string, input_strings: string[]): Promise<TestSuiteResponse> => {
    const res = await axios.post(`${API_BASE_URL}/test-suite`, { grammar_text, input_strings });
    return res.data;
  },

  downloadPDFReport: async (grammar_text: string, input_string: string, title?: string): Promise<Blob> => {
    const res = await axios.post(`${API_BASE_URL}/export/pdf`, {
      grammar_text,
      input_string,
      title: title || "ParseLab Compiler Analysis Report"
    }, { responseType: 'blob' });
    return res.data;
  }
};
