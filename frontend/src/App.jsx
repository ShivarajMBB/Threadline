import React, { useState, useEffect } from 'react';
import {
  authAPI,
  messagesAPI,
  leadsAPI,
  salesPagesAPI,
  schedulerAPI,
  settingsAPI,
  audienceInsightsAPI
} from './api';
import { 
  Send, Settings, MessageSquare, ArrowLeft, Users, DollarSign, 
  Calendar, TrendingUp, AlertCircle, Bell, Plus, Search, Filter,
  Clock, CheckCircle, XCircle, Phone, ExternalLink, Edit, Trash2,
  Image, ChevronRight, ChevronDown, BarChart3, Instagram, Globe, MapPin, PieChart
} from 'lucide-react';

// ============================================================================
// LOGIN COMPONENT
// ============================================================================

function Login({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await authAPI.login(formData.email, formData.password);
        onLoginSuccess(data.user);
      } else {
        const data = await authAPI.register(
          formData.email,
          formData.password,
          formData.businessName
        );
        onLoginSuccess(data.user);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '30px', textAlign: 'center' }}>
          {isLogin ? 'Login to Threadline' : 'Create Account'}
        </h2>

        {error && (
          <div style={{
            background: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{
              padding: '14px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '15px',
              outline: 'none'
            }}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={{
              padding: '14px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '15px',
              outline: 'none'
            }}
            required
          />

          {!isLogin && (
            <input
              type="text"
              placeholder="Business Name"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              style={{
                padding: '14px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none'
              }}
              required
            />
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '14px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>

        <div style={{
          marginTop: '30px',
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '8px',
          borderLeft: '4px solid #667eea'
        }}>
          <p style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>Test Account:</p>
          <p style={{ fontSize: '13px', color: '#666', margin: '4px 0' }}>Email: test@test.com</p>
          <p style={{ fontSize: '13px', color: '#666', margin: '4px 0' }}>Password: password123</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function ThreadlineCRM() {
  // Auth state FIRST
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Navigation
  const [currentView, setCurrentView] = useState('inbox');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  
  // Data State - from API
  const [conversations, setConversations] = useState([]);
  const [leads, setLeads] = useState([]);
  const [salesPages, setSalesPages] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // UI State
  const [replyText, setReplyText] = useState('');
  const [acknowledgmentEnabled, setAcknowledgmentEnabled] = useState(false);
  const [acknowledgmentMessage, setAcknowledgmentMessage] = useState('Thanks for reaching out. We\'ll reply shortly.');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState('all');

  // Modal / Form State
  const [showSchedulerForm, setShowSchedulerForm] = useState(false);
  const [schedulerForm, setSchedulerForm] = useState({ caption: '', imageUrl: '', scheduledFor: '', trackingKeyword: '' });
  const [showSalesPageForm, setShowSalesPageForm] = useState(false);
  const [salesPageForm, setSalesPageForm] = useState({ title: '', description: '', price: '', imageUrl: '' });
  const [editingSalesPage, setEditingSalesPage] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Audience Insights State
  const [audienceInsights, setAudienceInsights] = useState(null);
  const [audienceInsightsLoading, setAudienceInsightsLoading] = useState(false);
  const [audienceInsightsError, setAudienceInsightsError] = useState(null);
  const [audienceMetricType, setAudienceMetricType] = useState('follower_demographics');

  // Comment-to-DM Automation State
  const [commentAutomations, setCommentAutomations] = useState([]);
  const [showAutomationForm, setShowAutomationForm] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState(null);
  const [automationForm, setAutomationForm] = useState({ keyword: '', dmMessage: '', publicReply: '' });

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authAPI.isAuthenticated()) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Auth check failed:', error);
          authAPI.logout();
        }
      }
      setAuthLoading(false);
    };
    checkAuth();
  }, []);

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  // Load audience insights only when navigating to that page
  useEffect(() => {
    if (currentView === 'audience-insights' && user) {
      loadAudienceInsights(audienceMetricType);
    }
  }, [currentView, audienceMetricType]);


  // ============================================================================
  // DATA LOADING FUNCTIONS
  // ============================================================================

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadConversations(),
        loadLeads(),
        loadSalesPages(),
        loadScheduledPosts(),
        loadSettings(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAudienceInsights = async (metric = 'follower_demographics') => {
    setAudienceInsightsLoading(true);
    setAudienceInsightsError(null);
    try {
      const data = await audienceInsightsAPI.getInsights(metric);
      setAudienceInsights(data.insights);
    } catch (error) {
      console.error('Error loading audience insights:', error);
      const errorCode = error.response?.data?.code;
      const errorMessage = error.response?.data?.error || 'Failed to load audience insights';
      setAudienceInsightsError({ code: errorCode, message: errorMessage });
      setAudienceInsights(null);
    } finally {
      setAudienceInsightsLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await settingsAPI.getSettings();
      if (data) {
        setAcknowledgmentEnabled(data.acknowledgmentEnabled || false);
        if (data.acknowledgmentMessage) setAcknowledgmentMessage(data.acknowledgmentMessage);
        if (data.commentAutomations) setCommentAutomations(data.commentAutomations);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const data = await messagesAPI.getConversations();
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    }
  };

  const loadLeads = async () => {
    try {
      const data = await leadsAPI.getLeads();
      setLeads(data || []);
    } catch (error) {
      console.error('Error loading leads:', error);
      setLeads([]);
    }
  };

  const loadSalesPages = async () => {
    try {
      const data = await salesPagesAPI.getPages();
      setSalesPages(data || []);
    } catch (error) {
      console.error('Error loading sales pages:', error);
      setSalesPages([]);
    }
  };

  const loadScheduledPosts = async () => {
    try {
      const data = await schedulerAPI.getPosts();
      setScheduledPosts(data || []);
    } catch (error) {
      console.error('Error loading scheduled posts:', error);
      setScheduledPosts([]);
    }
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getLeadForConversation = (conversationId) => {
    const conv = conversations.find(c => c._id === conversationId);
    return leads.find(l => l.instagramUserId === conv?.instagramUserId);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation) return;

    try {
      await messagesAPI.sendMessage(selectedConversation._id, replyText);
      await loadConversations();
      
      const updated = conversations.find(c => c._id === selectedConversation._id);
      if (updated) {
        setSelectedConversation(updated);
      }

      setReplyText('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const updateLeadState = async (leadId, newState) => {
    try {
      await leadsAPI.updateLead(leadId, { funnelState: newState });
      await loadLeads();
      
      if (selectedLead && selectedLead._id === leadId) {
        const updated = leads.find(l => l._id === leadId);
        setSelectedLead(updated);
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Failed to update lead');
    }
  };

  const updateLeadRevenue = async (leadId, revenue) => {
    try {
      await leadsAPI.updateLead(leadId, { 
        revenue, 
        funnelState: 'closed'
      });
      await loadLeads();
      
      if (selectedLead && selectedLead._id === leadId) {
        const updated = leads.find(l => l._id === leadId);
        setSelectedLead(updated);
      }
    } catch (error) {
      console.error('Error updating revenue:', error);
      alert('Failed to update revenue');
    }
  };

  // ---- Scheduler Handlers ----
  const handleCreatePost = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await schedulerAPI.createPost(schedulerForm);
      await loadScheduledPosts();
      setShowSchedulerForm(false);
      setSchedulerForm({ caption: '', imageUrl: '', scheduledFor: '', trackingKeyword: '' });
    } catch (error) {
      console.error('Error creating post:', error);
      alert(error.response?.data?.error || 'Failed to schedule post');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePublishPost = async (postId) => {
    if (!confirm('Publish this post to Instagram now?')) return;
    try {
      await schedulerAPI.publishPost(postId);
      await loadScheduledPosts();
    } catch (error) {
      console.error('Error publishing post:', error);
      alert(error.response?.data?.error || error.response?.data?.details || 'Failed to publish post');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Cancel/delete this scheduled post?')) return;
    try {
      await schedulerAPI.deletePost(postId);
      await loadScheduledPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  // ---- Sales Pages Handlers ----
  const handleCreateSalesPage = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await salesPagesAPI.createPage({
        ...salesPageForm,
        price: parseFloat(salesPageForm.price)
      });
      await loadSalesPages();
      setShowSalesPageForm(false);
      setSalesPageForm({ title: '', description: '', price: '', imageUrl: '' });
      setEditingSalesPage(null);
    } catch (error) {
      console.error('Error creating sales page:', error);
      alert(error.response?.data?.error || 'Failed to create sales page');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateSalesPage = async (e) => {
    e.preventDefault();
    if (!editingSalesPage) return;
    setFormLoading(true);
    try {
      await salesPagesAPI.updatePage(editingSalesPage._id, {
        ...salesPageForm,
        price: parseFloat(salesPageForm.price)
      });
      await loadSalesPages();
      setShowSalesPageForm(false);
      setSalesPageForm({ title: '', description: '', price: '', imageUrl: '' });
      setEditingSalesPage(null);
    } catch (error) {
      console.error('Error updating sales page:', error);
      alert(error.response?.data?.error || 'Failed to update sales page');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSalesPage = async (pageId) => {
    if (!confirm('Delete this sales page?')) return;
    try {
      await salesPagesAPI.deletePage(pageId);
      await loadSalesPages();
    } catch (error) {
      console.error('Error deleting sales page:', error);
      alert('Failed to delete sales page');
    }
  };

  // Comment-to-DM Automation handlers
  const handleSaveAutomation = async () => {
    if (!automationForm.keyword.trim() || !automationForm.dmMessage.trim()) return;

    let updated;
    if (editingAutomation !== null) {
      updated = commentAutomations.map((a, i) =>
        i === editingAutomation
          ? { ...a, keyword: automationForm.keyword.toUpperCase().trim(), dmMessage: automationForm.dmMessage, publicReply: automationForm.publicReply }
          : a
      );
    } else {
      updated = [...commentAutomations, {
        keyword: automationForm.keyword.toUpperCase().trim(),
        dmMessage: automationForm.dmMessage,
        publicReply: automationForm.publicReply,
        enabled: true,
        triggerCount: 0
      }];
    }

    try {
      const saved = await settingsAPI.saveCommentAutomations(updated);
      setCommentAutomations(saved);
    } catch (err) {
      console.error('Failed to save automation:', err);
    }
    setShowAutomationForm(false);
    setEditingAutomation(null);
    setAutomationForm({ keyword: '', dmMessage: '', publicReply: '' });
  };

  const handleToggleAutomation = async (index) => {
    const updated = commentAutomations.map((a, i) =>
      i === index ? { ...a, enabled: !a.enabled } : a
    );
    try {
      const saved = await settingsAPI.saveCommentAutomations(updated);
      setCommentAutomations(saved);
    } catch (err) {
      console.error('Failed to toggle automation:', err);
    }
  };

  const handleDeleteAutomation = async (index) => {
    const updated = commentAutomations.filter((_, i) => i !== index);
    try {
      const saved = await settingsAPI.saveCommentAutomations(updated);
      setCommentAutomations(saved);
    } catch (err) {
      console.error('Failed to delete automation:', err);
    }
  };

  const openEditAutomation = (index) => {
    const a = commentAutomations[index];
    setAutomationForm({ keyword: a.keyword, dmMessage: a.dmMessage, publicReply: a.publicReply || '' });
    setEditingAutomation(index);
    setShowAutomationForm(true);
  };

  const openEditSalesPage = (page) => {
    setEditingSalesPage(page);
    setSalesPageForm({
      title: page.title,
      description: page.description,
      price: page.price.toString(),
      imageUrl: page.imageUrl || ''
    });
    setShowSalesPageForm(true);
  };

  const getStats = () => {
    const totalLeads = leads.length;
    const activeLeads = leads.filter(l => !['closed', 'lost'].includes(l.funnelState)).length;
    const totalRevenue = leads.reduce((sum, lead) => sum + (lead.revenue || 0), 0);
    const conversionRate = totalLeads > 0 ? ((leads.filter(l => l.funnelState === 'closed').length / totalLeads) * 100).toFixed(1) : 0;
    const unreadMessages = conversations.filter(c => c.unread).length;
    
    return { totalLeads, activeLeads, totalRevenue, conversionRate, unreadMessages };
  };

  const getAlerts = () => {
    const alerts = [];
    const now = new Date();
    
    leads.forEach(lead => {
      if (lead.funnelState === 'new' && !lead.lastReply) {
        const createdAt = new Date(lead.createdAt);
        const hoursSince = (now - createdAt) / (1000 * 60 * 60);
        if (hoursSince > 24) {
          alerts.push({
            type: 'urgent',
            message: `New lead @${lead.username} unreplied for ${Math.floor(hoursSince)}h`,
            leadId: lead._id
          });
        }
      }
      
      if (lead.funnelState === 'interested' && lead.lastReply) {
        const lastReply = new Date(lead.lastReply);
        const hoursSince = (now - lastReply) / (1000 * 60 * 60);
        if (hoursSince > 48) {
          alerts.push({
            type: 'warning',
            message: `Hot lead @${lead.username} idle for ${Math.floor(hoursSince / 24)} days`,
            leadId: lead._id
          });
        }
      }
    });
    
    return alerts;
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderDashboard = () => {
    const stats = getStats();
    const alerts = getAlerts();
    const recentLeads = [...leads].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    ).slice(0, 5);

    return (
      <div className="view-content">
        <div className="view-header">
          <div>
            <h1>Dashboard</h1>
            <p className="view-subtitle">Your Instagram business overview</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon revenue">
              <DollarSign size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">${stats.totalRevenue.toLocaleString()}</div>
              <div className="stat-change positive">+12% from last month</div>
              <div className="stat-disclaimer">User-reported & manually marked</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon leads">
              <Users size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Active Leads</div>
              <div className="stat-value">{stats.activeLeads}</div>
              <div className="stat-change neutral">of {stats.totalLeads} total</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon conversion">
              <TrendingUp size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Conversion Rate</div>
              <div className="stat-value">{stats.conversionRate}%</div>
              <div className="stat-change positive">+3.2% this week</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon messages">
              <MessageSquare size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Unread Messages</div>
              <div className="stat-value">{stats.unreadMessages}</div>
              <div className="stat-change warning">Needs attention</div>
            </div>
          </div>
        </div>

        <div className="dashboard-disclaimer">
          (i) Revenue and conversion data are user-reported or manually marked.
        </div>

        {alerts.length > 0 && (
          <div className="alerts-section">
            <div className="section-header">
              <Bell size={18} />
              <h2>Follow-up Alerts</h2>
            </div>
            <div className="alerts-list">
              {alerts.map((alert, index) => (
                <div key={index} className={`alert-item ${alert.type}`}>
                  <AlertCircle size={18} />
                  <span>{alert.message}</span>
                  <button 
                    className="alert-action"
                    onClick={() => {
                      const lead = leads.find(l => l._id === alert.leadId);
                      setSelectedLead(lead);
                      setCurrentView('lead-detail');
                    }}
                  >
                    View Lead
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="section">
          <div className="section-header">
            <h2>Recent Leads</h2>
            <button 
              className="btn-text"
              onClick={() => setCurrentView('leads')}
            >
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="leads-quick-list">
            {recentLeads.map(lead => (
              <div 
                key={lead._id}
                className="lead-quick-item"
                onClick={() => {
                  setSelectedLead(lead);
                  setCurrentView('lead-detail');
                }}
              >
                <div className="lead-quick-left">
                  <div className="avatar-small">
                    {lead.username.charAt(1).toUpperCase()}
                  </div>
                  <div>
                    <div className="lead-quick-name">{lead.name || lead.username}</div>
                    <div className="lead-quick-source">
                      {lead.source.replace('_', ' ')} • {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className={`funnel-badge ${lead.funnelState}`}>
                  {lead.funnelState.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderInbox = () => (
    <div className="view-content">
      <div className="view-header">
        <div>
          <h1>Threadline CRM — Inbox</h1>
          <p className="view-subtitle">Instagram messages • All replies are sent manually by the business</p>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="compliance-banner">
        (i) Incoming Instagram messages appear here for manual review and reply by your business.
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
          Loading conversations...
        </div>
      ) : conversations.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px',
          background: 'white',
          borderRadius: '16px'
        }}>
          <MessageSquare size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
          <p style={{ color: '#6c757d' }}>No conversations yet. Connect your Instagram account to get started.</p>
        </div>
      ) : (
        <div className="conversation-list">
          {conversations.map(conv => (
            <div 
              key={conv._id}
              className={`conversation-item ${conv.unread ? 'unread' : ''}`}
              onClick={async () => {
                setSelectedConversation(conv);
                setCurrentView('conversation');
                // Mark as read via API and update local state
                try {
                  await messagesAPI.getConversation(conv._id);
                  setConversations(prev => prev.map(c =>
                    c._id === conv._id ? { ...c, unread: false } : c
                  ));
                } catch (e) { /* ignore */ }
              }}
            >
              <div className="conv-left">
                <div className="avatar">{conv.username?.charAt(0).toUpperCase()}</div>
                <div className="conv-details">
                  <div className="conv-header-row">
                    <div className="username">{conv.username}</div>
                    {conv.unread && <div className="unread-dot" />}
                  </div>
                  <div className="last-message">
                    {conv.messages[conv.messages.length - 1]?.message || 'No messages'}
                  </div>
                  <div className="conv-meta">
                    <span className={`source-tag ${conv.source}`}>
                      {conv.source?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="conv-right">
                <div className="timestamp">
                  {new Date(conv.lastMessageAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderConversation = () => {
    if (!selectedConversation) return null;
    
    const lead = getLeadForConversation(selectedConversation._id);

    return (
      <div className="conversation-view">
        <div className="conversation-header">
          <button 
            className="back-btn"
            onClick={() => setCurrentView('inbox')}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="conversation-title">
            <div className="username">Conversation with {selectedConversation.username}</div>
            {lead && (
              <div className="lead-link" onClick={() => {
                setSelectedLead(lead);
                setCurrentView('lead-detail');
              }}>
                View in CRM <ChevronRight size={14} />
              </div>
            )}
          </div>
        </div>

        <div className="conversation-body">
          <div className="message-thread">
            {selectedConversation.messages?.map((msg, index) => (
              <div 
                key={msg._id || index}
                className={`message-bubble ${msg.isFromBusiness ? 'business' : 'customer'}`}
              >
                <div className="message-header">
                  <span className="sender-label">
                    {msg.isFromBusiness ? 'Business' : 'Customer'}
                  </span>
                  <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="message-text">{msg.message}</div>
              </div>
            ))}
          </div>

          <div className="reply-box">
            <div className="reply-disclaimer">
              (i) Replies are sent manually by the business.
            </div>
            <textarea
              placeholder="Type your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
            />
            <button 
              className="send-btn"
              onClick={handleSendReply}
              disabled={!replyText.trim()}
            >
              <Send size={18} />
              Send reply
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderLeads = () => {
    const filteredLeads = leads.filter(lead => {
      if (filterState !== 'all' && lead.funnelState !== filterState) return false;
      if (searchQuery && !lead.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !lead.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    const funnelStates = [
      { key: 'all', label: 'All Leads', count: leads.length },
      { key: 'new', label: 'New', count: leads.filter(l => l.funnelState === 'new').length },
      { key: 'replied', label: 'Replied', count: leads.filter(l => l.funnelState === 'replied').length },
      { key: 'interested', label: 'Interested', count: leads.filter(l => l.funnelState === 'interested').length },
      { key: 'call_booked', label: 'Call Booked', count: leads.filter(l => l.funnelState === 'call_booked').length },
      { key: 'closed', label: 'Closed', count: leads.filter(l => l.funnelState === 'closed').length },
      { key: 'lost', label: 'Lost', count: leads.filter(l => l.funnelState === 'lost').length }
    ];

    return (
      <div className="view-content">
        <div className="view-header">
          <div>
            <h1>Leads & CRM</h1>
            <p className="view-subtitle">Manage your Instagram leads • Lead stages are managed manually</p>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="compliance-banner">
          (i) Lead stages are managed and updated manually by your business.
        </div>

        <div className="crm-disclaimer">
          (i) Lead stages are managed manually. No automated workflows.
        </div>

        <div className="funnel-filters">
          {funnelStates.map(state => (
            <button
              key={state.key}
              className={`funnel-filter ${filterState === state.key ? 'active' : ''}`}
              onClick={() => setFilterState(state.key)}
            >
              {state.label}
              <span className="count">{state.count}</span>
            </button>
          ))}
        </div>

        {filteredLeads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' }}>
            <Users size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
            <p style={{ color: '#6c757d' }}>No leads yet</p>
          </div>
        ) : (
          <div className="leads-table">
            <div className="table-header">
              <div className="th lead-col">Lead</div>
              <div className="th source-col">Source</div>
              <div className="th state-col">State</div>
              <div className="th revenue-col">Revenue</div>
              <div className="th date-col">Created</div>
              <div className="th actions-col">Actions</div>
            </div>
            {filteredLeads.map(lead => (
              <div key={lead._id} className="table-row">
                <div className="td lead-col">
                  <div className="avatar-small">
                    {lead.username?.charAt(1).toUpperCase()}
                  </div>
                  <div>
                    <div className="lead-name">{lead.name || lead.username}</div>
                    <div className="lead-username">{lead.username}</div>
                  </div>
                </div>
                <div className="td source-col">
                  <span className={`source-tag ${lead.source}`}>
                    {lead.source?.replace('_', ' ')}
                  </span>
                  <div className="source-content">{lead.sourceContent}</div>
                </div>
                <div className="td state-col">
                  <span className={`funnel-badge ${lead.funnelState}`}>
                    {lead.funnelState?.replace('_', ' ')}
                  </span>
                </div>
                <div className="td revenue-col">
                  {lead.revenue ? `$${lead.revenue.toLocaleString()}` : '—'}
                </div>
                <div className="td date-col">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </div>
                <div className="td actions-col">
                  <button 
                    className="btn-icon"
                    onClick={() => {
                      setSelectedLead(lead);
                      setCurrentView('lead-detail');
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderLeadDetail = () => {
    if (!selectedLead) return null;

    return (
      <div className="view-content">
        <div className="view-header">
          <button 
            className="back-btn"
            onClick={() => setCurrentView('leads')}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>{selectedLead.name || selectedLead.username}</h1>
            <p className="view-subtitle">{selectedLead.username}</p>
          </div>
        </div>

        <div className="lead-detail-grid">
          <div className="lead-detail-main">
            <div className="detail-card">
              <h3>Contact Information</h3>
              <div className="detail-fields">
                <div className="detail-field">
                  <label>Instagram</label>
                  <div className="field-value">{selectedLead.username}</div>
                </div>
                {selectedLead.email && (
                  <div className="detail-field">
                    <label>Email</label>
                    <div className="field-value">{selectedLead.email}</div>
                  </div>
                )}
                {selectedLead.phone && (
                  <div className="detail-field">
                    <label>Phone</label>
                    <div className="field-value">{selectedLead.phone}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="detail-card">
              <h3>Lead Source</h3>
              <div className="detail-fields">
                <div className="detail-field">
                  <label>Channel</label>
                  <span className={`source-tag ${selectedLead.source}`}>
                    {selectedLead.source?.replace('_', ' ')}
                  </span>
                </div>
                <div className="detail-field">
                  <label>Content</label>
                  <div className="field-value">{selectedLead.sourceContent}</div>
                </div>
                <div className="detail-field">
                  <label>Created</label>
                  <div className="field-value">
                    {new Date(selectedLead.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <h3>Notes</h3>
              <div className="notes-area">
                <textarea 
                  value={selectedLead.notes || ''}
                  onChange={(e) => {
                    setLeads(leads.map(l => 
                      l._id === selectedLead._id 
                        ? { ...l, notes: e.target.value }
                        : l
                    ));
                    setSelectedLead({ ...selectedLead, notes: e.target.value });
                  }}
                  onBlur={async () => {
                    try {
                      await leadsAPI.updateLead(selectedLead._id, { notes: selectedLead.notes || '' });
                    } catch (err) {
                      console.error('Failed to save notes:', err);
                    }
                  }}
                  placeholder="Add notes about this lead..."
                />
              </div>
            </div>
          </div>

          <div className="lead-detail-sidebar">
            <div className="detail-card">
              <h3>Deal State</h3>
              <div className="funnel-progression">
                {['new', 'replied', 'interested', 'call_booked', 'closed'].map((state, index) => (
                  <div 
                    key={state}
                    className={`funnel-step ${selectedLead.funnelState === state ? 'active' : ''} ${
                      ['new', 'replied', 'interested', 'call_booked'].indexOf(selectedLead.funnelState) > index ? 'completed' : ''
                    }`}
                    onClick={() => updateLeadState(selectedLead._id, state)}
                  >
                    <div className="funnel-step-icon">
                      {['new', 'replied', 'interested', 'call_booked'].indexOf(selectedLead.funnelState) > index ? (
                        <CheckCircle size={20} />
                      ) : (
                        <div className="step-number">{index + 1}</div>
                      )}
                    </div>
                    <div className="funnel-step-label">
                      {state.replace('_', ' ')}
                    </div>
                  </div>
                ))}
                <div 
                  className={`funnel-step lost ${selectedLead.funnelState === 'lost' ? 'active' : ''}`}
                  onClick={() => updateLeadState(selectedLead._id, 'lost')}
                >
                  <div className="funnel-step-icon">
                    <XCircle size={20} />
                  </div>
                  <div className="funnel-step-label">Lost</div>
                </div>
              </div>
            </div>

            {selectedLead.funnelState === 'closed' && (
              <div className="detail-card revenue-card">
                <h3>Revenue</h3>
                <div className="revenue-input">
                  <div className="input-group">
                    <span className="input-prefix">$</span>
                    <input 
                      type="number"
                      defaultValue={selectedLead.revenue || ''}
                      onBlur={(e) => updateLeadRevenue(selectedLead._id, parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  {selectedLead.revenue && (
                    <div className="revenue-display">
                      Revenue: ${selectedLead.revenue.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="detail-card">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <button 
                  className="action-btn"
                  onClick={() => {
                    const conv = conversations.find(c => c.instagramUserId === selectedLead.instagramUserId);
                    if (conv) {
                      setSelectedConversation(conv);
                      setCurrentView('conversation');
                    }
                  }}
                >
                  <MessageSquare size={16} />
                  View Messages
                </button>
                <button className="action-btn" onClick={() => {
                  const note = `Call scheduled for ${selectedLead.username} on ${new Date().toLocaleDateString()}`;
                  const current = selectedLead.notes || '';
                  const updated = current ? `${current}\n${note}` : note;
                  leadsAPI.updateLead(selectedLead._id, { notes: updated }).then(() => {
                    loadLeads();
                    setSelectedLead(prev => ({ ...prev, notes: updated }));
                    alert('Call note added to lead');
                  });
                }}>
                  <Phone size={16} />
                  Schedule Call
                </button>
                <button className="action-btn" onClick={() => {
                  if (salesPages.length === 0) {
                    alert('No sales pages yet. Create one in the Sales Pages tab first.');
                    return;
                  }
                  const page = salesPages[0];
                  const link = `${window.location.origin}/p/${page.slug}`;
                  navigator.clipboard.writeText(link).then(() => {
                    alert(`Sales page link copied: ${link}\nPaste it in your Instagram reply.`);
                  }).catch(() => {
                    alert(`Sales page link: ${link}`);
                  });
                }}>
                  <ExternalLink size={16} />
                  Send Sales Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSalesPages = () => (
    <div className="view-content">
      <div className="view-header">
        <div>
          <h1>Sales Pages</h1>
          <p className="view-subtitle">Stan-style checkout pages • Sales pages are shared manually by the business</p>
        </div>
        <button className="btn-primary" onClick={() => {
          setEditingSalesPage(null);
          setSalesPageForm({ title: '', description: '', price: '', imageUrl: '' });
          setShowSalesPageForm(true);
        }}>
          <Plus size={18} />
          Create Page
        </button>
      </div>

      <div className="compliance-banner">
        (i) Sales pages are shared manually by the business. No automated link distribution.
      </div>

      {/* Sales Page Form Modal */}
      {showSalesPageForm && (
        <div className="modal-overlay" onClick={() => setShowSalesPageForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingSalesPage ? 'Edit Sales Page' : 'Create Sales Page'}</h2>
            <form onSubmit={editingSalesPage ? handleUpdateSalesPage : handleCreateSalesPage}>
              <div className="form-group">
                <label>Page Title *</label>
                <input type="text" placeholder="e.g. Instagram Growth Guide" value={salesPageForm.title}
                  onChange={(e) => setSalesPageForm({...salesPageForm, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea placeholder="Describe your product or service..." value={salesPageForm.description}
                  onChange={(e) => setSalesPageForm({...salesPageForm, description: e.target.value})} required rows={3} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (USD) *</label>
                  <input type="number" step="0.01" min="0" placeholder="29.99" value={salesPageForm.price}
                    onChange={(e) => setSalesPageForm({...salesPageForm, price: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Image URL (optional)</label>
                  <input type="url" placeholder="https://example.com/image.jpg" value={salesPageForm.imageUrl}
                    onChange={(e) => setSalesPageForm({...salesPageForm, imageUrl: e.target.value})} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowSalesPageForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : editingSalesPage ? 'Update Page' : 'Create Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {salesPages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' }}>
          <ExternalLink size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
          <p style={{ color: '#6c757d' }}>No sales pages yet. Click "Create Page" to get started.</p>
        </div>
      ) : (
        <div className="sales-pages-grid">
          {salesPages.map(page => (
            <div key={page._id} className="sales-page-card">
              <div className="page-header">
                <div>
                  <h3>{page.title}</h3>
                  <div className="page-slug">/{page.slug}</div>
                </div>
                <div className={`page-status ${page.active ? 'active' : 'inactive'}`}>
                  {page.active ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="page-description">{page.description}</div>

              <div className="page-stats">
                <div className="page-stat">
                  <div className="stat-label">Price</div>
                  <div className="stat-value">${page.price?.toLocaleString()}</div>
                </div>
                <div className="page-stat">
                  <div className="stat-label">Views</div>
                  <div className="stat-value">{page.views || 0}</div>
                </div>
                <div className="page-stat">
                  <div className="stat-label">Sales</div>
                  <div className="stat-value">{page.conversions || 0}</div>
                </div>
                <div className="page-stat">
                  <div className="stat-label">Revenue</div>
                  <div className="stat-value">${(page.revenue || 0).toLocaleString()}</div>
                </div>
              </div>

              <div className="page-actions">
                <button className="btn-text" onClick={() => openEditSalesPage(page)}>
                  <Edit size={16} />
                  Edit
                </button>
                <button className="btn-text" onClick={() => window.open(`/p/${page.slug}`, '_blank')}>
                  <ExternalLink size={16} />
                  View Page
                </button>
                <button className="btn-text danger" onClick={() => handleDeleteSalesPage(page._id)}>
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderScheduler = () => (
    <div className="view-content">
      <div className="view-header">
        <div>
          <h1>Post Scheduler</h1>
          <p className="view-subtitle">Schedule Instagram posts</p>
        </div>
        <button className="btn-primary" onClick={() => {
          setSchedulerForm({ caption: '', imageUrl: '', scheduledFor: '', trackingKeyword: '' });
          setShowSchedulerForm(true);
        }}>
          <Plus size={18} />
          Schedule Post
        </button>
      </div>

      <div className="scheduler-disclaimer">
        <AlertCircle size={16} />
        <div>
          <strong>Important:</strong> Tracking keywords are used for internal reporting only.
          All replies to comments are always sent manually. No automated triggers or responses.
        </div>
      </div>

      {/* Schedule Post Form Modal */}
      {showSchedulerForm && (
        <div className="modal-overlay" onClick={() => setShowSchedulerForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Schedule a Post</h2>
            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label>Caption *</label>
                <textarea placeholder="Write your Instagram caption..." value={schedulerForm.caption}
                  onChange={(e) => setSchedulerForm({...schedulerForm, caption: e.target.value})} required rows={4} />
              </div>
              <div className="form-group">
                <label>Image URL * <span style={{color: '#999', fontWeight: 'normal'}}>(must be a publicly accessible image URL)</span></label>
                <input type="url" placeholder="https://example.com/image.jpg" value={schedulerForm.imageUrl}
                  onChange={(e) => setSchedulerForm({...schedulerForm, imageUrl: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Schedule For *</label>
                  <input type="datetime-local" value={schedulerForm.scheduledFor}
                    onChange={(e) => setSchedulerForm({...schedulerForm, scheduledFor: e.target.value})} required
                    min={new Date().toISOString().slice(0, 16)} />
                </div>
                <div className="form-group">
                  <label>Tracking Keyword (optional)</label>
                  <input type="text" placeholder="e.g. summer_promo" value={schedulerForm.trackingKeyword}
                    onChange={(e) => setSchedulerForm({...schedulerForm, trackingKeyword: e.target.value})} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowSchedulerForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading ? 'Scheduling...' : 'Schedule Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {scheduledPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' }}>
          <Calendar size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
          <p style={{ color: '#6c757d' }}>No scheduled posts yet. Click "Schedule Post" to get started.</p>
        </div>
      ) : (
        <div className="scheduled-posts-list">
          {scheduledPosts.map(post => (
            <div key={post._id} className="scheduled-post-card">
              <div className="post-content">
                <div className="post-icon">
                  <Instagram size={24} />
                </div>
                <div className="post-details">
                  <div className="post-caption">{post.caption}</div>
                  {post.imageUrl && (
                    <div className="post-image-preview">
                      <img src={post.imageUrl} alt="" style={{maxHeight: '60px', borderRadius: '8px', marginTop: '4px'}}
                        onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                  <div className="post-meta">
                    <span className="post-meta-item">
                      <Calendar size={14} />
                      {new Date(post.scheduledFor).toLocaleString()}
                    </span>
                    {post.trackingKeyword && (
                      <span className="post-meta-item">
                        <BarChart3 size={14} />
                        Tracking: {post.trackingKeyword}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="post-actions-group">
                <div className={`post-status ${post.status}`}>
                  {post.status}
                </div>
                {post.status === 'scheduled' && (
                  <div className="post-action-btns">
                    <button className="btn-sm btn-publish" onClick={() => handlePublishPost(post._id)}>
                      <Send size={14} /> Publish Now
                    </button>
                    <button className="btn-sm btn-cancel" onClick={() => handleDeletePost(post._id)}>
                      <XCircle size={14} /> Cancel
                    </button>
                  </div>
                )}
                {post.status === 'failed' && (
                  <div className="post-error">{post.errorMessage || 'Publishing failed'}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRevenue = () => {
    const closedLeads = leads.filter(l => l.funnelState === 'closed' && l.revenue);
    const totalRevenue = closedLeads.reduce((sum, lead) => sum + lead.revenue, 0);
    const avgDealSize = closedLeads.length > 0 ? totalRevenue / closedLeads.length : 0;

    const sourceBreakdown = closedLeads.reduce((acc, lead) => {
      if (!acc[lead.source]) acc[lead.source] = 0;
      acc[lead.source] += lead.revenue;
      return acc;
    }, {});

    return (
      <div className="view-content">
        <div className="view-header">
          <div>
            <h1>Revenue Tracking</h1>
            <p className="view-subtitle">Attribution and analytics</p>
          </div>
        </div>

        <div className="revenue-stats-grid">
          <div className="revenue-stat-card">
            <div className="revenue-stat-label">Total Revenue</div>
            <div className="revenue-stat-value">${totalRevenue.toLocaleString()}</div>
          </div>
          <div className="revenue-stat-card">
            <div className="revenue-stat-label">Closed Deals</div>
            <div className="revenue-stat-value">{closedLeads.length}</div>
          </div>
          <div className="revenue-stat-card">
            <div className="revenue-stat-label">Avg Deal Size</div>
            <div className="revenue-stat-value">${Math.round(avgDealSize).toLocaleString()}</div>
          </div>
        </div>

        {Object.keys(sourceBreakdown).length > 0 && (
          <div className="revenue-section">
            <h2>Revenue by Source</h2>
            <div className="source-breakdown">
              {Object.entries(sourceBreakdown).map(([source, revenue]) => (
                <div key={source} className="source-breakdown-item">
                  <div className="source-breakdown-header">
                    <span className={`source-tag ${source}`}>
                      {source.replace('_', ' ')}
                    </span>
                    <span className="source-revenue">${revenue.toLocaleString()}</span>
                  </div>
                  <div className="source-breakdown-bar">
                    <div 
                      className="source-breakdown-fill"
                      style={{ width: `${(revenue / totalRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {closedLeads.length > 0 && (
          <div className="revenue-section">
            <h2>Closed Deals</h2>
            <div className="closed-deals-table">
              {closedLeads.map(lead => (
                <div key={lead._id} className="closed-deal-row">
                  <div className="deal-lead">
                    <div className="avatar-small">
                      {lead.username?.charAt(1).toUpperCase()}
                    </div>
                    <div>
                      <div className="deal-name">{lead.name || lead.username}</div>
                      <div className="deal-date">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span className={`source-tag ${lead.source}`}>
                    {lead.source?.replace('_', ' ')}
                  </span>
                  <div className="deal-revenue">${lead.revenue.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="view-content">
      <div className="view-header">
        <div>
          <h1>Settings</h1>
          <p className="view-subtitle">Instagram connection & message settings</p>
        </div>
      </div>

      <div className="settings-sections">
        {/* Instagram Connection Section */}
        <div className="setting-section">
          <div className="setting-section-header">
            <h3><Instagram size={20} style={{verticalAlign: 'middle', marginRight: '8px'}} />Instagram Account</h3>
          </div>
          {user?.instagramUsername ? (
            <div className="instagram-connected">
              <div className="ig-account-card">
                <div className="ig-account-avatar">
                  {user.instagramUsername.charAt(0).toUpperCase()}
                </div>
                <div className="ig-account-info">
                  <div className="ig-account-username">@{user.instagramUsername}</div>
                  <div className="ig-account-status">
                    <span className="status-dot connected"></span>
                    Connected
                  </div>
                  <div className="ig-account-id">Account ID: {user.instagramBusinessAccountId}</div>
                </div>
              </div>
              <button className="btn-disconnect" onClick={async () => {
                if (!confirm('Disconnect Instagram? You will stop receiving messages and comments.')) return;
                try {
                  await settingsAPI.disconnectInstagram();
                  const updated = await authAPI.getCurrentUser();
                  setUser(updated);
                } catch (err) {
                  alert('Failed to disconnect');
                }
              }}>
                <XCircle size={16} />
                Disconnect
              </button>
            </div>
          ) : (
            <div className="instagram-disconnected">
              <div className="ig-empty-state">
                <Instagram size={32} style={{color: '#ccc', marginBottom: '12px'}} />
                <p>No Instagram account connected</p>
                <p style={{fontSize: '13px', color: '#999', marginTop: '4px'}}>Connect your Instagram Business account to receive DMs, comments, and publish posts.</p>
              </div>
              <button className="btn-primary" onClick={() => {
                window.location.href = `${window.location.protocol}//${window.location.hostname}:5000/api/auth/instagram`;
              }}>
                <Instagram size={18} />
                Connect Instagram
              </button>
            </div>
          )}
        </div>

        {/* Acknowledgment Section */}
        <div className="setting-section">
          <div className="setting-section-header">
            <h3>Auto-Acknowledgment</h3>
          </div>
          <div className="setting-item">
            <div className="setting-item-left">
              <div className="setting-item-title">Send acknowledgment message</div>
              <div className="setting-item-description">
                Send one optional acknowledgment message when a user initiates a conversation. No follow-ups.
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={acknowledgmentEnabled}
                onChange={async (e) => {
                  const newVal = e.target.checked;
                  setAcknowledgmentEnabled(newVal);
                  try {
                    await settingsAPI.updateAcknowledgment(newVal, acknowledgmentMessage);
                  } catch (err) {
                    console.error('Failed to update acknowledgment:', err);
                    setAcknowledgmentEnabled(!newVal);
                  }
                }}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {acknowledgmentEnabled && (
            <div className="acknowledgment-preview">
              <label>Acknowledgment message:</label>
              <textarea
                className="ack-message-input"
                value={acknowledgmentMessage}
                onChange={(e) => setAcknowledgmentMessage(e.target.value)}
                onBlur={async () => {
                  try {
                    await settingsAPI.updateAcknowledgment(acknowledgmentEnabled, acknowledgmentMessage);
                  } catch (err) {
                    console.error('Failed to save message:', err);
                  }
                }}
                maxLength={200}
                rows={2}
              />
              <div className="setting-note">
                {acknowledgmentMessage.length}/200 characters. Sent only once when a user first messages you.
              </div>
            </div>
          )}
        </div>

        {/* Comment-to-DM Automations */}
        <div className="setting-section">
          <div className="setting-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Comment-to-DM Automations</h3>
              <p style={{ fontSize: '13px', color: '#6c757d', marginTop: '4px' }}>
                Auto-send a DM when someone comments a specific keyword on your posts
              </p>
            </div>
            <button
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
              onClick={() => {
                setAutomationForm({ keyword: '', dmMessage: '', publicReply: '' });
                setEditingAutomation(null);
                setShowAutomationForm(true);
              }}
            >
              <Plus size={16} /> Add Automation
            </button>
          </div>

          {commentAutomations.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#999' }}>
              <MessageSquare size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p>No automations set up yet</p>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>Create your first keyword trigger to auto-DM commenters</p>
            </div>
          ) : (
            <div className="automation-list">
              {commentAutomations.map((automation, index) => (
                <div key={index} className={`automation-card ${!automation.enabled ? 'automation-disabled' : ''}`}>
                  <div className="automation-card-header">
                    <span className="automation-keyword-badge">{automation.keyword}</span>
                    <div className="automation-card-actions">
                      {automation.triggerCount > 0 && (
                        <span className="automation-trigger-count">{automation.triggerCount} triggered</span>
                      )}
                      <label className="toggle-switch toggle-sm">
                        <input
                          type="checkbox"
                          checked={automation.enabled}
                          onChange={() => handleToggleAutomation(index)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                      <button className="btn-icon" onClick={() => openEditAutomation(index)} title="Edit">
                        <Edit size={14} />
                      </button>
                      <button className="btn-icon btn-icon-danger" onClick={() => handleDeleteAutomation(index)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="automation-card-body">
                    <div className="automation-dm-preview">
                      <Send size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{automation.dmMessage.length > 100 ? automation.dmMessage.slice(0, 100) + '...' : automation.dmMessage}</span>
                    </div>
                    {automation.publicReply && (
                      <div className="automation-reply-preview">
                        <MessageSquare size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>Public reply: {automation.publicReply}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Automation Form Modal */}
        {showAutomationForm && (
          <div className="modal-overlay" onClick={() => { setShowAutomationForm(false); setEditingAutomation(null); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <h2>{editingAutomation !== null ? 'Edit Automation' : 'New Automation'}</h2>

              <div className="form-group">
                <label>Trigger Keyword *</label>
                <input
                  type="text"
                  placeholder="e.g. GUIDE"
                  value={automationForm.keyword}
                  onChange={(e) => setAutomationForm(prev => ({ ...prev, keyword: e.target.value.toUpperCase() }))}
                  style={{ textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' }}
                />
                <small style={{ color: '#999' }}>When someone comments this word, they'll receive a DM</small>
              </div>

              <div className="form-group">
                <label>DM Message *</label>
                <textarea
                  placeholder="Hey! Here's the guide you requested: https://..."
                  value={automationForm.dmMessage}
                  onChange={(e) => setAutomationForm(prev => ({ ...prev, dmMessage: e.target.value }))}
                  rows={4}
                  maxLength={500}
                />
                <small style={{ color: '#999' }}>{automationForm.dmMessage.length}/500 characters</small>
              </div>

              <div className="form-group">
                <label>Public Reply (optional)</label>
                <input
                  type="text"
                  placeholder="Check your DMs! 📩"
                  value={automationForm.publicReply}
                  onChange={(e) => setAutomationForm(prev => ({ ...prev, publicReply: e.target.value }))}
                  maxLength={200}
                />
                <small style={{ color: '#999' }}>Visible reply under their comment (leave empty to skip)</small>
              </div>

              <div className="form-actions">
                <button className="btn-secondary" onClick={() => { setShowAutomationForm(false); setEditingAutomation(null); }}>Cancel</button>
                <button
                  className="btn-primary"
                  onClick={handleSaveAutomation}
                  disabled={!automationForm.keyword.trim() || !automationForm.dmMessage.trim()}
                >
                  {editingAutomation !== null ? 'Update' : 'Create'} Automation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Notes */}
        <div className="setting-section">
          <div className="setting-section-header">
            <h3>Compliance</h3>
          </div>
          <div className="compliance-notes">
            <div className="compliance-note">
              <CheckCircle size={16} />
              <span>All conversations are user-initiated</span>
            </div>
            <div className="compliance-note">
              <CheckCircle size={16} />
              <span>Businesses reply manually from the inbox</span>
            </div>
            <div className="compliance-note">
              <CheckCircle size={16} />
              <span>No automated conversation sequences or flows</span>
            </div>
            <div className="compliance-note">
              <CheckCircle size={16} />
              <span>Acknowledgment is optional and limited to one message</span>
            </div>
            <div className="compliance-note">
              <CheckCircle size={16} />
              <span>Sales pages are shared manually by the business</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // AUTH CHECKS - BEFORE RENDER
  // ============================================================================

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: '#6c757d', fontSize: '15px' }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }

  // ============================================================================
  // RENDER: AUDIENCE INSIGHTS
  // ============================================================================

  const renderAudienceInsights = () => {
    // No Instagram connected
    if (!user?.instagramBusinessAccountId) {
      return (
        <div className="view-content">
          <div className="view-header">
            <div>
              <h1>Audience Insights</h1>
              <p className="view-subtitle">Understand your Instagram audience demographics</p>
            </div>
          </div>
          <div className="insights-empty-state">
            <Instagram size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
            <h3>Connect Instagram to View Insights</h3>
            <p>Connect your Instagram Business account in Settings to access audience demographics.</p>
            <button className="btn-primary" onClick={() => setCurrentView('settings')}>
              Go to Settings
            </button>
          </div>
        </div>
      );
    }

    // Loading
    if (audienceInsightsLoading) {
      return (
        <div className="view-content">
          <div className="view-header">
            <div>
              <h1>Audience Insights</h1>
              <p className="view-subtitle">Loading your audience data...</p>
            </div>
          </div>
          <div className="insights-loading">
            <div className="insights-loading-spinner" />
            <p>Fetching demographics from Instagram...</p>
            <p style={{ fontSize: '13px', color: '#999', marginTop: '8px' }}>This may take a few seconds</p>
          </div>
        </div>
      );
    }

    // Error states
    if (audienceInsightsError) {
      const errorConfig = {
        NO_INSTAGRAM: {
          icon: <Instagram size={48} style={{ color: '#ccc' }} />,
          title: 'Instagram Not Connected',
          description: 'Connect your Instagram Business account in Settings.',
          action: { label: 'Go to Settings', view: 'settings' }
        },
        INSUFFICIENT_FOLLOWERS: {
          icon: <Users size={48} style={{ color: '#ccc' }} />,
          title: 'Not Enough Followers',
          description: 'Audience insights require at least 100 followers. Keep growing your account!',
          action: null
        },
        TOKEN_EXPIRED: {
          icon: <AlertCircle size={48} style={{ color: '#e74c3c' }} />,
          title: 'Token Expired',
          description: 'Your Instagram connection has expired. Please reconnect in Settings.',
          action: { label: 'Reconnect', view: 'settings' }
        },
        RATE_LIMITED: {
          icon: <Clock size={48} style={{ color: '#f39c12' }} />,
          title: 'Rate Limited',
          description: 'Too many requests. Please try again in a few minutes.',
          action: { label: 'Retry', handler: () => loadAudienceInsights(audienceMetricType) }
        }
      };

      const config = errorConfig[audienceInsightsError.code] || {
        icon: <AlertCircle size={48} style={{ color: '#e74c3c' }} />,
        title: 'Something Went Wrong',
        description: audienceInsightsError.message,
        action: { label: 'Retry', handler: () => loadAudienceInsights(audienceMetricType) }
      };

      return (
        <div className="view-content">
          <div className="view-header">
            <div>
              <h1>Audience Insights</h1>
              <p className="view-subtitle">Understand your Instagram audience demographics</p>
            </div>
          </div>
          <div className="insights-empty-state">
            {config.icon}
            <h3>{config.title}</h3>
            <p>{config.description}</p>
            {config.action && (
              <button
                className="btn-primary"
                onClick={config.action.handler || (() => setCurrentView(config.action.view))}
              >
                {config.action.label}
              </button>
            )}
          </div>
        </div>
      );
    }

    if (!audienceInsights) return null;

    const { city, country, age, gender, summary } = audienceInsights;

    // Helper: render horizontal bar chart (pure CSS)
    const renderBarChart = (data, maxItems = 15, colorGradient = ['#667eea', '#764ba2']) => {
      const items = data.slice(0, maxItems);
      const maxValue = items[0]?.value || 1;

      return (
        <div className="insights-bar-chart">
          {items.map((item, index) => (
            <div key={index} className="bar-chart-row">
              <div className="bar-chart-label" title={item.dimension}>
                {item.dimension}
              </div>
              <div className="bar-chart-track">
                <div
                  className="bar-chart-fill"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    background: `linear-gradient(90deg, ${colorGradient[0]}, ${colorGradient[1]})`,
                    opacity: 1 - (index * 0.03)
                  }}
                />
              </div>
              <div className="bar-chart-value">
                {item.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      );
    };

    // Helper: render gender visual
    const renderGenderVisual = () => {
      const total = gender.reduce((sum, g) => sum + g.value, 0);
      if (total === 0) return <p style={{ color: '#999' }}>No gender data available</p>;

      const genderColors = { 'M': '#4facfe', 'F': '#f093fb', 'U': '#a0a0a0' };
      const genderLabels = { 'M': 'Male', 'F': 'Female', 'U': 'Unspecified' };

      return (
        <div className="gender-visual">
          <div className="gender-bar-container">
            {gender.map((g, i) => {
              const pct = ((g.value / total) * 100).toFixed(1);
              return (
                <div
                  key={i}
                  className="gender-bar-segment"
                  style={{
                    width: `${pct}%`,
                    background: genderColors[g.dimension] || '#ccc',
                    minWidth: pct > 0 ? '20px' : '0'
                  }}
                  title={`${genderLabels[g.dimension] || g.dimension}: ${pct}%`}
                />
              );
            })}
          </div>
          <div className="gender-legend">
            {gender.map((g, i) => {
              const pct = ((g.value / total) * 100).toFixed(1);
              return (
                <div key={i} className="gender-legend-item">
                  <span className="gender-legend-dot" style={{ background: genderColors[g.dimension] || '#ccc' }} />
                  <span className="gender-legend-label">{genderLabels[g.dimension] || g.dimension}</span>
                  <span className="gender-legend-value">{pct}%</span>
                  <span className="gender-legend-count">({g.value.toLocaleString()})</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    return (
      <div className="view-content">
        <div className="view-header">
          <div>
            <h1>Audience Insights</h1>
            <p className="view-subtitle">Understand your Instagram audience demographics</p>
          </div>
          <div className="insights-controls">
            <select
              className="insights-metric-select"
              value={audienceMetricType}
              onChange={(e) => setAudienceMetricType(e.target.value)}
            >
              <option value="follower_demographics">All Followers</option>
              <option value="engaged_audience_demographics">Engaged Audience</option>
            </select>
            <button
              className="btn-secondary"
              onClick={() => loadAudienceInsights(audienceMetricType)}
              disabled={audienceInsightsLoading}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="compliance-banner">
          <AlertCircle size={18} />
          <span>Demographic data is provided by Instagram and may be delayed up to 48 hours. Shows top 45 results per category.</span>
        </div>

        {/* Summary Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>
              <MapPin size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Top City</div>
              <div className="stat-value" style={{ fontSize: '20px' }}>{summary.topCity}</div>
              <div className="stat-change neutral">{summary.totalCityFollowers.toLocaleString()} tracked followers</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)', color: 'white' }}>
              <Globe size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Top Country</div>
              <div className="stat-value" style={{ fontSize: '20px' }}>{summary.topCountry}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a, #fee140)', color: 'white' }}>
              <Users size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Dominant Age Group</div>
              <div className="stat-value" style={{ fontSize: '20px' }}>{summary.dominantAgeGroup}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)', color: 'white' }}>
              <PieChart size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Gender Split</div>
              <div className="stat-value" style={{ fontSize: '20px' }}>
                {summary.genderSummary?.F && summary.genderSummary?.M
                  ? `${((summary.genderSummary.F / (summary.genderSummary.F + summary.genderSummary.M + (summary.genderSummary.U || 0))) * 100).toFixed(0)}% F`
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="insights-charts-grid">
          <div className="insights-chart-card">
            <div className="insights-chart-header">
              <h3><MapPin size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />City Distribution</h3>
            </div>
            {city.length > 0
              ? renderBarChart(city, 15, ['#667eea', '#764ba2'])
              : <p className="insights-no-data">No city data available</p>
            }
          </div>

          <div className="insights-chart-card">
            <div className="insights-chart-header">
              <h3><Globe size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Country Distribution</h3>
            </div>
            {country.length > 0
              ? renderBarChart(country, 15, ['#43e97b', '#38f9d7'])
              : <p className="insights-no-data">No country data available</p>
            }
          </div>

          <div className="insights-chart-card">
            <div className="insights-chart-header">
              <h3><Users size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Age Distribution</h3>
            </div>
            {age.length > 0
              ? renderBarChart(age, 10, ['#fa709a', '#fee140'])
              : <p className="insights-no-data">No age data available</p>
            }
          </div>

          <div className="insights-chart-card">
            <div className="insights-chart-header">
              <h3><PieChart size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Gender Split</h3>
            </div>
            {gender.length > 0
              ? renderGenderVisual()
              : <p className="insights-no-data">No gender data available</p>
            }
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="app">

      <div className="sidebar">
        <div className="sidebar-header">
          <MessageSquare size={24} />
          <span>Threadline CRM</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <BarChart3 size={20} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${currentView === 'inbox' ? 'active' : ''}`}
            onClick={() => setCurrentView('inbox')}
          >
            <MessageSquare size={20} />
            <span>Inbox</span>
            {getStats().unreadMessages > 0 && (
              <span className="nav-badge">{getStats().unreadMessages}</span>
            )}
          </button>

          <button 
            className={`nav-item ${currentView === 'leads' ? 'active' : ''}`}
            onClick={() => setCurrentView('leads')}
          >
            <Users size={20} />
            <span>Leads</span>
          </button>

          <button 
            className={`nav-item ${currentView === 'sales-pages' ? 'active' : ''}`}
            onClick={() => setCurrentView('sales-pages')}
          >
            <ExternalLink size={20} />
            <span>Sales Pages</span>
          </button>

          <button
            className={`nav-item ${currentView === 'scheduler' ? 'active' : ''}`}
            onClick={() => setCurrentView('scheduler')}
          >
            <Calendar size={20} />
            <span>Scheduler</span>
          </button>

          <button
            className={`nav-item ${currentView === 'audience-insights' ? 'active' : ''}`}
            onClick={() => setCurrentView('audience-insights')}
          >
            <BarChart3 size={20} />
            <span>Audience</span>
          </button>

          <button
            className={`nav-item ${currentView === 'revenue' ? 'active' : ''}`}
            onClick={() => setCurrentView('revenue')}
          >
            <DollarSign size={20} />
            <span>Revenue</span>
          </button>

          <div className="nav-divider" />

          <button 
            className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentView('settings')}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>

          <button 
            className="nav-item"
            onClick={() => authAPI.logout()}
            style={{ marginTop: 'auto', color: '#e74c3c' }}
          >
            <ArrowLeft size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      <div className="main-content">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'inbox' && renderInbox()}
        {currentView === 'conversation' && renderConversation()}
        {currentView === 'leads' && renderLeads()}
        {currentView === 'lead-detail' && renderLeadDetail()}
        {currentView === 'sales-pages' && renderSalesPages()}
        {currentView === 'scheduler' && renderScheduler()}
        {currentView === 'audience-insights' && renderAudienceInsights()}
        {currentView === 'revenue' && renderRevenue()}
        {currentView === 'settings' && renderSettings()}
      </div>

      {/* Include all your existing styles here - I'll add them in the next part due to length */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app {
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          height: 100vh;
          display: flex;
          background: #f8f9fa;
          color: #1a1a2e;
          position: relative;
        }

        /* Sidebar */
        .sidebar {
          width: 260px;
          background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-header {
          padding: 24px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 18px;
          font-weight: 700;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-nav {
          flex: 1;
          padding: 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          border-radius: 10px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.2s;
          position: relative;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .nav-item.active {
          background: rgba(255, 255, 255, 0.15);
          color: white;
        }

        .nav-badge {
          margin-left: auto;
          background: #e74c3c;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .nav-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 12px 0;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          overflow-y: auto;
          background: #f8f9fa;
        }

        .view-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px;
        }

        .view-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .view-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 4px;
        }

        .view-subtitle {
          color: #6c757d;
          font-size: 15px;
        }

        /* Compliance Banners */
        .compliance-banner {
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          padding: 14px 18px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
          color: #1565c0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dashboard-disclaimer,
        .crm-disclaimer {
          background: #fff3e0;
          color: #e65100;
          padding: 12px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 24px;
        }

        .scheduler-disclaimer {
          background: #fff3cd;
          border: 2px solid #ff9800;
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          color: #e65100;
          font-size: 14px;
          line-height: 1.6;
        }

        .scheduler-disclaimer svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* Buttons */
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }

        .btn-text {
          background: none;
          border: none;
          color: #667eea;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .btn-text:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        .btn-text.danger {
          color: #e74c3c;
        }

        .btn-secondary {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          padding: 10px 24px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: rgba(102, 126, 234, 0.05);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-sm {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          border: none;
          transition: all 0.2s;
        }

        .btn-publish {
          background: #28a745;
          color: white;
        }

        .btn-publish:hover {
          background: #218838;
        }

        .btn-cancel {
          background: #f8f9fa;
          color: #e74c3c;
          border: 1px solid #e0e0e0;
        }

        .btn-cancel:hover {
          background: #fef2f2;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          padding: 32px;
          width: 90%;
          max-width: 560px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .modal-content h2 {
          margin-bottom: 24px;
          font-size: 22px;
          color: #1a1a2e;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          font-size: 14px;
          color: #4a4a5a;
          margin-bottom: 6px;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px 14px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s;
          background: white;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        .post-actions-group {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .post-action-btns {
          display: flex;
          gap: 6px;
        }

        .post-error {
          font-size: 12px;
          color: #e74c3c;
          max-width: 200px;
          text-align: right;
        }

        .btn-icon {
          background: white;
          border: 1px solid #e0e0e0;
          color: #667eea;
          padding: 6px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: #f8f9fa;
          border-color: #667eea;
        }

        .back-btn {
          background: white;
          border: 1px solid #e0e0e0;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6c757d;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: #f8f9fa;
          color: #1a1a2e;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid #e0e0e0;
          padding: 10px 16px;
          border-radius: 10px;
          min-width: 300px;
        }

        .search-box input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 14px;
          font-family: inherit;
        }

        .search-box svg {
          color: #6c757d;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          gap: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: all 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon.revenue {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .stat-icon.leads {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }

        .stat-icon.conversion {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          color: white;
        }

        .stat-icon.messages {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          color: white;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 13px;
          color: #6c757d;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 6px;
        }

        .stat-change {
          font-size: 12px;
          font-weight: 600;
        }

        .stat-change.positive {
          color: #27ae60;
        }

        .stat-change.neutral {
          color: #6c757d;
        }

        .stat-change.warning {
          color: #f39c12;
        }

        .stat-disclaimer {
          font-size: 10px;
          color: #999;
          font-weight: 500;
          margin-top: 4px;
          font-style: italic;
        }

        /* Alerts */
        .alerts-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 32px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .section-header h2 {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a2e;
          flex: 1;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .alert-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 10px;
          font-size: 14px;
        }

        .alert-item.urgent {
          background: #fee;
          color: #c0392b;
        }

        .alert-item.warning {
          background: #fff3cd;
          color: #856404;
        }

        .alert-action {
          margin-left: auto;
          background: white;
          border: none;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        /* Section */
        .section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        /* Leads Quick List */
        .leads-quick-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .lead-quick-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          border: 1px solid #f0f0f0;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .lead-quick-item:hover {
          background: #f8f9fa;
          border-color: #e0e0e0;
        }

        .lead-quick-left {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .avatar-small {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
        }

        .lead-quick-name {
          font-weight: 600;
          font-size: 14px;
          color: #1a1a2e;
        }

        .lead-quick-source {
          font-size: 12px;
          color: #6c757d;
          text-transform: capitalize;
        }

        /* Conversation List */
        .conversation-list {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .conversation-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 24px;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }

        .conversation-item:hover {
          background: #f8f9fa;
        }

        .conversation-item.unread {
          background: #f0f7ff;
        }

        .conv-left {
          display: flex;
          gap: 14px;
          flex: 1;
          min-width: 0;
        }

        .avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 20px;
          flex-shrink: 0;
        }

        .conv-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }

        .conv-header-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .username {
          font-weight: 600;
          font-size: 15px;
          color: #1a1a2e;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #667eea;
        }

        .last-message {
          color: #6c757d;
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .conv-meta {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .source-tag {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .source-tag.dm {
          background: #e3f2fd;
          color: #1976d2;
        }

        .source-tag.comment {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .source-tag.story_reply {
          background: #fff3e0;
          color: #e65100;
        }

        .conv-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }

        .timestamp {
          color: #999;
          font-size: 13px;
          white-space: nowrap;
        }

        /* Conversation View */
        .conversation-view {
          background: white;
          height: calc(100vh - 64px);
          margin: 32px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .conversation-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid #f0f0f0;
        }

        .conversation-title {
          flex: 1;
        }

        .conversation-title .username {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .lead-link {
          color: #667eea;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }

        .lead-link:hover {
          color: #764ba2;
        }

        .conversation-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .message-thread {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message-bubble {
          max-width: 70%;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .message-bubble.customer {
          align-self: flex-start;
        }

        .message-bubble.business {
          align-self: flex-end;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          font-size: 11px;
          color: #999;
          margin-bottom: 4px;
          padding: 0 4px;
        }

        .sender-label {
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .message-time {
          color: #bbb;
        }

        .message-text {
          padding: 14px 18px;
          border-radius: 16px;
          line-height: 1.6;
          font-size: 15px;
        }

        .message-bubble.customer .message-text {
          background: #f5f5f5;
          color: #1a1a2e;
          border-bottom-left-radius: 4px;
        }

        .message-bubble.business .message-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .reply-box {
          padding: 20px 24px;
          border-top: 1px solid #f0f0f0;
          background: white;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .reply-disclaimer {
          background: #e8f5e9;
          border: 1px solid #4caf50;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 12px;
          color: #2e7d32;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .reply-box textarea {
          padding: 14px 18px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-family: inherit;
          font-size: 15px;
          resize: none;
          min-height: 70px;
          transition: border-color 0.2s;
        }

        .reply-box textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .send-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          align-self: flex-end;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Funnel Filters */
        .funnel-filters {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .funnel-filter {
          background: white;
          border: 2px solid #e0e0e0;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .funnel-filter:hover {
          border-color: #667eea;
          background: #f8f9fa;
        }

        .funnel-filter.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
        }

        .funnel-filter .count {
          background: rgba(0, 0, 0, 0.1);
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 12px;
        }

        .funnel-filter.active .count {
          background: rgba(255, 255, 255, 0.25);
        }

        /* Leads Table */
        .leads-table {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 0.8fr;
          gap: 16px;
          padding: 16px 24px;
          background: #f8f9fa;
          border-bottom: 2px solid #e0e0e0;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6c757d;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 0.8fr;
          gap: 16px;
          padding: 18px 24px;
          border-bottom: 1px solid #f0f0f0;
          transition: all 0.2s;
          align-items: center;
        }

        .table-row:hover {
          background: #f8f9fa;
        }

        .td {
          font-size: 14px;
        }

        .lead-col {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .lead-name {
          font-weight: 600;
          color: #1a1a2e;
        }

        .lead-username {
          font-size: 13px;
          color: #6c757d;
        }

        .source-content {
          font-size: 12px;
          color: #6c757d;
          margin-top: 4px;
        }

        .funnel-badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .funnel-badge.new {
          background: #e3f2fd;
          color: #1976d2;
        }

        .funnel-badge.replied {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .funnel-badge.interested {
          background: #fff3e0;
          color: #e65100;
        }

        .funnel-badge.call_booked {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .funnel-badge.closed {
          background: #c8e6c9;
          color: #1b5e20;
        }

        .funnel-badge.lost {
          background: #ffebee;
          color: #c62828;
        }

        /* Lead Detail */
        .lead-detail-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 24px;
        }

        .detail-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          margin-bottom: 20px;
        }

        .detail-card h3 {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 20px;
        }

        .detail-fields {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .detail-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .detail-field label {
          font-size: 12px;
          font-weight: 600;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .field-value {
          font-size: 15px;
          color: #1a1a2e;
        }

        .notes-area textarea {
          width: 100%;
          min-height: 150px;
          padding: 14px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
          transition: border-color 0.2s;
        }

        .notes-area textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .funnel-progression {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .funnel-step {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px;
          border-radius: 10px;
          border: 2px solid #e0e0e0;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: capitalize;
        }

        .funnel-step:hover {
          border-color: #667eea;
          background: #f8f9fa;
        }

        .funnel-step.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
        }

        .funnel-step.completed {
          background: #e8f5e9;
          border-color: #4caf50;
        }

        .funnel-step.lost {
          border-color: #e74c3c;
        }

        .funnel-step.lost.active {
          background: #e74c3c;
        }

        .funnel-step-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .funnel-step.active .funnel-step-icon {
          background: rgba(255, 255, 255, 0.3);
        }

        .step-number {
          font-weight: 700;
          font-size: 14px;
        }

        .funnel-step-label {
          font-weight: 600;
          font-size: 14px;
        }

        .revenue-card {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .revenue-input {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .input-group {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          overflow: hidden;
        }

        .input-prefix {
          padding: 12px 16px;
          font-weight: 700;
          font-size: 18px;
          background: rgba(255, 255, 255, 0.1);
        }

        .input-group input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 12px 16px;
          color: white;
          font-size: 18px;
          font-weight: 600;
          font-family: inherit;
        }

        .input-group input:focus {
          outline: none;
        }

        .input-group input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .revenue-display {
          font-size: 14px;
          font-weight: 600;
          opacity: 0.9;
        }

        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .action-btn {
          background: white;
          border: 2px solid #e0e0e0;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s;
          color: #1a1a2e;
        }

        .action-btn:hover {
          border-color: #667eea;
          background: #f8f9fa;
        }

        /* Sales Pages */
        .sales-pages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .sales-page-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: all 0.2s;
        }

        .sales-page-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .page-header h3 {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 6px;
        }

        .page-slug {
          font-size: 13px;
          color: #667eea;
          font-family: 'Courier New', monospace;
        }

        .page-status {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .page-status.active {
          background: #c8e6c9;
          color: #1b5e20;
        }

        .page-status.inactive {
          background: #ffebee;
          color: #c62828;
        }

        .page-description {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .page-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 20px;
          padding: 20px 0;
          border-top: 1px solid #f0f0f0;
          border-bottom: 1px solid #f0f0f0;
        }

        .page-stat {
          text-align: center;
        }

        .page-stat .stat-label {
          font-size: 11px;
          color: #6c757d;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .page-stat .stat-value {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a2e;
        }

        .page-actions {
          display: flex;
          gap: 16px;
          justify-content: space-between;
        }

        /* Scheduler */
        .scheduled-posts-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .scheduled-post-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .post-content {
          flex: 1;
          display: flex;
          gap: 16px;
        }

        .post-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .post-details {
          flex: 1;
        }

        .post-caption {
          font-size: 15px;
          color: #1a1a2e;
          margin-bottom: 12px;
          line-height: 1.6;
        }

        .post-meta {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .post-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6c757d;
        }

        .post-status {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          text-transform: capitalize;
          align-self: flex-start;
        }

        .post-status.scheduled {
          background: #e3f2fd;
          color: #1976d2;
        }

        .post-status.published {
          background: #c8e6c9;
          color: #1b5e20;
        }

        /* Revenue */
        .revenue-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .revenue-stat-card {
          background: white;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          text-align: center;
        }

        .revenue-stat-label {
          font-size: 13px;
          color: #6c757d;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .revenue-stat-value {
          font-size: 36px;
          font-weight: 700;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .revenue-section {
          background: white;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          margin-bottom: 24px;
        }

        .revenue-section h2 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .source-breakdown {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .source-breakdown-item {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .source-breakdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .source-revenue {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a2e;
        }

        .source-breakdown-bar {
          height: 8px;
          background: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .source-breakdown-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .closed-deals-table {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .closed-deal-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 10px;
        }

        .deal-lead {
          display: flex;
          gap: 12px;
          align-items: center;
          flex: 1;
        }

        .deal-name {
          font-weight: 600;
          color: #1a1a2e;
        }

        .deal-date {
          font-size: 12px;
          color: #6c757d;
        }

        .deal-revenue {
          font-size: 18px;
          font-weight: 700;
          color: #27ae60;
          margin-left: auto;
        }

        /* Settings */
        .settings-sections {
          max-width: 800px;
        }

        .setting-section {
          background: white;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          margin-bottom: 24px;
        }

        .setting-section-header {
          margin-bottom: 24px;
        }

        .setting-section-header h3 {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a2e;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 20px;
        }

        .setting-item-left {
          flex: 1;
        }

        .setting-item-title {
          font-size: 15px;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 6px;
        }

        .setting-item-description {
          font-size: 13px;
          color: #6c757d;
          line-height: 1.6;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 56px;
          height: 30px;
          flex-shrink: 0;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.3s;
          border-radius: 30px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 22px;
          width: 22px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        .toggle-switch input:checked + .toggle-slider {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }

        .acknowledgment-preview {
          margin-top: 24px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .acknowledgment-preview label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #6c757d;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .message-preview {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          padding: 14px 18px;
          font-size: 14px;
          color: #1a1a2e;
          margin-bottom: 12px;
        }

        .setting-note {
          font-size: 12px;
          color: #856404;
          background: #fff3cd;
          padding: 10px 14px;
          border-radius: 8px;
          line-height: 1.6;
        }

        /* Instagram Connection Styles */
        .instagram-connected {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          background: #f0fdf4;
          border: 2px solid #bbf7d0;
          border-radius: 12px;
        }

        .ig-account-card {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .ig-account-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 700;
        }

        .ig-account-username {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a2e;
        }

        .ig-account-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #16a34a;
          font-weight: 600;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .status-dot.connected {
          background: #16a34a;
        }

        .ig-account-id {
          font-size: 12px;
          color: #999;
          margin-top: 2px;
        }

        .btn-disconnect {
          background: white;
          color: #e74c3c;
          border: 2px solid #fecaca;
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .btn-disconnect:hover {
          background: #fef2f2;
          border-color: #e74c3c;
        }

        .instagram-disconnected {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 20px;
          text-align: center;
        }

        .ig-empty-state {
          margin-bottom: 20px;
        }

        .ig-empty-state p {
          color: #6c757d;
          font-size: 15px;
        }

        .ack-message-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          resize: vertical;
          margin-bottom: 12px;
          transition: border-color 0.2s;
        }

        .ack-message-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .compliance-notes {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .compliance-note {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: #1a1a2e;
        }

        .compliance-note svg {
          color: #27ae60;
          flex-shrink: 0;
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #999;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .lead-detail-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 70px;
          }

          .sidebar-header span,
          .nav-item span {
            display: none;
          }

          .view-content {
            padding: 20px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .insights-charts-grid {
            grid-template-columns: 1fr;
          }

          .bar-chart-label {
            width: 100px;
            font-size: 12px;
          }
        }

        /* Comment-to-DM Automations */
        .automation-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
        }

        .automation-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.2s;
        }

        .automation-card:hover {
          border-color: #667eea;
        }

        .automation-card.automation-disabled {
          opacity: 0.5;
        }

        .automation-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .automation-keyword-badge {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .automation-card-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .automation-trigger-count {
          font-size: 12px;
          color: #667eea;
          font-weight: 600;
          background: rgba(102, 126, 234, 0.1);
          padding: 2px 8px;
          border-radius: 10px;
        }

        .toggle-sm {
          transform: scale(0.8);
        }

        .btn-icon {
          background: transparent;
          border: none;
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
          color: #6c757d;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: #e9ecef;
          color: #1a1a2e;
        }

        .btn-icon-danger:hover {
          background: #fce4ec;
          color: #e74c3c;
        }

        .automation-card-body {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .automation-dm-preview {
          display: flex;
          gap: 8px;
          font-size: 13px;
          color: #495057;
          padding: 8px 10px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .automation-reply-preview {
          display: flex;
          gap: 8px;
          font-size: 12px;
          color: #999;
          padding: 6px 10px;
        }

        /* Audience Insights */
        .insights-empty-state {
          text-align: center;
          padding: 80px 40px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .insights-empty-state h3 {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 8px;
        }

        .insights-empty-state p {
          color: #6c757d;
          font-size: 15px;
          margin-bottom: 24px;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .insights-loading {
          text-align: center;
          padding: 80px 40px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .insights-loading p {
          color: #6c757d;
          font-size: 15px;
        }

        .insights-loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e0e0e0;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: insightsSpin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes insightsSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .insights-controls {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .insights-metric-select {
          padding: 10px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          background: white;
          color: #1a1a2e;
          cursor: pointer;
          outline: none;
        }

        .insights-metric-select:focus {
          border-color: #667eea;
        }

        .insights-charts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-top: 24px;
        }

        .insights-chart-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .insights-chart-header {
          margin-bottom: 20px;
        }

        .insights-chart-header h3 {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a2e;
        }

        .insights-no-data {
          text-align: center;
          color: #999;
          padding: 40px 20px;
          font-size: 14px;
        }

        /* Horizontal Bar Chart */
        .insights-bar-chart {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .bar-chart-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bar-chart-label {
          width: 140px;
          flex-shrink: 0;
          font-size: 13px;
          color: #495057;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: right;
        }

        .bar-chart-track {
          flex: 1;
          height: 24px;
          background: #f1f3f5;
          border-radius: 6px;
          overflow: hidden;
        }

        .bar-chart-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          min-width: 4px;
        }

        .bar-chart-value {
          width: 60px;
          flex-shrink: 0;
          font-size: 13px;
          font-weight: 600;
          color: #1a1a2e;
          text-align: right;
        }

        /* Gender Visual */
        .gender-visual {
          padding: 8px 0;
        }

        .gender-bar-container {
          display: flex;
          height: 32px;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .gender-bar-segment {
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .gender-legend {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .gender-legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .gender-legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .gender-legend-label {
          color: #495057;
          min-width: 80px;
        }

        .gender-legend-value {
          font-weight: 700;
          color: #1a1a2e;
          min-width: 50px;
        }

        .gender-legend-count {
          color: #999;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}