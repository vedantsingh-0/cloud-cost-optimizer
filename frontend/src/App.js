import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import LandingPage from './LandingPage';
import Pricing from './Pricing';
import './App.css';

const API = 'https://cloud-cost-optimizer-05pk.onrender.com/api';
const COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e'];

const Login = ({ onLogin, switchToRegister }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API}/auth/login`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div style={s.authBg}>
      <div style={s.authCard}>
        <div style={s.authLogoRow}>
          <svg width="40" height="40" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="20" r="10" fill="#6366f1"/>
            <circle cx="20" cy="14" r="8" fill="#6366f1"/>
            <circle cx="28" cy="18" r="7" fill="#6366f1"/>
            <rect x="2" y="20" width="33" height="8" rx="3" fill="#6366f1"/>
            <polygon points="18,12 22,12 20,18" fill="white"/>
            <rect x="18.5" y="8" width="3" height="6" rx="1" fill="white"/>
          </svg>
          <span style={s.authBrand}>CloudOptimizer</span>
        </div>
        <h2 style={s.authHeading}>Welcome back 👋</h2>
        <p style={s.authSub}>Sign in to your account to continue</p>
        {error && <div style={s.errorBox}>⚠️ {error}</div>}
        <div style={s.inputGroup}>
          <label style={s.label}>Email address</label>
          <input style={s.input} type="email" placeholder="you@company.com"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})}
            onKeyPress={e => e.key === 'Enter' && handleSubmit()}/>
        </div>
        <div style={s.inputGroup}>
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" placeholder="••••••••"
            value={form.password} onChange={e => setForm({...form, password: e.target.value})}
            onKeyPress={e => e.key === 'Enter' && handleSubmit()}/>
        </div>
        <button style={s.btnPrimary} onClick={handleSubmit} disabled={loading}>
          {loading ? '⏳ Signing in...' : 'Sign in →'}
        </button>
        <p style={s.switchText}>
          New here? <span style={s.link} onClick={switchToRegister}>Create free account</span>
        </p>
      </div>
    </div>
  );
};

const Register = ({ onLogin, switchToLogin }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API}/auth/register`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <div style={s.authBg}>
      <div style={s.authCard}>
        <div style={s.authLogoRow}>
          <svg width="40" height="40" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="20" r="10" fill="#6366f1"/>
            <circle cx="20" cy="14" r="8" fill="#6366f1"/>
            <circle cx="28" cy="18" r="7" fill="#6366f1"/>
            <rect x="2" y="20" width="33" height="8" rx="3" fill="#6366f1"/>
            <polygon points="18,12 22,12 20,18" fill="white"/>
            <rect x="18.5" y="8" width="3" height="6" rx="1" fill="white"/>
          </svg>
          <span style={s.authBrand}>CloudOptimizer</span>
        </div>
        <h2 style={s.authHeading}>Create your account 🚀</h2>
        <p style={s.authSub}>Start saving on AWS today — free forever</p>
        {error && <div style={s.errorBox}>⚠️ {error}</div>}
        <div style={s.inputGroup}>
          <label style={s.label}>Full name</label>
          <input style={s.input} type="text" placeholder="Vedant Singh"
            value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>
        </div>
        <div style={s.inputGroup}>
          <label style={s.label}>Email address</label>
          <input style={s.input} type="email" placeholder="you@company.com"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})}/>
        </div>
        <div style={s.inputGroup}>
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" placeholder="Min 6 characters"
            value={form.password} onChange={e => setForm({...form, password: e.target.value})}/>
        </div>
        <button style={s.btnPrimary} onClick={handleSubmit} disabled={loading}>
          {loading ? '⏳ Creating account...' : 'Get started free →'}
        </button>
        <p style={s.switchText}>
          Already have an account? <span style={s.link} onClick={switchToLogin}>Sign in</span>
        </p>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, sub, color }) => (
  <div style={{...s.statCard, borderLeft: `4px solid ${color}`}}>
    <div style={{...s.statIcon, background: color + '18', color}}>{icon}</div>
    <div>
      <p style={s.statLabel}>{label}</p>
      <h2 style={s.statValue}>{value}</h2>
      <p style={s.statSub}>{sub}</p>
    </div>
  </div>
);

