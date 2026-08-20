import { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import type { TabType } from './components/layout/Sidebar';
import { Console } from './components/layout/Console';
import type { ConsoleLog } from './components/layout/Console';

import { DashboardView } from './components/views/DashboardView';
import { GrammarEditorView } from './components/views/GrammarEditorView';
import { DoctorView } from './components/views/DoctorView';
import { FirstFollowView } from './components/views/FirstFollowView';
import { LL1View } from './components/views/LL1View';
import { SLRView } from './components/views/SLRView';
import { AutomatonView } from './components/views/AutomatonView';
import { ParseTreeView } from './components/views/ParseTreeView';
import { CompareView } from './components/views/CompareView';
import { TestRunnerView } from './components/views/TestRunnerView';
import { ProjectsView } from './components/views/ProjectsView';
import { LearningView } from './components/views/LearningView';
import { QuizView } from './components/views/QuizView';

import { api } from './services/api';
import type {
  Grammar,
  FirstFollowData,
  LL1Data,
  SLRData,
  DoctorData,
  TransformData,
  ParseResult,
  CompareResult,
  TestSuiteResponse,
  ProjectData
} from './types';

const DEFAULT_GRAMMAR = `E -> E + T | T
T -> T * F | F
F -> ( E ) | id`;

const DEFAULT_TEST_INPUTS = [
  'id + id',
  'id * id',
  '( id + id )',
  'id +',
  '+ id'
];

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('grammar');
  const [learningMode, setLearningMode] = useState<boolean>(false);

  const [grammarText, setGrammarText] = useState<string>(DEFAULT_GRAMMAR);
  const [inputString, setInputString] = useState<string>('id + id');
  const [testInputs, setTestInputs] = useState<string[]>(DEFAULT_TEST_INPUTS);

  const [grammarData, setGrammarData] = useState<Grammar | null>(null);
  const [firstFollowData, setFirstFollowData] = useState<FirstFollowData | null>(null);
  const [ll1Data, setLL1Data] = useState<LL1Data | null>(null);
  const [slrData, setSLRData] = useState<SLRData | null>(null);
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [transformData, setTransformData] = useState<TransformData | null>(null);

  const [ll1ParseResult, setLL1ParseResult] = useState<ParseResult | null>(null);
  const [slrParseResult, setSLRParseResult] = useState<ParseResult | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [testSuiteResponse, setTestSuiteResponse] = useState<TestSuiteResponse | null>(null);

  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('default_proj');

  const addLog = (type: 'info' | 'success' | 'warning' | 'error', message: string) => {
    const newLog: ConsoleLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    setConsoleLogs((prev) => [newLog, ...prev]);
  };

  // Load initial default project
  useEffect(() => {
    const savedProjects = localStorage.getItem('parselab_projects');
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) {
        console.error(e);
      }
    } else {
      const defaultProj: ProjectData = {
        id: 'default_proj',
        name: 'Arithmetic Expressions Laboratory',
        createdAt: new Date().toLocaleDateString(),
        grammar_text: DEFAULT_GRAMMAR,
        test_inputs: DEFAULT_TEST_INPUTS,
        lastInput: 'id + id'
      };
      setProjects([defaultProj]);
      localStorage.setItem('parselab_projects', JSON.stringify([defaultProj]));
    }

    // Run initial analysis automatically on startup
    handleAnalyzeGrammar(DEFAULT_GRAMMAR);
  }, []);

  const handleAnalyzeGrammar = async (textToAnalyze?: string) => {
    const text = textToAnalyze || grammarText;
    addLog('info', `Analyzing grammar rules...`);
    try {
      const res = await api.analyzeGrammar(text);
      const ll1Res = await api.generateLL1(text);
      const slrRes = await api.generateSLR(text);

      setGrammarData(res.grammar);
      setFirstFollowData(res.first_follow);
      setDoctorData(res.doctor);
      setLL1Data(ll1Res.ll1);
      setSLRData(slrRes.slr);

      addLog('success', `Grammar analyzed! Found ${res.grammar.non_terminals.length} non-terminals, ${res.grammar.terminals.length} terminals.`);

      if (res.doctor.diagnostics.length > 0) {
        addLog('warning', `Grammar Doctor identified ${res.doctor.diagnostics.length} diagnostic warnings/conflicts.`);
      }

      // Automatically run initial parse simulation
      handleParseLL1(text, inputString);
      handleParseSLR(text, inputString);
    } catch (err: any) {
      addLog('error', `Failed to connect to backend engine: ${err.message || err}`);
    }
  };

  const handleTransformGrammar = async () => {
    addLog('info', 'Executing LL(1) Converter (Left recursion removal & left factoring)...');
    try {
      const res = await api.transformGrammar(grammarText);
      setTransformData(res);
      addLog('success', `Grammar converted! Created transformed grammar text.`);
    } catch (err: any) {
      addLog('error', `Grammar transformation failed: ${err.message || err}`);
    }
  };

  const handleParseLL1 = async (gText?: string, inStr?: string) => {
    const text = gText || grammarText;
    const str = inStr || inputString;
    addLog('info', `Simulating LL(1) parse on input '${str}'...`);
    try {
      const res = await api.parseLL1(text, str);
      setLL1ParseResult(res);
      if (res.accepted) {
        addLog('success', `LL(1) Parser ACCEPTED '${str}' in ${res.total_steps} steps (${res.execution_time_ms} ms).`);
      } else {
        addLog('error', `LL(1) Parser REJECTED '${str}'. Diagnostic error logged.`);
      }
    } catch (err: any) {
      addLog('error', `LL(1) Parse failed: ${err.message || err}`);
    }
  };

  const handleParseSLR = async (gText?: string, inStr?: string) => {
    const text = gText || grammarText;
    const str = inStr || inputString;
    addLog('info', `Simulating SLR shift-reduce parse on input '${str}'...`);
    try {
      const res = await api.parseSLR(text, str);
      setSLRParseResult(res);
      if (res.accepted) {
        addLog('success', `SLR Parser ACCEPTED '${str}' in ${res.total_steps} steps (${res.execution_time_ms} ms).`);
      } else {
        addLog('error', `SLR Parser REJECTED '${str}'.`);
      }
    } catch (err: any) {
      addLog('error', `SLR Parse failed: ${err.message || err}`);
    }
  };

  const handleCompare = async (str?: string) => {
    const targetStr = str || inputString;
    addLog('info', `Running LL(1) vs SLR head-to-head comparison benchmark...`);
    try {
      const res = await api.compareParsers(grammarText, targetStr);
      setCompareResult(res);
      addLog('success', `Comparison completed! LL(1) steps: ${res.metrics.ll1.total_steps}, SLR steps: ${res.metrics.slr.total_steps}.`);
    } catch (err: any) {
      addLog('error', `Comparison failed: ${err.message || err}`);
    }
  };

  const handleRunTestSuite = async () => {
    addLog('info', `Running batch test suite on ${testInputs.length} test inputs...`);
    try {
      const res = await api.runTestSuite(grammarText, testInputs);
      setTestSuiteResponse(res);
      addLog('success', `Test Suite completed! LL(1) Passed: ${res.ll1_passed}/${res.total_tests}, SLR Passed: ${res.slr_passed}/${res.total_tests}.`);
    } catch (err: any) {
      addLog('error', `Test suite failed: ${err.message || err}`);
    }
  };

  const handleExportPDF = async () => {
    addLog('info', 'Generating complete PDF analysis report...');
    try {
      const blob = await api.downloadPDFReport(grammarText, inputString);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'parselab_compiler_report.pdf';
      a.click();
      URL.revokeObjectURL(url);
      addLog('success', 'Downloaded PDF analysis report.');
    } catch (err: any) {
      addLog('error', `PDF Export failed: ${err.message || err}`);
    }
  };

  const handleSaveProject = (name: string) => {
    const newProj: ProjectData = {
      id: Math.random().toString(36).substring(7),
      name,
      createdAt: new Date().toLocaleDateString(),
      grammar_text: grammarText,
      test_inputs: testInputs,
      lastInput: inputString
    };
    const updated = [...projects, newProj];
    setProjects(updated);
    localStorage.setItem('parselab_projects', JSON.stringify(updated));
    setActiveProjectId(newProj.id);
    addLog('success', `Project '${name}' saved successfully.`);
  };

  const handleLoadProject = (p: ProjectData) => {
    setGrammarText(p.grammar_text);
    setTestInputs(p.test_inputs || DEFAULT_TEST_INPUTS);
    setInputString(p.lastInput || 'id + id');
    setActiveProjectId(p.id);
    handleAnalyzeGrammar(p.grammar_text);
    addLog('info', `Loaded project '${p.name}'.`);
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    localStorage.setItem('parselab_projects', JSON.stringify(updated));
    addLog('info', `Deleted project.`);
  };

  const activeProjectName = projects.find((p) => p.id === activeProjectId)?.name || 'Custom Grammar Project';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Top IDE Header Navbar */}
      <Navbar
        learningMode={learningMode}
        setLearningMode={setLearningMode}
        grammarValid={grammarData?.is_valid ?? false}
        onQuickRun={() => {
          handleParseLL1();
          handleParseSLR();
        }}
        onExportPDF={handleExportPDF}
        activeProjectName={activeProjectName}
      />

      {/* Center Body: Sidebar + Main Active Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          doctorIssueCount={doctorData?.total_issues || 0}
          hasLL1Conflict={!(ll1Data?.is_ll1 ?? true)}
          hasSLRConflict={!(slrData?.is_slr ?? true)}
        />

        <main className="flex-1 overflow-y-auto bg-slate-950">
          {activeTab === 'dashboard' && (
            <DashboardView
              grammarData={grammarData}
              doctorData={doctorData}
              ll1Data={ll1Data}
              slrData={slrData}
              onNavigate={setActiveTab}
              onSelectPreset={(txt) => {
                setGrammarText(txt);
                handleAnalyzeGrammar(txt);
              }}
            />
          )}

          {activeTab === 'grammar' && (
            <GrammarEditorView
              grammarText={grammarText}
              setGrammarText={setGrammarText}
              grammarData={grammarData}
              onAnalyze={() => handleAnalyzeGrammar()}
              onSelectPreset={(txt) => {
                setGrammarText(txt);
                handleAnalyzeGrammar(txt);
              }}
            />
          )}

          {activeTab === 'doctor' && (
            <DoctorView
              doctorData={doctorData}
              onTransformGrammar={handleTransformGrammar}
              transformData={transformData}
            />
          )}

          {activeTab === 'first_follow' && (
            <FirstFollowView
              grammarData={grammarData}
              firstFollowData={firstFollowData}
              learningMode={learningMode}
            />
          )}

          {activeTab === 'll1' && (
            <LL1View
              grammarData={grammarData}
              ll1Data={ll1Data}
              inputString={inputString}
              setInputString={setInputString}
              onParse={(str) => handleParseLL1(grammarText, str)}
              parseResult={ll1ParseResult}
            />
          )}

          {activeTab === 'slr' && (
            <SLRView
              grammarData={grammarData}
              slrData={slrData}
              inputString={inputString}
              setInputString={setInputString}
              onParse={(str) => handleParseSLR(grammarText, str)}
              parseResult={slrParseResult}
              onNavigateToAutomaton={() => setActiveTab('automaton')}
            />
          )}

          {activeTab === 'automaton' && <AutomatonView slrData={slrData} />}

          {activeTab === 'parse_tree' && (
            <ParseTreeView
              parseResult={slrParseResult || ll1ParseResult}
              inputString={inputString}
            />
          )}

          {activeTab === 'compare' && (
            <CompareView
              compareResult={compareResult}
              inputString={inputString}
              setInputString={setInputString}
              onCompare={(str) => handleCompare(str)}
            />
          )}

          {activeTab === 'tests' && (
            <TestRunnerView
              grammarText={grammarText}
              testInputs={testInputs}
              setTestInputs={setTestInputs}
              onRunSuite={handleRunTestSuite}
              suiteResponse={testSuiteResponse}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              projects={projects}
              activeProjectId={activeProjectId}
              onSaveProject={handleSaveProject}
              onLoadProject={handleLoadProject}
              onDeleteProject={handleDeleteProject}
              currentGrammarText={grammarText}
            />
          )}

          {activeTab === 'learning' && <LearningView />}

          {activeTab === 'quiz' && <QuizView />}
        </main>
      </div>

      {/* Bottom IDE Console Output Bar */}
      <Console logs={consoleLogs} onClear={() => setConsoleLogs([])} />
    </div>
  );
}

export default App;
