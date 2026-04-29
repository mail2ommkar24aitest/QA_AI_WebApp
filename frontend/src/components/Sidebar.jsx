import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, Settings, Github, Moon, Sun } from 'lucide-react';
import useStore from '../store';
import SettingsModal from './SettingsModal';

const Sidebar = () => {
  const { 
    conversations, 
    currentConversationId, 
    setCurrentConversationId, 
    createNewConversation, 
    deleteConversation,
    clearHistory,
    theme,
    setTheme
  } = useStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <aside className="w-72 h-full flex flex-col bg-white dark:bg-[#161b22] border-r border-slate-200 dark:border-white/5 z-20">
        <div className="p-4">
          <button 
            onClick={createNewConversation}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-95 font-medium"
          >
            <Plus size={20} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-hide">
          {conversations.length === 0 ? (
            <div className="mt-10 text-center px-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="text-slate-400" size={24} />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">No conversations yet. Start a new one!</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div 
                key={conv.id}
                onClick={() => setCurrentConversationId(conv.id)}
                className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  currentConversationId === conv.id 
                    ? 'bg-slate-100 dark:bg-white/10 text-brand-600 dark:text-brand-400' 
                    : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
                }`}
              >
                <MessageSquare size={18} className={currentConversationId === conv.id ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'} />
                <span className="flex-1 truncate text-sm font-medium">{conv.title}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-2">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-colors text-sm"
          >
            <Settings size={18} />
            Settings
          </button>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-colors text-sm"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button 
            onClick={clearHistory}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-600 transition-colors text-sm"
          >
            <Trash2 size={18} />
            Clear History
          </button>
        </div>
      </aside>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

export default Sidebar;
