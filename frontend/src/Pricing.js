import React, { useState } from 'react';
import axios from 'axios';

const API = 'https://cloud-cost-optimizer-05pk.onrender.com/api';

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
        theme: { color: '#6366f1' },
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
            color: '#6366f1',
            features: ['1 AWS account', 'Cost dashboard', 'Basic alerts', 'Email support'],
            cta: 'Current Plan',
            disabled: true,
          },
          {
            id: 'pro',
            name: 'Pro',
            price: '₹999',
            sub: '/month',
            color: '#8b5cf6',
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
            color: '#06b6d4',
            features: ['Unlimited accounts', 'Custom reports', 'Slack alerts', 'Dedicated support', 'SLA guarantee'],
            cta: 'Upgrade to Enterprise',
            disabled: false,
          },
        ].map(plan => (
          <div key={plan.id} style={{
            ...s.card,
            border: plan.popular ? `2px solid ${plan.color}` : '1px solid #e2e8f0',
            transform: plan.popular ? 'scale(1.03)' : 'none',
          }}>
            {plan.popular && (
              <div style={{...s.badge, background: plan.color}}>Most Popular</div>
            )}
            <h2 style={{...s.planName, color: plan.color}}>{plan.name}</h2>
            <div style={s.priceRow}>
              <span style={s.price}>{plan.price}</span>
              <span style={s.priceSub}>{plan.sub}</span>
            </div>
            <div style={s.divider}/>
            {plan.features.map(f => (
              <p key={f} style={s.feature}>✓ {f}</p>
            ))}
            <button
              style={{
                ...s.btn,
                background: plan.disabled ? '#e2e8f0' : plan.color,
                color: plan.disabled ? '#94a3b8' : 'white',
                cursor: plan.disabled ? 'default' : 'pointer',
              }}
              onClick={() => !plan.disabled && handlePayment(plan.id)}
              disabled={plan.disabled || loading === plan.id}
            >
              {loading === plan.id ? '⏳ Processing...' : plan.cta}
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
  page: { minHeight: '100vh', background: '#f5f7fa', fontFamily: 'Arial, sans-serif', padding: '40px 20px' },
  header: { textAlign: 'center', marginBottom: 48 },
  backBtn: { background: 'none', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', color: '#64748b', fontSize: 14, marginBottom: 24 },
  title: { fontSize: 36, fontWeight: 800, color: '#1e1b4b', margin: '0 0 8px' },
  sub: { fontSize: 16, color: '#64748b', margin: 0 },
  successBox: { background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: 16, borderRadius: 12, textAlign: 'center', maxWidth: 600, margin: '0 auto 32px', fontSize: 16 },
  grid: { display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', maxWidth: 1000, margin: '0 auto 48px' },
  card: { background: 'white', borderRadius: 20, padding: '36px 28px', width: 280, position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  badge: { position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', color: 'white', padding: '4px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' },
  planName: { fontSize: 20, fontWeight: 700, margin: '0 0 16px' },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 },
  price: { fontSize: 40, fontWeight: 800, color: '#1e1b4b' },
  priceSub: { fontSize: 14, color: '#94a3b8' },
  divider: { height: 1, background: '#f1f5f9', margin: '16px 0' },
  feature: { fontSize: 14, color: '#64748b', margin: '0 0 8px' },
  btn: { width: '100%', padding: 14, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, marginTop: 16 },
  footer: { textAlign: 'center' },
  footerText: { color: '#94a3b8', fontSize: 13 },
};
