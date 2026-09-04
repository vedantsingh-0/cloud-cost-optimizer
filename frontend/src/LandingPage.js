import React, { useState, useEffect, useRef } from 'react';

// ── Animated counter hook ────────────────────────────────────
const useCounter = (end, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
};

// ── Intersection Observer hook ───────────────────────────────
const useInView = () => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
};

export default function LandingPage({ onGetStarted }) {
  const [scrollY, setScrollY] = useState(0);
  const [statsRef, statsInView] = useInView();
  const [email, setEmail] = useState('');

  const savings = useCounter(40, 2000, statsInView);
  const users = useCounter(500, 2000, statsInView);
  const saved = useCounter(50, 2000, statsInView);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Syne', 'DM Sans', system-ui, sans-serif", background: '#080810', color: '#e8e8f0', minHeight: '100vh', overflowX: 'hidden' }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse-glow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .hero-title { animation: slide-up 0.8s ease forwards; }
        .hero-sub { animation: slide-up 0.8s ease 0.2s both; }
        .hero-cta { animation: slide-up 0.8s ease 0.4s both; }
        .hero-preview { animation: slide-up 0.8s ease 0.6s both; }
        .feature-card { transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease; }
        .feature-card:hover { transform: translateY(-8px); border-color: rgba(100, 120, 255, 0.4) !important; box-shadow: 0 20px 60px rgba(100, 120, 255, 0.15) !important; }
        .nav-link { transition: color 0.2s ease; cursor: pointer; }
        .nav-link:hover { color: #8899ff !important; }
        .btn-primary { transition: all 0.3s ease; cursor: pointer; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(100, 120, 255, 0.4) !important; }
        .btn-secondary { transition: all 0.3s ease; cursor: pointer; }
        .btn-secondary:hover { background: rgba(255,255,255,0.08) !important; transform: translateY(-2px); }
        .pricing-card { transition: all 0.3s ease; }
        .pricing-card:hover { transform: translateY(-8px); }
        .stat-item { transition: transform 0.3s ease; }
        .stat-item:hover { transform: scale(1.05); }
        .marquee-track { animation: marquee 20s linear infinite; display: flex; gap: 48px; width: max-content; }
      `}</style>

      {/* Background gradient orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, background: 'radial-gradient(circle, rgba(80,100,255,0.12) 0%, transparent 70%)', top: -100, left: -100, animation: 'pulse-glow 4s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, background: 'radial-gradient(circle, rgba(120,60,255,0.08) 0%, transparent 70%)', bottom: 200, right: -100, animation: 'pulse-glow 6s ease-in-out infinite 2s' }} />
      </div>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 60px', height: 64,
        background: scrollY > 50 ? 'rgba(8,8,16,0.9)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 36 36">
            <circle cx="12" cy="20" r="10" fill="#6478ff" />
            <circle cx="20" cy="14" r="8" fill="#6478ff" />
            <circle cx="28" cy="18" r="7" fill="#6478ff" />
            <rect x="2" y="20" width="33" height="8" rx="3" fill="#6478ff" />
            <polygon points="18,12 22,12 20,18" fill="white" />
            <rect x="18.5" y="8" width="3" height="6" rx="1" fill="white" />
          </svg>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', fontFamily: 'Syne, sans-serif' }}>CloudOptimizer</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          {['Features', 'Pricing', 'How it works'].map(item => (
            <a key={item} className="nav-link" href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>{item}</a>
          ))}
          <button className="btn-primary" onClick={onGetStarted}
            style={{ background: 'linear-gradient(135deg, #6478ff, #8860ff)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, boxShadow: '0 4px 20px rgba(100,120,255,0.3)' }}>
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 40px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(100,120,255,0.12)', border: '1px solid rgba(100,120,255,0.3)', borderRadius: 100, padding: '6px 16px', marginBottom: 32, animation: 'fade-in 0.6s ease forwards' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Live — Trusted by 500+ startups</span>
        </div>

        <h1 className="hero-title" style={{ fontSize: 'clamp(48px, 7vw, 88px)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-3px', marginBottom: 28, fontFamily: 'Syne, sans-serif', maxWidth: 900 }}>
          <span style={{ color: '#fff' }}>Stop burning</span><br />
          <span style={{ background: 'linear-gradient(135deg, #6478ff 0%, #a78bfa 50%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AWS money</span><br />
          <span style={{ color: '#fff' }}>every month</span>
        </h1>

        <p className="hero-sub" style={{ fontSize: 20, color: 'rgba(255,255,255,0.5)', maxWidth: 560, lineHeight: 1.7, marginBottom: 48, fontWeight: 300 }}>
          CloudOptimizer automatically finds idle resources, tracks real-time spending, and saves Indian startups up to 40% on their AWS bills.
        </p>

        <div className="hero-cta" style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20 }}>
          <button className="btn-primary" onClick={onGetStarted} style={{ background: 'linear-gradient(135deg, #6478ff, #8860ff)', color: '#fff', border: 'none', padding: '14px 36px', borderRadius: 10, fontSize: 16, fontWeight: 700, boxShadow: '0 8px 32px rgba(100,120,255,0.4)', letterSpacing: '-0.3px' }}>
            Start saving for free →
          </button>
          <button className="btn-secondary" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 500 }}>
            ▶ Watch demo
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.5px' }}>✓ Free forever &nbsp;&nbsp; ✓ No credit card &nbsp;&nbsp; ✓ 2 min setup</p>

        {/* Dashboard Preview */}
        <div className="hero-preview" style={{ marginTop: 72, width: '100%', maxWidth: 1000, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: -40, zIndex: -1, background: 'radial-gradient(ellipse, rgba(100,120,255,0.2) 0%, transparent 70%)' }} />
          <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 120px rgba(0,0,0,0.8)', background: '#0d0d18' }}>
            <div style={{ background: '#111120', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '4px 12px', fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', maxWidth: 300, margin: '0 auto' }}>app.cloudoptimizer.in</div>
            </div>
            <div style={{ display: 'flex', height: 300 }}>
              <div style={{ width: 160, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '20px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <svg width="18" height="18" viewBox="0 0 36 36"><circle cx="12" cy="20" r="10" fill="#6478ff" /><circle cx="20" cy="14" r="8" fill="#6478ff" /><circle cx="28" cy="18" r="7" fill="#6478ff" /><rect x="2" y="20" width="33" height="8" rx="3" fill="#6478ff" /></svg>
                  <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>CloudOpt</span>
                </div>
                {['▦ Overview', '◈ Costs', '◻ Resources', '◫ Storage'].map((item, i) => (
                  <div key={item} style={{ padding: '8px 10px', borderRadius: 6, fontSize: 11, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.4)', background: i === 0 ? 'rgba(100,120,255,0.2)' : 'transparent', borderLeft: i === 0 ? '2px solid #6478ff' : '2px solid transparent', marginBottom: 4 }}>{item}</div>
                ))}
              </div>
              <div style={{ flex: 1, padding: 20, background: '#0d0d18' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
                  {[{ label: 'MONTHLY COST', value: '$247.50', color: '#6478ff' }, { label: 'DAILY AVG', value: '$8.25', color: '#22d3ee' }, { label: 'EC2 IDLE', value: '3', color: '#f59e0b' }, { label: 'S3 BUCKETS', value: '12', color: '#22c55e' }].map(card => (
                    <div key={card.label} style={{ background: '#111120', borderRadius: 8, padding: '10px 12px', borderTop: `2px solid ${card.color}` }}>
                      <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>{card.label}</p>
                      <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>{card.value}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'linear-gradient(135deg, rgba(100,120,255,0.2), rgba(136,96,255,0.2))', border: '1px solid rgba(100,120,255,0.3)', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>POTENTIAL SAVINGS</p>
                    <p style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>$180.00</p>
                  </div>
                  <span style={{ fontSize: 28 }}>💡</span>
                </div>
                <div style={{ background: '#111120', borderRadius: 8, padding: '10px 12px', height: 70, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                  {[20, 45, 30, 60, 40, 80, 55, 70, 50, 90, 65, 75, 55, 85].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(to top, #6478ff, #8860ff)', borderRadius: '3px 3px 0 0', opacity: 0.6 + (i / 14) * 0.4 }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div style={{ position: 'relative', zIndex: 1, overflow: 'hidden', padding: '40px 0', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 3 }}>Trusted by teams at</div>
        <div style={{ overflow: 'hidden' }}>
          <div className="marquee-track">
            {['Razorpay', 'Zepto', 'CRED', 'Groww', 'Meesho', 'PhonePe', 'Nykaa', 'Swiggy', 'Zomato', 'Ola', 'Razorpay', 'Zepto', 'CRED', 'Groww', 'Meesho', 'PhonePe', 'Nykaa', 'Swiggy', 'Zomato', 'Ola'].map((company, i) => (
              <span key={i} style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.15)', whiteSpace: 'nowrap', fontFamily: 'Syne, sans-serif' }}>{company}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <section ref={statsRef} style={{ position: 'relative', zIndex: 1, padding: '100px 60px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, maxWidth: 900, margin: '0 auto' }}>
        {[{ value: `${savings}%`, label: 'Average cost reduction' }, { value: `${users}+`, label: 'Startups trust us' }, { value: `₹${saved}L+`, label: 'Saved for customers' }].map((stat, i) => (
          <div key={i} className="stat-item" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 56, fontWeight: 800, fontFamily: 'Syne, sans-serif', background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.5) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 12, letterSpacing: '-2px' }}>{stat.value}</div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" style={{ position: 'relative', zIndex: 1, padding: '100px 60px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ display: 'inline-block', background: 'rgba(100,120,255,0.1)', border: '1px solid rgba(100,120,255,0.2)', borderRadius: 100, padding: '4px 14px', fontSize: 12, color: '#8899ff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 2 }}>Features</div>
          <h2 style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 800, fontFamily: 'Syne, sans-serif', letterSpacing: '-2px', color: '#fff', lineHeight: 1.1 }}>
            Everything you need to<br /><span style={{ color: 'rgba(255,255,255,0.4)' }}>cut AWS costs</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[
            { icon: '⚡', title: 'Real-time Dashboard', desc: 'See all AWS costs in one beautiful dark dashboard. No more digging through 50 confusing AWS Console pages.', color: '#6478ff' },
            { icon: '🔍', title: 'Idle Resource Detection', desc: 'Automatically finds wasted EC2 instances, volumes, and services burning money 24/7 without you knowing.', color: '#22d3ee' },
            { icon: '📧', title: 'Smart Cost Alerts', desc: 'Get instant email alerts when AWS spending crosses your threshold. Never get a surprise bill again.', color: '#f59e0b' },
            { icon: '📊', title: 'Deep Cost Analytics', desc: 'Daily, weekly, monthly breakdowns by service. Know exactly where every rupee goes in your AWS account.', color: '#22c55e' },
            { icon: '🔒', title: 'Secure by Design', desc: 'Read-only AWS access. We never modify your resources. Your credentials are encrypted and private.', color: '#a78bfa' },
            { icon: '👥', title: 'Per-User Isolation', desc: 'Each user sees only their own AWS data. Perfect for agencies managing multiple client accounts securely.', color: '#f43f5e' },
          ].map((feature, i) => (
            <div key={i} className="feature-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${feature.color}18`, border: `1px solid ${feature.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 18 }}>{feature.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 10px', fontFamily: 'Syne, sans-serif' }}>{feature.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ position: 'relative', zIndex: 1, padding: '100px 60px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ display: 'inline-block', background: 'rgba(100,120,255,0.1)', border: '1px solid rgba(100,120,255,0.2)', borderRadius: 100, padding: '4px 14px', fontSize: 12, color: '#8899ff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 2 }}>How it works</div>
          <h2 style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 800, fontFamily: 'Syne, sans-serif', letterSpacing: '-2px', color: '#fff' }}>Start saving in 3 steps</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 28, left: '16%', right: '16%', height: 1, background: 'linear-gradient(90deg, #6478ff, #8860ff, #22d3ee)', zIndex: 0, opacity: 0.3 }} />
          {[
            { step: '01', title: 'Connect AWS', desc: 'Add your AWS read-only IAM credentials in under 2 minutes. Zero risk — we never touch your resources.' },
            { step: '02', title: 'Get Insights', desc: 'Your personalized dashboard shows real costs, idle resources, and savings opportunities instantly.' },
            { step: '03', title: 'Save Money', desc: 'Act on AI recommendations and watch your AWS bill drop month after month automatically.' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 24px', position: 'relative', zIndex: 1 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #6478ff, #8860ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', margin: '0 auto 24px', fontFamily: 'Syne, sans-serif', boxShadow: '0 8px 24px rgba(100,120,255,0.4)' }}>{s.step}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 12px', fontFamily: 'Syne, sans-serif' }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ position: 'relative', zIndex: 1, padding: '100px 60px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ display: 'inline-block', background: 'rgba(100,120,255,0.1)', border: '1px solid rgba(100,120,255,0.2)', borderRadius: 100, padding: '4px 14px', fontSize: 12, color: '#8899ff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 2 }}>Pricing</div>
          <h2 style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 800, fontFamily: 'Syne, sans-serif', letterSpacing: '-2px', color: '#fff' }}>Simple, honest pricing</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 12, fontSize: 16 }}>Start free. Upgrade when you're ready.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, alignItems: 'center' }}>
          {[
            { name: 'Starter', price: 'Free', sub: 'forever', features: ['1 AWS account', 'Cost dashboard', 'Basic alerts', 'Email support'], cta: 'Get started free', popular: false, color: '#6478ff' },
            { name: 'Pro', price: '₹999', sub: '/month', features: ['5 AWS accounts', 'Advanced analytics', 'Smart alerts', 'AI recommendations', 'Priority support'], cta: 'Start free trial', popular: true, color: '#8860ff' },
            { name: 'Enterprise', price: '₹4,999', sub: '/month', features: ['Unlimited accounts', 'Custom reports', 'Slack alerts', 'Dedicated manager', 'SLA guarantee'], cta: 'Contact us', popular: false, color: '#22d3ee' },
          ].map((plan, i) => (
            <div key={i} className="pricing-card" style={{ background: plan.popular ? 'linear-gradient(135deg, rgba(100,120,255,0.15), rgba(136,96,255,0.15))' : 'rgba(255,255,255,0.02)', border: plan.popular ? '1px solid rgba(100,120,255,0.4)' : '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: plan.popular ? '40px 28px' : '32px 28px', position: 'relative', boxShadow: plan.popular ? '0 0 60px rgba(100,120,255,0.2)' : 'none' }}>
              {plan.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #6478ff, #8860ff)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 16px', borderRadius: 100, whiteSpace: 'nowrap' }}>MOST POPULAR</div>}
              <h3 style={{ fontSize: 16, fontWeight: 700, color: plan.color, margin: '0 0 16px', fontFamily: 'Syne, sans-serif' }}>{plan.name}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: '#fff', fontFamily: 'Syne, sans-serif', letterSpacing: '-1px' }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>{plan.sub}</span>
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />
              {plan.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ color: plan.color, fontSize: 14 }}>✓</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{f}</span>
                </div>
              ))}
              <button className="btn-primary" onClick={onGetStarted} style={{ width: '100%', padding: '12px', marginTop: 24, background: plan.popular ? 'linear-gradient(135deg, #6478ff, #8860ff)' : 'rgba(255,255,255,0.06)', color: '#fff', border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 14, fontWeight: 600, boxShadow: plan.popular ? '0 8px 24px rgba(100,120,255,0.3)' : 'none' }}>{plan.cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: 'relative', zIndex: 1, padding: '100px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', background: 'linear-gradient(135deg, rgba(100,120,255,0.12), rgba(136,96,255,0.08))', border: '1px solid rgba(100,120,255,0.2)', borderRadius: 24, padding: '72px 60px', boxShadow: '0 40px 120px rgba(100,120,255,0.1)' }}>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, fontFamily: 'Syne, sans-serif', letterSpacing: '-2px', color: '#fff', marginBottom: 16 }}>
            Ready to cut your<br />AWS bill in half?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, marginBottom: 40, lineHeight: 1.7 }}>Join 500+ Indian startups already saving money with CloudOptimizer. Free forever to start.</p>
          <div style={{ display: 'flex', gap: 12, maxWidth: 480, margin: '0 auto' }}>
            <input type="email" placeholder="Enter your work email" value={email} onChange={e => setEmail(e.target.value)}
              style={{ flex: 1, padding: '13px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }} />
            <button className="btn-primary" onClick={onGetStarted} style={{ background: 'linear-gradient(135deg, #6478ff, #8860ff)', color: '#fff', border: 'none', padding: '13px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(100,120,255,0.4)' }}>Get started →</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, padding: '40px 60px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 36 36"><circle cx="12" cy="20" r="10" fill="#6478ff" /><circle cx="20" cy="14" r="8" fill="#6478ff" /><circle cx="28" cy="18" r="7" fill="#6478ff" /><rect x="2" y="20" width="33" height="8" rx="3" fill="#6478ff" /></svg>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600 }}>CloudOptimizer</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>© 2026 CloudOptimizer. Built with ❤️ in India.</p>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'Contact'].map(item => (
            <span key={item} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer' }}>{item}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
