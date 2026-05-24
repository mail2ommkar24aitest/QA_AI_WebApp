import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Database, Cpu, Table as TableIcon } from 'lucide-react';

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: 'Hello! I am your AI Database Assistant. You can ask me to show customers, orders, or add new data using natural language.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage = { role: 'user', content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/query', { prompt });
      const { sql, results, message } = response.data;

      const aiMessage = {
        role: 'ai',
        content: message,
        sql: sql,
        results: results,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'ai',
        content: error.response?.data?.error || 'Something went wrong.',
        sql: error.response?.data?.generatedSql,
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <Database size={24} color="#3b82f6" />
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>AI Database Assistant</h2>
      </header>

      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="bubble">{msg.content}</div>
            
            {msg.sql && (
              <div className="sql-block">
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Cpu size={12} /> GENERATED SQL
                </div>
                <code>{msg.sql}</code>
              </div>
            )}

            {msg.results && msg.results.length > 0 && (
              <div className="table-container">
                <div style={{ padding: '8px', fontSize: '0.7rem', color: '#94a3b8', background: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TableIcon size={12} /> DATA RESULTS
                </div>
                <table>
                  <thead>
                    <tr>
                      {Object.keys(msg.results[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {msg.results.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td key={j}>{val?.toString()}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="message ai">
            <div className="bubble">Thinking...</div>
          </div>
        )}
      </div>

      <form className="input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="e.g. Show all customers from New York"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !prompt.trim()}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default App;
