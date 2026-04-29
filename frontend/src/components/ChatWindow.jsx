import React, { useRef, useEffect } from 'react';
import { Sparkles, Terminal } from 'lucide-react';
import useStore from '../store';
import { chatStream } from '../api';
import MessageBubble from './MessageBubble';
import InputBox from './InputBox';

const ChatWindow = () => {
  const { 
    conversations, 
    currentConversationId, 
    addMessage, 
    updateLastMessage,
    selectedModel,
    createNewConversation,
    provider,
    cloudSettings,
    setAbortController,
    stopGeneration,
    isGenerating,
    setIsGenerating,
    selectedIssue,
    abortController: currentAbortController
  } = useStore();
  
  const scrollRef = useRef(null);

  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const handleSendMessage = async (content) => {
    // Abort any existing generation before starting a new one
    if (currentAbortController) {
      currentAbortController.abort();
    }

    let convId = currentConversationId;
    if (!convId) {
      convId = createNewConversation();
    }

    const timestamp = new Date().toISOString();
    addMessage(convId, { role: 'user', content, timestamp });
    addMessage(convId, { role: 'assistant', content: 'Initializing generation engine...', timestamp });

    // Build the prompt — add Jira context and conversation history for follow-ups
    const conv = useStore.getState().conversations.find(c => c.id === convId);
    const history = (conv?.messages || [])
      .filter(m => m.role !== 'assistant' || m.content !== 'Initializing generation engine...')
      .slice(-10) // Last 10 messages for context
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    let prompt = '';
    if (selectedIssue) {
      const { adfToText: adfFn } = await import('../utils/jiraUtils');
      const descriptionText = adfFn(selectedIssue.description);
      prompt = `You are a QA expert. The following is context from a Jira story:\n\nJira ID: ${selectedIssue.id}\nSummary: ${selectedIssue.summary}\nDescription: ${descriptionText}\n\nConversation so far:\n${history}\n\nUser: ${content}\nAssistant:`;
    } else {
      prompt = history ? `${history}\nUser: ${content}\nAssistant:` : content;
    }

    setIsGenerating(true);
    const controller = new AbortController();
    setAbortController(controller);

    try {
      await chatStream(
        selectedModel,
        prompt,
        (chunk) => updateLastMessage(convId, chunk),
        () => {
          setIsGenerating(false);
          setAbortController(null);
          const currentMsgs = useStore.getState().conversations.find(c => c.id === convId)?.messages;
          if (currentMsgs && currentMsgs.length > 0) {
            const lastMsg = currentMsgs[currentMsgs.length - 1];
            if (lastMsg.content === 'Initializing generation engine...') {
              updateLastMessage(convId, '⚠️ The AI returned an empty response. Please check your model selection or API key in Settings.');
            }
          }
        },
        (error) => {
          setIsGenerating(false);
          setAbortController(null);
          if (typeof error === 'string' && (error.includes('AbortError') || error.includes('signal is aborted'))) return;
          updateLastMessage(convId, `❌ Error: ${error}`);
        },
        provider,
        cloudSettings,
        controller.signal
      );
    } catch (error) {
      setIsGenerating(false);
      setAbortController(null);
      updateLastMessage(convId, `❌ Error: ${error.message || error}`);
    }
  };

  const handleStop = () => {
    stopGeneration();
    setIsGenerating(false);
  };

  if (!currentConversationId && conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-[#0b0e14]">
        <div className="w-20 h-20 bg-brand-500/10 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
          <Terminal className="text-brand-500" size={40} />
        </div>
        <h1 className="text-4xl font-bold mb-4">QA Intelligence Core</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-10 text-lg">
          Select a Jira story to begin context-aware test generation or start a new chat below.
        </p>
        <div className="w-full max-w-lg">
          <InputBox onSend={handleSendMessage} onStop={handleStop} isGenerating={isGenerating} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#0d1117]">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth custom-scrollbar"
      >
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isGenerating && messages.length > 0 && messages[messages.length-1].content === '' && (
          <div className="flex gap-4 max-w-3xl mx-auto animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-8 bg-gradient-to-t from-white via-white to-transparent dark:from-[#0d1117] dark:via-[#0d1117]">
        <div className="max-w-4xl mx-auto">
          <InputBox onSend={handleSendMessage} onStop={handleStop} isGenerating={isGenerating} />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
