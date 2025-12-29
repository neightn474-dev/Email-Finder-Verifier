import React, { useState, useEffect } from 'react';
import { Mail, Search, CheckCircle, XCircle, Loader2, Key, Copy, User, LogOut, Activity } from 'lucide-react';

const API_BASE_URL = '';

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  const [activeTab, setActiveTab] = useState('finder');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [usageStats, setUsageStats] = useState({
    totalRequests: 0,
    successfulFinds: 0,
    verifications: 0,
    activeKeys: 0
  });
  
  const [fullName, setFullName] = useState('');
  const [domain, setDomain] = useState('');
  const [finderResult, setFinderResult] = useState(null);
  
  const [emailToVerify, setEmailToVerify] = useState('');
  const [verifierResult, setVerifierResult] = useState(null);

  useEffect(() => {
    const savedKeys = localStorage.getItem('apiKeys');
    const savedStats = localStorage.getItem('usageStats');
    if (savedKeys) setApiKeys(JSON.parse(savedKeys));
    if (savedStats) setUsageStats(JSON.parse(savedStats));
  }, []);

  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      setShowLogin(false);
    } else {
      alert('❌ Invalid password');
    }
  };

  const generateApiKey = () => {
    if (!newKeyName.trim()) {
      alert('⚠️ Please enter a key name');
      return;
    }

    const key = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `ek_${Math.random().toString(36).substr(2, 9)}_${Math.random().toString(36).substr(2, 9)}`,
      created: new Date().toISOString(),
      requests: 0
    };

    const updatedKeys = [...apiKeys, key];
    setApiKeys(updatedKeys);
    localStorage.setItem('apiKeys', JSON.stringify(updatedKeys));
    setNewKeyName('');
    setUsageStats(prev => ({ ...prev, activeKeys: prev.activeKeys + 1 }));
  };

  const deleteApiKey = (id) => {
    const updatedKeys = apiKeys.filter(k => k.id !== id);
    setApiKeys(updatedKeys);
    localStorage.setItem('apiKeys', JSON.stringify(updatedKeys));
    setUsageStats(prev => ({ ...prev, activeKeys: prev.activeKeys - 1 }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('✅ Copied!');
  };

  const updateStats = (type) => {
    const newStats = { ...usageStats, totalRequests: usageStats.totalRequests + 1, [type]: usageStats[type] + 1 };
    setUsageStats(newStats);
    localStorage.setItem('usageStats', JSON.stringify(newStats));
  };

  const findEmail = async () => {
    if (!fullName || !domain) {
      alert('⚠️ Fill all fields');
      return;
    }

    setLoading(true);
    setFinderResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/find-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, domain })
      });

      const data = await response.json();
      
      if (data.success) {
        setFinderResult({
          success: true,
          email: data.email,
          confidence: data.confidence,
          message: '✅ Email found and verified'
        });
        updateStats('successfulFinds');
      } else {
        setFinderResult({ success: false, message: data.message || '❌ Could not verify email', confidence: 0 });
      }
    } catch (error) {
      setFinderResult({ success: false, message: '❌ Error connecting to server', confidence: 0 });
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async () => {
    if (!emailToVerify) {
      alert('⚠️ Enter email');
      return;
    }

    setLoading(true);
    setVerifierResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToVerify })
      });

      const data = await response.json();
      
      setVerifierResult({
        success: data.success,
        email: data.email,
        confidence: data.confidence,
        message: data.success ? '✅ ' + data.message : '❌ ' + data.message
      });
      updateStats('verifications');
    } catch (error) {
      setVerifierResult({ success: false, message: '❌ Error connecting to server', confidence: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-8">
        <div className="bg-gray-800 bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full border border-purple-500">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">Admin Portal</h1>
            <p className="text-gray-300">Enter credentials to access</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">🔑 Admin Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
              />
            </div>
            
            <button
              onClick={handleAdminLogin}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              🚀 Login to Dashboard
            </button>
            
            <p className="text-xs text-gray-400 text-center mt-4">💡 Demo: admin123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="bg-gray-800 bg-opacity-90 backdrop-blur-lg shadow-xl border-b border-purple-500">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-4xl mr-3">📧</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">EmailFinder Pro</h1>
                <p className="text-sm text-gray-300">⚡ Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 rounded-lg">
                <span className="text-xl mr-2">👤</span>
                <span className="text-sm font-medium text-white">Admin</span>
              </div>
              <button
                onClick={() => { setIsAdmin(false); setShowLogin(true); setAdminPassword(''); }}
                className="text-gray-300 hover:text-white bg-gray-700 px-4 py-2 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 bg-opacity-80 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex space-x-8">
            {['dashboard', 'finder', 'api'].map(section => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`py-4 px-2 font-medium border-b-2 transition-all ${
                  activeSection === section ? 'text-purple-400 border-purple-400' : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <span className="text-xl mr-2">{section === 'dashboard' ? '📊' : section === 'finder' ? '🔍' : '🔑'}</span>
                {section === 'dashboard' ? 'Dashboard' : section === 'finder' ? 'Email Finder' : 'API Keys'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {activeSection === 'dashboard' && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">📈 Platform Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { icon: '📊', value: usageStats.totalRequests, label: 'Total Requests', color: 'from-blue-600 to-blue-800' },
                { icon: '✅', value: usageStats.successfulFinds, label: 'Successful Finds', color: 'from-green-600 to-green-800' },
                { icon: '🛡️', value: usageStats.verifications, label: 'Verifications', color: 'from-purple-600 to-purple-800' },
                { icon: '🔑', value: usageStats.activeKeys, label: 'Active Keys', color: 'from-orange-600 to-orange-800' }
              ].map((stat, i) => (
                <div key={i} className={`bg-gradient-to-br ${stat.color} p-6 rounded-xl shadow-xl transform hover:scale-105 transition-transform`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-4xl">{stat.icon}</span>
                    <span className="text-4xl font-bold text-white">{stat.value}</span>
                  </div>
                  <p className="text-white font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-purple-500">
              <h3 className="text-2xl font-bold text-white mb-4">⚡ Admin Privileges</h3>
              <ul className="space-y-3 text-white">
                {['♾️ Unlimited email finding', '🔓 Unlimited verification', '🗝️ API key management', '📊 Full statistics', '🚀 No rate limiting'].map((priv, i) => (
                  <li key={i} className="flex items-center text-lg">{priv}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeSection === 'finder' && (
          <div className="bg-gray-800 rounded-xl border border-purple-500">
            <div className="flex border-b border-gray-700">
              {['finder', 'verifier'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 font-medium ${activeTab === tab ? 'text-purple-400 border-b-2 border-purple-400 bg-gray-700' : 'text-gray-400'}`}
                >
                  <span className="text-xl mr-2">{tab === 'finder' ? '🔍' : '✔️'}</span>
                  {tab === 'finder' ? 'Email Finder' : 'Email Verifier'}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'finder' ? (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">🔍 Find Email</h2>
                  <p className="text-gray-300 mb-6">⚡ Unlimited requests</p>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">👤 Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">🏢 Domain</label>
                      <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="company.com"
                        className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <button
                    onClick={findEmail}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center shadow-lg"
                  >
                    {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />🔄 Finding...</> : <><Search className="w-5 h-5 mr-2" />🚀 Find Email</>}
                  </button>

                  {finderResult && (
                    <div className={`mt-6 p-6 rounded-xl border-2 ${finderResult.success ? 'bg-gradient-to-r from-green-900 to-emerald-900 border-green-400' : 'bg-gradient-to-r from-red-900 to-rose-900 border-red-400'}`}>
                      <div className="flex justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">{finderResult.message}</h3>
                        <div className={`px-4 py-2 rounded-full font-bold ${finderResult.confidence >= 80 ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                          {finderResult.confidence}% 🎯
                        </div>
                      </div>
                      {finderResult.email && (
                        <div className="p-4 bg-gray-800 rounded-lg">
                          <p className="text-2xl font-mono font-bold text-white">📧 {finderResult.email}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">✔️ Verify Email</h2>
                  <p className="text-gray-300 mb-6">⚡ Unlimited verifications</p>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">📧 Email</label>
                    <input
                      type="email"
                      value={emailToVerify}
                      onChange={(e) => setEmailToVerify(e.target.value)}
                      placeholder="example@company.com"
                      className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
                    />
                  </div>

                  <button
                    onClick={verifyEmail}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center shadow-lg"
                  >
                    {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />🔄 Verifying...</> : <><CheckCircle className="w-5 h-5 mr-2" />🛡️ Verify</>}
                  </button>

                  {verifierResult && (
                    <div className={`mt-6 p-6 rounded-xl border-2 ${verifierResult.success ? 'bg-gradient-to-r from-green-900 to-emerald-900 border-green-400' : 'bg-gradient-to-r from-red-900 to-rose-900 border-red-400'}`}>
                      <div className="flex justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">{verifierResult.message}</h3>
                        <div className={`px-4 py-2 rounded-full font-bold ${verifierResult.confidence >= 80 ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                          {verifierResult.confidence}% 🎯
                        </div>
                      </div>
                      {verifierResult.email && (
                        <div className="p-4 bg-gray-800 rounded-lg">
                          <p className="text-2xl font-mono font-bold text-white">📧 {verifierResult.email}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'api' && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">🔑 API Management</h2>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-purple-500 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">✨ Generate Key</h3>
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key name"
                  className="flex-1 px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
                />
                <button
                  onClick={generateApiKey}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 flex items-center shadow-lg"
                >
                  <Key className="w-5 h-5 mr-2" />🎉 Generate
                </button>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-purple-500">
              <h3 className="text-xl font-bold text-white mb-4">🗝️ Active Keys</h3>
              {apiKeys.length === 0 ? (
                <p className="text-gray-400">📝 No keys yet</p>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-white">{key.name}</h4>
                          <p className="text-xs text-gray-400">{new Date(key.created).toLocaleString()}</p>
                        </div>
                        <button onClick={() => deleteApiKey(key.id)} className="text-red-400 hover:text-red-300 text-sm">❌ Delete</button>
                      </div>
                      <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded">
                        <code className="flex-1 text-sm font-mono text-white">{key.key}</code>
                        <button onClick={() => copyToClipboard(key.key)} className="text-purple-400 hover:text-purple-300">
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;