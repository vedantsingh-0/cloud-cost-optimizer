import React, { useState } from 'react';
import axios from 'axios';

const API = 'https://cloud-cost-optimizer-05pk.onrender.com/api';
const ACCENT = '#6478ff';
const ACCENT2 = '#8860ff';
const headingFont = "'Syne', 'Inter', sans-serif";
const fontStack = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

export default function Pricing({ user, onBack }) {
  const [loading, setLoading] = useState('');
  const [success, setSuccess] = useState('');

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (plan) => {
    if (plan === 'starter') {
      setSuccess('You are already on the free Starter plan!');
      return;
    }

    setLoading(plan);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        alert('Failed to load payment gateway. Check your internet connection.');
        return;
      }

      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${API}/payments/create-order`,
        { plan },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'CloudOptimizer',
        description: data.planName,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            await axios.post(
              `${API}/payments/verify`,
              response,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess(`🎉 Payment successful! Welcome to ${data.planName}!`);
          } catch (err) {
            alert('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: ACCENT },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      alert('Payment failed: ' + error.message);
    }
    setLoading('');
  };

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .pricing-card { transition: all 0.3s ease; }
        .pricing-card:hover { transform: translateY(-6px); }
        .pricing-btn { transition: all 0.2s ease; }
        .pricing-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.08); }
      `}</style>

      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>← Back to Dashboard</button>
        <h1 style={s.title}>Upgrade Your Plan</h1>
        <p style={s.sub}>Choose the plan that fits your needs</p>
      </div>

      {success && (
        <div style={s.successBox}>{success}</div>
      )}

      <div style={s.grid}>
        {[
          {
            id: 'starter',
            name: 'Starter',
            price: 'Free',
            sub: 'forever',
            color: ACCENT,
            features: ['1 AWS account', 'Cost dashboard', 'Basic alerts', 'Email support'],
            cta: 'Current Plan',
            disabled: true,
          },
          {
            id: 'pro',
            name: 'Pro',
            price: '₹999',
            sub: '/month',
            color: ACCENT2,
            features: ['5 AWS accounts', 'Advanced analytics', 'Smart alerts', 'AI recommendations', 'Priority support'],
            cta: 'Upgrade to Pro',
            disabled: false,
            popular: true,
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            price: '₹4,999',
            sub: '/month',
            color: '#22d3ee',
            features: ['Unlimited accounts', 'Custom reports', 'Slack alerts', 'Dedicated support', 'SLA guarantee'],
            cta: 'Upgrade to Enterprise',
            disabled: false,
          },
        ].map(plan => (
          <div key={plan.id} className="pricing-card" style={{
            ...s.card,
            border: plan.popular ? `1px solid rgba(100,120,255,0.4)` : '1px solid rgba(255,255,255,0.08)',
            background: plan.popular ? 'linear-gradient(135deg, rgba(100,120,255,0.12), rgba(136,96,255,0.08))' : 'rgba(255,255,255,0.03)',
            boxShadow: plan.popular ? '0 0 60px rgba(100,120,255,0.15)' : '0 4px 24px rgba(0,0,0,0.3)',
            transform: plan.popular ? 'scale(1.03)' : 'none',
          }}>
            {plan.popular && (
              <div style={{ ...s.badge, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})` }}>Most Popular</div>
            )}
            <h2 style={{ ...s.planName, color: plan.color }}>{plan.name}</h2>
            <div style={s.priceRow}>
              <span style={s.price}>{plan.price}</span>
              <span style={s.priceSub}>{plan.sub}</span>
            </div>
            <div style={s.divider} />
            {plan.features.map(f => (
              <p key={f} style={s.feature}><span style={{ color: plan.color }}>✓</span> {f}</p>
            ))}
            <button
              className="pricing-btn"
              style={{
                ...s.btn,
                background: plan.disabled ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, ${plan.color}, ${plan.id === 'pro' ? '#a78bfa' : plan.id === 'enterprise' ? '#67e8f9' : ACCENT2})`,
                color: plan.disabled ? 'rgba(255,255,255,0.3)' : '#fff',
                cursor: plan.disabled ? 'default' : 'pointer',
                boxShadow: plan.disabled ? 'none' : `0 8px 24px ${plan.color}40`,
              }}
              onClick={() => !plan.disabled && handlePayment(plan.id)}
              disabled={plan.disabled || loading === plan.id}
            >
              {loading === plan.id ? 'Processing...' : plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div style={s.footer}>
        <p style={s.footerText}>
          🔒 Secure payments powered by Razorpay &nbsp;|&nbsp;
          Cancel anytime &nbsp;|&nbsp;
          7-day money back guarantee
        </p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#080810', fontFamily: fontStack, padding: '40px 20px' },
  header: { textAlign: 'center', marginBottom: 48 },
  backBtn: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, marginBottom: 24 },
  title: { fontSize: 36, fontWeight: 800, color: '#fff', margin: '0 0 8px', fontFamily: headingFont, letterSpacing: -1 },
  sub: { fontSize: 16, color: 'rgba(255,255,255,0.45)', margin: 0 },
  successBox: { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', padding: 16, borderRadius: 12, textAlign: 'center', maxWidth: 600, margin: '0 auto 32px', fontSize: 15 },
  grid: { display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', maxWidth: 1000, margin: '0 auto 48px' },
  card: { borderRadius: 20, padding: '36px 28px', width: 280, position: 'relative' },
  badge: { position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', color: 'white', padding: '4px 16px', borderRadius: 100, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' },
  planName: { fontSize: 18, fontWeight: 700, margin: '0 0 16px', fontFamily: headingFont },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 },
  price: { fontSize: 38, fontWeight: 800, color: '#fff', fontFamily: headingFont, letterSpacing: -1 },
  priceSub: { fontSize: 14, color: 'rgba(255,255,255,0.4)' },
  divider: { height: 1, background: 'rgba(255,255,255,0.08)', margin: '16px 0' },
  feature: { fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 },
  btn: { width: '100%', padding: 14, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, marginTop: 16 },
  footer: { textAlign: 'center' },
  footerText: { color: 'rgba(255,255,255,0.35)', fontSize: 13 },
};