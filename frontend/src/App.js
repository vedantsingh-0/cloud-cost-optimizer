import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LandingPage from './LandingPage';
import Pricing from './Pricing';
import './App.css';

const API = 'https://cloud-cost-optimizer-05pk.onrender.com/api';
const COLORS = ['#6478ff', '#22d3ee', '#f59e0b', '#22c55e', '#f43f5e', '#a78bfa'];
const ACCENT = '#6478ff';
const ACCENT2 = '#8860ff';

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// ── Shared style tokens ──────────────────────────────────────

const fontStack = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const headingFont = "'Syne', 'Inter', sans-serif";

// ── Tiny components ──────────────────────────────────────────

const Tag = ({ children, color = ACCENT }) => (
  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: color + '18', color, border: `1px solid ${color}33`, fontFamily: fontStack, fontWeight: 600, letterSpacing: 0.3 }}>
    {children}
  </span>
);

const Dot = ({ color = '#22c55e', pulse }) => (
  <span style={{ position: 'relative', display: 'inline-block', width: 8, height: 8 }}>
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'block', boxShadow: `0 0 8px ${color}` }} />
    {pulse && <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, animation: 'ping 1.5s ease-in-out infinite', opacity: 0.4 }} />}
  </span>
);

const Field = ({ label, type, value, placeholder, onChange, onEnter, extra }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 8, fontFamily: fontStack, fontWeight: 600, letterSpacing: 0.3 }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <input type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && onEnter && onEnter()}
        style={{ width: '100%', padding: '13px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 14, fontFamily: fontStack, boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
        onFocus={e => e.target.style.borderColor = ACCENT}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
      {extra}
    </div>
  </div>
);

const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: fontStack, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: 18, opacity: 0.7 }}>{icon}</span>
    </div>
    <p style={{ fontSize: 30, fontWeight: 800, color: '#fff', margin: '0 0 6px', fontFamily: headingFont, letterSpacing: -1 }}>{value}</p>
    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0, fontFamily: fontStack }}>{sub}</p>
  </div>
);

const SideBtn = ({ children, onClick, active, accent }) => (
  <button onClick={onClick} style={{
    width: '100%', padding: '10px 14px', background: active ? 'rgba(100,120,255,0.16)' : accent ? 'rgba(100,120,255,0.08)' : 'transparent',
    color: active ? '#9fb0ff' : accent ? '#9fb0ff' : 'rgba(255,255,255,0.55)',
    border: active ? '1px solid rgba(100,120,255,0.35)' : '1px solid transparent',
    borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, textAlign: 'left',
    marginBottom: 3, fontFamily: fontStack, transition: 'all 0.15s', letterSpacing: 0.2,
    display: 'flex', alignItems: 'center', gap: 10,
  }}>
    {children}
  </button>
);

const ChartBox = ({ title, tag, children }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 22px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.65)', margin: 0, fontFamily: fontStack, letterSpacing: 0.3 }}>{title}</p>
      {tag && <Tag>{tag}</Tag>}
    </div>
    {children}
  </div>
);

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontFamily: fontStack }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '0 0 4px' }}>{label}</p>
      <p style={{ color: ACCENT, fontSize: 14, fontWeight: 700, margin: 0 }}>${payload[0]?.value}</p>
    </div>
  );
};

// ── Auth pages ────────────────────────────────────────────────

