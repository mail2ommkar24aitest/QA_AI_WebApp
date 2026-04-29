import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import Toolbar from './components/Toolbar';
import JiraPanel from './components/JiraPanel';
import GenerationPanel from './components/GenerationPanel';
import useStore from './store';
import { fetchModels } from './api';
import { Layout } from 'lucide-react';

import TestExecutionTable from './components/TestExecutionTable';
import DefectForm from './components/DefectForm';

function App() {
  const { theme, setAvailableModels, selectedModel, setSelectedModel, provider } = useStore();
  const [isJiraOpen, setIsJiraOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'defects'

  // Handle theme switching
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Load models on startup
  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await fetchModels();
        setAvailableModels(models);
        
        if (models.length > 0 && provider === 'ollama' && !models.includes(selectedModel)) {
          setSelectedModel(models[0]);
        }
      } catch (err) {
        console.error('Failed to load models:', err);
      }
    };
    loadModels();
  }, [setAvailableModels, selectedModel, setSelectedModel, provider]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 font-sans">
      <Sidebar />
      
      {isJiraOpen && <JiraPanel />}
      
      <main className="flex-1 flex flex-col relative min-w-0 shadow-2xl z-10">
        <Toolbar />
        
        {/* Jira Toggle Floating Button */}
        <button 
          onClick={() => setIsJiraOpen(!isJiraOpen)}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-50 p-2 bg-brand-600 text-white rounded-r-xl shadow-lg transition-transform hover:translate-x-1 ${isJiraOpen ? 'translate-x-0' : 'translate-x-0'}`}
          title={isJiraOpen ? "Close Jira Panel" : "Open Jira Panel"}
        >
          <Layout size={18} />
        </button>

        <GenerationPanel />
        
        <div className="flex px-4 pt-2 border-b border-slate-200 dark:border-white/10 gap-4">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'chat' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Chat Console
          </button>
          <button 
            onClick={() => setActiveTab('defects')}
            className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'defects' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Execution & Defects
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'chat' ? (
            <ChatWindow />
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
              <DefectForm />
              <TestExecutionTable />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
