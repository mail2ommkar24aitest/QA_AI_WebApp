import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Paperclip } from 'lucide-react';

const InputBox = ({ onSend, onStop, isGenerating }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !isGenerating) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative group transition-all duration-300">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-indigo-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000 group-focus-within:duration-200"></div>
      <div className="relative flex items-end gap-2 p-2 bg-white dark:bg-[#1c2128] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl focus-within:border-brand-500/50 transition-all">
        <button className="p-2 text-slate-400 hover:text-brand-500 transition-colors">
          <Paperclip size={20} />
        </button>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything, generate test cases..."
          className="flex-1 max-h-[200px] bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-100 py-3 resize-none text-base placeholder:text-slate-400 dark:placeholder:text-slate-500"
          rows={1}
          disabled={isGenerating}
        />
        
        {isGenerating ? (
          <button
            onClick={onStop}
            className="p-3 bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/30 hover:bg-red-600 active:scale-95 transition-all"
            title="Stop generating"
          >
            <Square size={20} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`p-3 rounded-xl transition-all ${
              !input.trim()
                ? 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-slate-700'
                : 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700 active:scale-95'
            }`}
          >
            <Send size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default InputBox;
