export interface Production {
  id: number;
  lhs: string;
  rhs: string[];
  representation: string;
}

export interface Grammar {
  start_symbol: string;
  non_terminals: string[];
  terminals: string[];
  productions: Production[];
  errors: string[];
  is_valid: boolean;
}

export interface FirstFollowStep {
  iteration: number;
  type: 'FIRST' | 'FOLLOW';
  symbol: string;
  rule?: string;
  reason?: string;
  added?: string[];
  current_set: string[];
}

export interface FirstFollowData {
  first: Record<string, string[]>;
  follow: Record<string, string[]>;
  steps: FirstFollowStep[];
}

export interface LL1Conflict {
  non_terminal: string;
  terminal: string;
  productions: Production[];
  type: string;
}

export interface LL1Data {
  is_ll1: boolean;
  terminals: string[];
  non_terminals: string[];
  table: Record<string, Record<string, Production[]>>;
  conflicts: LL1Conflict[];
}

export interface ParseStep {
  step: number;
  stack: string[] | string;
  input: string;
  action: string;
  applied_rule?: Production | null;
}

export interface ParseTreeNode {
  id: number;
  label: string;
  children?: ParseTreeNode[];
  parent_id?: number | null;
}

export interface ParseError {
  position: number;
  token: string;
  expected: string[];
  reason?: string;
  suggestion?: string;
}

export interface ParseResult {
  accepted: boolean;
  steps: ParseStep[];
  total_steps: number;
  table_lookups: number;
  execution_time_ms: number;
  parse_tree?: ParseTreeNode | null;
  error?: ParseError | null;
}

export interface LR0Item {
  rule_id: number;
  lhs: string;
  rhs: string[];
  dot_pos: number;
  representation: string;
  is_complete: boolean;
}

export interface ItemSet {
  id: number;
  name: string;
  items: LR0Item[];
}

export interface Transition {
  from: number;
  to: number;
  symbol: string;
}

export interface ActionEntry {
  type: 'shift' | 'reduce' | 'accept';
  state?: number;
  production?: Production;
  representation: string;
}

export interface SLRConflict {
  state_id: number;
  terminal: string;
  conflict_type: string;
  actions: ActionEntry[];
}

export interface SLRData {
  is_slr: boolean;
  augmented_start: string;
  augmented_production: Production;
  terminals: string[];
  non_terminals: string[];
  states: ItemSet[];
  transitions: Transition[];
  action_table: Record<number, Record<string, ActionEntry[]>>;
  goto_table: Record<number, Record<string, number | null>>;
  conflicts: SLRConflict[];
}

export interface DiagnosticItem {
  severity: 'error' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  suggestion: string;
}

export interface DoctorData {
  is_clean: boolean;
  total_issues: number;
  diagnostics: DiagnosticItem[];
}

export interface TransformationLog {
  type: string;
  non_terminal?: string;
  new_non_terminal?: string;
  prefix?: string;
  description: string;
}

export interface TransformData {
  original_text: string;
  transformed_text: string;
  transformations_log: TransformationLog[];
  transformed_grammar: Grammar;
}

export interface CompareMetrics {
  accepted: boolean;
  total_steps: number;
  table_lookups: number;
  execution_time_ms: number;
  is_grammar_valid?: boolean;
  conflicts_count?: number;
}

export interface CompareResult {
  input_string: string;
  metrics: {
    ll1: CompareMetrics;
    slr: CompareMetrics;
  };
  summary_notes: string[];
  ll1_details: ParseResult;
  slr_details: ParseResult;
}

export interface TestSuiteResultItem {
  input_string: string;
  ll1_accepted: boolean;
  ll1_steps: number;
  ll1_time_ms: number;
  slr_accepted: boolean;
  slr_steps: number;
  slr_time_ms: number;
  match: boolean;
}

export interface TestSuiteResponse {
  total_tests: number;
  ll1_passed: number;
  slr_passed: number;
  results: TestSuiteResultItem[];
}

export interface ProjectData {
  id: string;
  name: string;
  createdAt: string;
  grammar_text: string;
  test_inputs: string[];
  lastInput: string;
}

export interface QuizQuestion {
  id: number;
  category: 'FIRST/FOLLOW' | 'LL(1)' | 'LR(0)' | 'SLR' | 'Conflicts' | 'Parsing Tables';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
