import React, { useState } from 'react';
import { User, Sparkles, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-4 max-w-4xl mx-auto group ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
        isUser 
          ? 'bg-brand-600 text-white' 
          : 'bg-white dark:bg-white/10 text-brand-500 border border-slate-200 dark:border-white/10'
      }`}>
        {isUser ? <User size={20} /> : <Sparkles size={20} />}
      </div>
      
      <div className={`relative flex flex-col gap-2 max-w-[85%] ${isUser ? 'items-end' : ''}`}>
        <div className={`p-4 rounded-2xl shadow-sm ${
          isUser 
            ? 'bg-white dark:bg-brand-600 border border-slate-200 dark:border-brand-500/50 text-slate-800 dark:text-white rounded-tr-none' 
            : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-tl-none'
        }`}>
          <div className="prose dark:prose-invert max-w-none prose-sm md:prose-base prose-pre:bg-slate-900 prose-pre:border prose-pre:border-white/10">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
        
        {!isUser && message.content && (
          <button 
            onClick={copyToClipboard}
            className="absolute -right-12 top-0 p-2 text-slate-400 hover:text-brand-500 opacity-0 group-hover:opacity-100 transition-all bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10"
            title="Copy to clipboard"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
        )}
        
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider flex gap-2">
          <span>{new Date(message.timestamp || Date.now()).toLocaleDateString([], { day: '2-digit', month: 'short' })}</span>
          <span>{new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
