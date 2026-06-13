'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

// ─── WebGL Shader Background ──────────────────────────────────────────────────
function ShaderBackground() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl')
    if (!gl) return
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; gl.viewport(0,0,canvas.width,canvas.height) }
    resize(); window.addEventListener('resize', resize)
    const vert = `attribute vec2 a_pos; void main(){gl_Position=vec4(a_pos,0.,1.);}`
    const frag = `
      precision highp float;
      uniform float u_time; uniform vec2 u_res;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);float a=hash(i);float b=hash(i+vec2(1,0));float c=hash(i+vec2(0,1));float d=hash(i+vec2(1,1));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_res; uv.y=1.-uv.y;
        float t=u_time*.18;
        float n1=noise(uv*3.5+vec2(t*.4,t*.2));
        float n2=noise(uv*2.8-vec2(t*.3,t*.5));
        float n3=noise(uv*5.+vec2(t*.6,-t*.3));
        float plasma=n1*.5+n2*.3+n3*.2;
        float lines=abs(sin(plasma*12.+t));
        lines=smoothstep(.82,1.,lines);
        vec3 bg=vec3(.02,.01,.04);
        vec3 vein=vec3(.35,.08,.72);
        vec3 highlight=vec3(.58,.18,.92);
        float dist=length(uv-.5);
        float pulse=sin(t*1.2)*.5+.5;
        float glow=exp(-dist*3.5)*pulse*.12;
        vec3 col=bg+vein*lines*.38+highlight*glow;
        col+=bg*plasma*.04;
        gl_FragColor=vec4(col,1.);
      }`
    const compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s}
    const prog=gl.createProgram()
    gl.attachShader(prog,compile(gl.VERTEX_SHADER,vert))
    gl.attachShader(prog,compile(gl.FRAGMENT_SHADER,frag))
    gl.linkProgram(prog); gl.useProgram(prog)
    const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf)
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW)
    const loc=gl.getAttribLocation(prog,'a_pos'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0)
    const uTime=gl.getUniformLocation(prog,'u_time'); const uRes=gl.getUniformLocation(prog,'u_res')
    let start=performance.now(); let raf
    const tick=()=>{ const t=(performance.now()-start)/1000; gl.uniform1f(uTime,t); gl.uniform2f(uRes,canvas.width,canvas.height); gl.drawArrays(gl.TRIANGLE_STRIP,0,4); raf=requestAnimationFrame(tick) }
    tick()
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize) }
  },[])
  return <canvas ref={canvasRef} style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',zIndex:0,opacity:0.5,pointerEvents:'none'}} />
}