const AuthWrap = ({ children }) => (
  <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden', fontFamily: fontStack }}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      @keyframes ping { 0%,100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.8); opacity: 0; } }
      @keyframes pulse-glow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      .auth-in { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
    `}</style>
    {/* Glow orbs to match landing page */}
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <div style={{ position: 'absolute', width: 500, height: 500, background: 'radial-gradient(circle, rgba(80,100,255,0.14) 0%, transparent 70%)', top: -120, left: -120, animation: 'pulse-glow 4s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 450, height: 450, background: 'radial-gradient(circle, rgba(120,60,255,0.1) 0%, transparent 70%)', bottom: -120, right: -100, animation: 'pulse-glow 6s ease-in-out infinite 2s' }} />
    </div>
    <div className="auth-in" style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
      {children}
    </div>
  </div>
);

const AuthLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
    <svg width="32" height="32" viewBox="0 0 36 36">
      <circle cx="12" cy="20" r="10" fill={ACCENT} />
      <circle cx="20" cy="14" r="8" fill={ACCENT} />
      <circle cx="28" cy="18" r="7" fill={ACCENT} />
      <rect x="2" y="20" width="33" height="8" rx="3" fill={ACCENT} />
      <polygon points="18,12 22,12 20,18" fill="white" />
      <rect x="18.5" y="8" width="3" height="6" rx="1" fill="white" />
    </svg>
    <div>
      <p style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: 0, fontFamily: headingFont }}>CloudOptimizer</p>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>v2.0 · production</p>
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
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '40px 36px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <AuthLogo />

        <p style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: '0 0 6px', fontFamily: headingFont, letterSpacing: -0.5 }}>Welcome back</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 28px' }}>Sign in to your dashboard</p>

        {error && (
          <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, color: '#fb7185', fontSize: 13 }}>
            {error}
          </div>
        )}

        <Field label="Email" type="email" value={form.email} placeholder="user@company.com"
          onChange={v => setForm({ ...form, email: v })} onEnter={submit} />
        <Field label="Password" type={showPass ? 'text' : 'password'} value={form.password} placeholder="••••••••••"
          onChange={v => setForm({ ...form, password: v })} onEnter={submit}
          extra={
            <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: 13, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 12 }}>
              {showPass ? 'Hide' : 'Show'}
            </button>
          }
        />

        <button onClick={submit} disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', background: loading ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, color: loading ? 'rgba(255,255,255,0.3)' : '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer', marginBottom: 20, boxShadow: loading ? 'none' : '0 8px 24px rgba(100,120,255,0.35)' }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>
          No account?{' '}
          <span style={{ color: '#9fb0ff', cursor: 'pointer', fontWeight: 600 }} onClick={switchToRegister}>Register</span>
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
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '40px 36px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <AuthLogo />

        <p style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: '0 0 6px', fontFamily: headingFont, letterSpacing: -0.5 }}>Create your account</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 28px' }}>Free forever — no credit card needed</p>

        {error && (
          <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, color: '#fb7185', fontSize: 13 }}>
            {error}
          </div>
        )}

        <Field label="Name" type="text" value={form.name} placeholder="Vedant Singh"
          onChange={v => setForm({ ...form, name: v })} />
        <Field label="Email" type="email" value={form.email} placeholder="user@company.com"
          onChange={v => setForm({ ...form, email: v })} />
        <Field label="Password" type={showPass ? 'text' : 'password'} value={form.password} placeholder="Min 6 characters"
          onChange={v => setForm({ ...form, password: v })} onEnter={submit}
          extra={
            <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: 13, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 12 }}>
              {showPass ? 'Hide' : 'Show'}
            </button>
          }
        />

        <button onClick={submit} disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', background: loading ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, color: loading ? 'rgba(255,255,255,0.3)' : '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer', marginBottom: 20, boxShadow: loading ? 'none' : '0 8px 24px rgba(100,120,255,0.35)' }}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>
          Have an account?{' '}
          <span style={{ color: '#9fb0ff', cursor: 'pointer', fontWeight: 600 }} onClick={switchToLogin}>Sign in</span>
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
    <div style={{ minHeight: '100vh', background: '#080810', color: '#e8e8f0', fontFamily: fontStack, padding: '40px 48px' }}>
      <style>{`@keyframes ping { 0%,100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.8); opacity: 0; } }`}</style>
      <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, marginBottom: 40, fontFamily: fontStack, fontWeight: 600 }}>
        ← Back to dashboard
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Tag>SETTINGS</Tag>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0, fontFamily: headingFont }}>AWS Credentials</h1>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 40, fontSize: 14 }}>Each user connects their own AWS account — data is private and isolated.</p>

      {msg === 'success' && <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, color: '#4ade80', fontSize: 13 }}>✓ AWS credentials saved successfully</div>}
      {msg.startsWith('error:') && <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, color: '#fb7185', fontSize: 13 }}>{msg.replace('error:', '')}</div>}

      <div style={{ maxWidth: 520 }}>
        <Field label="AWS Access Key ID" type="text" value={form.awsAccessKeyId} placeholder="AKIA..."
          onChange={v => setForm({ ...form, awsAccessKeyId: v })} />
        <Field label="AWS Secret Access Key" type="password" value={form.awsSecretAccessKey} placeholder="Your secret key"
          onChange={v => setForm({ ...form, awsSecretAccessKey: v })} />
        <Field label="AWS Region" type="text" value={form.awsRegion} placeholder="us-east-1"
          onChange={v => setForm({ ...form, awsRegion: v })} />

        <button onClick={save} disabled={loading} className="btn-primary" style={{ width: '100%', padding: 14, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 24, boxShadow: '0 8px 24px rgba(100,120,255,0.35)' }}>
          {loading ? 'Saving...' : 'Save credentials'}
        </button>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 18, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 2 }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 8, fontWeight: 600 }}>Required IAM permissions:</p>
          {['AWSBillingReadOnlyAccess', 'AmazonEC2ReadOnlyAccess', 'CloudWatchReadOnlyAccess', 'AmazonS3ReadOnlyAccess'].map(p => (
            <div key={p} style={{ color: '#9fb0ff' }}>• {p}</div>
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
    <div style={{ minHeight: '100vh', background: '#080810', color: '#e8e8f0', fontFamily: fontStack, padding: '40px 48px' }}>
      <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, marginBottom: 40, fontWeight: 600 }}>← Back to dashboard</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Tag color="#f59e0b">ADMIN</Tag>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0, fontFamily: headingFont }}>User Registry</h1>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 32, fontSize: 14 }}>All registered accounts — {users.length} total</p>

      {loading && <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading users...</p>}
      {error && <div style={{ color: '#fb7185', padding: 16, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 10 }}>{error}</div>}

      {!loading && !error && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 32 }}>
            {[
              { label: 'Total Users', value: users.length, color: ACCENT },
              { label: 'AWS Connected', value: users.filter(u => u.isAwsConnected).length, color: '#22d3ee' },
              { label: 'Admin Count', value: users.filter(u => u.role === 'admin').length, color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 22px' }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 8px', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</p>
                <p style={{ fontSize: 36, fontWeight: 800, color: s.color, margin: 0, fontFamily: headingFont }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr 1.5fr 0.7fr 0.7fr 0.5fr 0.8fr', gap: 16 }}>
              {['Name', 'Email', 'Plan', 'AWS', 'Role', 'Joined'].map(h => (
                <span key={h} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>{h}</span>
              ))}
            </div>
            {users.map((u, i) => (
              <div key={u._id} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'grid', gridTemplateColumns: '1fr 1.5fr 0.7fr 0.7fr 0.5fr 0.8fr', gap: 16, alignItems: 'center', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                <span style={{ color: '#e8e8f0', fontSize: 13, fontWeight: 600 }}>{u.name}</span>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{u.email}</span>
                <Tag color="#22d3ee">{u.plan || 'starter'}</Tag>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Dot color={u.isAwsConnected ? '#22c55e' : '#444'} pulse={u.isAwsConnected} />
                  <span style={{ fontSize: 11, color: u.isAwsConnected ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>{u.isAwsConnected ? 'On' : 'Off'}</span>
                </div>
                <Tag color={u.role === 'admin' ? '#f59e0b' : '#666'}>{u.role || 'user'}</Tag>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}</span>
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
    { id: 'overview', label: 'Overview', icon: '▦' },
    { id: 'costs', label: 'Costs', icon: '◈' },
    { id: 'resources', label: 'EC2 Idle', icon: '◻' },
    { id: 'storage', label: 'S3 Usage', icon: '◫' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080810', fontFamily: fontStack }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes ping { 0%,100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.8); opacity: 0; } }
        .btn-primary { transition: all 0.2s ease; }
        .btn-primary:hover { transform: translateY(-1px); filter: brightness(1.08); }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0d0d18; } ::-webkit-scrollbar-thumb { background: #23233a; border-radius: 4px; }
      `}</style>

      {/* Sidebar */}
      <div style={{ width: 224, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <svg width="24" height="24" viewBox="0 0 36 36">
              <circle cx="12" cy="20" r="10" fill={ACCENT} />
              <circle cx="20" cy="14" r="8" fill={ACCENT} />
              <circle cx="28" cy="18" r="7" fill={ACCENT} />
              <rect x="2" y="20" width="33" height="8" rx="3" fill={ACCENT} />
            </svg>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 800, letterSpacing: 0.2, fontFamily: headingFont }}>CloudOpt</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, margin: 0 }}>{time.toLocaleTimeString('en-IN', { hour12: false })}</p>
        </div>

        {/* Nav */}
        <nav style={{ padding: '14px 10px', flex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, letterSpacing: 1.5, margin: '0 0 8px 4px', textTransform: 'uppercase', fontWeight: 700 }}>Navigation</p>
          {navItems.map(item => (
            <SideBtn key={item.id} active={tab === item.id} onClick={() => setTab(item.id)}>
              <span style={{ fontSize: 13 }}>{item.icon}</span>
              {item.label}
            </SideBtn>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {user.isAwsConnected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', marginBottom: 4 }}>
              <Dot color="#22c55e" pulse />
              <span style={{ fontSize: 11, color: '#4ade80', letterSpacing: 0.3, fontWeight: 600 }}>AWS connected</span>
            </div>
          )}
          <SideBtn onClick={() => setShowSettings(true)}>⚙ Settings</SideBtn>
          <SideBtn accent onClick={() => setShowPricing(true)}>⚡ Upgrade</SideBtn>
          {user.role === 'admin' && <SideBtn onClick={() => setShowAdmin(true)}>👑 Admin</SideBtn>}

          <div style={{ margin: '8px 0', height: 1, background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ padding: '8px 14px', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(100,120,255,0.15)', border: '1px solid rgba(100,120,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#9fb0ff', flexShrink: 0, fontWeight: 700 }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ color: '#e8e8f0', fontSize: 12, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
              </div>
            </div>
          </div>
          <SideBtn onClick={onLogout}>↩ Logout</SideBtn>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 224, flex: 1, padding: '28px 32px', minHeight: '100vh', overflowY: 'auto' }}>
        {/* Topbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Tag color="#22c55e">LIVE</Tag>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: -0.3, fontFamily: headingFont }}>
                {tab === 'overview' && 'Dashboard Overview'}
                {tab === 'costs' && 'Cost Analysis'}
                {tab === 'resources' && 'EC2 Idle Detection'}
                {tab === 'storage' && 'S3 Storage Usage'}
              </h1>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>
              Real-time AWS cost monitoring · {user.email}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 14px' }}>
            <Dot color={ACCENT} pulse />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              {time.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* AWS not connected */}
        {!user.isAwsConnected && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '48px', textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🔌</div>
            <p style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 8px', fontFamily: headingFont }}>AWS not connected</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '0 0 28px' }}>Add your AWS credentials to see real cost data</p>
            <button onClick={() => setShowSettings(true)} className="btn-primary" style={{ padding: '12px 28px', background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(100,120,255,0.35)' }}>
              Connect AWS
            </button>
          </div>
        )}

        {user.isAwsConnected && awsError && (
          <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 10, padding: '14px 20px', marginBottom: 24, color: '#fb7185', fontSize: 13 }}>
            {awsError}
          </div>
        )}

        {user.isAwsConnected && loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Fetching AWS data...</p>
          </div>
        )}

        {user.isAwsConnected && !loading && !awsError && (
          <>
            {/* Overview */}
            {tab === 'overview' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
                  <StatCard label="Monthly Cost" value={`$${monthly?.totalCost || '0.00'}`} sub="This month" color={ACCENT} icon="💵" />
                  <StatCard label="Daily Average" value={`$${daily?.summary?.averageDailyCost || '0.00'}`} sub="Last 30 days" color="#22d3ee" icon="📈" />
                  <StatCard label="EC2 Instances" value={ec2?.summary?.totalInstances || 0} sub={`${ec2?.summary?.idleInstances || 0} idle`} color="#f59e0b" icon="🖥" />
                  <StatCard label="S3 Buckets" value={s3?.summary?.totalBuckets || 0} sub={`${s3?.summary?.totalSizeGB || 0} GB`} color="#22c55e" icon="🪣" />
                </div>

                {/* Savings */}
                <div style={{ background: 'linear-gradient(135deg, rgba(100,120,255,0.1), rgba(136,96,255,0.06))', border: '1px solid rgba(100,120,255,0.25)', borderRadius: 16, padding: '24px 28px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <Tag>SAVINGS</Tag>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Potential monthly reduction</span>
                    </div>
                    <p style={{ fontSize: 48, fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: -1.5, fontFamily: headingFont }}>{ec2?.summary?.estimatedMonthlySavings || '$0.00'}</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>Stop idle EC2 instances to unlock these savings</p>
                  </div>
                  <div style={{ fontSize: 60, opacity: 0.5 }}>💡</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
                  <ChartBox title="Daily Cost Trend" tag="14D">
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={dailyChart}>
                        <defs>
                          <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={ACCENT} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<DarkTooltip />} />
                        <Area type="monotone" dataKey="cost" stroke={ACCENT} strokeWidth={2} fill="url(#costGrad)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartBox>

                  <ChartBox title="Cost by Service" tag="MTD">
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={45} strokeWidth={0}>
                            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} formatter={v => [`$${v}`, '']} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 220, color: 'rgba(255,255,255,0.2)', gap: 8 }}>
                        <span style={{ fontSize: 32 }}>✓</span>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Free tier — no costs</p>
                      </div>
                    )}
                  </ChartBox>
                </div>
              </>
            )}

            {/* Costs */}
            {tab === 'costs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <ChartBox title="Daily Breakdown" tag="14D">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyChart} barSize={16}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<DarkTooltip />} />
                      <Bar dataKey="cost" fill={ACCENT} opacity={0.9} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartBox>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                  {[
                    { label: 'Peak Day', value: `$${daily?.summary?.highestDay?.cost || '0'}`, sub: daily?.summary?.highestDay?.date },
                    { label: 'Lowest Day', value: `$${daily?.summary?.lowestDay?.cost || '0'}`, sub: daily?.summary?.lowestDay?.date },
                    { label: 'Daily Avg', value: `$${daily?.summary?.averageDailyCost || '0'}`, sub: '30 day mean' },
                    { label: 'Month Total', value: `$${monthly?.totalCost || '0'}`, sub: 'Current month' },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px' }}>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 10px', letterSpacing: 0.5, fontWeight: 600 }}>{item.label}</p>
                      <p style={{ fontSize: 22, fontWeight: 800, color: ACCENT, margin: '0 0 4px', fontFamily: headingFont }}>{item.value}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{item.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            {tab === 'resources' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: '3px solid #f59e0b', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 20 }}>🖥</span>
                  <div>
                    <p style={{ fontWeight: 700, color: '#e8e8f0', margin: '0 0 4px', fontSize: 13 }}>EC2 Idle Detector</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>
                      Total: {ec2?.summary?.totalInstances || 0} · Idle: {ec2?.summary?.idleInstances || 0} · Savings: {ec2?.summary?.estimatedMonthlySavings || '$0'}
                    </p>
                  </div>
                </div>

                {ec2?.idleInstances?.length > 0 ? (
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Tag color="#f59e0b">WARNING</Tag>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Idle instances detected — action required</span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          {['Instance ID', 'Type', 'CPU %', 'Est. Cost/mo', 'Action'].map(h => (
                            <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, fontWeight: 600 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ec2.idleInstances.map((inst, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{inst.instanceId}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#e8e8f0' }}>{inst.instanceType}</td>
                            <td style={{ padding: '12px 16px' }}><Tag color="#f43f5e">{inst.avgCPUPercent}%</Tag></td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#fbbf24', fontWeight: 700 }}>${inst.estimatedMonthlyCost}</td>
                            <td style={{ padding: '12px 16px' }}><Tag color="#f59e0b">Stop → Save</Tag></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '60px', textAlign: 'center' }}>
                    <p style={{ color: '#4ade80', fontSize: 15, margin: '0 0 8px', fontWeight: 600 }}>✓ All instances active</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>No idle instances detected</p>
                  </div>
                )}
              </div>
            )}

            {/* Storage */}
            {tab === 'storage' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: '3px solid #fbbf24', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 20 }}>🪣</span>
                  <div>
                    <p style={{ fontWeight: 700, color: '#e8e8f0', margin: '0 0 4px', fontSize: 13 }}>S3 Storage Scan</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>
                      Buckets: {s3?.summary?.totalBuckets || 0} · Size: {s3?.summary?.totalSizeGB || 0} GB · Cost: {s3?.summary?.estimatedMonthlyCost || '$0'}
                    </p>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['Bucket Name', 'Size (GB)', 'Objects', 'Cost/mo', 'Recommendation'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(s3?.buckets || []).map((b, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>🪣 {b.bucketName}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#e8e8f0' }}>{b.sizeGB}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#e8e8f0' }}>{b.numberOfObjects}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#fbbf24', fontWeight: 700 }}>{b.estimatedMonthlyCost}</td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{b.recommendation}</td>
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