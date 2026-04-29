import React from 'react';
import { Cpu, ChevronDown, Download, Share2, Shield, Globe } from 'lucide-react';
import useStore from '../store';

const Toolbar = () => {
  const { 
    availableModels, 
    selectedModel, 
    setSelectedModel, 
    currentConversationId, 
    conversations,
    provider,
    cloudSettings
  } = useStore();

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  const getActiveModelName = () => {
    if (provider === 'ollama') return selectedModel;
    return cloudSettings[provider]?.model || 'Default';
  };

  const getProviderIcon = () => {
    if (provider === 'openai') return <Shield size={16} className="text-blue-500" />;
    if (provider === 'gemini') return <Shield size={16} className="text-orange-500" />;
    return <Cpu size={16} className="text-brand-500" />;
  };

  const exportChat = () => {
    if (!currentConversation) return;
    const content = currentConversation.messages
      .map(m => `### ${m.role.toUpperCase()}\n${m.content}\n`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${currentConversation.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0b0e14]/80 backdrop-blur-md z-10">
      <div className="flex items-center gap-4">
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
            {getProviderIcon()}
            <span className="text-slate-700 dark:text-slate-300 capitalize">
              {provider === 'ollama' ? getActiveModelName() : `${provider}: ${getActiveModelName()}`}
            </span>
            {provider === 'ollama' && <ChevronDown size={14} className="text-slate-400" />}
          </button>
          
          {provider === 'ollama' && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#1c2128] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
              {availableModels.length > 0 ? (
                availableModels.map(model => (
                  <button
                    key={model}
                    onClick={() => setSelectedModel(model)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${
                      selectedModel === model ? 'text-brand-600 font-bold' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {model}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-xs text-slate-400">No models found in Ollama</div>
              )}
            </div>
          )}
        </div>
        <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10"></div>
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
          {currentConversation?.title || 'New Conversation'}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={exportChat}
          disabled={!currentConversationId}
          className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-white/5 rounded-lg transition-all disabled:opacity-30"
          title="Export as Markdown"
        >
          <Download size={18} />
        </button>
        <button className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-white/5 rounded-lg transition-all">
          <Share2 size={18} />
        </button>
      </div>
    </header>
  );
};

export default Toolbar;
