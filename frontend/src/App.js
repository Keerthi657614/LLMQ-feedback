import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Plus, Trash2, Edit, Check, X, Bot } from 'lucide-react';

const API_BASE_URL = 'https://llmq-feedback-backend-gsva.onrender.com/api';
function App() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: ''
  });

  // AI Chat states
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/feedback`);
      if (response.data.success) {
        setFeedback(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch feedback');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.author) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/feedback`, formData);
      if (response.data.success) {
        setFeedback([response.data.data, ...feedback]);
        setFormData({ title: '', content: '', author: '' });
        setError('');
      }
    } catch (err) {
      setError('Failed to create feedback');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/feedback/${id}`);
      setFeedback(feedback.filter(f => f.id !== id));
    } catch (err) {
      setError('Failed to delete feedback');
      console.error(err);
    }
  };

  const handleEdit = (feedbackItem) => {
    setEditingId(feedbackItem.id);
    setEditForm({
      title: feedbackItem.title,
      content: feedbackItem.content,
      author: feedbackItem.author,
      status: feedbackItem.status
    });
  };

  const handleUpdateSubmit = async () => {
    try {
      const response = await axios.put(`${API_BASE_URL}/feedback/${editingId}`, editForm);
      if (response.data.success) {
        setFeedback(feedback.map(f => 
          f.id === editingId ? response.data.data : f
        ));
        setEditingId(null);
        setEditForm({});
      }
    } catch (err) {
      setError('Failed to update feedback');
      console.error(err);
    }
  };

  const handleAiChat = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      setAiLoading(true);
      const response = await axios.post(`${API_BASE_URL}/ai/chat`, {
        question: question.trim()
      });
      
      if (response.data.success) {
        setAiResponse(response.data.data.answer);
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setAiResponse('OpenAI API quota exceeded. Please check your API usage and billing.');
      } else if (err.response?.status === 401) {
        setAiResponse('OpenAI API key is invalid. Please check your configuration.');
      } else if (err.response?.status === 500 && err.response?.data?.message?.includes('not configured')) {
        setAiResponse('OpenAI API key is not configured. Please add your API key to the backend environment variables.');
      } else {
        setAiResponse('Sorry, I encountered an error while processing your request.');
      }
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            Feedback Tracker
          </h1>
          <p className="text-gray-600 mt-2">Collect and manage feedback with AI-powered insights</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* AI Chat Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Bot className="h-5 w-5 text-purple-600" />
            AI Assistant
          </h2>
          <form onSubmit={handleAiChat} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask me anything about feedback management..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={aiLoading || !question.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? 'Thinking...' : 'Ask AI'}
              </button>
            </div>
          </form>
          {aiResponse && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-gray-800 whitespace-pre-wrap">{aiResponse}</p>
            </div>
          )}
        </div>

        {/* Feedback Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-green-600" />
            Add New Feedback
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter feedback title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your feedback details"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Feedback'}
            </button>
          </form>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Feedback List ({feedback.length})
          </h2>
          
          {loading && feedback.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading feedback...</p>
            </div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No feedback yet. Add the first one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  {editingId === item.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        value={editForm.content}
                        onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={editForm.author}
                          onChange={(e) => setEditForm({...editForm, author: e.target.value})}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                          className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateSubmit}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                        >
                          <Check className="h-4 w-4" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-1"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{item.content}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>By: {item.author}</span>
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
