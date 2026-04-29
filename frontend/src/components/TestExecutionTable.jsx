import React, { useState } from 'react';
import { PlayCircle, AlertCircle, CheckCircle, Bug, Trash2 } from 'lucide-react';
import useStore from '../store';

const TestExecutionTable = () => {
  const { testExecutions, updateTestExecution, removeTestExecution, clearTestExecutions, selectedIssue } = useStore();
  const [isCreatingDefects, setIsCreatingDefects] = useState(false);

  // Filter for failed test cases that are selected
  const selectedFailedCases = testExecutions.filter(tc => tc.status === 'Failed' && tc.selected);

  const handleStatusChange = (id, status) => {
    updateTestExecution(id, { status });
  };

  const handleSelectToggle = (id, currentSelected) => {
    updateTestExecution(id, { selected: !currentSelected });
  };

  const handleCreateAutoDefects = async () => {
    if (selectedFailedCases.length === 0) return;

    setIsCreatingDefects(true);
    try {
      // In a real scenario, this would call the backend API: /api/defect/from-testcases
      // For this demo, we'll simulate the API call that uses AutoDefectService
      const response = await fetch('http://localhost:3001/api/defect/from-testcases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Basic ${btoa(jiraSettings.email + ":" + jiraSettings.apiToken)}`
        },
        body: JSON.stringify({
          testCases: selectedFailedCases,
          jiraStoryId: selectedIssue?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to auto-create defects');
      }

      const result = await response.json();
      alert(`Successfully created ${result.defectsCreated?.length || 0} defects!`);
      
      // Mark as processed or remove from list
      selectedFailedCases.forEach(tc => {
        updateTestExecution(tc.id, { selected: false, status: 'Defect Logged' });
      });

    } catch (error) {
      console.error(error);
      alert('Error creating auto-defects. Check backend connection and Jira credentials.');
    } finally {
      setIsCreatingDefects(false);
    }
  };

  if (testExecutions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm mt-6">
      <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
            <PlayCircle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Test Execution Results</h2>
            <p className="text-xs text-slate-500">Mark tests as failed to auto-generate Jira defects</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {selectedFailedCases.length > 0 && (
            <button 
              onClick={handleCreateAutoDefects}
              disabled={isCreatingDefects}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isCreatingDefects ? <Loader2 size={16} className="animate-spin" /> : <Bug size={16} />}
              Create Defects ({selectedFailedCases.length})
            </button>
          )}
          <button 
            onClick={clearTestExecutions}
            className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10"
            title="Clear All"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
              <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-12 text-center">Sel</th>
              <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Test Case Title</th>
              <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Expected Result</th>
              <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {testExecutions.map(tc => (
              <tr key={tc.id} className={`hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors ${tc.status === 'Failed' ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                <td className="p-3 text-center">
                  <input 
                    type="checkbox" 
                    checked={tc.selected || false}
                    onChange={() => handleSelectToggle(tc.id, tc.selected)}
                    disabled={tc.status !== 'Failed'}
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                </td>
                <td className="p-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {tc.title}
                  {tc.status === 'Failed' && (
                    <div className="mt-1 text-xs text-red-500 dark:text-red-400">
                      <strong>Actual:</strong> {tc.actualResult || "Needs actual result"}
                    </div>
                  )}
                </td>
                <td className="p-3 text-sm text-slate-600 dark:text-slate-400 truncate max-w-[200px]" title={tc.expectedResult}>
                  {tc.expectedResult}
                </td>
                <td className="p-3">
                  <select 
                    value={tc.status}
                    onChange={(e) => handleStatusChange(tc.id, e.target.value)}
                    className={`text-xs font-bold px-2 py-1 rounded-md border ${
                      tc.status === 'Pass' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' :
                      tc.status === 'Failed' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-300'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Pass">Pass</option>
                    <option value="Failed">Failed</option>
                    <option value="Defect Logged">Logged</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestExecutionTable;
