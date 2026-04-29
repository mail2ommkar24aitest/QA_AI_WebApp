import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      selectedModel: 'phi3:latest',
      availableModels: [],
      theme: 'dark',
      
      // Cloud Provider Settings
      provider: 'ollama', // 'ollama', 'openai', 'gemini'
      cloudSettings: {
        openai: { apiKey: '', model: 'gpt-4o' },
        gemini: { apiKey: '', model: 'gemini-1.5-flash' },
      },

      // Generation control
      isGenerating: false,
      setIsGenerating: (status) => set({ isGenerating: status }),
      abortController: null,
      setAbortController: (controller) => set({ abortController: controller }),
      stopGeneration: () => {
        const { abortController } = get();
        if (abortController) {
          abortController.abort();
          set({ abortController: null, isGenerating: false });
        }
      },

      // Jira Integration
      jiraSettings: {
        domain: '',
        email: '',
        apiToken: '',
      },
      jiraIssues: [],
      selectedIssue: null,

      setTheme: (theme) => set({ theme }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setAvailableModels: (models) => set({ availableModels: models }),
      setProvider: (provider) => set({ provider }),
      
      updateCloudSettings: (provider, settings) => set((state) => ({
        cloudSettings: {
          ...state.cloudSettings,
          [provider]: { ...state.cloudSettings[provider], ...settings }
        }
      })),

      updateJiraSettings: (settings) => set((state) => ({
        jiraSettings: { ...state.jiraSettings, ...settings }
      })),

      setJiraIssues: (newIssues) => set((state) => {
        // Merge and deduplicate by issue ID (New ones go to the TOP)
        const existingIds = new Set(state.jiraIssues.map(i => i.id));
        const uniqueNewIssues = newIssues.filter(i => !existingIds.has(i.id));
        return { jiraIssues: [...uniqueNewIssues, ...state.jiraIssues] };
      }),
      removeJiraIssue: (id) => set((state) => ({
        jiraIssues: state.jiraIssues.filter(i => i.id !== id),
        selectedIssue: state.selectedIssue?.id === id ? null : state.selectedIssue
      })),
      clearJiraIssues: () => set({ jiraIssues: [], selectedIssue: null }),
      setSelectedIssue: (issue) => set({ selectedIssue: issue }),

      // Test Execution Results
      testExecutions: [], // Array of { id, title, steps, expectedResult, actualResult, status: 'Pass' | 'Fail' | 'Pending', selected: boolean }
      setTestExecutions: (executions) => set({ testExecutions: executions }),
      updateTestExecution: (id, updates) => set((state) => ({
        testExecutions: state.testExecutions.map(ex => ex.id === id ? { ...ex, ...updates } : ex)
      })),
      clearTestExecutions: () => set({ testExecutions: [] }),

      createNewConversation: () => {
        const id = Date.now().toString();
        const newConversation = {
          id,
          title: 'New Conversation',
          messages: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id,
        }));
        return id;
      },

      setCurrentConversationId: (id) => set({ currentConversationId: id }),

      addMessage: (conversationId, message) => {
        set((state) => ({
          conversations: state.conversations.map((conv) => {
            if (conv.id === conversationId) {
              const messages = [...conv.messages, message];
              let title = conv.title;
              if (message.role === 'user' && conv.messages.length === 0) {
                title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
              }
              return { ...conv, messages, title };
            }
            return conv;
          }),
        }));
      },

      updateLastMessage: (conversationId, content) => {
        set((state) => ({
          conversations: state.conversations.map((conv) => {
            if (conv.id === conversationId) {
              const messages = [...conv.messages];
              if (messages.length > 0) {
                const lastMessage = messages[messages.length - 1];
                messages[messages.length - 1] = { ...lastMessage, content };
              }
              return { ...conv, messages };
            }
            return conv;
          }),
        }));
      },

      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((conv) => conv.id !== id),
          currentConversationId: state.currentConversationId === id ? null : state.currentConversationId,
        }));
      },

      clearHistory: () => {
        set({ conversations: [], currentConversationId: null });
      },
    }),
    {
      name: 'qa-chat-storage',
    }
  )
);

export default useStore;
