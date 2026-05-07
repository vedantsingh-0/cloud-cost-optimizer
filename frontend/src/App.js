import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LandingPage from './LandingPage';
import Pricing from './Pricing';
import './App.css';

const API = 'https://cloud-cost-optimizer-05pk.onrender.com/api';
const COLORS = ['#00ff88', '#00ccff', '#ff6b35', '#ffd700', '#ff0080', '#7c3aed'];

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// ── Tiny components ──────────────────────────────────────────

const Tag = ({ children, color = '#00ff88' }) => (
  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 3, background: color + '15', color, border: `1px solid ${color}30`, fontFamily: 'monospace', letterSpacing: 1 }}>
    {children}
  </span>
);

const Dot = ({ color = '#00ff88', pulse }) => (
  <span style={{ position: 'relative', display: 'inline-block', width: 8, height: 8 }}>
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'block', boxShadow: `0 0 6px ${color}` }} />
    {pulse && <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, animation: 'ping 1.5s ease-in-out infinite', opacity: 0.4 }} />}
  </span>
);

const Field = ({ label, type, value, placeholder, onChange, onEnter, extra }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', fontSize: 11, color: '#00ff88', marginBottom: 8, fontFamily: 'monospace', letterSpacing: 2, textTransform: 'uppercase' }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <input type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && onEnter && onEnter()}
        style={{ width: '100%', padding: '12px 16px', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 4, color: '#e0e0e0', fontSize: 14, fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
        onFocus={e => e.target.style.borderColor = '#00ff88'}
        onBlur={e => e.target.style.borderColor = '#1a1a1a'}
      />
      {extra}
    </div>
  </div>
);

const StatCard = ({ label, value, sub, color, icon, trend }) => (
  <div style={{ background: '#080808', border: '1px solid #111', borderRadius: 8, padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      <span style={{ fontSize: 11, color: '#444', fontFamily: 'monospace', letterSpacing: 2, textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: 18, opacity: 0.6 }}>{icon}</span>
    </div>
    <p style={{ fontSize: 32, fontWeight: 700, color: '#fff', margin: '0 0 6px', fontFamily: 'monospace', letterSpacing: -1 }}>{value}</p>
    <p style={{ fontSize: 12, color: '#333', margin: 0, fontFamily: 'monospace' }}>{sub}</p>
    {trend && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, opacity: 0.15 }}>{trend}</div>}
  </div>
);

const SideBtn = ({ children, onClick, active, accent }) => (
  <button onClick={onClick} style={{
    width: '100%', padding: '9px 14px', background: active ? '#00ff8810' : accent ? '#00ff8818' : 'transparent',
    color: active ? '#00ff88' : accent ? '#00ff88' : '#333',
    border: active ? '1px solid #00ff8830' : '1px solid transparent',
    borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600, textAlign: 'left',
    marginBottom: 2, fontFamily: 'monospace', transition: 'all 0.15s', letterSpacing: 0.5,
    display: 'flex', alignItems: 'center', gap: 8,
  }}>
    {children}
  </button>
);

const ChartBox = ({ title, tag, children }) => (
  <div style={{ background: '#080808', border: '1px solid #111', borderRadius: 8, padding: '20px 24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#666', margin: 0, fontFamily: 'monospace', letterSpacing: 2, textTransform: 'uppercase' }}>{title}</p>
      {tag && <Tag>{tag}</Tag>}
    </div>
    {children}
  </div>
);

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 4, padding: '10px 14px', fontFamily: 'monospace' }}>
      <p style={{ color: '#444', fontSize: 11, margin: '0 0 4px' }}>{label}</p>
      <p style={{ color: '#00ff88', fontSize: 14, fontWeight: 700, margin: 0 }}>${payload[0]?.value}</p>
    </div>
  );
};

// ── Auth pages ────────────────────────────────────────────────

