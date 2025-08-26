import React, { useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DataInputView } from './components/DataInputView';
import { ConfigurationView } from './components/ConfigurationView';
import { TimetableView } from './components/TimetableView';
import { ResultsView } from './components/ResultsView';
import { HomeView } from './components/HomeView';
import { AboutView } from './components/AboutView';
import { LoginView } from './components/LoginView';
import { Algorithm, AppState, View, Page, AlgorithmParameters } from './types';
import { generateTimetable } from './services/timetableService';
import { DnaIcon } from './components/icons/DnaIcon';
import { FlameIcon } from './components/icons/FlameIcon';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    departments: [
        { id: 'DEPT_CS', name: 'Computer Science' },
        { id: 'DEPT_MATH', name: 'Mathematics' },
        { id: 'DEPT_PHY', name: 'Physics' },
        { id: 'DEPT_HUM', name: 'Humanities' },
    ],
    courses: [
        { id: 'CS101', name: 'Intro to CS', departmentId: 'DEPT_CS', students: 150, units: 3 },
        { id: 'MA201', name: 'Calculus II', departmentId: 'DEPT_MATH', students: 80, units: 4 },
        { id: 'PHY301', name: 'Quantum Physics', departmentId: 'DEPT_PHY', students: 50, units: 3 },
        { id: 'ENG102', name: 'Literature', departmentId: 'DEPT_HUM', students: 120, units: 3 },
        { id: 'HIS210', name: 'World History', departmentId: 'DEPT_HUM', students: 90, units: 2 },
    ],
    rooms: [
        { id: 'R101', capacity: 100 },
        { id: 'R102', capacity: 160 },
        { id: 'R205', capacity: 60 },
        { id: 'AUD', capacity: 200 },
    ],
    constraints: [
      { id: 'c1', description: 'No student should have two exams at the same time.', type: 'Hard', enabled: true },
      { id: 'c2', description: 'Exam capacity must not exceed room capacity.', type: 'Hard', enabled: true },
      { id: 'c3', description: 'A student should not have more than two exams in a row.', type: 'Soft', enabled: true },
      { id: 'c4', description: 'Spread out exams for the same year as much as possible.', type: 'Soft', enabled: true },
    ],
    startingDate: new Date().toISOString().split('T')[0], // Default to today
    algorithm: Algorithm.GENETIC_ALGORITHM,
    params: {
        populationSize: 100,
        mutationRate: 0.05,
        crossoverRate: 0.8,
        generations: 200,
        initialTemperature: 1000,
        coolingRate: 0.995,
    },
    isGenerating: false,
    generationProgress: 0,
    generationResult: null,
    isAuthenticated: false,
    currentPage: Page.HOME,
    activeView: View.DATA_INPUT,
  });

  const handleNavigate = (page: Page) => {
    setAppState(prev => ({ ...prev, currentPage: page }));
  };

  const handleLogin = () => {
    setAppState(prev => ({ ...prev, isAuthenticated: true, currentPage: Page.APP, activeView: View.DATA_INPUT }));
  };

  const handleSignOut = () => {
    setAppState(prev => ({ ...prev, isAuthenticated: false, currentPage: Page.HOME }));
  };

  const handleGetStarted = () => {
    if (appState.isAuthenticated) {
        handleNavigate(Page.APP);
    } else {
        handleNavigate(Page.LOGIN);
    }
  };

  const setActiveView = (view: View) => {
    setAppState(prev => ({ ...prev, activeView: view }));
  };

  const handleRunAlgorithm = useCallback(async () => {
    setAppState(prev => ({ ...prev, isGenerating: true, generationProgress: 0, generationResult: null }));

    const onProgress = (progress: number) => {
        setAppState(prev => ({ ...prev, generationProgress: progress }));
    };

    const result = await generateTimetable(
        appState.courses,
        appState.rooms,
        appState.constraints,
        appState.algorithm,
        appState.params,
        onProgress
    );

    setAppState(prev => ({ ...prev, isGenerating: false, generationResult: result, activeView: View.TIMETABLE }));
  }, [appState.algorithm, appState.courses, appState.rooms, appState.constraints, appState.params]);

  const updateParams = (newParams: Partial<AlgorithmParameters>) => {
    setAppState(prev => ({...prev, params: {...prev.params, ...newParams}}))
  };

  const renderCurrentView = () => {
    switch (appState.activeView) {
      case View.DATA_INPUT:
        return <DataInputView appState={appState} setAppState={setAppState} />;
      case View.CONFIGURATION:
        return <ConfigurationView params={appState.params} updateParams={updateParams} algorithm={appState.algorithm} />;
      case View.TIMETABLE:
        return <TimetableView result={appState.generationResult} departments={appState.departments} />;
      case View.RESULTS:
        return <ResultsView result={appState.generationResult} />;
      default:
        return <DataInputView appState={appState} setAppState={setAppState} />;
    }
  };
  
  const renderPage = () => {
    if (appState.currentPage === Page.APP && !appState.isAuthenticated) {
        return <LoginView onLogin={handleLogin} />;
    }
    
    switch (appState.currentPage) {
        case Page.HOME:
            return <HomeView onGetStarted={handleGetStarted} />;
        case Page.ABOUT:
            return <AboutView />;
        case Page.LOGIN:
            return <LoginView onLogin={handleLogin} />;
        case Page.APP:
            return (
                <div className="flex flex-1 overflow-hidden">
                    <Sidebar activeView={appState.activeView} setActiveView={setActiveView} />
                    <main className="flex-1 p-6 overflow-y-auto">
                        {renderCurrentView()}
                    </main>
                    <aside className="w-80 bg-gray-900/80 border-l border-gray-700 p-6 flex flex-col space-y-6">
                        <h2 className="text-xl font-semibold text-white">Algorithm Control</h2>
                        <div className="bg-gray-800 rounded-lg p-4">
                            <label htmlFor="algorithm-select" className="block text-sm font-medium text-gray-400 mb-2">Select Algorithm</label>
                            <div className="relative">
                            <select 
                                id="algorithm-select"
                                value={appState.algorithm}
                                onChange={(e) => setAppState(prev => ({...prev, algorithm: e.target.value as Algorithm}))}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                            >
                                <option value={Algorithm.GENETIC_ALGORITHM}>Genetic Algorithm</option>
                                <option value={Algorithm.SIMULATED_ANNEALING}>Simulated Annealing</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                {appState.algorithm === Algorithm.GENETIC_ALGORITHM ? <DnaIcon className="w-5 h-5" /> : <FlameIcon className="w-5 h-5" />}
                            </div>
                            </div>
                        </div>
                        <ConfigurationView params={appState.params} updateParams={updateParams} algorithm={appState.algorithm} />
                        <div className="flex-grow flex flex-col justify-end">
                            {appState.isGenerating && (
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${appState.generationProgress}%` }}></div>
                                <p className="text-center text-sm mt-1 text-gray-400">{`Processing... ${appState.generationProgress.toFixed(0)}%`}</p>
                            </div>
                            )}
                            <button
                            onClick={handleRunAlgorithm}
                            disabled={appState.isGenerating}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:transform-none"
                            >
                            {appState.isGenerating ? 'Generating...' : 'Generate Timetable'}
                            </button>
                        </div>
                    </aside>
                </div>
            );
        default:
            return <HomeView onGetStarted={handleGetStarted} />;
    }
  };


  return (
    <div className="min-h-screen bg-black/60 backdrop-blur-sm text-gray-200 flex flex-col">
      <Navbar
        currentPage={appState.currentPage}
        isAuthenticated={appState.isAuthenticated}
        onNavigate={handleNavigate}
        onSignOut={handleSignOut}
      />
      {renderPage()}
    </div>
  );
};

export default App;
