import React, { useState } from 'react';

export default function LandingPage({ onGetStarted }) {
  const [email, setEmail] = useState('');

  return (
    <div style={s.page}>

      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.navLogo}>
          <svg width="32" height="32" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="20" r="10" fill="#6366f1"/>
            <circle cx="20" cy="14" r="8" fill="#6366f1"/>
            <circle cx="28" cy="18" r="7" fill="#6366f1"/>
            <rect x="2" y="20" width="33" height="8" rx="3" fill="#6366f1"/>
            <polygon points="18,12 22,12 20,18" fill="white"/>
            <rect x="18.5" y="8" width="3" height="6" rx="1" fill="white"/>
          </svg>
          <span style={s.navBrand}>CloudOptimizer</span>
        </div>
        <div style={s.navLinks}>
          <a href="#features" style={s.navLink}>Features</a>
          <a href="#pricing" style={s.navLink}>Pricing</a>
          <a href="#how" style={s.navLink}>How it works</a>
          <button style={s.navBtn} onClick={onGetStarted}>Sign in</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={s.hero}>
        <div style={s.heroBadge}>🚀 Trusted by 100+ startups</div>
        <h1 style={s.heroTitle}>
          Stop Wasting Money<br/>
          <span style={s.heroGradient}>on AWS Bills</span>
        </h1>
        <p style={s.heroSub}>
          CloudOptimizer automatically detects idle resources, tracks spending,
          and saves startups up to 40% on their AWS bills — in real time.
        </p>
        <div style={s.heroActions}>
          <button style={s.btnPrimary} onClick={onGetStarted}>
            Start saving for free →
          </button>
          <button style={s.btnSecondary}>
            Watch demo ▶
          </button>
        </div>
        <p style={s.heroNote}>✓ Free forever &nbsp;&nbsp; ✓ No credit card &nbsp;&nbsp; ✓ 2 min setup</p>

        {/* Dashboard Preview */}
        <div style={s.dashPreview}>
          <div style={s.previewBar}>
            <div style={s.previewDot1}/>
            <div style={s.previewDot2}/>
            <div style={s.previewDot3}/>
            <span style={s.previewUrl}>app.cloudoptimizer.in</span>
          </div>
          <div style={s.previewBody}>
            <div style={s.previewSidebar}>
              <div style={s.previewLogo}>☁️ CloudOpt</div>
              {['Overview','Costs','Resources','Storage'].map(item => (
                <div key={item} style={{
                  ...s.previewNavItem,
                  ...(item === 'Overview' ? s.previewNavActive : {})
                }}>{item}</div>
              ))}
            </div>
            <div style={s.previewMain}>
              <div style={s.previewCards}>
                {[
                  { label: 'Monthly Cost', value: '$247.50', color: '#6366f1' },
                  { label: 'Daily Avg', value: '$8.25', color: '#06b6d4' },
                  { label: 'EC2 Idle', value: '3', color: '#f59e0b' },
                  { label: 'Savings', value: '$180', color: '#10b981' },
                ].map(card => (
                  <div key={card.label} style={{...s.previewCard, borderTop: `3px solid ${card.color}`}}>
                    <p style={s.previewCardLabel}>{card.label}</p>
                    <p style={{...s.previewCardValue, color: card.color}}>{card.value}</p>
                  </div>
                ))}
              </div>
              <div style={s.previewSavings}>
                💰 Potential Monthly Savings: <strong>$180.00</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={s.stats}>
        {[
          { value: '40%', label: 'Average cost reduction' },
          { value: '₹50L+', label: 'Saved for customers' },
          { value: '2 min', label: 'Setup time' },
          { value: '24/7', label: 'Real-time monitoring' },
        ].map(stat => (
          <div key={stat.label} style={s.statItem}>
            <h2 style={s.statValue}>{stat.value}</h2>
            <p style={s.statLabel}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div style={s.features} id="features">
        <div style={s.sectionBadge}>✨ Features</div>
        <h2 style={s.sectionTitle}>Everything you need to<br/>optimize AWS costs</h2>
        <div style={s.featuresGrid}>
          {[
            { icon: '📊', title: 'Real-time Dashboard', desc: 'See all your AWS costs in one beautiful dashboard. No more digging through 50 AWS Console pages.' },
            { icon: '🔍', title: 'Idle Resource Detection', desc: 'Automatically finds EC2 instances, volumes, and services wasting your money 24/7.' },
            { icon: '📧', title: 'Smart Alerts', desc: 'Get email alerts instantly when your AWS spending exceeds your budget threshold.' },
            { icon: '📈', title: 'Cost Analytics', desc: 'Daily, weekly, and monthly cost breakdowns by service so you know exactly where money goes.' },
            { icon: '💡', title: 'AI Recommendations', desc: 'Get smart suggestions like downgrading instance sizes or using reserved instances.' },
            { icon: '🔒', title: 'Secure & Private', desc: 'Read-only AWS access. We never touch your resources. Your data stays private.' },
          ].map(f => (
            <div key={f.title} style={s.featureCard}>
              <div style={s.featureIcon}>{f.icon}</div>
              <h3 style={s.featureTitle}>{f.title}</h3>
              <p style={s.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={s.howSection} id="how">
        <div style={s.sectionBadge}>🛠️ How it works</div>
        <h2 style={s.sectionTitle}>Start saving in 3 simple steps</h2>
        <div style={s.stepsRow}>
          {[
            { step: '1', title: 'Connect AWS', desc: 'Link your AWS account with read-only IAM credentials in 2 minutes.' },
            { step: '2', title: 'Get insights', desc: 'See your costs, idle resources, and savings opportunities instantly.' },
            { step: '3', title: 'Save money', desc: 'Act on recommendations and watch your AWS bill drop every month.' },
          ].map((s2, i) => (
            <div key={s2.step} style={s.stepCard}>
              <div style={s.stepNumber}>{s2.step}</div>
              <h3 style={s.stepTitle}>{s2.title}</h3>
              <p style={s.stepDesc}>{s2.desc}</p>
              {i < 2 && <div style={s.stepArrow}>→</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div style={s.pricing} id="pricing">
        <div style={s.sectionBadge}>💰 Pricing</div>
        <h2 style={s.sectionTitle}>Simple, honest pricing</h2>
        <div style={s.pricingGrid}>
          {[
            {
              name: 'Starter',
              price: 'Free',
              sub: 'forever',
              color: '#6366f1',
              features: ['1 AWS account', 'Cost dashboard', 'Basic alerts', 'Email support'],
              cta: 'Get started free',
              popular: false,
            },
            {
              name: 'Pro',
              price: '₹999',
              sub: '/month',
              color: '#8b5cf6',
              features: ['5 AWS accounts', 'Advanced analytics', 'Smart alerts', 'AI recommendations', 'Priority support'],
              cta: 'Start free trial',
              popular: true,
            },
            {
              name: 'Enterprise',
              price: '₹4999',
              sub: '/month',
              color: '#06b6d4',
              features: ['Unlimited accounts', 'Custom reports', 'Slack integration', 'Dedicated support', 'SLA guarantee'],
              cta: 'Contact us',
              popular: false,
            },
          ].map(plan => (
            <div key={plan.name} style={{
              ...s.pricingCard,
              border: plan.popular ? `2px solid ${plan.color}` : '1px solid #e2e8f0',
              transform: plan.popular ? 'scale(1.05)' : 'none',
            }}>
              {plan.popular && <div style={{...s.popularBadge, background: plan.color}}>Most Popular</div>}
              <h3 style={{...s.planName, color: plan.color}}>{plan.name}</h3>
              <div style={s.planPrice}>
                <span style={s.planAmount}>{plan.price}</span>
                <span style={s.planSub}>{plan.sub}</span>
              </div>
              <div style={s.planDivider}/>
              {plan.features.map(f => (
                <p key={f} style={s.planFeature}>✓ {f}</p>
              ))}
              <button
                style={{...s.planBtn, background: plan.color}}
                onClick={onGetStarted}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div style={s.cta}>
        <h2 style={s.ctaTitle}>Ready to cut your AWS bill?</h2>
        <p style={s.ctaSub}>Join 100+ startups already saving money with CloudOptimizer</p>
        <div style={s.ctaForm}>
          <input
            style={s.ctaInput}
            type="email"
            placeholder="Enter your work email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button style={s.ctaBtn} onClick={onGetStarted}>
            Get started free →
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerLogo}>☁️ CloudOptimizer</div>
        <p style={s.footerSub}>Save up to 40% on your AWS bills</p>
        <p style={s.footerCopy}>© 2026 CloudOptimizer. Built with ❤️ in India.</p>
      </footer>
    </div>
  );
}

const s = {
  page: { fontFamily: "'Inter', Arial, sans-serif", background: '#ffffff', minHeight: '100vh' },
  
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 80px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: 'white', zIndex: 100 },
  navLogo: { display: 'flex', alignItems: 'center', gap: 10 },
  navBrand: { fontSize: 20, fontWeight: 700, color: '#1e1b4b' },
  navLinks: { display: 'flex', alignItems: 'center', gap: 32 },
  navLink: { color: '#64748b', textDecoration: 'none', fontSize: 14, fontWeight: 500 },
  navBtn: { background: '#6366f1', color: 'white', border: 'none', padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },

  hero: { padding: '80px 80px 60px', textAlign: 'center', background: 'linear-gradient(180deg, #faf5ff 0%, #ffffff 100%)' },
  heroBadge: { display: 'inline-block', background: '#ede9fe', color: '#6366f1', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 24 },
  heroTitle: { fontSize: 64, fontWeight: 800, color: '#1e1b4b', margin: '0 0 24px', lineHeight: 1.1 },
  heroGradient: { background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSub: { fontSize: 20, color: '#64748b', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 },
  heroActions: { display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16 },
  btnPrimary: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '16px 32px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer' },
  btnSecondary: { background: 'white', color: '#1e1b4b', border: '1px solid #e2e8f0', padding: '16px 32px', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer' },
  heroNote: { color: '#94a3b8', fontSize: 13, marginBottom: 48 },

  dashPreview: { maxWidth: 900, margin: '0 auto', borderRadius: 16, overflow: 'hidden', boxShadow: '0 25px 80px rgba(99,102,241,0.2)', border: '1px solid #e2e8f0' },
  previewBar: { background: '#f8fafc', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 },
  previewDot1: { width: 12, height: 12, borderRadius: '50%', background: '#fc5c65' },
  previewDot2: { width: 12, height: 12, borderRadius: '50%', background: '#fed330' },
  previewDot3: { width: 12, height: 12, borderRadius: '50%', background: '#26de81' },
  previewUrl: { flex: 1, textAlign: 'center', fontSize: 12, color: '#94a3b8' },
  previewBody: { display: 'flex', height: 280 },
  previewSidebar: { width: 140, background: '#1e1b4b', padding: '16px 12px' },
  previewLogo: { color: 'white', fontSize: 13, fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.1)' },
  previewNavItem: { color: 'rgba(255,255,255,0.6)', fontSize: 12, padding: '8px 10px', borderRadius: 6, marginBottom: 4, cursor: 'pointer' },
  previewNavActive: { background: 'rgba(99,102,241,0.3)', color: 'white' },
  previewMain: { flex: 1, background: '#f5f7fa', padding: 16 },
  previewCards: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 },
  previewCard: { background: 'white', borderRadius: 8, padding: 10 },
  previewCardLabel: { fontSize: 9, color: '#94a3b8', margin: '0 0 4px', textTransform: 'uppercase' },
  previewCardValue: { fontSize: 16, fontWeight: 700, margin: 0 },
  previewSavings: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', borderRadius: 8, padding: '12px 16px', fontSize: 13 },

  stats: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: '#1e1b4b', padding: '48px 80px' },
  statItem: { textAlign: 'center' },
  statValue: { fontSize: 40, fontWeight: 800, color: 'white', margin: '0 0 8px' },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: 0 },

  features: { padding: '80px', textAlign: 'center' },
  sectionBadge: { display: 'inline-block', background: '#ede9fe', color: '#6366f1', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 16 },
  sectionTitle: { fontSize: 40, fontWeight: 800, color: '#1e1b4b', margin: '0 0 48px', lineHeight: 1.2 },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, maxWidth: 1000, margin: '0 auto' },
  featureCard: { background: '#faf5ff', borderRadius: 16, padding: 28, textAlign: 'left', border: '1px solid #ede9fe' },
  featureIcon: { fontSize: 32, marginBottom: 16 },
  featureTitle: { fontSize: 18, fontWeight: 700, color: '#1e1b4b', margin: '0 0 8px' },
  featureDesc: { fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 },

  howSection: { padding: '80px', background: '#f8fafc', textAlign: 'center' },
  stepsRow: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0, maxWidth: 900, margin: '0 auto', position: 'relative' },
  stepCard: { background: 'white', borderRadius: 16, padding: 32, flex: 1, position: 'relative', border: '1px solid #e2e8f0' },
  stepNumber: { width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, margin: '0 auto 16px' },
  stepTitle: { fontSize: 18, fontWeight: 700, color: '#1e1b4b', margin: '0 0 8px' },
  stepDesc: { fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 },
  stepArrow: { fontSize: 24, color: '#6366f1', padding: '0 16px', fontWeight: 700 },

  pricing: { padding: '80px', textAlign: 'center' },
  pricingGrid: { display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' },
  pricingCard: { background: 'white', borderRadius: 20, padding: '36px 28px', width: 280, position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
  popularBadge: { position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', color: 'white', padding: '4px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' },
  planName: { fontSize: 18, fontWeight: 700, margin: '0 0 16px' },
  planPrice: { display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'center', marginBottom: 16 },
  planAmount: { fontSize: 40, fontWeight: 800, color: '#1e1b4b' },
  planSub: { fontSize: 14, color: '#94a3b8' },
  planDivider: { height: 1, background: '#f1f5f9', margin: '16px 0' },
  planFeature: { fontSize: 14, color: '#64748b', margin: '0 0 8px', textAlign: 'left' },
  planBtn: { width: '100%', padding: '12px', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 16 },

  cta: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '80px', textAlign: 'center' },
  ctaTitle: { fontSize: 40, fontWeight: 800, color: 'white', margin: '0 0 16px' },
  ctaSub: { fontSize: 18, color: 'rgba(255,255,255,0.8)', margin: '0 0 40px' },
  ctaForm: { display: 'flex', gap: 12, justifyContent: 'center', maxWidth: 500, margin: '0 auto' },
  ctaInput: { flex: 1, padding: '14px 20px', borderRadius: 10, border: 'none', fontSize: 15, outline: 'none' },
  ctaBtn: { background: 'white', color: '#6366f1', border: 'none', padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },

  footer: { background: '#1e1b4b', padding: '40px 80px', textAlign: 'center' },
  footerLogo: { fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 8 },
  footerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 16 },
  footerCopy: { color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 },
};
