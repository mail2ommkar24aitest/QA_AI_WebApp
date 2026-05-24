import React, { useState } from 'react';
import { FileText, List, Zap, AlertTriangle, Bug, Copy, Download, Square } from 'lucide-react';
import useStore from '../store';
import { chatStream } from '../api';
import { adfToText } from '../utils/jiraUtils';

const GenerationPanel = () => {
  const { 
    selectedIssue, 
    provider, 
    cloudSettings, 
    selectedModel, 
    addMessage, 
    updateLastMessage,
    createNewConversation,
    setAbortController,
    stopGeneration,
    abortController,
    isGenerating,
    setIsGenerating
  } = useStore();

  const generateContent = async (type) => {
    if (!selectedIssue) {
      alert('Please select a Jira story from the left panel first.');
      return;
    }

    if (isGenerating) return;

    // Prepare the specialized prompt
    let prompt = '';
    const descriptionText = adfToText(selectedIssue.description);
    const context = `Jira ID: ${selectedIssue.id}\nSummary: ${selectedIssue.summary}\nDescription: ${descriptionText}`;

    const tableInstruction = `\n\nIMPORTANT FORMATTING RULES:
- Present EACH test case as a separate section with a heading like "## Test Case 1: <Title>"
- Under each heading, use a markdown table with exactly TWO columns: | Field | Details |
- The fields must include: Test Case ID, Test Scenario, Preconditions, Test Steps, Test Data, Expected Result, Priority
- For Test Steps, number them (1. 2. 3.) within the table cell
- Do NOT use bullet points or plain paragraphs — ONLY use markdown tables
- Example format:

## Test Case 1: Valid Login

| Field | Details |
|-------|---------|
| Test Case ID | TC_001 |
| Test Scenario | Verify user can login with valid credentials |
| Preconditions | User account is registered and active |
| Test Steps | 1. Open login page\\n2. Enter valid username\\n3. Enter valid password\\n4. Click Login |
| Test Data | Username: testuser@email.com, Password: Test@123 |
| Expected Result | User is logged in and redirected to dashboard |
| Priority | High |`;

    switch (type) {
      case 'test-cases':
        prompt = `You are a senior QA engineer. Based on this Jira story, generate a comprehensive set of Test Cases.\n\nContext:\n${context}${tableInstruction}`;
        break;
      case 'scenarios':
        prompt = `You are a senior QA engineer. Based on this Jira story, generate high-level Test Scenarios.\n\nContext:\n${context}\n\nIMPORTANT FORMATTING RULES:
- Present the output as a markdown table with these columns: | Scenario ID | Test Scenario | Description | Priority |
- Include both positive and negative scenarios
- Do NOT use bullet points or plain paragraphs — ONLY use a markdown table`;
        break;
      case 'edge-cases':
        prompt = `You are a senior QA engineer. Analyze this Jira story and identify potential Edge Cases and boundary conditions.\n\nContext:\n${context}\n\nIMPORTANT FORMATTING RULES:
- Present the output as a markdown table with these columns: | Edge Case ID | Scenario | Input/Condition | Expected Behavior | Risk Level |
- Do NOT use bullet points or plain paragraphs — ONLY use a markdown table`;
        break;
      case 'defect':
        prompt = `You are a senior QA engineer. Based on this Jira story, create Defect Report templates for potential failures.\n\nContext:\n${context}\n\nIMPORTANT FORMATTING RULES:
- Present EACH defect as a separate section with a heading like "## Defect 1: <Title>"
- Under each heading, use a markdown table with TWO columns: | Field | Details |
- Fields: Defect ID, Title, Severity, Priority, Preconditions, Steps to Reproduce, Expected Result, Actual Result, Environment
- Do NOT use bullet points or plain paragraphs — ONLY use markdown tables`;
        break;
      default:
        return;
    }

    // Start a new conversation for this generation
    const convId = createNewConversation();
    const timestamp = new Date().toISOString();
    addMessage(convId, { role: 'user', content: `Generate ${type} for ${selectedIssue.id}`, timestamp });
    addMessage(convId, { role: 'assistant', content: 'Initializing generation engine...', timestamp });

    setIsGenerating(true);
    const controller = new AbortController();
    setAbortController(controller);

    try {
      await chatStream(
        selectedModel,
        prompt,
        (content) => updateLastMessage(convId, content),
        () => {
          setIsGenerating(false);
          setAbortController(null);
          const currentMsgs = useStore.getState().conversations.find(c => c.id === convId)?.messages;
          if (currentMsgs && currentMsgs.length > 0) {
            const lastMsg = currentMsgs[currentMsgs.length - 1];
            if (lastMsg.content === 'Initializing generation engine...') {
              updateLastMessage(convId, 'No response from the AI. Please try a different prompt or model.');
            }
          }
        },
        (error) => {
          setIsGenerating(false);
          setAbortController(null);
          if (error.includes('AbortError') || error.includes('signal is aborted')) return;
          updateLastMessage(convId, `Error: ${error}`);
        },
        provider,
        cloudSettings,
        controller.signal
      );
    } catch (error) {
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  const handleStop = () => {
    stopGeneration();
    setIsGenerating(false);
  };

  const actionButtons = [
    { id: 'test-cases', label: 'Test Cases', icon: <FileText size={18} />, color: 'bg-blue-500' },
    { id: 'scenarios', label: 'Scenarios', icon: <List size={18} />, color: 'bg-purple-500' },
    { id: 'edge-cases', label: 'Edge Cases', icon: <Zap size={18} />, color: 'bg-amber-500' },
    { id: 'defect', label: 'Defect Template', icon: <Bug size={18} />, color: 'bg-red-500' },
  ];

  return (
    <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#0b0e14]/50 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {actionButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => generateContent(btn.id)}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 active:scale-95 ${
                isGenerating ? 'opacity-50 grayscale' : 'hover:shadow-lg'
              }`}
            >
              <div className={`p-1.5 rounded-lg text-white ${btn.color}`}>
                {btn.icon}
              </div>
              <span className="text-slate-700 dark:text-slate-300">{btn.label}</span>
            </button>
          ))}
          
          {isGenerating && (
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all animate-pulse"
            >
              <Square size={16} fill="currentColor" />
              Stop Generating
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-slate-500 hover:text-brand-500 transition-colors">
            <Copy size={14} />
            Copy All
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-slate-500 hover:text-brand-500 transition-colors">
            <Download size={14} />
            Export Results
          </button>
        </div>
      </div>
      
      {!selectedIssue && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <p className="text-[10px] text-amber-700 dark:text-amber-400">
            <strong>Context missing:</strong> Please select a Jira story to enable context-aware generation.
          </p>
        </div>
      )}
    </div>
  );
};

export default GenerationPanel;