// ─── 3D Floating Orb ──────────────────────────────────────────────────────────
function FloatingOrb({ size, x, y, color, duration, delay, blur }) {
  return (
    <motion.div
      animate={{
        y: [0, -30, 0, 20, 0],
        x: [0, 15, -10, 5, 0],
        rotateZ: [0, 360],
        scale: [1, 1.08, 0.95, 1.04, 1],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        width: size, height: size,
        left: x, top: y,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${color}55, ${color}18 50%, transparent 70%)`,
        boxShadow: `0 0 ${size/2}px ${color}22, inset 0 0 ${size/3}px ${color}15`,
        border: `1px solid ${color}25`,
        backdropFilter: 'blur(2px)',
        filter: blur ? `blur(${blur}px)` : 'none',
        pointerEvents: 'none',
        zIndex: 0,
        transform: 'translateZ(0)',
      }}
    />
  )
}

// ─── 3D Wireframe Cube ────────────────────────────────────────────────────────
function WireframeCube({ size = 80, x, y, duration = 12, delay = 0, opacity = 0.25 }) {
  const face = (transform, border = '1px solid rgba(168,85,247,0.35)') => ({
    position: 'absolute',
    width: size, height: size,
    border,
    transform,
    background: 'rgba(124,58,237,0.04)',
    backdropFilter: 'blur(1px)',
  })
  return (
    <motion.div
      animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
      style={{
        position: 'absolute',
        left: x, top: y,
        width: size, height: size,
        transformStyle: 'preserve-3d',
        perspective: 800,
        opacity,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <div style={face(`rotateY(0deg) translateZ(${size/2}px)`)} />
      <div style={face(`rotateY(90deg) translateZ(${size/2}px)`)} />
      <div style={face(`rotateY(180deg) translateZ(${size/2}px)`)} />
      <div style={face(`rotateY(-90deg) translateZ(${size/2}px)`)} />
      <div style={face(`rotateX(90deg) translateZ(${size/2}px)`)} />
      <div style={face(`rotateX(-90deg) translateZ(${size/2}px)`)} />
    </motion.div>
  )
}

// ─── 3D Ring ──────────────────────────────────────────────────────────────────
function Ring3D({ size = 120, x, y, duration = 8, delay = 0, color = '#7c3aed' }) {
  return (
    <motion.div
      animate={{ rotateX: [20, 80, 20], rotateY: [0, 360] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
      style={{
        position: 'absolute',
        left: x, top: y,
        width: size, height: size,
        borderRadius: '50%',
        border: `2px solid ${color}45`,
        boxShadow: `0 0 20px ${color}20, inset 0 0 20px ${color}10`,
        transformStyle: 'preserve-3d',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: '50%', left: '10%',
        width: '80%', height: '80%',
        marginTop: '-40%',
        borderRadius: '50%',
        border: `1px solid ${color}25`,
      }} />
    </motion.div>
  )
}

// ─── 3D Tilt Card ─────────────────────────────────────────────────────────────
function TiltCard({ children, style = {} }) {
  const ref = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0, glow: false })

  const handleMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width - 0.5
    const cy = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: cy * -14, y: cx * 14, glow: true })
  }, [])

  const handleLeave = useCallback(() => {
    setTilt({ x: 0, y: 0, glow: false })
  }, [])

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        scale: tilt.glow ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 800,
        cursor: 'default',
        ...style,
      }}
    >
      <div style={{
        background: tilt.glow ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.05)',
        border: `1px solid rgba(124,58,237,${tilt.glow ? '0.35' : '0.18'})`,
        borderRadius: 16,
        padding: '32px 28px',
        transition: 'background 0.3s, border-color 0.3s',
        boxShadow: tilt.glow ? '0 20px 60px rgba(124,58,237,0.2), 0 0 0 1px rgba(168,85,247,0.1)' : 'none',
        transform: 'translateZ(20px)',
      }}>
        {children}
      </div>
    </motion.div>
  )
}

// ─── Scroll Reveal ────────────────────────────────────────────────────────────
function RevealSection({ children, delay = 0, style = {} }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 48 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }} style={style}>
      {children}
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
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  if (submitted) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: 'center', color: '#4edea3', fontSize: 17, fontWeight: 600 }}>
      ✓ You're on the list. We'll be in touch.
    </motion.div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420, margin: '0 auto' }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" type="email" style={inputStyle} />
      <motion.button onClick={handleSubmit} disabled={loading} whileHover={{ scale: 1.03, boxShadow: '0 0 48px rgba(124,58,237,0.6)' }} whileTap={{ scale: 0.97 }}
        style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '14px 28px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 0 32px rgba(124,58,237,0.4)' }}>
        {loading ? 'Joining...' : 'Join the Waitlist'}
      </motion.button>
    </div>
  )
}

const inputStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 10, color: '#e4e1ea', fontSize: 15, outline: 'none', padding: '13px 16px', width: '100%', boxSizing: 'border-box' }

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  const containerRef = useRef(null)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 600], [0, -120])
  const heroScale = useTransform(scrollY, [0, 600], [1, 0.92])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])

  const line1Words = 'YOU KNOW WHAT YOU MADE.'.split(' ')
  const line2Words = "YOU DON'T KNOW WHAT YOU LOST.".split(' ')
  const line1Duration = line1Words.length * 0.09
  const pauseBetween = 0.55
  const line2Start = 0.4 + line1Duration + pauseBetween
  const line2Duration = line2Words.length * 0.09
  const sublineDelay = line2Start + line2Duration + 0.3
  const ctaDelay = sublineDelay + 0.45

  return (
    <div ref={containerRef} style={{ background: '#05050a', minHeight: '100vh', color: '#e4e1ea', fontFamily: 'system-ui,-apple-system,sans-serif', overflowX: 'hidden' }}>
      <ShaderBackground />

      {/* ── NAV ── */}
      <motion.nav initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.1 }}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 48px', backdropFilter: 'blur(16px)', background: 'rgba(5,5,10,0.7)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#fff' }}>REVELA</div>
        <motion.a href="https://revela-app-neon.vercel.app" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', padding: '9px 20px', textDecoration: 'none', textTransform: 'uppercase', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}>
          Get Access
        </motion.a>
      </motion.nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', overflow: 'hidden', perspective: '1200px' }}>

        {/* 3D floating orbs */}
        <FloatingOrb size={320} x="-8%" y="5%" color="#7c3aed" duration={14} delay={0} blur={8} />
        <FloatingOrb size={200} x="78%" y="60%" color="#a855f7" duration={11} delay={2} blur={4} />
        <FloatingOrb size={140} x="85%" y="8%" color="#7c3aed" duration={9} delay={1} />
        <FloatingOrb size={100} x="5%" y="70%" color="#a855f7" duration={13} delay={3} />
        <FloatingOrb size={60} x="60%" y="15%" color="#c084fc" duration={7} delay={0.5} />

        {/* 3D wireframe shapes */}
        <WireframeCube size={70} x="12%" y="20%" duration={15} delay={0} opacity={0.2} />
        <WireframeCube size={45} x="82%" y="25%" duration={10} delay={2} opacity={0.15} />
        <Ring3D size={160} x="75%" y="10%" duration={12} delay={1} color="#7c3aed" />
        <Ring3D size={90} x="3%" y="55%" duration={9} delay={0.5} color="#a855f7" />
        <Ring3D size={60} x="55%" y="75%" duration={7} delay={3} color="#c084fc" />

        {/* Purple glow bloom */}
        <motion.div animate={{ opacity: [0.2, 0.38, 0.2], scale: [1, 1.12, 1] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 500, background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.22) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* Secondary glow ring */}
        <motion.div animate={{ opacity: [0.1, 0.2, 0.1], scale: [0.95, 1.05, 0.95], rotate: [0, 180, 360] }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, borderRadius: '50%', border: '1px solid rgba(168,85,247,0.12)', boxShadow: '0 0 80px rgba(124,58,237,0.08)', pointerEvents: 'none', zIndex: 0 }} />

        {/* Hero content — parallax on scroll */}
        <motion.div style={{ y: heroY, scale: heroScale, opacity: heroOpacity, zIndex: 1, width: '100%' }}>

          {/* Eyebrow */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 1 }}
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 48 }}>
            Business Intelligence · Powered by Data Science
          </motion.div>

          {/* 3D extruded headline — Line 1 */}
          <div style={{ overflow: 'hidden', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 0.22em', marginBottom: '0.04em' }}>
            {line1Words.map((word, i) => (
              <motion.span key={i}
                initial={{ y: '115%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.09, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: 'inline-block',
                  fontSize: 'clamp(34px,6.2vw,86px)',
                  fontWeight: 900,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.0,
                  color: '#e4e1ea',
                  // 3D text depth via layered shadow
                  textShadow: `
                    0 1px 0 rgba(124,58,237,0.6),
                    0 2px 0 rgba(124,58,237,0.45),
                    0 3px 0 rgba(124,58,237,0.3),
                    0 4px 0 rgba(124,58,237,0.18),
                    0 5px 0 rgba(124,58,237,0.1),
                    0 8px 20px rgba(124,58,237,0.25),
                    0 16px 40px rgba(0,0,0,0.5)
                  `,
                }}>
                {word}
              </motion.span>
            ))}
          </div>

          {/* Pause line */}
          <motion.div initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.4 + line1Duration + 0.1, duration: pauseBetween * 0.7, ease: [0.16,1,0.3,1] }}
            style={{ width: 48, height: 1.5, background: 'linear-gradient(90deg,transparent,#7c3aed,transparent)', margin: '18px auto', transformOrigin: 'center', zIndex: 1 }} />

          {/* Line 2 */}
          <div style={{ overflow: 'hidden', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 0.22em' }}>
            {line2Words.map((word, i) => (
              <motion.span key={i}
                initial={{ y: '115%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ delay: line2Start + i * 0.09, duration: 0.8, ease: [0.16,1,0.3,1] }}
                style={{
                  display: 'inline-block',
                  fontSize: 'clamp(34px,6.2vw,86px)',
                  fontWeight: 900,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.0,
                  color: '#a855f7',
                  textShadow: `
                    0 1px 0 rgba(168,85,247,0.7),
                    0 2px 0 rgba(168,85,247,0.5),
                    0 3px 0 rgba(168,85,247,0.3),
                    0 4px 0 rgba(168,85,247,0.18),
                    0 6px 0 rgba(168,85,247,0.1),
                    0 8px 24px rgba(168,85,247,0.3),
                    0 20px 50px rgba(0,0,0,0.5)
                  `,
                }}>
                {word}
              </motion.span>
            ))}
          </div>

          {/* Subline */}
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: sublineDelay, duration: 0.9 }}
            style={{ fontSize: 'clamp(15px,1.8vw,19px)', color: '#6a5f80', fontWeight: 400, maxWidth: 520, lineHeight: 1.7, margin: '36px auto 0' }}>
            Upload your sales data. Revela's data science engine finds exactly where your business is losing money — in plain English.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ctaDelay, duration: 0.9 }}
            style={{ marginTop: 52, display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <motion.a href="https://revela-app-neon.vercel.app" whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(124,58,237,0.65)', y: -3 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 300 }}
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius: 12, color: '#fff', display: 'inline-block', fontSize: 14, fontWeight: 700, letterSpacing: '0.12em', padding: '16px 36px', textDecoration: 'none', textTransform: 'uppercase', boxShadow: '0 0 40px rgba(124,58,237,0.45)', transform: 'translateZ(0)' }}>
              Analyze My Business Free
            </motion.a>
            <motion.a href="#how-it-works" whileHover={{ color: '#a855f7', borderColor: 'rgba(168,85,247,0.5)', y: -2 }}
              style={{ border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, color: '#9999bb', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, letterSpacing: '0.08em', padding: '16px 28px', textDecoration: 'none', textTransform: 'uppercase', backdropFilter: 'blur(8px)', transition: 'color 0.2s, border-color 0.2s' }}>
              See How It Works ↓
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.45, 0] }} transition={{ delay: ctaDelay + 1.5, duration: 2.5, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', fontSize: 11, letterSpacing: '0.2em', color: '#6a5f80', textTransform: 'uppercase' }}>
          scroll
        </motion.div>
      </section>

      {/* ── STAT STRIP ── */}
      <RevealSection style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 40 }}>
          {[
            { value: '23%', label: 'Average revenue leak found' },
            { value: '<2 min', label: 'To your first insight' },
            { value: '$0', label: 'To run your first report' },
          ].map((stat, i) => (
            <motion.div key={i} whileHover={{ scale: 1.06, y: -4 }} transition={{ type: 'spring', stiffness: 300 }} style={{ textAlign: 'center', cursor: 'default' }}>
              <div style={{ fontSize: 'clamp(36px,5vw,60px)', fontWeight: 900, color: '#a855f7', letterSpacing: '-0.02em', textShadow: '0 0 40px rgba(168,85,247,0.4)' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#6a5f80', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 8 }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </RevealSection>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ position: 'relative', zIndex: 1, padding: '120px 24px', overflow: 'hidden' }}>
        {/* Background 3D shapes */}
        <WireframeCube size={100} x="5%" y="10%" duration={20} delay={0} opacity={0.1} />
        <Ring3D size={200} x="88%" y="40%" duration={16} delay={2} color="#7c3aed" />

        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <RevealSection>
            <div style={{ textAlign: 'center', marginBottom: 80 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 20 }}>The Process</div>
              <div style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, color: '#e4e1ea', lineHeight: 1.1 }}>
                Three steps.<br /><span style={{ color: '#a855f7' }}>Real answers.</span>
              </div>
            </div>
          </RevealSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24 }}>
            {[
              { step: '01', icon: '↑', title: 'Upload Your Data', desc: 'CSV, Excel, QuickBooks export — anything. Revela reads it in seconds. No reformatting required.' },
              { step: '02', icon: '⬡', title: 'The Engine Runs', desc: 'A Python data science engine cleans, analyzes, and stress-tests every number. No guessing.' },
              { step: '03', icon: '◎', title: 'Get Your Briefing', desc: 'Plain English. Your Business Health Score. Exactly where money is leaking and what to do about it.' },
            ].map((item, i) => (
              <RevealSection key={i} delay={i * 0.12}>
                <TiltCard>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', color: '#7c3aed', marginBottom: 20 }}>{item.step}</div>
                  <div style={{ fontSize: 36, marginBottom: 20, color: '#a855f7', textShadow: '0 0 20px rgba(168,85,247,0.5)' }}>{item.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#e4e1ea', marginBottom: 14, letterSpacing: '-0.01em' }}>{item.title}</div>
                  <div style={{ fontSize: 15, color: '#6a5f80', lineHeight: 1.7 }}>{item.desc}</div>
                </TiltCard>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px 120px', overflow: 'hidden' }}>
        <FloatingOrb size={400} x="60%" y="20%" color="#7c3aed" duration={18} delay={0} blur={20} />

        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <RevealSection>
            <div style={{ textAlign: 'center', marginBottom: 72 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 20 }}>What You Get</div>
              <div style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, color: '#e4e1ea', lineHeight: 1.1 }}>
                Every angle.<br /><span style={{ color: '#a855f7' }}>One score.</span>
              </div>
            </div>
          </RevealSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
            {[
              { icon: '◉', title: 'Business Health Score', desc: 'One number, 0–100, updated every week. Know where you actually stand.' },
              { icon: '⚠', title: 'Revenue Leak Detector', desc: 'Finds silent money drains — late invoices, underpriced services, overspend.' },
              { icon: '☀', title: 'Monday Briefing', desc: 'Plain English email every Monday. What changed, what it means, what to do.' },
              { icon: '◈', title: 'Cash Flow Forecast', desc: '30, 60, and 90-day projections so you stop guessing what next month looks like.' },
              { icon: '⬡', title: 'Pricing Optimizer', desc: 'See current vs recommended pricing by product or service line.' },
              { icon: '⊹', title: 'Expense Anomaly Alerts', desc: 'Unusual spending gets flagged before it becomes a pattern.' },
            ].map((f, i) => (
              <RevealSection key={i} delay={i * 0.07}>
                <TiltCard>
                  <div style={{ fontSize: 32, marginBottom: 16, textShadow: '0 0 20px rgba(168,85,247,0.5)' }}>{f.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a855f7', marginBottom: 10 }}>{f.title}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.65, color: '#9999bb' }}>{f.desc}</div>
                </TiltCard>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM STATEMENT ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px 120px', overflow: 'hidden' }}>
        <Ring3D size={300} x="80%" y="20%" duration={20} delay={0} color="#7c3aed" />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 500, background: 'radial-gradient(ellipse at center,rgba(124,58,237,0.1) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <RevealSection>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 32 }}>The Problem</div>
          </RevealSection>
          {[
            { text: 'Most small business owners know their revenue.', size: 'clamp(17px,2.2vw,24px)', color: '#e4e1ea', weight: 400 },
            { text: "Almost none of them know where it's going.", size: 'clamp(17px,2.2vw,24px)', color: '#e4e1ea', weight: 400 },
            { text: 'Spreadsheets nobody reads. Accountants who categorize, not strategize. Dashboards that show everything except what actually matters.', size: 'clamp(14px,1.6vw,18px)', color: '#6a5f80', weight: 400 },
            { text: 'Revela fixes that.', size: 'clamp(22px,3.5vw,40px)', color: '#a855f7', weight: 900 },
          ].map((line, i) => (
            <RevealSection key={i} delay={i * 0.15} style={{ marginBottom: i < 3 ? 28 : 0 }}>
              <p style={{ fontSize: line.size, fontWeight: line.weight, color: line.color, lineHeight: 1.5, textShadow: line.weight === 900 ? '0 0 40px rgba(168,85,247,0.4)' : 'none' }}>
                {line.text}
              </p>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px 120px', overflow: 'hidden' }}>
        <WireframeCube size={120} x="2%" y="15%" duration={18} delay={1} opacity={0.12} />
        <WireframeCube size={80} x="90%" y="60%" duration={14} delay={0} opacity={0.1} />

        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <RevealSection>
            <div style={{ textAlign: 'center', marginBottom: 72 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 20 }}>Pricing</div>
              <div style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, color: '#e4e1ea', lineHeight: 1.1 }}>Simple. No surprises.</div>
            </div>
          </RevealSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24 }}>
            {[
              { name: 'Starter', price: '$49', features: ['3 data uploads/month','Business Health Score','Revenue Leak Report','AI-powered explanations','Basic charts'], cta: 'Get Started', highlight: false },
              { name: 'Growth', price: '$97', features: ['Unlimited uploads','Monday Morning Briefing','AI chat — ask your data','Historical tracking','Cash flow forecast'], cta: 'Most Popular', highlight: true },
              { name: 'Pro', price: '$197', features: ['Everything in Growth','Monthly 30-min strategy call','Priority analysis','Custom report templates','Direct Slack access'], cta: 'Go Pro', highlight: false },
            ].map((tier, i) => (
              <RevealSection key={i} delay={i * 0.12}>
                <TiltCard style={{ height: '100%' }}>
                  <div style={{ position: 'relative' }}>
                    {tier.highlight && (
                      <div style={{ position: 'absolute', top: -44, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', padding: '4px 14px', color: '#fff', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        Most Popular
                      </div>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 16 }}>{tier.name}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 28 }}>
                      <span style={{ fontSize: 52, fontWeight: 900, color: '#e4e1ea', letterSpacing: '-0.03em', textShadow: '0 0 30px rgba(168,85,247,0.2)' }}>{tier.price}</span>
                      <span style={{ fontSize: 14, color: '#6a5f80' }}>/month</span>
                    </div>
                    <div style={{ marginBottom: 32 }}>
                      {tier.features.map((f, fi) => (
                        <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <span style={{ color: '#4edea3', fontSize: 13 }}>✓</span>
                          <span style={{ fontSize: 14, color: '#9999bb' }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <motion.a href="https://revela-app-neon.vercel.app" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      style={{ display: 'block', textAlign: 'center', background: tier.highlight ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : 'transparent', border: tier.highlight ? 'none' : '1px solid rgba(124,58,237,0.35)', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', padding: '13px', textDecoration: 'none', textTransform: 'uppercase', boxShadow: tier.highlight ? '0 0 28px rgba(124,58,237,0.3)' : 'none' }}>
                      {tier.cta}
                    </motion.a>
                  </div>
                </TiltCard>
              </RevealSection>
            ))}
          </div>
          <RevealSection delay={0.3}>
            <p style={{ textAlign: 'center', color: '#6a5f80', fontSize: 14, marginTop: 32 }}>First report free. No credit card required.</p>
          </RevealSection>
        </div>
      </section>

      {/* ── WAITLIST CTA ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '100px 24px 120px', overflow: 'hidden' }}>
        <FloatingOrb size={500} x="30%" y="10%" color="#7c3aed" duration={20} delay={0} blur={30} />
        <Ring3D size={250} x="5%" y="20%" duration={15} delay={1} color="#a855f7" />

        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <RevealSection>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 24 }}>Early Access</div>
            <div style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#e4e1ea', lineHeight: 1.1, marginBottom: 18 }}>
              Find your leaks.<br /><span style={{ color: '#a855f7', textShadow: '0 0 40px rgba(168,85,247,0.4)' }}>Stop them.</span>
            </div>
            <p style={{ fontSize: 16, color: '#6a5f80', lineHeight: 1.7, marginBottom: 44 }}>
              Join the waitlist. Get early access and the first report free.
            </p>
            <WaitlistForm />
          </RevealSection>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.04)', padding: '36px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.2em', color: '#3d3550' }}>REVELA</div>
        <div style={{ fontSize: 12, color: '#3d3550', letterSpacing: '0.05em' }}>Built by a data scientist. For business owners who hate spreadsheets.</div>
      </footer>
    </div>
  )
}