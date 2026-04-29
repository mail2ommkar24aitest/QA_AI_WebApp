import React, { useState } from 'react';
import { X, Save, Shield, Cpu, Globe, RefreshCw, CheckCircle, AlertCircle, Layout } from 'lucide-react';
import useStore from '../store';

const SettingsModal = ({ isOpen, onClose }) => {
  const { 
    provider, 
    setProvider, 
    cloudSettings, 
    updateCloudSettings,
    jiraSettings,
    updateJiraSettings
  } = useStore();
  
  const [localCloudSettings, setLocalCloudSettings] = useState(cloudSettings);
  const [localJiraSettings, setLocalJiraSettings] = useState(jiraSettings);
  const [geminiModels, setGeminiModels] = useState([]);
  const [isCheckingModels, setIsCheckingModels] = useState(false);
  const [checkStatus, setCheckStatus] = useState(null);

  if (!isOpen) return null;

  const handleSave = () => {
    updateCloudSettings('openai', localCloudSettings.openai);
    updateCloudSettings('gemini', localCloudSettings.gemini);
    updateJiraSettings(localJiraSettings);
    onClose();
  };

  const checkAvailableGeminiModels = async () => {
    if (!localCloudSettings.gemini.apiKey) {
      alert('Please enter a Gemini API Key first');
      return;
    }
    
    setIsCheckingModels(true);
    setCheckStatus(null);
    try {
      const response = await fetch('http://localhost:3001/api/models/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: localCloudSettings.gemini.apiKey }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch models');
      }
      
      const models = await response.json();
      const modelNames = models.map(m => m.name.replace('models/', ''));
      setGeminiModels(modelNames);
      setCheckStatus('success');
    } catch (err) {
      console.error(err);
      setCheckStatus('error');
    } finally {
      setIsCheckingModels(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-slate-800 dark:text-slate-100">
      <div className="bg-white dark:bg-[#161b22] w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/10 rounded-lg text-brand-600 dark:text-brand-400">
              <Globe size={20} />
            </div>
            <h2 className="text-xl font-bold">System Configuration</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
          {/* Column 1: Providers */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Provider</label>
              <div className="grid grid-cols-3 gap-2">
                {['ollama', 'openai', 'gemini'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition-all ${
                      provider === p 
                        ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20' 
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-white/5"></div>

            {/* LLM Settings */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Shield size={16} className="text-blue-500" />
                  OpenAI
                </div>
                <div className="space-y-2">
                  <input
                    type="password"
                    value={localCloudSettings.openai.apiKey}
                    onChange={(e) => setLocalCloudSettings({...localCloudSettings, openai: {...localCloudSettings.openai, apiKey: e.target.value}})}
                    placeholder="API Key"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                  <input
                    type="text"
                    value={localCloudSettings.openai.model}
                    onChange={(e) => setLocalCloudSettings({...localCloudSettings, openai: {...localCloudSettings.openai, model: e.target.value}})}
                    placeholder="Model (gpt-4o)"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Shield size={16} className="text-orange-500" />
                    Gemini
                  </div>
                  <button onClick={checkAvailableGeminiModels} className="text-[9px] text-brand-500 hover:underline">List Models</button>
                </div>
                <div className="space-y-2">
                  <input
                    type="password"
                    value={localCloudSettings.gemini.apiKey}
                    onChange={(e) => setLocalCloudSettings({...localCloudSettings, gemini: {...localCloudSettings.gemini, apiKey: e.target.value}})}
                    placeholder="API Key"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                  <input
                    type="text"
                    value={localCloudSettings.gemini.model}
                    onChange={(e) => setLocalCloudSettings({...localCloudSettings, gemini: {...localCloudSettings.gemini, model: e.target.value}})}
                    placeholder="Model (gemini-1.5-flash)"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                  {geminiModels.length > 0 && (
                    <div className="mt-2 p-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 max-h-32 overflow-y-auto custom-scrollbar">
                      <p className="text-[10px] font-bold text-slate-500 mb-1">Available Gemini Models:</p>
                      <div className="flex flex-wrap gap-1">
                        {geminiModels.filter(m => m.includes('gemini')).map(m => (
                          <button
                            key={m}
                            onClick={() => {
                              setLocalCloudSettings({...localCloudSettings, gemini: {...localCloudSettings.gemini, model: m}});
                              setCheckStatus('selected');
                            }}
                            className={`text-[9px] px-1.5 py-0.5 rounded transition-all ${
                              localCloudSettings.gemini.model === m
                                ? 'bg-brand-500 text-white shadow-sm'
                                : 'bg-white dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {checkStatus === 'selected' && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-green-500 font-bold">
                      <CheckCircle size={12} />
                      Model Verified & Selected
                    </div>
                  )}
                  {checkStatus === 'error' && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-red-500 font-bold">
                      <AlertCircle size={12} />
                      Connection failed. Check key.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Jira */}
          <div className="space-y-6 border-l border-slate-200 dark:border-white/5 pl-6">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
              <Layout size={18} className="text-brand-500" />
              Jira Integration
            </div>
            <p className="text-[11px] text-slate-400">Connect to your Jira Cloud account to fetch user stories.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block font-bold uppercase">Jira Domain</label>
                <input
                  type="text"
                  value={localJiraSettings.domain}
                  onChange={(e) => setLocalJiraSettings({...localJiraSettings, domain: e.target.value})}
                  placeholder="your-company.atlassian.net"
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block font-bold uppercase">Account Email</label>
                <input
                  type="email"
                  value={localJiraSettings.email}
                  onChange={(e) => setLocalJiraSettings({...localJiraSettings, email: e.target.value})}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block font-bold uppercase">API Token</label>
                <input
                  type="password"
                  value={localJiraSettings.apiToken}
                  onChange={(e) => setLocalJiraSettings({...localJiraSettings, apiToken: e.target.value})}
                  placeholder="Jira API Token"
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none"
                />
                <p className="text-[9px] text-slate-400 mt-2">Generate at: id.atlassian.com/manage-profile/security/api-tokens</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/5">
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-all shadow-lg shadow-brand-500/30 font-bold active:scale-95"
          >
            <Save size={18} />
            Save System Configurations
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