const AuthWrap = ({ children }) => (
  <div style={{ minHeight: '100vh', background: '#030303', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
    <style>{`
      @keyframes ping { 0%,100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.8); opacity: 0; } }
      @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
      @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      .auth-in { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
    `}</style>
    {/* Scan line */}
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #00ff8808, transparent)', animation: 'scan 4s linear infinite' }} />
      {/* Grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(#00ff8804 1px, transparent 1px), linear-gradient(90deg, #00ff8804 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
    </div>
    <div className="auth-in" style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
      {children}
    </div>
  </div>
);

const Login = ({ onLogin, switchToRegister }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API}/auth/login`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (e) { setError(e.response?.data?.message || 'Authentication failed'); }
    setLoading(false);
  };

  return (
    <AuthWrap>
      <div style={{ background: '#080808', border: '1px solid #111', borderRadius: 8, padding: '40px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, background: '#00ff8810', border: '1px solid #00ff8830', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>☁</div>
          <div>
            <p style={{ color: '#00ff88', fontSize: 14, fontWeight: 700, margin: 0, fontFamily: 'monospace' }}>CloudOptimizer</p>
            <p style={{ color: '#333', fontSize: 11, margin: 0, fontFamily: 'monospace' }}>v2.0.0 · production</p>
          </div>
        </div>

        <p style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 4px', fontFamily: 'monospace' }}>$ authenticate</p>
        <p style={{ color: '#333', fontSize: 12, margin: '0 0 28px', fontFamily: 'monospace' }}>Enter your credentials to access the system</p>

        {error && (
          <div style={{ background: '#ff000008', border: '1px solid #ff000030', borderRadius: 4, padding: '10px 14px', marginBottom: 20, color: '#ff4444', fontSize: 12, fontFamily: 'monospace' }}>
            ✗ {error}
          </div>
        )}

        <Field label="Email" type="email" value={form.email} placeholder="user@company.com"
          onChange={v => setForm({ ...form, email: v })} onEnter={submit} />
        <Field label="Password" type={showPass ? 'text' : 'password'} value={form.password} placeholder="••••••••••"
          onChange={v => setForm({ ...form, password: v })} onEnter={submit}
          extra={
            <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 12, fontFamily: 'monospace' }}>
              {showPass ? '[hide]' : '[show]'}
            </button>
          }
        />

        <button onClick={submit} disabled={loading} style={{ width: '100%', padding: '13px', background: loading ? '#0a0a0a' : '#00ff8815', color: loading ? '#333' : '#00ff88', border: `1px solid ${loading ? '#111' : '#00ff8840'}`, borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 20 }}>
          {loading ? '// authenticating...' : '→ sign_in()'}
        </button>

        <p style={{ textAlign: 'center', color: '#222', fontSize: 12, margin: 0, fontFamily: 'monospace' }}>
          No account?{' '}
          <span style={{ color: '#00ff88', cursor: 'pointer' }} onClick={switchToRegister}>[register]</span>
        </p>
      </div>
    </AuthWrap>
  );
};

const Register = ({ onLogin, switchToLogin }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API}/auth/register`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (e) { setError(e.response?.data?.message || 'Registration failed'); }
    setLoading(false);
  };

  return (
    <AuthWrap>
      <div style={{ background: '#080808', border: '1px solid #111', borderRadius: 8, padding: '40px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, background: '#00ff8810', border: '1px solid #00ff8830', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>☁</div>
          <div>
            <p style={{ color: '#00ff88', fontSize: 14, fontWeight: 700, margin: 0, fontFamily: 'monospace' }}>CloudOptimizer</p>
            <p style={{ color: '#333', fontSize: 11, margin: 0, fontFamily: 'monospace' }}>v2.0.0 · production</p>
          </div>
        </div>

        <p style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 4px', fontFamily: 'monospace' }}>$ create_account</p>
        <p style={{ color: '#333', fontSize: 12, margin: '0 0 28px', fontFamily: 'monospace' }}>Initialize new user — free forever</p>

        {error && (
          <div style={{ background: '#ff000008', border: '1px solid #ff000030', borderRadius: 4, padding: '10px 14px', marginBottom: 20, color: '#ff4444', fontSize: 12, fontFamily: 'monospace' }}>
            ✗ {error}
          </div>
        )}

        <Field label="Name" type="text" value={form.name} placeholder="Vedant Singh"
          onChange={v => setForm({ ...form, name: v })} />
        <Field label="Email" type="email" value={form.email} placeholder="user@company.com"
          onChange={v => setForm({ ...form, email: v })} />
        <Field label="Password" type={showPass ? 'text' : 'password'} value={form.password} placeholder="Min 6 characters"
          onChange={v => setForm({ ...form, password: v })} onEnter={submit}
          extra={
            <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 12, fontFamily: 'monospace' }}>
              {showPass ? '[hide]' : '[show]'}
            </button>
          }
        />

        <button onClick={submit} disabled={loading} style={{ width: '100%', padding: '13px', background: loading ? '#0a0a0a' : '#00ff8815', color: loading ? '#333' : '#00ff88', border: `1px solid ${loading ? '#111' : '#00ff8840'}`, borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 20 }}>
          {loading ? '// creating account...' : '→ register()'}
        </button>

        <p style={{ textAlign: 'center', color: '#222', fontSize: 12, margin: 0, fontFamily: 'monospace' }}>
          Have account?{' '}
          <span style={{ color: '#00ff88', cursor: 'pointer' }} onClick={switchToLogin}>[sign_in]</span>
        </p>
      </div>
    </AuthWrap>
  );
};

// ── Settings ──────────────────────────────────────────────────

const Settings = ({ user, onBack, onSave }) => {
  const [form, setForm] = useState({ awsAccessKeyId: '', awsSecretAccessKey: '', awsRegion: 'us-east-1' });
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
    } catch (e) { setMsg('error:' + (e.response?.data?.message || 'Failed')); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#030303', color: '#e0e0e0', fontFamily: 'monospace', padding: '40px 48px' }}>
      <style>{`@keyframes ping { 0%,100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.8); opacity: 0; } }`}</style>
      <button onClick={onBack} style={{ background: 'none', border: '1px solid #111', color: '#333', padding: '7px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 12, marginBottom: 40, fontFamily: 'monospace' }}>
        ← back()
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Tag color="#00ff88">CONFIG</Tag>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>aws_credentials</h1>
      </div>
      <p style={{ color: '#333', marginBottom: 40, fontSize: 13 }}>// Each user connects their own AWS account — data is private and isolated</p>

      {msg === 'success' && <div style={{ background: '#00ff8808', border: '1px solid #00ff8830', borderRadius: 4, padding: '12px 16px', marginBottom: 24, color: '#00ff88', fontSize: 12 }}>✓ AWS credentials saved successfully</div>}
      {msg.startsWith('error:') && <div style={{ background: '#ff000008', border: '1px solid #ff000030', borderRadius: 4, padding: '12px 16px', marginBottom: 24, color: '#ff4444', fontSize: 12 }}>✗ {msg.replace('error:', '')}</div>}

      <div style={{ maxWidth: 520 }}>
        <Field label="AWS_ACCESS_KEY_ID" type="text" value={form.awsAccessKeyId} placeholder="AKIA..."
          onChange={v => setForm({ ...form, awsAccessKeyId: v })} />
        <Field label="AWS_SECRET_ACCESS_KEY" type="password" value={form.awsSecretAccessKey} placeholder="your_secret_key"
          onChange={v => setForm({ ...form, awsSecretAccessKey: v })} />
        <Field label="AWS_REGION" type="text" value={form.awsRegion} placeholder="us-east-1"
          onChange={v => setForm({ ...form, awsRegion: v })} />

        <button onClick={save} disabled={loading} style={{ width: '100%', padding: 13, background: '#00ff8815', color: '#00ff88', border: '1px solid #00ff8840', borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace', marginBottom: 24 }}>
          {loading ? '// saving...' : '→ save_credentials()'}
        </button>

        <div style={{ background: '#080808', border: '1px solid #111', borderRadius: 4, padding: 16, fontSize: 12, color: '#333', lineHeight: 2 }}>
          <p style={{ color: '#444', marginBottom: 8 }}># Required IAM permissions:</p>
          {['AWSBillingReadOnlyAccess', 'AmazonEC2ReadOnlyAccess', 'CloudWatchReadOnlyAccess', 'AmazonS3ReadOnlyAccess'].map(p => (
            <div key={p} style={{ color: '#00ff88' }}>+ {p}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Admin Panel ───────────────────────────────────────────────

const AdminPanel = ({ onBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API}/auth/admin/users`, { headers: authHeaders() })
      .then(r => setUsers(r.data.users || []))
      .catch(e => setError(e.response?.data?.message || 'Access denied'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#030303', color: '#e0e0e0', fontFamily: 'monospace', padding: '40px 48px' }}>
      <button onClick={onBack} style={{ background: 'none', border: '1px solid #111', color: '#333', padding: '7px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 12, marginBottom: 40 }}>← back()</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Tag color="#ffd700">ADMIN</Tag>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>user_registry</h1>
      </div>
      <p style={{ color: '#333', marginBottom: 32, fontSize: 13 }}>// All registered accounts — {users.length} total</p>

      {loading && <p style={{ color: '#333' }}>// loading users...</p>}
      {error && <div style={{ color: '#ff4444', padding: 16, background: '#ff000008', border: '1px solid #ff000030', borderRadius: 4 }}>✗ {error}</div>}

      {!loading && !error && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'total_users', value: users.length, color: '#00ff88' },
              { label: 'aws_connected', value: users.filter(u => u.isAwsConnected).length, color: '#00ccff' },
              { label: 'admin_count', value: users.filter(u => u.role === 'admin').length, color: '#ffd700' },
            ].map(s => (
              <div key={s.label} style={{ background: '#080808', border: '1px solid #111', borderRadius: 6, padding: '16px 20px' }}>
                <p style={{ fontSize: 10, color: '#333', margin: '0 0 8px', letterSpacing: 2 }}>{s.label}</p>
                <p style={{ fontSize: 36, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div style={{ background: '#080808', border: '1px solid #111', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #111', display: 'grid', gridTemplateColumns: '1fr 1.5fr 0.7fr 0.7fr 0.5fr 0.8fr', gap: 16 }}>
              {['name', 'email', 'plan', 'aws', 'role', 'joined'].map(h => (
                <span key={h} style={{ fontSize: 10, color: '#333', letterSpacing: 2, textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>
            {users.map((u, i) => (
              <div key={u._id} style={{ padding: '14px 20px', borderBottom: '1px solid #0a0a0a', display: 'grid', gridTemplateColumns: '1fr 1.5fr 0.7fr 0.7fr 0.5fr 0.8fr', gap: 16, alignItems: 'center', background: i % 2 === 0 ? 'transparent' : '#050505' }}>
                <span style={{ color: '#e0e0e0', fontSize: 13 }}>{u.name}</span>
                <span style={{ color: '#555', fontSize: 12 }}>{u.email}</span>
                <Tag color="#00ccff">{u.plan || 'starter'}</Tag>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Dot color={u.isAwsConnected ? '#00ff88' : '#333'} pulse={u.isAwsConnected} />
                  <span style={{ fontSize: 11, color: u.isAwsConnected ? '#00ff88' : '#333' }}>{u.isAwsConnected ? 'on' : 'off'}</span>
                </div>
                <Tag color={u.role === 'admin' ? '#ffd700' : '#333'}>{u.role || 'user'}</Tag>
                <span style={{ fontSize: 11, color: '#333' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────

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
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

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

  if (showSettings) return <Settings user={user} onBack={() => setShowSettings(false)} onSave={u => { onUserUpdate(u); setShowSettings(false); }} />;
  if (showPricing) return <Pricing user={user} onBack={() => setShowPricing(false)} />;
  if (showAdmin) return <AdminPanel onBack={() => setShowAdmin(false)} />;

  const dailyChart = daily?.dailyData?.slice(-14).map(d => ({ date: d.date.slice(5), cost: parseFloat(d.totalCost) })) || [];
  const pieData = monthly?.services?.filter(s => parseFloat(s.cost) > 0).map(s => ({ name: s.service.replace('Amazon ', '').replace('AWS ', ''), value: parseFloat(s.cost) })) || [];

  const navItems = [
    { id: 'overview', label: 'overview()', icon: '▦' },
    { id: 'costs', label: 'costs()', icon: '◈' },
    { id: 'resources', label: 'ec2_idle()', icon: '◻' },
    { id: 'storage', label: 's3_usage()', icon: '◫' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#030303', fontFamily: 'monospace' }}>
      <style>{`
        @keyframes ping { 0%,100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.8); opacity: 0; } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #080808; } ::-webkit-scrollbar-thumb { background: #1a1a1a; }
      `}</style>

      {/* Sidebar */}
      <div style={{ width: 220, background: '#050505', borderRight: '1px solid #0d0d0d', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #0d0d0d' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 26, height: 26, background: '#00ff8810', border: '1px solid #00ff8825', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>☁</div>
            <span style={{ color: '#00ff88', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>CloudOpt</span>
          </div>
          <p style={{ color: '#222', fontSize: 10, margin: 0, letterSpacing: 2 }}>v2.0 · {time.toLocaleTimeString('en-IN', { hour12: false })}</p>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 10px', flex: 1 }}>
          <p style={{ color: '#1a1a1a', fontSize: 9, letterSpacing: 3, margin: '0 0 8px 4px' }}>// NAVIGATION</p>
          {navItems.map(item => (
            <SideBtn key={item.id} active={tab === item.id} onClick={() => setTab(item.id)}>
              <span style={{ fontSize: 12 }}>{item.icon}</span>
              {item.label}
            </SideBtn>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid #0d0d0d' }}>
          <p style={{ color: '#1a1a1a', fontSize: 9, letterSpacing: 3, margin: '0 0 8px 4px' }}>// SYSTEM</p>
          {user.isAwsConnected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', marginBottom: 4 }}>
              <Dot color="#00ff88" pulse />
              <span style={{ fontSize: 10, color: '#00ff88', letterSpacing: 1 }}>aws:connected</span>
            </div>
          )}
          <SideBtn onClick={() => setShowSettings(true)}>⚙ settings()</SideBtn>
          <SideBtn accent onClick={() => setShowPricing(true)}>⚡ upgrade()</SideBtn>
          {user.role === 'admin' && <SideBtn onClick={() => setShowAdmin(true)}>👑 admin()</SideBtn>}

          <div style={{ margin: '8px 0', height: 1, background: '#0d0d0d' }} />
          <div style={{ padding: '8px 14px', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#00ff8810', border: '1px solid #00ff8825', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#00ff88', flexShrink: 0 }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ color: '#e0e0e0', fontSize: 11, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                <p style={{ color: '#222', fontSize: 9, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
              </div>
            </div>
          </div>
          <SideBtn onClick={onLogout}>↩ logout()</SideBtn>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 220, flex: 1, padding: '28px 32px', minHeight: '100vh', overflowY: 'auto' }}>
        {/* Topbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid #0d0d0d' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Tag color="#00ff88">LIVE</Tag>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: -0.5 }}>
                {tab === 'overview' && '$ dashboard --overview'}
                {tab === 'costs' && '$ costs --analyze'}
                {tab === 'resources' && '$ ec2 --idle-detect'}
                {tab === 'storage' && '$ s3 --usage'}
              </h1>
            </div>
            <p style={{ color: '#222', fontSize: 11, margin: 0, letterSpacing: 1 }}>
              // real-time AWS cost monitoring · user: {user.email}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#080808', border: '1px solid #111', borderRadius: 4, padding: '8px 14px' }}>
            <Dot color="#00ff88" pulse />
            <span style={{ fontSize: 11, color: '#444', letterSpacing: 1 }}>
              {time.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* AWS not connected */}
        {!user.isAwsConnected && (
          <div style={{ background: '#080808', border: '1px solid #111', borderRadius: 8, padding: '48px', textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔌</div>
            <p style={{ color: '#00ff88', fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>$ aws --not-connected</p>
            <p style={{ color: '#333', fontSize: 13, margin: '0 0 28px' }}>// Add your AWS credentials to see real cost data</p>
            <button onClick={() => setShowSettings(true)} style={{ padding: '11px 28px', background: '#00ff8815', color: '#00ff88', border: '1px solid #00ff8840', borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
              → connect_aws()
            </button>
          </div>
        )}

        {user.isAwsConnected && awsError && (
          <div style={{ background: '#ff000008', border: '1px solid #ff000030', borderRadius: 6, padding: '14px 20px', marginBottom: 24, color: '#ff4444', fontSize: 12 }}>
            ✗ {awsError}
          </div>
        )}

        {user.isAwsConnected && loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: '#00ff88', fontSize: 14, fontFamily: 'monospace' }}>
              // fetching aws data<span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
            </p>
          </div>
        )}

        {user.isAwsConnected && !loading && !awsError && (
          <>
            {/* Overview */}
            {tab === 'overview' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                  <StatCard label="monthly_cost" value={`$${monthly?.totalCost || '0.00'}`} sub="// this month" color="#00ff88" icon="💵" />
                  <StatCard label="daily_average" value={`$${daily?.summary?.averageDailyCost || '0.00'}`} sub="// last 30d" color="#00ccff" icon="📈" />
                  <StatCard label="ec2_instances" value={ec2?.summary?.totalInstances || 0} sub={`// ${ec2?.summary?.idleInstances || 0} idle`} color="#ff6b35" icon="🖥" />
                  <StatCard label="s3_buckets" value={s3?.summary?.totalBuckets || 0} sub={`// ${s3?.summary?.totalSizeGB || 0} GB`} color="#ffd700" icon="🪣" />
                </div>

                {/* Savings */}
                <div style={{ background: '#080808', border: '1px solid #00ff8815', borderRadius: 8, padding: '24px 28px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, #00ff88, transparent)' }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <Tag color="#00ff88">SAVINGS</Tag>
                      <span style={{ color: '#333', fontSize: 11 }}>// potential monthly reduction</span>
                    </div>
                    <p style={{ fontSize: 52, fontWeight: 700, color: '#00ff88', margin: '0 0 4px', letterSpacing: -2 }}>{ec2?.summary?.estimatedMonthlySavings || '$0.00'}</p>
                    <p style={{ color: '#333', fontSize: 12, margin: 0 }}>// stop idle EC2 instances to unlock these savings</p>
                  </div>
                  <div style={{ fontSize: 64, opacity: 0.1 }}>💡</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
                  <ChartBox title="daily_cost_trend" tag="14D">
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={dailyChart}>
                        <defs>
                          <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00ff88" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#0d0d0d" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#333', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#333', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<DarkTooltip />} />
                        <Area type="monotone" dataKey="cost" stroke="#00ff88" strokeWidth={1.5} fill="url(#costGrad)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartBox>

                  <ChartBox title="cost_by_service" tag="MTD">
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={45} strokeWidth={0}>
                            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }} formatter={v => [`$${v}`, '']} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 220, color: '#1a1a1a', gap: 8 }}>
                        <span style={{ fontSize: 32 }}>✓</span>
                        <p style={{ fontSize: 12, color: '#222' }}>// free tier — no costs</p>
                      </div>
                    )}
                  </ChartBox>
                </div>
              </>
            )}

            {/* Costs */}
            {tab === 'costs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <ChartBox title="daily_breakdown" tag="14D">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyChart} barSize={16}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#0d0d0d" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#333', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#333', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<DarkTooltip />} />
                      <Bar dataKey="cost" fill="#00ff88" opacity={0.8} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartBox>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                  {[
                    { label: 'peak_day', value: `$${daily?.summary?.highestDay?.cost || '0'}`, sub: daily?.summary?.highestDay?.date },
                    { label: 'lowest_day', value: `$${daily?.summary?.lowestDay?.cost || '0'}`, sub: daily?.summary?.lowestDay?.date },
                    { label: 'daily_avg', value: `$${daily?.summary?.averageDailyCost || '0'}`, sub: '// 30 day mean' },
                    { label: 'month_total', value: `$${monthly?.totalCost || '0'}`, sub: '// current month' },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#080808', border: '1px solid #111', borderRadius: 6, padding: '16px 20px' }}>
                      <p style={{ fontSize: 10, color: '#333', margin: '0 0 10px', letterSpacing: 2 }}>{item.label}</p>
                      <p style={{ fontSize: 22, fontWeight: 700, color: '#00ff88', margin: '0 0 4px' }}>{item.value}</p>
                      <p style={{ fontSize: 11, color: '#222', margin: 0 }}>{item.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            {tab === 'resources' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#080808', border: '1px solid #111', borderLeft: '3px solid #ff6b35', borderRadius: 6, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 20 }}>🖥</span>
                  <div>
                    <p style={{ fontWeight: 600, color: '#e0e0e0', margin: '0 0 4px', fontSize: 13 }}>ec2_idle_detector()</p>
                    <p style={{ color: '#333', fontSize: 12, margin: 0, fontFamily: 'monospace' }}>
                      // total: {ec2?.summary?.totalInstances || 0} · idle: {ec2?.summary?.idleInstances || 0} · savings: {ec2?.summary?.estimatedMonthlySavings || '$0'}
                    </p>
                  </div>
                </div>

                {ec2?.idleInstances?.length > 0 ? (
                  <div style={{ background: '#080808', border: '1px solid #111', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 20px', borderBottom: '1px solid #111', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Tag color="#ff6b35">WARNING</Tag>
                      <span style={{ fontSize: 12, color: '#555' }}>idle instances detected — action required</span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #0d0d0d' }}>
                          {['instance_id', 'type', 'cpu_%', 'est_cost/mo', 'action'].map(h => (
                            <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, color: '#333', letterSpacing: 2, fontWeight: 400 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ec2.idleInstances.map((inst, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #080808' }}>
                            <td style={{ padding: '12px 16px', fontSize: 12, color: '#888', fontFamily: 'monospace' }}>{inst.instanceId}</td>
                            <td style={{ padding: '12px 16px', fontSize: 12, color: '#e0e0e0' }}>{inst.instanceType}</td>
                            <td style={{ padding: '12px 16px' }}><Tag color="#ff4444">{inst.avgCPUPercent}%</Tag></td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#ff6b35', fontWeight: 700 }}>${inst.estimatedMonthlyCost}</td>
                            <td style={{ padding: '12px 16px' }}><Tag color="#ffd700">stop → save</Tag></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ background: '#080808', border: '1px solid #111', borderRadius: 6, padding: '60px', textAlign: 'center' }}>
                    <p style={{ color: '#00ff88', fontSize: 14, margin: '0 0 8px' }}>✓ all_instances_active()</p>
                    <p style={{ color: '#222', fontSize: 12, margin: 0 }}>// no idle instances detected</p>
                  </div>
                )}
              </div>
            )}

            {/* Storage */}
            {tab === 'storage' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#080808', border: '1px solid #111', borderLeft: '3px solid #ffd700', borderRadius: 6, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 20 }}>🪣</span>
                  <div>
                    <p style={{ fontWeight: 600, color: '#e0e0e0', margin: '0 0 4px', fontSize: 13 }}>s3_storage_scan()</p>
                    <p style={{ color: '#333', fontSize: 12, margin: 0, fontFamily: 'monospace' }}>
                      // buckets: {s3?.summary?.totalBuckets || 0} · size: {s3?.summary?.totalSizeGB || 0} GB · cost: {s3?.summary?.estimatedMonthlyCost || '$0'}
                    </p>
                  </div>
                </div>

                <div style={{ background: '#080808', border: '1px solid #111', borderRadius: 6, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #0d0d0d' }}>
                        {['bucket_name', 'size_gb', 'objects', 'cost/mo', 'recommendation'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, color: '#333', letterSpacing: 2, fontWeight: 400 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(s3?.buckets || []).map((b, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #080808', background: i % 2 === 0 ? 'transparent' : '#050505' }}>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#888', fontFamily: 'monospace' }}>🪣 {b.bucketName}</td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#e0e0e0' }}>{b.sizeGB}</td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#e0e0e0' }}>{b.numberOfObjects}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#ffd700', fontWeight: 700 }}>{b.estimatedMonthlyCost}</td>
                          <td style={{ padding: '12px 16px', fontSize: 11, color: '#555' }}>{b.recommendation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ── Root ──────────────────────────────────────────────────────

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