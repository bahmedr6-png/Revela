'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const APP_URL = 'https://revela-app-neon.vercel.app'

const ticker = ['Revenue Analysis', 'Expense Tracking', 'Strategic Reports', 'Business Health Score', 'Data Science Engine', 'Profit Optimization', 'Revenue Leak Detection', 'Weekly Briefings']

export default function Home() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSite, setShowSite] = useState(false)
  const [logoVisible, setLogoVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setLogoVisible(true), 300)
    setTimeout(() => setShowSite(true), 2400)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('waitlist')
      .insert([{ name, email }])
    if (error) {
      alert('Something went wrong. Please try again.')
    } else {
      setSubmitted(true)
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #05050a; }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px #7c3aed44; }
          50% { box-shadow: 0 0 40px #7c3aed88; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .ticker-track {
          display: flex;
          animation: ticker 25s linear infinite;
          width: max-content;
        }
        .glow-btn {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .float-card {
          animation: float 4s ease-in-out infinite;
        }
        input::placeholder { color: #4a4a6a; }
        input:focus { border-color: #7c3aed !important; outline: none; }
        nav a:hover { color: #a855f7 !important; }
      `}</style>

      <AnimatePresence>
        {!showSite && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
            style={{
              position: 'fixed', inset: 0,
              background: 'radial-gradient(ellipse at center, #0d0520 0%, #05050a 70%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 100, flexDirection: 'column', gap: '16px'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={logoVisible ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ textAlign: 'center' }}
            >
              <motion.div
                style={{
                  fontSize: '64px', fontWeight: '800', color: '#fff',
                  letterSpacing: '-3px', fontFamily: 'system-ui',
                  textShadow: '0 0 60px #7c3aed88'
                }}
              >
                Re<span style={{ color: '#a855f7' }}>vela</span>
              </motion.div>

              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={logoVisible ? { width: '100%', opacity: 1 } : {}}
                transition={{ duration: 1.2, delay: 0.6, ease: 'easeInOut' }}
                style={{
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, #a855f7, transparent)',
                  marginTop: '12px'
                }}
              />

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={logoVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 1.2 }}
                style={{
                  color: '#a855f7', fontSize: '12px', marginTop: '14px',
                  letterSpacing: '4px', textTransform: 'uppercase'
                }}
              >
                Turning data into decisions
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={logoVisible ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 1.6 }}
                style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}
              >
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, delay: i * 0.3, repeat: Infinity }}
                    style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7c3aed' }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSite && (
          <motion.div
            key="site"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <main style={{ background: '#05050a', color: '#fff', fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>

              {/* Nav */}
              <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  padding: '18px 48px', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', borderBottom: '1px solid #1a1a3a',
                  background: '#05050a', position: 'sticky', top: 0, zIndex: 50,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-1px' }}>
                  Re<span style={{ color: '#a855f7' }}>vela</span>
                </div>
                <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                  {['How it Works', 'Why Revela', 'Early Access'].map((item, i) => (
                    <a key={i} href={i === 2 ? '#waitlist' : `#section${i}`}
                      style={{ color: '#9999bb', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'color 0.2s' }}>
                      {item}
                    </a>
                  ))}
                  <a href={APP_URL} style={{
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    color: '#fff', padding: '10px 22px', borderRadius: '8px',
                    textDecoration: 'none', fontSize: '14px', fontWeight: '700',
                    boxShadow: '0 0 20px #7c3aed44'
                  }}>
                    Get Early Access
                  </a>
                </div>
              </motion.nav>

              {/* Hero */}
              <section style={{ textAlign: 'center', padding: '100px 24px 60px', maxWidth: '860px', margin: '0 auto' }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  style={{
                    display: 'inline-block', background: '#12082a',
                    border: '1px solid #7c3aed44', color: '#a855f7',
                    fontSize: '11px', padding: '6px 18px', borderRadius: '20px',
                    marginBottom: '36px', letterSpacing: '3px', textTransform: 'uppercase'
                  }}
                >
                  Now accepting early access
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={{ fontSize: '52px', fontWeight: '800', lineHeight: '1.15', marginBottom: '24px', letterSpacing: '-2px' }}
                >
                  You know what you made.
                  <br />
                  <span style={{ color: '#a855f7', textShadow: '0 0 40px #7c3aed66' }}>
                    You don't know what you lost.
                  </span>
                  <br />
                  That's the problem.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  style={{ fontSize: '18px', color: '#9999bb', lineHeight: '1.7', marginBottom: '40px', maxWidth: '580px', margin: '0 auto 40px' }}
                >
                  We turn your data into answers — so you know exactly what to cut, fix, and double down on.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
                >
                  <a href={APP_URL} className="glow-btn" style={{
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    color: '#fff', padding: '16px 40px', borderRadius: '10px',
                    textDecoration: 'none', fontSize: '16px', fontWeight: '700',
                    display: 'inline-block'
                  }}>
                    Start Your Free Analysis →
                  </a>
                  <p style={{ color: '#4a4a6a', fontSize: '13px' }}>
                    Trusted by founders and business owners · Launching 2025
                  </p>
                </motion.div>
              </section>

              {/* Ticker */}
              <div style={{ overflow: 'hidden', borderTop: '1px solid #1a1a3a', borderBottom: '1px solid #1a1a3a', padding: '14px 0', background: '#08081a' }}>
                <div className="ticker-track">
                  {[...ticker, ...ticker].map((item, i) => (
                    <span key={i} style={{ padding: '0 32px', color: '#6a6a9a', fontSize: '13px', fontWeight: '600', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                      {item} <span style={{ color: '#7c3aed', marginLeft: '32px' }}>✦</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Problem */}
              <motion.section
                id="section0"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                style={{ padding: '80px 24px', background: '#080812' }}
              >
                <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
                  <p style={{ color: '#a855f7', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>The Problem</p>
                  <h2 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-1px' }}>
                    You built this business.
                  </h2>
                  <p style={{ color: '#9999bb', fontSize: '20px', marginBottom: '60px' }}>
                    You deserve to know exactly how it's performing.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    {[
                      {
                        title: 'The Gap Nobody Talks About',
                        body: 'You had a strong month. The revenue came in. But somewhere between the invoices and your bank account — money disappeared. That gap has a source. Most owners never find it.',
                        delay: 0
                      },
                      {
                        title: 'Not Everything You Offer Is Working For You',
                        body: 'Some of your services are quietly carrying the business. Others are draining it. Without the data to tell you which is which, you\'re making decisions on instinct — and instinct has a cost.',
                        delay: 0.15
                      },
                      {
                        title: 'Strategy Without Data Is Just Guessing',
                        body: 'The difference between a business that scales and one that stays stuck is rarely effort. It\'s clarity. Knowing exactly where to push, where to cut, and where the next dollar of growth is hiding.',
                        delay: 0.3
                      }
                    ].map((card, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: card.delay }}
                        whileHover={{ borderColor: '#7c3aed', y: -4 }}
                        style={{
                          background: '#0a0a1e', border: '1px solid #1a1a3a',
                          borderRadius: '16px', padding: '32px', textAlign: 'left',
                          transition: 'all 0.3s', cursor: 'default'
                        }}
                      >
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '10px',
                          background: '#12082a', border: '1px solid #7c3aed44',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginBottom: '16px', fontSize: '18px'
                        }}>
                          {['💸', '📊', '🎯'][i]}
                        </div>
                        <div style={{ color: '#a855f7', fontSize: '12px', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {card.title}
                        </div>
                        <p style={{ color: '#9999bb', lineHeight: '1.7', fontSize: '14px' }}>
                          {card.body}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>

              {/* How it works */}
              <motion.section
                id="section1"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                style={{ padding: '80px 24px' }}
              >
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                  <p style={{ color: '#a855f7', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>How It Works</p>
                  <h2 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-1px' }}>
                    Three steps to knowing your business
                  </h2>
                  <p style={{ color: '#9999bb', fontSize: '18px', marginBottom: '60px' }}>
                    like never before.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {[
                      {
                        number: '01',
                        title: 'Share Your Data',
                        body: 'Export your sales, expenses, or transaction history — whatever format you have. CSV, Excel, QuickBooks. We take it from there.',
                        icon: '📁'
                      },
                      {
                        number: '02',
                        title: 'We Go to Work',
                        body: 'Our data science engine and strategic consulting system analyzes every number. We clean it, interrogate it, and extract what matters — the patterns, the leaks, the opportunities hiding in plain sight.',
                        icon: '⚡'
                      },
                      {
                        number: '03',
                        title: 'Receive Your Strategic Report',
                        body: 'Not a dashboard full of charts. A clear, direct breakdown of what\'s working, what\'s costing you, and the exact moves to make next. Built for decision makers, not data analysts.',
                        icon: '📈'
                      }
                    ].map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.2 }}
                        whileHover={{ borderColor: '#7c3aed55', x: 4 }}
                        style={{
                          display: 'flex', gap: '24px', alignItems: 'flex-start',
                          background: '#080812', border: '1px solid #1a1a3a',
                          borderRadius: '16px', padding: '28px', textAlign: 'left',
                          transition: 'all 0.3s'
                        }}
                      >
                        <div style={{ fontSize: '28px', minWidth: '48px' }}>{step.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <span style={{ color: '#7c3aed', fontSize: '13px', fontWeight: '800', fontFamily: 'monospace' }}>{step.number}</span>
                            <span style={{ fontSize: '18px', fontWeight: '700' }}>{step.title}</span>
                          </div>
                          <p style={{ color: '#9999bb', lineHeight: '1.7', fontSize: '14px' }}>{step.body}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>

              {/* Why Revela */}
              <motion.section
                id="section2"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                style={{ padding: '80px 24px', background: '#080812' }}
              >
                <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
                  <p style={{ color: '#a855f7', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>Why Revela</p>
                  <h2 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '60px', letterSpacing: '-1px' }}>
                    Not a dashboard. Not a consultant. <span style={{ color: '#a855f7' }}>Something better.</span>
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {[
                      { icon: '🧠', title: 'Data Science Engine', body: 'Built on Python and real analytical frameworks. Not generic AI fluff.' },
                      { icon: '📋', title: 'Strategic Reports', body: 'Plain English. No charts to decode. Just answers and actions.' },
                      { icon: '🔍', title: 'Revenue Leak Detection', body: 'We find what\'s silently draining your margins before it compounds.' },
                      { icon: '📅', title: 'Weekly Briefings', body: 'Every Monday, a clear picture of where your business stands.' },
                      { icon: '💯', title: 'Health Score', body: 'One number that tells you the truth about your business this week.' },
                      { icon: '🤝', title: 'Consulting Layer', body: 'Real human insight backed by data. Not just software.' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        whileHover={{ borderColor: '#7c3aed', scale: 1.02 }}
                        style={{
                          background: '#0a0a1e', border: '1px solid #1a1a3a',
                          borderRadius: '14px', padding: '24px', textAlign: 'left',
                          transition: 'all 0.3s'
                        }}
                      >
                        <div style={{ fontSize: '24px', marginBottom: '12px' }}>{item.icon}</div>
                        <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>{item.title}</div>
                        <p style={{ color: '#9999bb', fontSize: '13px', lineHeight: '1.6' }}>{item.body}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>

              {/* Urgency CTA */}
              <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                style={{ padding: '60px 24px', textAlign: 'center', borderTop: '1px solid #1a1a3a', borderBottom: '1px solid #1a1a3a' }}
              >
                <p style={{ fontSize: '22px', fontWeight: '700', color: '#9999bb' }}>
                  Your competitors already know their numbers.{' '}
                  <span style={{ color: '#fff' }}>Do you?</span>
                </p>
              </motion.section>

              {/* Waitlist */}
              <motion.section
                id="waitlist"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                style={{ padding: '100px 24px' }}
              >
                <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
                  <p style={{ color: '#a855f7', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>Early Access</p>
                  <h2 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-1px' }}>
                    The businesses that know their numbers win.
                  </h2>
                  <p style={{ color: '#a855f7', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                    Be one of them.
                  </p>
                  <p style={{ color: '#9999bb', fontSize: '14px', marginBottom: '40px' }}>
                    Early access is limited. Join now and be first in when we launch.
                  </p>
                  {submitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{
                        background: '#0d0820', border: '1px solid #7c3aed',
                        borderRadius: '16px', padding: '40px',
                        color: '#fff', fontSize: '20px', fontWeight: '700',
                        boxShadow: '0 0 40px #7c3aed33'
                      }}
                    >
                      You're on the list. 🚀
                      <p style={{ fontSize: '14px', color: '#9999bb', fontWeight: '400', marginTop: '8px' }}>
                        We'll be in touch when we launch.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{
                          padding: '16px 20px', borderRadius: '10px', fontSize: '15px',
                          background: '#0a0a1e', border: '1px solid #1a1a3a',
                          color: '#fff', width: '100%', transition: 'border-color 0.2s'
                        }}
                      />
                      <input
                        type="email"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                          padding: '16px 20px', borderRadius: '10px', fontSize: '15px',
                          background: '#0a0a1e', border: '1px solid #1a1a3a',
                          color: '#fff', width: '100%', transition: 'border-color 0.2s'
                        }}
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="glow-btn"
                        style={{
                          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                          color: '#fff', padding: '16px',
                          borderRadius: '10px', fontSize: '16px', fontWeight: '700',
                          border: 'none', cursor: 'pointer', width: '100%'
                        }}
                      >
                        {loading ? 'Submitting...' : 'Get early access →'}
                      </button>
                    </form>
                  )}
                  <p style={{ color: '#3a3a5a', fontSize: '13px', marginTop: '16px' }}>
                    No spam. Just your access link when we launch.
                  </p>
                </div>
              </motion.section>

              {/* Footer */}
              <footer style={{ padding: '40px 48px', borderTop: '1px solid #1a1a3a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ fontSize: '20px', fontWeight: '800' }}>
                  Re<span style={{ color: '#a855f7' }}>vela</span>
                </div>
                <p style={{ color: '#3a3a5a', fontSize: '13px' }}>© 2025 Revela. All rights reserved.</p>
                <div style={{ display: 'flex', gap: '20px' }}>
                  {['Twitter', 'LinkedIn', 'TikTok'].map((s, i) => (
                    <a key={i} href="#" style={{ color: '#4a4a6a', fontSize: '13px', textDecoration: 'none' }}>{s}</a>
                  ))}
                </div>
              </footer>

            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}