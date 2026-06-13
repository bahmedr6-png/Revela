'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

// ─── WebGL Shader Background ──────────────────────────────────────────────────
function ShaderBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl')
    if (!gl) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const vert = `
      attribute vec2 a_pos;
      void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `
    const frag = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_res;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        uv.y = 1.0 - uv.y;

        float t = u_time * 0.18;

        // Flowing plasma lines
        float n1 = noise(uv * 3.5 + vec2(t * 0.4, t * 0.2));
        float n2 = noise(uv * 2.8 - vec2(t * 0.3, t * 0.5));
        float n3 = noise(uv * 5.0 + vec2(t * 0.6, -t * 0.3));

        float plasma = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

        // Purple vein lines
        float lines = abs(sin(plasma * 12.0 + t));
        lines = smoothstep(0.82, 1.0, lines);

        // Deep purple core color
        vec3 bg = vec3(0.02, 0.01, 0.04);
        vec3 vein = vec3(0.35, 0.08, 0.72);   // #7c3aed-ish
        vec3 highlight = vec3(0.58, 0.18, 0.92); // #a855f7-ish

        // Subtle radial pulse from center
        float dist = length(uv - 0.5);
        float pulse = sin(t * 1.2) * 0.5 + 0.5;
        float glow = exp(-dist * 3.5) * pulse * 0.12;

        vec3 col = bg + vein * lines * 0.38 + highlight * glow;
        col += bg * plasma * 0.04;

        gl_FragColor = vec4(col, 1.0);
      }
    `

    const compile = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }

    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes = gl.getUniformLocation(prog, 'u_res')

    let start = performance.now()
    let raf
    const tick = () => {
      const t = (performance.now() - start) / 1000
      gl.uniform1f(uTime, t)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0,
        opacity: 0.55,
        pointerEvents: 'none',
      }}
    />
  )
}

// ─── Cinematic Word-by-Word Text ──────────────────────────────────────────────
function CinematicText({ lines, startDelay = 0.4 }) {
  // lines = [{ text, pause }] — pause adds extra delay before next line
  let wordIndex = 0
  const allWords = []

  lines.forEach((line, li) => {
    const words = line.text.split(' ')
    words.forEach((word, wi) => {
      allWords.push({
        word,
        delay: startDelay + wordIndex * 0.09,
        lineIndex: li,
        isLastInLine: wi === words.length - 1,
        linePause: line.pause || 0,
      })
      wordIndex++
    })
    if (line.pause) wordIndex += line.pause / 0.09
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15em' }}>
      {lines.map((line, li) => {
        let lineWordStart = 0
        for (let i = 0; i < li; i++) lineWordStart += lines[i].text.split(' ').length

        const words = line.text.split(' ')
        let cumulativeDelay = startDelay
        for (let i = 0; i < li; i++) {
          cumulativeDelay += lines[i].text.split(' ').length * 0.09
          cumulativeDelay += (lines[i].pause || 0)
        }

        return (
          <div key={li} style={{ overflow: 'hidden', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 0.25em' }}>
            {words.map((word, wi) => (
              <motion.span
                key={wi}
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{
                  delay: cumulativeDelay + wi * 0.09,
                  duration: 0.75,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{ display: 'inline-block' }}
              >
                {word}
              </motion.span>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ─── Scroll Reveal Section ────────────────────────────────────────────────────
function RevealSection({ children, delay = 0, style = {} }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'rgba(124,58,237,0.06)',
        border: '1px solid rgba(124,58,237,0.18)',
        borderRadius: 16,
        padding: '32px 28px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 16 }}>{icon}</div>
      <div style={{
        fontSize: 15,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#a855f7',
        marginBottom: 10,
      }}>{title}</div>
      <div style={{ fontSize: 15, lineHeight: 1.65, color: '#9999bb' }}>{desc}</div>
    </motion.div>
  )
}

// ─── Waitlist Form ────────────────────────────────────────────────────────────
function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email) return
    setLoading(true)
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        'https://tdiwozgrrzpmzubulfcq.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaXdvemdycnpwbXp1YnVsZmNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzA5ODEsImV4cCI6MjA5MTk0Njk4MX0.fTBwKhRfaPq9fNQdt3rau2qkr2NZNBixNiH217lXS28'
      )
      await supabase.from('waitlist').insert([{ name, email }])
      setSubmitted(true)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center', color: '#4edea3', fontSize: 17, fontWeight: 600 }}
      >
        ✓ You're on the list. We'll be in touch.
      </motion.div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420, margin: '0 auto' }}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Your name"
        style={inputStyle}
      />
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Your email"
        type="email"
        style={inputStyle}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          border: 'none',
          borderRadius: 10,
          color: '#fff',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '14px 28px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          boxShadow: '0 0 32px rgba(124,58,237,0.4)',
        }}
      >
        {loading ? 'Joining...' : 'Join the Waitlist'}
      </button>
    </div>
  )
}

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(124,58,237,0.25)',
  borderRadius: 10,
  color: '#e4e1ea',
  fontSize: 15,
  outline: 'none',
  padding: '13px 16px',
  width: '100%',
  boxSizing: 'border-box',
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  const [heroReady, setHeroReady] = useState(false)

  useEffect(() => {
    setHeroReady(true)
  }, [])

  // Timing: nav fades at 0s, line1 starts at 0.4s (6 words × 0.09s = 0.54s)
  // pause 0.6s, line2 starts at ~1.54s (6 words × 0.09s = 0.54s → done ~2.08s)
  // subline at 2.3s, CTA at 2.9s
  const line1Words = 'YOU KNOW WHAT YOU MADE.'.split(' ')
  const line2Words = "YOU DON'T KNOW WHAT YOU LOST.".split(' ')

  const line1Duration = line1Words.length * 0.09
  const pauseBetween = 0.55
  const line2Start = 0.4 + line1Duration + pauseBetween
  const line2Duration = line2Words.length * 0.09
  const sublineDelay = line2Start + line2Duration + 0.3
  const ctaDelay = sublineDelay + 0.45

  return (
    <div style={{ background: '#05050a', minHeight: '100vh', color: '#e4e1ea', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden' }}>
      <ShaderBackground />

      {/* ── NAV ── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.1, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '22px 48px',
          backdropFilter: 'blur(16px)',
          background: 'rgba(5,5,10,0.6)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <div style={{
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#fff',
        }}>
          REVELA
        </div>
        <motion.a
          href="https://revela-app-neon.vercel.app"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            borderRadius: 8,
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.12em',
            padding: '9px 20px',
            textDecoration: 'none',
            textTransform: 'uppercase',
            boxShadow: '0 0 20px rgba(124,58,237,0.35)',
          }}
        >
          Get Access
        </motion.a>
      </motion.nav>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 24px 80px',
      }}>

        {/* Purple glow bloom behind text */}
        <motion.div
          animate={{
            opacity: [0.18, 0.32, 0.18],
            scale: [1, 1.08, 1],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 700,
            height: 400,
            background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.28) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#7c3aed',
            marginBottom: 48,
            zIndex: 1,
          }}
        >
          Business Intelligence · Powered by Data Science
        </motion.div>

        {/* Line 1: YOU KNOW WHAT YOU MADE. */}
        <div style={{
          overflow: 'hidden',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0 0.22em',
          zIndex: 1,
          marginBottom: '0.04em',
        }}>
          {line1Words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ y: '115%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{
                delay: 0.4 + i * 0.09,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                display: 'inline-block',
                fontSize: 'clamp(36px, 6.5vw, 88px)',
                fontWeight: 900,
                letterSpacing: '-0.01em',
                lineHeight: 1.0,
                color: '#e4e1ea',
              }}
            >
              {word}
            </motion.span>
          ))}
        </div>

        {/* Pause separator — thin purple line that draws in between lines */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{
            delay: 0.4 + line1Duration + 0.1,
            duration: pauseBetween * 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            width: 48,
            height: 1.5,
            background: 'linear-gradient(90deg, transparent, #7c3aed, transparent)',
            margin: '18px auto',
            transformOrigin: 'center',
            zIndex: 1,
          }}
        />

        {/* Line 2: YOU DON'T KNOW WHAT YOU LOST. */}
        <div style={{
          overflow: 'hidden',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0 0.22em',
          zIndex: 1,
          marginBottom: '0.04em',
        }}>
          {line2Words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ y: '115%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{
                delay: line2Start + i * 0.09,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                display: 'inline-block',
                fontSize: 'clamp(36px, 6.5vw, 88px)',
                fontWeight: 900,
                letterSpacing: '-0.01em',
                lineHeight: 1.0,
                color: '#a855f7',
              }}
            >
              {word}
            </motion.span>
          ))}
        </div>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sublineDelay, duration: 0.9, ease: 'easeOut' }}
          style={{
            fontSize: 'clamp(15px, 1.8vw, 19px)',
            color: '#6a5f80',
            fontWeight: 400,
            maxWidth: 520,
            lineHeight: 1.7,
            marginTop: 36,
            zIndex: 1,
          }}
        >
          Upload your sales data. Revela's data science engine finds exactly where your business is losing money — in plain English.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ctaDelay, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginTop: 52, zIndex: 1, display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <motion.a
            href="https://revela-app-neon.vercel.app"
            whileHover={{ scale: 1.04, boxShadow: '0 0 48px rgba(124,58,237,0.55)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              borderRadius: 12,
              color: '#fff',
              display: 'inline-block',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.12em',
              padding: '16px 36px',
              textDecoration: 'none',
              textTransform: 'uppercase',
              boxShadow: '0 0 36px rgba(124,58,237,0.4)',
            }}
          >
            Analyze My Business Free
          </motion.a>

          <motion.a
            href="#how-it-works"
            whileHover={{ color: '#a855f7' }}
            style={{
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: 12,
              color: '#9999bb',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.08em',
              padding: '16px 28px',
              textDecoration: 'none',
              textTransform: 'uppercase',
              backdropFilter: 'blur(8px)',
            }}
          >
            See How It Works ↓
          </motion.a>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ delay: ctaDelay + 1.5, duration: 2.5, repeat: Infinity }}
          style={{
            position: 'absolute',
            bottom: 36,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 11,
            letterSpacing: '0.2em',
            color: '#6a5f80',
            textTransform: 'uppercase',
          }}
        >
          scroll
        </motion.div>
      </section>

      {/* ── STAT STRIP ── */}
      <RevealSection style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 40 }}>
          {[
            { value: '23%', label: 'Average revenue leak found' },
            { value: '<2 min', label: 'To your first insight' },
            { value: '$0', label: 'To run your first report' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, color: '#a855f7', letterSpacing: '-0.02em' }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: '#6a5f80', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 6 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </RevealSection>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ position: 'relative', zIndex: 1, padding: '120px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <RevealSection>
            <div style={{ textAlign: 'center', marginBottom: 80 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 20 }}>The Process</div>
              <div style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, color: '#e4e1ea', lineHeight: 1.1 }}>
                Three steps.<br />
                <span style={{ color: '#a855f7' }}>Real answers.</span>
              </div>
            </div>
          </RevealSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              {
                step: '01',
                title: 'Upload Your Data',
                desc: 'CSV, Excel, QuickBooks export — anything. Revela reads it in seconds. No reformatting required.',
                icon: '↑',
              },
              {
                step: '02',
                title: 'The Engine Runs',
                desc: 'A Python data science engine cleans, analyzes, and stress-tests every number. No guessing.',
                icon: '⬡',
              },
              {
                step: '03',
                title: 'Get Your Briefing',
                desc: 'Plain English. Your Business Health Score. Exactly where money is leaking and what to do about it.',
                icon: '◎',
              },
            ].map((item, i) => (
              <RevealSection key={i} delay={i * 0.12}>
                <div style={{
                  background: 'rgba(124,58,237,0.05)',
                  border: '1px solid rgba(124,58,237,0.15)',
                  borderRadius: 20,
                  padding: '40px 32px',
                  height: '100%',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', color: '#7c3aed', marginBottom: 20 }}>{item.step}</div>
                  <div style={{ fontSize: 36, marginBottom: 20, color: '#a855f7' }}>{item.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#e4e1ea', marginBottom: 14, letterSpacing: '-0.01em' }}>{item.title}</div>
                  <div style={{ fontSize: 15, color: '#6a5f80', lineHeight: 1.7 }}>{item.desc}</div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px 120px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <RevealSection>
            <div style={{ textAlign: 'center', marginBottom: 72 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 20 }}>What You Get</div>
              <div style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, color: '#e4e1ea', lineHeight: 1.1 }}>
                Every angle.<br />
                <span style={{ color: '#a855f7' }}>One score.</span>
              </div>
            </div>
          </RevealSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[
              { icon: '◉', title: 'Business Health Score', desc: 'One number, 0–100, updated every week. Know where you actually stand.' },
              { icon: '⚠', title: 'Revenue Leak Detector', desc: 'Finds silent money drains — late invoices, underpriced services, overspend.' },
              { icon: '☀', title: 'Monday Briefing', desc: 'Plain English email every Monday. What changed, what it means, what to do.' },
              { icon: '◈', title: 'Cash Flow Forecast', desc: '30, 60, and 90-day projections so you stop guessing what next month looks like.' },
              { icon: '⬡', title: 'Pricing Optimizer', desc: 'See current vs recommended pricing by product or service line.' },
              { icon: '⊹', title: 'Expense Anomaly Alerts', desc: 'Unusual spending gets flagged before it becomes a pattern.' },
            ].map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.07} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM / POSITIONING STATEMENT ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px 120px', overflow: 'hidden' }}>
        {/* Background glow for this section */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800, height: 500,
          background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <RevealSection>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 32 }}>
              The Problem
            </div>
          </RevealSection>

          {[
            'Most small business owners know their revenue.',
            "Almost none of them know where it's going.",
            'Spreadsheets nobody reads. Accountants who categorize, not strategize. Dashboards that show everything except what actually matters.',
            'Revela fixes that.',
          ].map((line, i) => (
            <RevealSection key={i} delay={i * 0.15} style={{ marginBottom: i < 3 ? 28 : 0 }}>
              <p style={{
                fontSize: i === 3
                  ? 'clamp(22px, 3.5vw, 40px)'
                  : 'clamp(17px, 2.2vw, 24px)',
                fontWeight: i === 3 ? 900 : 400,
                color: i === 3 ? '#a855f7' : i < 2 ? '#e4e1ea' : '#6a5f80',
                lineHeight: 1.5,
              }}>
                {line}
              </p>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px 120px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <RevealSection>
            <div style={{ textAlign: 'center', marginBottom: 72 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 20 }}>Pricing</div>
              <div style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, color: '#e4e1ea', lineHeight: 1.1 }}>
                Simple. No surprises.
              </div>
            </div>
          </RevealSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              {
                name: 'Starter',
                price: '$49',
                period: '/month',
                features: ['3 data uploads/month', 'Business Health Score', 'Revenue Leak Report', 'AI-powered explanations', 'Basic charts'],
                cta: 'Get Started',
                highlight: false,
              },
              {
                name: 'Growth',
                price: '$97',
                period: '/month',
                features: ['Unlimited uploads', 'Monday Morning Briefing', 'AI chat — ask your data', 'Historical tracking', 'Cash flow forecast'],
                cta: 'Most Popular',
                highlight: true,
              },
              {
                name: 'Pro',
                price: '$197',
                period: '/month',
                features: ['Everything in Growth', 'Monthly 30-min strategy call', 'Priority analysis', 'Custom report templates', 'Direct Slack access'],
                cta: 'Go Pro',
                highlight: false,
              },
            ].map((tier, i) => (
              <RevealSection key={i} delay={i * 0.12}>
                <div style={{
                  background: tier.highlight ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.04)',
                  border: tier.highlight ? '1px solid rgba(168,85,247,0.45)' : '1px solid rgba(124,58,237,0.15)',
                  borderRadius: 20,
                  padding: '40px 32px',
                  position: 'relative',
                  boxShadow: tier.highlight ? '0 0 48px rgba(124,58,237,0.15)' : 'none',
                }}>
                  {tier.highlight && (
                    <div style={{
                      position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                      borderRadius: 20,
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                      padding: '4px 14px', color: '#fff', textTransform: 'uppercase',
                    }}>
                      Most Popular
                    </div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 16 }}>{tier.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 28 }}>
                    <span style={{ fontSize: 48, fontWeight: 900, color: '#e4e1ea', letterSpacing: '-0.03em' }}>{tier.price}</span>
                    <span style={{ fontSize: 14, color: '#6a5f80' }}>{tier.period}</span>
                  </div>
                  <div style={{ marginBottom: 32 }}>
                    {tier.features.map((f, fi) => (
                      <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <span style={{ color: '#4edea3', fontSize: 13 }}>✓</span>
                        <span style={{ fontSize: 14, color: '#9999bb' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <motion.a
                    href="https://revela-app-neon.vercel.app"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      background: tier.highlight ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'transparent',
                      border: tier.highlight ? 'none' : '1px solid rgba(124,58,237,0.35)',
                      borderRadius: 10,
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      padding: '13px',
                      textDecoration: 'none',
                      textTransform: 'uppercase',
                      boxShadow: tier.highlight ? '0 0 28px rgba(124,58,237,0.3)' : 'none',
                    }}
                  >
                    {tier.cta}
                  </motion.a>
                </div>
              </RevealSection>
            ))}
          </div>

          <RevealSection delay={0.3}>
            <p style={{ textAlign: 'center', color: '#6a5f80', fontSize: 14, marginTop: 32 }}>
              First report free. No credit card required.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ── WAITLIST CTA ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '100px 24px 120px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <RevealSection>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 24 }}>Early Access</div>
            <div style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#e4e1ea', lineHeight: 1.1, marginBottom: 18 }}>
              Find your leaks.<br />
              <span style={{ color: '#a855f7' }}>Stop them.</span>
            </div>
            <p style={{ fontSize: 16, color: '#6a5f80', lineHeight: 1.7, marginBottom: 44 }}>
              Join the waitlist. Get early access and the first report free.
            </p>
            <WaitlistForm />
          </RevealSection>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.04)',
        padding: '36px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.2em', color: '#3d3550' }}>REVELA</div>
        <div style={{ fontSize: 12, color: '#3d3550', letterSpacing: '0.05em' }}>
          Built by a data scientist. For business owners who hate spreadsheets.
        </div>
      </footer>
    </div>
  )
}