const Dashboard = ({ user, onLogout }) => {
  const [monthly, setMonthly] = useState(null);
  const [daily, setDaily] = useState(null);
  const [ec2, setEc2] = useState(null);
  const [s3, setS3] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [showPricing, setShowPricing] = useState(

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(`${API}/cost/monthly`, { headers }),
      axios.get(`${API}/cost/daily`, { headers }),
      axios.get(`${API}/ec2/idle`, { headers }),
      axios.get(`${API}/s3/usage`, { headers }),
    ]).then(([m, d, e, s3r]) => {
      setMonthly(m.data);
      setDaily(d.data);
      setEc2(e.data);
      setS3(s3r.data);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const dailyChart = daily?.dailyData?.slice(-14).map(d => ({
    date: d.date.slice(5),
    cost: parseFloat(d.totalCost),
  })) || [];

  const pieData = monthly?.services?.filter(s => parseFloat(s.cost) > 0).map(s => ({
    name: s.service.replace('Amazon ', '').replace('AWS ', ''),
    value: parseFloat(s.cost),
  })) || [];

  if (showSettings) return <Settings user={user} onBack={() => setShowSettings(false)} onSave={(u) => { onUserUpdate(u); setShowSettings(false); }}/>;
  if (showPricing) return <Pricing

  if (loading) return (
    <div style={s.loadingScreen}>
      <div style={s.loadingCard}>
        <div style={{fontSize: 60}}>☁️</div>
        <h2 style={{color: '#6366f1', margin: '16px 0 8px'}}>Loading your cloud data</h2>
        <p style={{color: '#94a3b8'}}>Fetching real-time AWS metrics...</p>
      </div>
    </div>
  );

  return (
    <div style={s.dashContainer}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <svg width="32" height="32" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="20" r="10" fill="#6366f1"/>
            <circle cx="20" cy="14" r="8" fill="#6366f1"/>
            <circle cx="28" cy="18" r="7" fill="#6366f1"/>
            <rect x="2" y="20" width="33" height="8" rx="3" fill="#6366f1"/>
            <polygon points="18,12 22,12 20,18" fill="white"/>
            <rect x="18.5" y="8" width="3" height="6" rx="1" fill="white"/>
          </svg>
          <span style={s.sidebarBrand}>CloudOpt</span>
        </div>
        <nav style={s.nav}>
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'costs', icon: '💰', label: 'Costs' },
            { id: 'resources', icon: '🖥️', label: 'Resources' },
            { id: 'storage', icon: '🗄️', label: 'Storage' },
          ].map(item => (
            <div key={item.id}
              style={{...s.navItem, ...(activeTab === item.id ? s.navItemActive : {})}}
              onClick={() => setActiveTab(item.id)}>
              <span style={{fontSize: 16}}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={s.sidebarFooter}>
          <div style={s.userBadge}>
            <div style={s.avatar}>{user.name[0].toUpperCase()}</div>
            <div>
              <p style={s.userName}>{user.name}</p>
              <p style={s.userEmail}>{user.email}</p>
            </div>
          </div>
          <button style={{...s.logoutBtn, marginBottom:8}} onClick={() => setShowSettings(true)}>
            ⚙️ Settings
          </button>
          <button style={s.upgradeBtn} onClick={() => setShowPricing(true)}>
            ⚡ Upgrade Plan
          </button>
          <button style={s.logoutBtn} onClick={onLogout}>↩ Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={s.mainContent}>
        {/* Top Bar */}
        <div style={s.topBar}>
          <div>
            <h1 style={s.pageTitle}>
              {activeTab === 'overview' && '📊 Overview'}
              {activeTab === 'costs' && '💰 Cost Analysis'}
              {activeTab === 'resources' && '🖥️ EC2 Resources'}
              {activeTab === 'storage' && '🗄️ S3 Storage'}
            </h1>
            <p style={s.pageSubtitle}>Real-time AWS cost monitoring</p>
          </div>
          <div style={s.dateBadge}>
            📅 {new Date().toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div style={s.statsGrid}>
              <StatCard icon="💵" label="Monthly Cost" color="#6366f1"
                value={`$${monthly?.totalCost || '0.00'}`} sub="This month so far"/>
              <StatCard icon="📈" label="Daily Average" color="#06b6d4"
                value={`$${daily?.summary?.averageDailyCost || '0.00'}`} sub="Last 30 days"/>
              <StatCard icon="🖥️" label="EC2 Instances" color="#f59e0b"
                value={ec2?.summary?.totalInstances || 0}
                sub={`${ec2?.summary?.idleInstances || 0} idle detected`}/>
              <StatCard icon="🪣" label="S3 Buckets" color="#10b981"
                value={s3?.summary?.totalBuckets || 0}
                sub={`${s3?.summary?.totalSizeGB || 0} GB total`}/>
            </div>
            <div style={s.savingsBanner}>
              <div>
                <p style={s.savingsLabel}>💡 Estimated Monthly Savings</p>
                <h1 style={s.savingsAmount}>{ec2?.summary?.estimatedMonthlySavings || '$0.00'}</h1>
                <p style={s.savingsSub}>Stop idle EC2 instances to save this amount every month</p>
              </div>
              <div style={{textAlign:'center', opacity:0.9}}>
                <span style={{fontSize:48}}>🚀</span>
                <p style={{margin:'8px 0 0',fontSize:13,opacity:0.9}}>Potential savings identified</p>
              </div>
            </div>
            <div style={s.chartsRow}>
              <div style={s.chartBox}>
                <h3 style={s.chartTitle}>📈 Daily Cost Trend (14 days)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={dailyChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                    <XAxis dataKey="date" tick={{fontSize:10,fill:'#94a3b8'}}/>
                    <YAxis tick={{fontSize:10,fill:'#94a3b8'}}/>
                    <Tooltip contentStyle={{borderRadius:8,border:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}} formatter={v=>[`$${v}`,'Cost']}/>
                    <Line type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={2} dot={{fill:'#6366f1',r:3}}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={s.chartBox}>
                <h3 style={s.chartTitle}>🥧 Cost by Service</h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                        label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                        {pieData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                      </Pie>
                      <Tooltip formatter={v=>[`$${v}`,'Cost']}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={s.emptyState}>
                    <span style={{fontSize:40}}>🎉</span>
                    <p>No costs yet — you're on free tier!</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'costs' && (
          <div style={s.tabContent}>
            <div style={s.chartBox}>
              <h3 style={s.chartTitle}>📊 Daily Cost Breakdown (Last 14 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="date" tick={{fontSize:11,fill:'#94a3b8'}}/>
                  <YAxis tick={{fontSize:11,fill:'#94a3b8'}}/>
                  <Tooltip contentStyle={{borderRadius:8,border:'none'}} formatter={v=>[`$${v}`,'Cost']}/>
                  <Bar dataKey="cost" fill="#6366f1" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={s.summaryBox}>
              <h3 style={s.chartTitle}>📋 Cost Summary</h3>
              <div style={s.summaryGrid}>
                {[
                  {label:'Highest Day', value:`$${daily?.summary?.highestDay?.cost||'0'}`, sub:daily?.summary?.highestDay?.date},
                  {label:'Lowest Day', value:`$${daily?.summary?.lowestDay?.cost||'0'}`, sub:daily?.summary?.lowestDay?.date},
                  {label:'Daily Average', value:`$${daily?.summary?.averageDailyCost||'0'}`, sub:'Last 30 days'},
                  {label:'Monthly Total', value:`$${monthly?.totalCost||'0'}`, sub:'This month'},
                ].map(item=>(
                  <div key={item.label} style={s.summaryItem}>
                    <p style={s.summaryLabel}>{item.label}</p>
                    <p style={s.summaryValue}>{item.value}</p>
                    <p style={s.summarySub}>{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div style={s.tabContent}>
            <div style={s.alertBox}>
              <span style={{fontSize:20}}>🖥️</span>
              <div>
                <p style={s.alertTitle}>EC2 Instance Monitor</p>
                <p style={s.alertSub}>
                  Total: {ec2?.summary?.totalInstances||0} instances —
                  Idle: {ec2?.summary?.idleInstances||0} —
                  Savings: {ec2?.summary?.estimatedMonthlySavings||'$0'}
                </p>
              </div>
            </div>
            {ec2?.idleInstances?.length > 0 ? (
              <div style={s.tableBox}>
                <h3 style={s.chartTitle}>⚠️ Idle Instances</h3>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>Instance ID</th>
                      <th style={s.th}>Type</th>
                      <th style={s.th}>CPU %</th>
                      <th style={s.th}>Monthly Cost</th>
                      <th style={s.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ec2.idleInstances.map((inst,i)=>(
                      <tr key={i}>
                        <td style={s.td}>{inst.instanceId}</td>
                        <td style={s.td}>{inst.instanceType}</td>
                        <td style={s.td}><span style={s.badgeRed}>{inst.avgCPUPercent}%</span></td>
                        <td style={s.td}>${inst.estimatedMonthlyCost}</td>
                        <td style={s.td}><span style={s.badgeOrange}>Stop to save</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={s.emptyCard}>
                <span style={{fontSize:48}}>✅</span>
                <h3 style={{margin:'16px 0 8px',color:'#10b981'}}>No idle instances!</h3>
                <p style={{color:'#94a3b8'}}>All your EC2 instances are actively being used.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'storage' && (
          <div style={s.tabContent}>
            <div style={s.alertBox}>
              <span style={{fontSize:20}}>🪣</span>
              <div>
                <p style={s.alertTitle}>S3 Storage Overview</p>
                <p style={s.alertSub}>
                  {s3?.summary?.totalBuckets||0} buckets —
                  {s3?.summary?.totalSizeGB||0} GB total —
                  Est. cost: {s3?.summary?.estimatedMonthlyCost||'$0'}
                </p>
              </div>
            </div>
            <div style={s.tableBox}>
              <h3 style={s.chartTitle}>🗄️ S3 Buckets</h3>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Bucket Name</th>
                    <th style={s.th}>Size (GB)</th>
                    <th style={s.th}>Objects</th>
                    <th style={s.th}>Monthly Cost</th>
                    <th style={s.th}>Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {s3?.buckets?.map((b,i)=>(
                    <tr key={i} style={{background:i%2===0?'white':'#fafafa'}}>
                      <td style={s.td}>🪣 {b.bucketName}</td>
                      <td style={s.td}>{b.sizeGB}</td>
                      <td style={s.td}>{b.numberOfObjects}</td>
                      <td style={s.td}>{b.estimatedMonthlyCost}</td>
                      <td style={{...s.td,color:'#f59e0b',fontSize:12}}>{b.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Settings = ({ user, onBack, onSave }) => {
  const [form, setForm] = useState({ awsAccessKeyId: '', awsSecretAccessKey: '', awsRegion: 'us-east-1' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/auth/aws-credentials`, form, { headers: { Authorization: `Bearer ${token}` } });
      const updatedUser = { ...user, isAwsConnected: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onSave(updatedUser);
      setMsg('✅ AWS credentials saved! Your dashboard now shows your real data.');
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Failed to save'));
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:'100vh', background:'#0a0a0f', color:'white', fontFamily:'monospace', padding:'40px'}}>
      <button onClick={onBack} style={{background:'none', border:'1px solid #333', color:'#888', padding:'8px 16px', borderRadius:6, cursor:'pointer', marginBottom:32}}>← Back</button>
      <h1 style={{fontSize:28, fontWeight:700, marginBottom:8}}>⚙️ AWS Settings</h1>
      <p style={{color:'#666', marginBottom:32}}>Connect your AWS account to see your real cost data</p>
      {msg && <div style={{padding:'12px 16px', borderRadius:8, background: msg.startsWith('✅') ? '#0d2818' : '#2d0a0a', border: `1px solid ${msg.startsWith('✅') ? '#22c55e' : '#ef4444'}`, marginBottom:24, fontSize:14}}>{msg}</div>}
      <div style={{maxWidth:500}}>
        {[
          {label:'AWS Access Key ID', key:'awsAccessKeyId', type:'text', placeholder:'AKIA...'},
          {label:'AWS Secret Access Key', key:'awsSecretAccessKey', type:'password', placeholder:'Your secret key'},
          {label:'AWS Region', key:'awsRegion', type:'text', placeholder:'us-east-1'},
        ].map(f => (
          <div key={f.key} style={{marginBottom:20}}>
            <label style={{display:'block', fontSize:12, color:'#888', marginBottom:6, textTransform:'uppercase', letterSpacing:1}}>{f.label}</label>
            <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
              onChange={e => setForm({...form, [f.key]: e.target.value})}
              style={{width:'100%', padding:'12px 14px', background:'#111', border:'1px solid #333', borderRadius:8, color:'white', fontSize:14, boxSizing:'border-box'}}/>
          </div>
        ))}
        <button onClick={handleSave} disabled={loading}
          style={{width:'100%', padding:14, background:'#6366f1', color:'white', border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor:'pointer'}}>
          {loading ? 'Saving...' : 'Save & Connect AWS'}
        </button>
        <div style={{marginTop:24, padding:16, background:'#111', borderRadius:8, border:'1px solid #222', fontSize:13, color:'#666', lineHeight:1.8}}>
          <p style={{color:'#888', marginBottom:8}}>🔒 Required IAM permissions:</p>
          <code style={{color:'#6366f1'}}>AWSBillingReadOnlyAccess</code><br/>
          <code style={{color:'#6366f1'}}>AmazonEC2ReadOnlyAccess</code><br/>
          <code style={{color:'#6366f1'}}>CloudWatchReadOnlyAccess</code><br/>
          <code style={{color:'#6366f1'}}>AmazonS3ReadOnlyAccess</code>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('landing');

  useEffect(() => {
    const u = localStorage.getItem('user');
    const t = localStorage.getItem('token');
    if (u && t) setUser(JSON.parse(u));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setPage('landing');
  };

  if (user) return <Dashboard user={user} onLogout={handleLogout} onUserUpdate={handleLogin}/>;
  if (page === 'register') return <Register onLogin={handleLogin} switchToLogin={() => setPage('login')}/>;
  if (page === 'login') return <Login onLogin={handleLogin} switchToRegister={() => setPage('register')}/>;
  return <LandingPage onGetStarted={() => setPage('register')}/>;
}

const s = {
  authBg: { minHeight:'100vh', background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  authCard: { background:'white', borderRadius:20, padding:'40px 36px', width:'100%', maxWidth:420, boxShadow:'0 25px 80px rgba(0,0,0,0.2)' },
  authLogoRow: { display:'flex', alignItems:'center', gap:10, justifyContent:'center', marginBottom:24 },
  authBrand: { fontSize:22, fontWeight:700, color:'#1e1b4b' },
  authHeading: { fontSize:22, fontWeight:700, color:'#1e1b4b', margin:'0 0 8px', textAlign:'center' },
  authSub: { fontSize:14, color:'#94a3b8', margin:'0 0 24px', textAlign:'center' },
  errorBox: { background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', padding:'10px 14px', borderRadius:8, marginBottom:16, fontSize:13 },
  inputGroup: { marginBottom:16 },
  label: { display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6 },
  input: { width:'100%', padding:'12px 14px', borderRadius:8, border:'1.5px solid #e2e8f0', fontSize:14, outline:'none', boxSizing:'border-box' },
  btnPrimary: { width:'100%', padding:14, background:'linear-gradient(135deg, #6366f1, #8b5cf6)', color:'white', border:'none', borderRadius:10, fontSize:15, fontWeight:600, cursor:'pointer', marginBottom:16 },
  switchText: { textAlign:'center', color:'#94a3b8', fontSize:13, margin:0 },
  link: { color:'#6366f1', cursor:'pointer', fontWeight:600 },
  loadingScreen: { minHeight:'100vh', background:'#f5f7fa', display:'flex', alignItems:'center', justifyContent:'center' },
  loadingCard: { textAlign:'center', padding:40 },
  dashContainer: { display:'flex', minHeight:'100vh', background:'#f5f7fa' },
  sidebar: { width:220, background:'#1e1b4b', display:'flex', flexDirection:'column', padding:'24px 0', position:'fixed', height:'100vh' },
  sidebarLogo: { display:'flex', alignItems:'center', gap:10, padding:'0 20px 24px', borderBottom:'1px solid rgba(255,255,255,0.1)' },
  sidebarBrand: { color:'white', fontSize:18, fontWeight:700 },
  nav: { padding:'16px 12px', flex:1 },
  navItem: { display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:10, color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:14, fontWeight:500, marginBottom:4 },
  navItemActive: { background:'rgba(99,102,241,0.3)', color:'white' },
  sidebarFooter: { padding:'16px 12px', borderTop:'1px solid rgba(255,255,255,0.1)' },
  userBadge: { display:'flex', alignItems:'center', gap:10, marginBottom:12 },
  avatar: { width:36, height:36, borderRadius:'50%', background:'#6366f1', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, flexShrink:0 },
  userName: { color:'white', fontSize:13, fontWeight:600, margin:0 },
  userEmail: { color:'rgba(255,255,255,0.5)', fontSize:11, margin:0 },
  upgradeBtn: { width:'100%', padding:'9px', background:'linear-gradient(135deg, #6366f1, #8b5cf6)', color:'white', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:8 },
  logoutBtn: { width:'100%', padding:'8px', background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, cursor:'pointer', fontSize:13 },
  mainContent: { marginLeft:220, flex:1, padding:'28px 32px' },
  topBar: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 },
  pageTitle: { fontSize:24, fontWeight:700, color:'#1e1b4b', margin:'0 0 4px' },
  pageSubtitle: { color:'#94a3b8', fontSize:13, margin:0 },
  dateBadge: { background:'white', padding:'8px 16px', borderRadius:10, fontSize:13, color:'#64748b', border:'1px solid #e2e8f0' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 },
  statCard: { background:'white', borderRadius:14, padding:'20px', display:'flex', alignItems:'center', gap:16, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  statIcon: { width:48, height:48, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 },
  statLabel: { fontSize:12, color:'#94a3b8', margin:'0 0 4px', textTransform:'uppercase', letterSpacing:0.5 },
  statValue: { fontSize:26, fontWeight:700, color:'#1e1b4b', margin:'0 0 2px' },
  statSub: { fontSize:11, color:'#94a3b8', margin:0 },
  savingsBanner: { background:'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius:16, padding:'28px 32px', marginBottom:24, color:'white', display:'flex', justifyContent:'space-between', alignItems:'center' },
  savingsLabel: { fontSize:13, opacity:0.85, margin:'0 0 8px' },
  savingsAmount: { fontSize:52, fontWeight:800, margin:'0 0 8px' },
  savingsSub: { fontSize:13, opacity:0.75, margin:0 },
  chartsRow: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 },
  chartBox: { background:'white', borderRadius:14, padding:'20px 24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  chartTitle: { fontSize:15, fontWeight:600, color:'#1e1b4b', margin:'0 0 16px' },
  emptyState: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:200, color:'#94a3b8', gap:8 },
  tabContent: { display:'flex', flexDirection:'column', gap:20 },
  alertBox: { background:'white', borderRadius:14, padding:'20px 24px', display:'flex', alignItems:'center', gap:16, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', borderLeft:'4px solid #6366f1' },
  alertTitle: { fontWeight:600, color:'#1e1b4b', margin:'0 0 4px' },
  alertSub: { color:'#94a3b8', fontSize:13, margin:0 },
  tableBox: { background:'white', borderRadius:14, padding:'20px 24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { padding:'10px 14px', textAlign:'left', fontSize:12, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.5, borderBottom:'1px solid #f1f5f9' },
  td: { padding:'12px 14px', fontSize:14, color:'#374151', borderBottom:'1px solid #f8fafc' },
  badgeRed: { background:'#fef2f2', color:'#dc2626', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 },
  badgeOrange: { background:'#fff7ed', color:'#ea580c', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 },
  emptyCard: { background:'white', borderRadius:14, padding:'60px', textAlign:'center', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  summaryBox: { background:'white', borderRadius:14, padding:'20px 24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  summaryGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 },
  summaryItem: { textAlign:'center', padding:16, background:'#f8fafc', borderRadius:10 },
  summaryLabel: { fontSize:12, color:'#94a3b8', margin:'0 0 8px', textTransform:'uppercase' },
  summaryValue: { fontSize:24, fontWeight:700, color:'#6366f1', margin:'0 0 4px' },
  summarySub: { fontSize:12, color:'#94a3b8', margin:0 },
};
