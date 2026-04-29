import React, { useState } from 'react';
import { Search, RefreshCw, Layout, ChevronRight, FileText, CheckCircle2, Trash2, X } from 'lucide-react';
import useStore from '../store';

const JiraPanel = () => {
  const { 
    jiraSettings, 
    setJiraIssues, 
    jiraIssues, 
    setSelectedIssue, 
    selectedIssue, 
    removeJiraIssue, 
    clearJiraIssues 
  } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchIssues = async () => {
    if (!jiraSettings.domain || !jiraSettings.email || !jiraSettings.apiToken) {
      alert('Please configure Jira settings first in the Settings menu.');
      return;
    }

    setIsLoading(true);
    try {
      let finalQuery = searchQuery.trim();
      
      if (finalQuery.includes('/browse/')) {
        finalQuery = finalQuery.split('/browse/')[1].split('?')[0];
      }

      const jql = finalQuery 
        ? `key = "${finalQuery}" OR summary ~ "${finalQuery}" OR text ~ "${finalQuery}"` 
        : 'issuetype in (Story, Task) order by created DESC';

      const params = new URLSearchParams({
        domain: jiraSettings.domain,
        email: jiraSettings.email,
        apiToken: jiraSettings.apiToken,
        query: jql
      });

      const response = await fetch(`http://localhost:3001/api/jira/issues?${params}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch Jira issues');
      }

      const issues = await response.json();
      setJiraIssues(issues);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-80 border-r border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#0b0e14]/50 flex flex-col h-full overflow-hidden transition-all duration-300">
      <div className="p-4 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <Layout size={18} className="text-brand-500" />
            Jira Stories
          </div>
          <div className="flex items-center gap-1">
            {jiraIssues.length > 0 && (
              <button 
                onClick={clearJiraIssues}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                title="Clear All Stories"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button 
              onClick={fetchIssues}
              disabled={isLoading}
              className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-brand-500/10 rounded-lg transition-all disabled:opacity-50"
              title="Refresh Stories"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search key or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchIssues()}
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {jiraIssues.length > 0 ? (
          jiraIssues.map((issue) => (
            <div key={issue.id} className="relative group/card">
              <button
                onClick={() => setSelectedIssue(issue)}
                className={`w-full text-left p-3 rounded-xl transition-all relative overflow-hidden ${
                  selectedIssue?.id === issue.id
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                    : 'hover:bg-slate-200 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2 pr-6">
                  <div className="flex-1">
                    <div className={`text-[10px] font-bold uppercase mb-1 ${selectedIssue?.id === issue.id ? 'text-brand-100' : 'text-brand-500'}`}>
                      {issue.id}
                    </div>
                    <div className="text-xs font-semibold line-clamp-2 leading-relaxed">
                      {issue.summary}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${
                    selectedIssue?.id === issue.id ? 'bg-white/20' : 'bg-slate-200 dark:bg-white/10'
                  }`}>
                    {issue.type}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${
                    selectedIssue?.id === issue.id ? 'bg-white/20' : 'bg-slate-200 dark:bg-white/10'
                  }`}>
                    {issue.priority}
                  </span>
                </div>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeJiraIssue(issue.id);
                }}
                className={`absolute top-2 right-2 p-1 rounded-md transition-all opacity-0 group-hover/card:opacity-100 hover:bg-red-500 hover:text-white ${
                  selectedIssue?.id === issue.id ? 'text-brand-100' : 'text-slate-400'
                }`}
                title="Remove Story"
              >
                <X size={14} />
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4 animate-fade-in">
            <FileText size={32} className="text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs text-slate-400">No Jira stories loaded.<br/>Click refresh to fetch issues.</p>
          </div>
        )}
      </div>

      {selectedIssue && (
        <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#161b22]/50 animate-slide-up">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-green-500">
            <CheckCircle2 size={14} />
            Context Selected
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            {selectedIssue.summary}
          </div>
        </div>
      )}
    </div>
  );
};

export default JiraPanel;
