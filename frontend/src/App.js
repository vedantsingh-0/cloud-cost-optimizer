import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import LandingPage from './LandingPage';
import Pricing from './Pricing';
import './App.css';

const API = 'https://cloud-cost-optimizer-05pk.onrender.com/api';
const COLORS = ['#5b6af0', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e', '#a855f7'];

// ─── helpers ────────────────────────────────────────────────
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

// ─── Login ──────────────────────────────────────────────────
const Login = ({ onLogin, switchToRegister }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API}/auth/login`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (e) {
      setError(e.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={d.authWrap}>
      <div style={d.authBox}>
        <div style={d.authLogo}>
          <CloudIcon />
          <span style={d.authBrand}>CloudOptimizer</span>
        </div>
        <h2 style={d.authTitle}>Welcome back</h2>
        <p style={d.authSub}>Sign in to your account</p>
        {error && <div style={d.errBox}>⚠ {error}</div>}
        <Field label="Email" type="email" value={form.email} placeholder="you@company.com"
          onChange={v => setForm({ ...form, email: v })} onEnter={submit} />
        <Field label="Password" type="password" value={form.password} placeholder="••••••••"
          onChange={v => setForm({ ...form, password: v })} onEnter={submit} />
        <button style={d.btnPrimary} onClick={submit} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
        <p style={d.switchTxt}>
          No account?{' '}
          <span style={d.lnk} onClick={switchToRegister}>Create one free</span>
        </p>
      </div>
    </div>
  );
};

// ─── Register ───────────────────────────────────────────────
const Register = ({ onLogin, switchToLogin }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API}/auth/register`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={d.authWrap}>
      <div style={d.authBox}>
        <div style={d.authLogo}>
          <CloudIcon />
          <span style={d.authBrand}>CloudOptimizer</span>
        </div>
        <h2 style={d.authTitle}>Create account</h2>
        <p style={d.authSub}>Start saving on AWS — free forever</p>
        {error && <div style={d.errBox}>⚠ {error}</div>}
        <Field label="Full name" type="text" value={form.name} placeholder="Vedant Singh"
          onChange={v => setForm({ ...form, name: v })} />
        <Field label="Email" type="email" value={form.email} placeholder="you@company.com"
          onChange={v => setForm({ ...form, email: v })} />
        <Field label="Password" type="password" value={form.password} placeholder="Min 6 chars"
          onChange={v => setForm({ ...form, password: v })} onEnter={submit} />
        <button style={d.btnPrimary} onClick={submit} disabled={loading}>
          {loading ? 'Creating…' : 'Get started free →'}
        </button>
        <p style={d.switchTxt}>
          Have an account?{' '}
          <span style={d.lnk} onClick={switchToLogin}>Sign in</span>
        </p>
      </div>
    </div>
  );
};

