import React, { useState } from 'react';
import { Bug, Sparkles, Loader2, Send } from 'lucide-react';
import useStore from '../store';

const DefectForm = ({ onSubmit }) => {
  const { provider, selectedModel, cloudSettings, selectedIssue, jiraSettings } = useStore();
  const [loadingSeverity, setLoadingSeverity] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    summary: '',
    stepsToReproduce: '',
    expectedResult: '',
    actualResult: '',
    severity: 'Medium',
    priority: 'P2',
    category: 'Functional',
    classification: 'Negative'
  });

  const [aiReason, setAiReason] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSuggestSeverity = async () => {
    if (!formData.summary && !formData.actualResult) {
      alert("Please provide at least a summary or actual result for the AI to analyze.");
      return;
    }

    setLoadingSeverity(true);
    setAiReason('');

    try {
      const response = await fetch('http://localhost:3001/api/defect/suggest-severity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          provider,
          model: provider === 'ollama' ? selectedModel : cloudSettings[provider]?.model,
          settings: cloudSettings[provider] || {}
        })
      });

      if (!response.ok) throw new Error('Failed to fetch severity suggestion');
      
      const data = await response.json();
      setFormData(prev => ({ ...prev, severity: data.severity }));
      setAiReason(`AI Suggestion: ${data.reason}`);
    } catch (error) {
      console.error(error);
      alert('Could not suggest severity at this time.');
    } finally {
      setLoadingSeverity(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ ...formData, jiraStoryId: selectedIssue?.id });
      return;
    }

    if (!jiraSettings?.domain || !jiraSettings?.email || !jiraSettings?.apiToken) {
      alert('Please configure Jira credentials in settings first.');
      return;
    }

    if (!selectedIssue?.id) {
      alert('Please select a Jira Story from the sidebar first so I know which project to create the defect in.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3001/api/defect/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defectData: formData,
          jiraStoryId: selectedIssue?.id,
          jiraSettings
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit defect');
      }

      alert(`Successfully created defect: ${result.key}`);
      
      // Clear form
      setFormData({
        summary: '',
        stepsToReproduce: '',
        expectedResult: '',
        actualResult: '',
        severity: 'Medium',
        priority: 'P2',
        category: 'Functional',
        classification: 'Negative'
      });
      setAiReason('');
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg">
          <Bug size={24} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Create Defect</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Defect Summary *</label>
            <input 
              type="text" 
              name="summary" 
              required
              value={formData.summary} 
              onChange={handleChange}
              placeholder="Brief description of the issue..."
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expected Output</label>
              <textarea 
                name="expectedResult" 
                value={formData.expectedResult} 
                onChange={handleChange}
                placeholder="What should have happened?"
                rows={3}
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Actual Output</label>
              <textarea 
                name="actualResult" 
                value={formData.actualResult} 
                onChange={handleChange}
                placeholder="What actually happened?"
                rows={3}
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Steps to Reproduce</label>
            <textarea 
              name="stepsToReproduce" 
              value={formData.stepsToReproduce} 
              onChange={handleChange}
              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
              rows={4}
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>
        </div>

        {/* Categorization Dropdowns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Severity</label>
              <button 
                type="button" 
                onClick={handleSuggestSeverity}
                disabled={loadingSeverity}
                className="text-[10px] flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 disabled:opacity-50"
                title="Use AI to suggest severity based on description"
              >
                {loadingSeverity ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Auto
              </button>
            </div>
            <select 
              name="severity" 
              value={formData.severity} 
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            {aiReason && <p className="text-[10px] text-green-600 dark:text-green-400 mt-1 truncate" title={aiReason}>{aiReason}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
            <select 
              name="priority" 
              value={formData.priority} 
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="P0">P0 (Blocker)</option>
              <option value="P1">P1 (High)</option>
              <option value="P2">P2 (Medium)</option>
              <option value="P3">P3 (Low)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select 
              name="category" 
              value={formData.category} 
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Functional">Functional</option>
              <option value="Non Functional">Non Functional</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Classification</label>
            <select 
              name="classification" 
              value={formData.classification} 
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Positive">Positive</option>
              <option value="Negative">Negative</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {isSubmitting ? 'Submitting...' : 'Submit Defect to Jira'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DefectForm;