// ─── Settings ───────────────────────────────────────────────
const Settings = ({ user, onBack, onSave }) => {
  const [form, setForm] = useState({
    awsAccessKeyId: '',
    awsSecretAccessKey: '',
    awsRegion: 'us-east-1'
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const save = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/auth/aws-credentials`, form, { headers: authHeaders() });
      const updated = { ...user, isAwsConnected: true };
      localStorage.setItem('user', JSON.stringify(updated));
      onSave(updated);
      setMsg('success');
    } catch (e) {
      setMsg('error:' + (e.response?.data?.message || 'Failed'));
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e1e1e6', fontFamily: '"DM Mono", monospace, sans-serif', padding: '40px 48px' }}>
      <button onClick={onBack} style={{ background: 'none', border: '1px solid #2a2a35', color: '#888', padding: '7px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, marginBottom: 40 }}>
        ← Back to Dashboard
      </button>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: '#fff' }}>⚙️ AWS Settings</h1>
      <p style={{ color: '#555', marginBottom: 36, fontSize: 14 }}>Connect your AWS account — each user sees only their own data</p>

      {msg === 'success' && (
        <div style={{ padding: '12px 16px', borderRadius: 8, background: '#0d2818', border: '1px solid #22c55e', color: '#22c55e', marginBottom: 24, fontSize: 13 }}>
          ✅ AWS credentials saved! Your dashboard now shows your real data.
        </div>
      )}
      {msg.startsWith('error:') && (
        <div style={{ padding: '12px 16px', borderRadius: 8, background: '#2d0a0a', border: '1px solid #ef4444', color: '#ef4444', marginBottom: 24, fontSize: 13 }}>
          ❌ {msg.replace('error:', '')}
        </div>
      )}

      <div style={{ maxWidth: 480 }}>
        {[
          { label: 'AWS Access Key ID', key: 'awsAccessKeyId', type: 'text', ph: 'AKIA…' },
          { label: 'AWS Secret Access Key', key: 'awsSecretAccessKey', type: 'password', ph: 'Your secret key' },
          { label: 'AWS Region', key: 'awsRegion', type: 'text', ph: 'us-east-1' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{f.label}</label>
            <input type={f.type} placeholder={f.ph} value={form[f.key]}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              style={{ width: '100%', padding: '11px 14px', background: '#111', border: '1px solid #222', borderRadius: 7, color: '#e1e1e6', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
          </div>
        ))}
        <button onClick={save} disabled={loading}
          style={{ width: '100%', padding: 13, background: '#5b6af0', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 24 }}>
          {loading ? 'Saving…' : 'Save & Connect AWS'}
        </button>
        <div style={{ padding: 16, background: '#0f0f14', borderRadius: 8, border: '1px solid #1a1a25', fontSize: 12, color: '#555', lineHeight: 2 }}>
          <p style={{ color: '#777', marginBottom: 8, fontSize: 12 }}>🔒 Required IAM permissions:</p>
          {['AWSBillingReadOnlyAccess', 'AmazonEC2ReadOnlyAccess', 'CloudWatchReadOnlyAccess', 'AmazonS3ReadOnlyAccess'].map(p => (
            <div key={p}><code style={{ color: '#5b6af0' }}>{p}</code></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Admin Panel ─────────────────────────────────────────────
const AdminPanel = ({ onBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API}/auth/admin/users`, { headers: authHeaders() })
      .then(r => setUsers(r.data.users || []))
      .catch(e => setError(e.response?.data?.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e1e1e6', fontFamily: 'system-ui, sans-serif', padding: '40px 48px' }}>
      <button onClick={onBack} style={{ background: 'none', border: '1px solid #2a2a35', color: '#888', padding: '7px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, marginBottom: 40 }}>
        ← Back
      </button>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: '#fff' }}>👑 Admin Panel</h1>
      <p style={{ color: '#555', marginBottom: 36, fontSize: 14 }}>All registered users</p>

      {loading && <p style={{ color: '#555' }}>Loading users…</p>}
      {error && <div style={{ color: '#ef4444', padding: 16, background: '#2d0a0a', borderRadius: 8, border: '1px solid #ef4444' }}>❌ {error} — Make sure your account has admin role in MongoDB.</div>}

      {!loading && !error && (
        <>
          <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total Users', value: users.length },
              { label: 'AWS Connected', value: users.filter(u => u.isAwsConnected).length },
              { label: 'Admins', value: users.filter(u => u.role === 'admin').length },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, background: '#0f0f14', border: '1px solid #1a1a25', borderRadius: 10, padding: '20px 24px' }}>
                <p style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>{s.label}</p>
                <p style={{ fontSize: 32, fontWeight: 700, color: '#5b6af0', margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div style={{ background: '#0f0f14', border: '1px solid #1a1a25', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a25' }}>
                  {['Name', 'Email', 'Plan', 'AWS Connected', 'Role', 'Joined'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #111', background: i % 2 === 0 ? 'transparent' : '#0a0a0f' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#e1e1e6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#5b6af0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#888' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: u.plan === 'pro' ? '#1a1a40' : '#111', color: u.plan === 'pro' ? '#5b6af0' : '#555', border: `1px solid ${u.plan === 'pro' ? '#5b6af0' : '#222'}` }}>
                        {u.plan || 'starter'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: u.isAwsConnected ? '#0d2818' : '#1a0a0a', color: u.isAwsConnected ? '#22c55e' : '#ef4444', border: `1px solid ${u.isAwsConnected ? '#22c55e33' : '#ef444433'}` }}>
                        {u.isAwsConnected ? '✓ Connected' : '✗ Not connected'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: u.role === 'admin' ? '#2d1a00' : '#111', color: u.role === 'admin' ? '#f59e0b' : '#555', border: `1px solid ${u.role === 'admin' ? '#f59e0b33' : '#222'}` }}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#555' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Dashboard ───────────────────────────────────────────────
const Dashboard = ({ user, onLogout, onUserUpdate }) => {
  const [monthly, setMonthly] = useState(null);
  const [daily, setDaily] = useState(null);
  const [ec2, setEc2] = useState(null);
  const [s3, setS3] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [awsError, setAwsError] = useState('');

  useEffect(() => {
    if (!user.isAwsConnected) { setLoading(false); return; }
    const h = { headers: authHeaders() };
    Promise.all([
      axios.get(`${API}/cost/monthly`, h),
      axios.get(`${API}/cost/daily`, h),
      axios.get(`${API}/ec2/idle`, h),
      axios.get(`${API}/s3/usage`, h),
    ]).then(([m, da, e, s]) => {
      setMonthly(m.data); setDaily(da.data); setEc2(e.data); setS3(s.data);
    }).catch(e => setAwsError(e.response?.data?.message || 'Failed to fetch AWS data'))
      .finally(() => setLoading(false));
  }, [user.isAwsConnected]);

  if (showSettings) return (
    <Settings user={user} onBack={() => setShowSettings(false)}
      onSave={u => { onUserUpdate(u); setShowSettings(false); }} />
  );
  if (showPricing) return (
    <Pricing user={user} onBack={() => setShowPricing(false)} />
  );
  if (showAdmin) return (
    <AdminPanel onBack={() => setShowAdmin(false)} />
  );

  const dailyChart = daily?.dailyData?.slice(-14).map(d => ({
    date: d.date.slice(5),
    cost: parseFloat(d.totalCost),
  })) || [];

  const pieData = monthly?.services?.filter(s => parseFloat(s.cost) > 0).map(s => ({
    name: s.service.replace('Amazon ', '').replace('AWS ', ''),
    value: parseFloat(s.cost),
  })) || [];

  const navItems = [
    { id: 'overview', icon: '▦', label: 'Overview' },
    { id: 'costs', icon: '◈', label: 'Costs' },
    { id: 'resources', icon: '◻', label: 'Resources' },
    { id: 'storage', icon: '◫', label: 'Storage' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 224, background: '#0d0d12', borderRight: '1px solid #1a1a25', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 10 }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1a1a25', display: 'flex', alignItems: 'center', gap: 10 }}>
          <CloudIcon size={28} />
          <span style={{ color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px' }}>CloudOpt</span>
        </div>

        <nav style={{ padding: '12px 10px', flex: 1 }}>
          {navItems.map(item => (
            <div key={item.id} onClick={() => setTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                borderRadius: 7, cursor: 'pointer', marginBottom: 2, fontSize: 13, fontWeight: 500,
                color: tab === item.id ? '#fff' : '#555',
                background: tab === item.id ? '#1a1a2e' : 'transparent',
                borderLeft: tab === item.id ? '2px solid #5b6af0' : '2px solid transparent',
                transition: 'all 0.15s',
              }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div style={{ padding: '12px 10px', borderTop: '1px solid #1a1a25' }}>
          {user.isAwsConnected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', marginBottom: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <span style={{ fontSize: 11, color: '#22c55e' }}>AWS Connected</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1a1a2e', border: '1px solid #5b6af0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#5b6af0', flexShrink: 0 }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ color: '#e1e1e6', fontSize: 12, fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
              <p style={{ color: '#444', fontSize: 11, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
            </div>
          </div>
          <SideBtn onClick={() => setShowSettings(true)}>⚙ Settings</SideBtn>
          <SideBtn onClick={() => setShowPricing(true)} accent>⚡ Upgrade</SideBtn>
          {user.role === 'admin' && (
            <SideBtn onClick={() => setShowAdmin(true)}>👑 Admin</SideBtn>
          )}
          <SideBtn onClick={onLogout}>↩ Logout</SideBtn>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 224, flex: 1, padding: '28px 36px', minHeight: '100vh' }}>
        {/* Topbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
              {navItems.find(n => n.id === tab)?.label}
            </h1>
            <p style={{ color: '#444', fontSize: 13, margin: 0 }}>Real-time AWS cost monitoring</p>
          </div>
          <div style={{ background: '#0f0f14', border: '1px solid #1a1a25', borderRadius: 8, padding: '7px 14px', fontSize: 12, color: '#555' }}>
            📅 {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>

        {/* AWS not connected banner */}
        {!user.isAwsConnected && (
          <div style={{ background: '#0f0f14', border: '1px solid #5b6af033', borderRadius: 12, padding: '32px 40px', textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔌</div>
            <h2 style={{ color: '#fff', fontSize: 20, margin: '0 0 8px' }}>Connect your AWS account</h2>
            <p style={{ color: '#555', fontSize: 14, margin: '0 0 24px' }}>Add your AWS credentials to see your real cost data. Each user has their own private data.</p>
            <button onClick={() => setShowSettings(true)}
              style={{ background: '#5b6af0', color: '#fff', border: 'none', padding: '11px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Connect AWS →
            </button>
          </div>
        )}

        {user.isAwsConnected && awsError && (
          <div style={{ background: '#2d0a0a', border: '1px solid #ef4444', borderRadius: 10, padding: '16px 20px', marginBottom: 24, color: '#ef4444', fontSize: 13 }}>
            ❌ {awsError}
          </div>
        )}

        {user.isAwsConnected && loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#555' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>☁️</div>
            <p>Loading your AWS data…</p>
          </div>
        )}

        {user.isAwsConnected && !loading && !awsError && (
          <>
            {/* Overview */}
            {tab === 'overview' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                  <MetricCard label="Monthly Cost" value={`$${monthly?.totalCost || '0.00'}`} sub="This month" accent="#5b6af0" />
                  <MetricCard label="Daily Average" value={`$${daily?.summary?.averageDailyCost || '0.00'}`} sub="Last 30 days" accent="#06b6d4" />
                  <MetricCard label="EC2 Instances" value={ec2?.summary?.totalInstances || 0} sub={`${ec2?.summary?.idleInstances || 0} idle`} accent="#f59e0b" />
                  <MetricCard label="S3 Buckets" value={s3?.summary?.totalBuckets || 0} sub={`${s3?.summary?.totalSizeGB || 0} GB`} accent="#10b981" />
                </div>

                <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)', border: '1px solid #5b6af033', borderRadius: 12, padding: '24px 32px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: '#5b6af0', fontSize: 12, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 1 }}>Potential Monthly Savings</p>
                    <h1 style={{ color: '#fff', fontSize: 48, fontWeight: 800, margin: '0 0 6px' }}>{ec2?.summary?.estimatedMonthlySavings || '$0.00'}</h1>
                    <p style={{ color: '#444', fontSize: 13, margin: 0 }}>From idle EC2 instances — stop them to save</p>
                  </div>
                  <div style={{ fontSize: 56, opacity: 0.6 }}>💡</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <ChartCard title="Daily Cost Trend (14 days)">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={dailyChart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a25" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#444' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#444' }} />
                        <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, color: '#e1e1e6' }} formatter={v => [`$${v}`, 'Cost']} />
                        <Line type="monotone" dataKey="cost" stroke="#5b6af0" strokeWidth={2} dot={{ fill: '#5b6af0', r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Cost by Service">
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, color: '#e1e1e6' }} formatter={v => [`$${v}`, 'Cost']} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: '#444', gap: 8 }}>
                        <span style={{ fontSize: 32 }}>🎉</span>
                        <p style={{ fontSize: 13 }}>No costs yet — free tier!</p>
                      </div>
                    )}
                  </ChartCard>
                </div>
              </>
            )}

            {/* Costs Tab */}
            {tab === 'costs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <ChartCard title="Daily Cost Breakdown (14 days)">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={dailyChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a1a25" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#444' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#444' }} />
                      <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, color: '#e1e1e6' }} formatter={v => [`$${v}`, 'Cost']} />
                      <Bar dataKey="cost" fill="#5b6af0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                  {[
                    { label: 'Highest Day', value: `$${daily?.summary?.highestDay?.cost || '0'}`, sub: daily?.summary?.highestDay?.date },
                    { label: 'Lowest Day', value: `$${daily?.summary?.lowestDay?.cost || '0'}`, sub: daily?.summary?.lowestDay?.date },
                    { label: 'Daily Average', value: `$${daily?.summary?.averageDailyCost || '0'}`, sub: 'Last 30 days' },
                    { label: 'Monthly Total', value: `$${monthly?.totalCost || '0'}`, sub: 'This month' },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#0f0f14', border: '1px solid #1a1a25', borderRadius: 10, padding: '18px 20px' }}>
                      <p style={{ fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>{item.label}</p>
                      <p style={{ fontSize: 24, fontWeight: 700, color: '#5b6af0', margin: '0 0 4px' }}>{item.value}</p>
                      <p style={{ fontSize: 11, color: '#444', margin: 0 }}>{item.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {tab === 'resources' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#0f0f14', border: '1px solid #1a1a25', borderLeft: '3px solid #5b6af0', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 20 }}>🖥</span>
                  <div>
                    <p style={{ fontWeight: 600, color: '#e1e1e6', margin: '0 0 4px', fontSize: 14 }}>EC2 Instance Monitor</p>
                    <p style={{ color: '#555', fontSize: 13, margin: 0 }}>
                      Total: {ec2?.summary?.totalInstances || 0} — Idle: {ec2?.summary?.idleInstances || 0} — Savings: {ec2?.summary?.estimatedMonthlySavings || '$0'}
                    </p>
                  </div>
                </div>

                {ec2?.idleInstances?.length > 0 ? (
                  <DarkTable
                    title="⚠ Idle Instances (Action Required)"
                    headers={['Instance ID', 'Type', 'CPU %', 'Est. Monthly Cost', 'Action']}
                    rows={ec2.idleInstances.map(i => [
                      i.instanceId,
                      i.instanceType,
                      <Badge color="#ef4444">{i.avgCPUPercent}%</Badge>,
                      `$${i.estimatedMonthlyCost}`,
                      <Badge color="#f59e0b">Stop to save</Badge>,
                    ])}
                  />
                ) : (
                  <EmptyState icon="✅" title="No idle instances" sub="All EC2 instances are actively used" />
                )}
              </div>
            )}

            {/* Storage Tab */}
            {tab === 'storage' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#0f0f14', border: '1px solid #1a1a25', borderLeft: '3px solid #10b981', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 20 }}>🪣</span>
                  <div>
                    <p style={{ fontWeight: 600, color: '#e1e1e6', margin: '0 0 4px', fontSize: 14 }}>S3 Storage Overview</p>
                    <p style={{ color: '#555', fontSize: 13, margin: 0 }}>
                      {s3?.summary?.totalBuckets || 0} buckets — {s3?.summary?.totalSizeGB || 0} GB — Est: {s3?.summary?.estimatedMonthlyCost || '$0'}
                    </p>
                  </div>
                </div>
                <DarkTable
                  title="S3 Buckets"
                  headers={['Bucket Name', 'Size (GB)', 'Objects', 'Monthly Cost', 'Recommendation']}
                  rows={(s3?.buckets || []).map(b => [
                    `🪣 ${b.bucketName}`,
                    b.sizeGB,
                    b.numberOfObjects,
                    b.estimatedMonthlyCost,
                    <span style={{ color: '#f59e0b', fontSize: 12 }}>{b.recommendation}</span>,
                  ])}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── Small components ────────────────────────────────────────
const CloudIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="20" r="10" fill="#5b6af0" />
    <circle cx="20" cy="14" r="8" fill="#5b6af0" />
    <circle cx="28" cy="18" r="7" fill="#5b6af0" />
    <rect x="2" y="20" width="33" height="8" rx="3" fill="#5b6af0" />
    <polygon points="18,12 22,12 20,18" fill="white" />
    <rect x="18.5" y="8" width="3" height="6" rx="1" fill="white" />
  </svg>
);

const Field = ({ label, type, value, placeholder, onChange, onEnter }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6, fontWeight: 500 }}>{label}</label>
    <input type={type} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      onKeyPress={e => e.key === 'Enter' && onEnter && onEnter()}
      style={{ width: '100%', padding: '11px 14px', background: '#111', border: '1px solid #222', borderRadius: 8, color: '#e1e1e6', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
  </div>
);

const SideBtn = ({ children, onClick, accent }) => (
  <button onClick={onClick} style={{
    width: '100%', padding: '8px 12px', background: accent ? '#5b6af0' : 'transparent',
    color: accent ? '#fff' : '#555', border: accent ? 'none' : '1px solid #1a1a25',
    borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500, textAlign: 'left',
    marginBottom: 6, transition: 'all 0.15s',
  }}>{children}</button>
);

const MetricCard = ({ label, value, sub, accent }) => (
  <div style={{ background: '#0f0f14', border: '1px solid #1a1a25', borderRadius: 10, padding: '18px 20px', borderTop: `2px solid ${accent}` }}>
    <p style={{ fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>{label}</p>
    <p style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{value}</p>
    <p style={{ fontSize: 11, color: '#444', margin: 0 }}>{sub}</p>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div style={{ background: '#0f0f14', border: '1px solid #1a1a25', borderRadius: 12, padding: '20px 24px' }}>
    <p style={{ fontSize: 13, fontWeight: 600, color: '#e1e1e6', margin: '0 0 16px' }}>{title}</p>
    {children}
  </div>
);

const DarkTable = ({ title, headers, rows }) => (
  <div style={{ background: '#0f0f14', border: '1px solid #1a1a25', borderRadius: 12, overflow: 'hidden' }}>
    <p style={{ fontSize: 13, fontWeight: 600, color: '#e1e1e6', margin: 0, padding: '16px 20px', borderBottom: '1px solid #1a1a25' }}>{title}</p>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>{headers.map(h => <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderTop: '1px solid #111' }}>
            {row.map((cell, j) => <td key={j} style={{ padding: '11px 16px', fontSize: 13, color: '#888' }}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Badge = ({ children, color }) => (
  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: color + '22', color, border: `1px solid ${color}44` }}>{children}</span>
);

const EmptyState = ({ icon, title, sub }) => (
  <div style={{ background: '#0f0f14', border: '1px solid #1a1a25', borderRadius: 12, padding: '60px', textAlign: 'center' }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
    <h3 style={{ color: '#22c55e', margin: '0 0 8px', fontSize: 16 }}>{title}</h3>
    <p style={{ color: '#444', fontSize: 13, margin: 0 }}>{sub}</p>
  </div>
);

// ─── Root App ─────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('landing');

  useEffect(() => {
    const u = localStorage.getItem('user');
    const t = localStorage.getItem('token');
    if (u && t) setUser(JSON.parse(u));
  }, []);

  const handleLogin = u => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setPage('landing');
  };

  if (user) return <Dashboard user={user} onLogout={handleLogout} onUserUpdate={handleLogin} />;
  if (page === 'register') return <Register onLogin={handleLogin} switchToLogin={() => setPage('login')} />;
  if (page === 'login') return <Login onLogin={handleLogin} switchToRegister={() => setPage('register')} />;
  return <LandingPage onGetStarted={() => setPage('register')} />;
}

// ─── Styles ───────────────────────────────────────────────────
const d = {
  authWrap: { minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  authBox: { background: '#0f0f14', border: '1px solid #1a1a25', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 400 },
  authLogo: { display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 28 },
  authBrand: { fontSize: 20, fontWeight: 700, color: '#fff' },
  authTitle: { fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 6px', textAlign: 'center' },
  authSub: { fontSize: 13, color: '#555', margin: '0 0 24px', textAlign: 'center' },
  errBox: { background: '#2d0a0a', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 },
  btnPrimary: { width: '100%', padding: 13, background: '#5b6af0', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 16, marginTop: 4 },
  switchTxt: { textAlign: 'center', color: '#444', fontSize: 13, margin: 0 },
  lnk: { color: '#5b6af0', cursor: 'pointer', fontWeight: 600 },
};
