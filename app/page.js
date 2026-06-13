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
      animate={{ y:[0,-30,0,20,0], x:[0,15,-10,5,0], scale:[1,1.08,0.95,1.04,1] }}
      transition={{ duration, delay, repeat:Infinity, ease:'easeInOut' }}
      style={{ position:'absolute', width:size, height:size, left:x, top:y, borderRadius:'50%', background:`radial-gradient(circle at 35% 35%, ${color}55, ${color}18 50%, transparent 70%)`, boxShadow:`0 0 ${size/2}px ${color}22, inset 0 0 ${size/3}px ${color}15`, border:`1px solid ${color}25`, pointerEvents:'none', zIndex:0 }}
    />
  )
}

// ─── Wireframe Cube ───────────────────────────────────────────────────────────
function WireframeCube({ size=80, x, y, duration=12, delay=0, opacity=0.25 }) {
  const face = (transform) => ({ position:'absolute', width:size, height:size, border:'1px solid rgba(168,85,247,0.35)', transform, background:'rgba(124,58,237,0.04)' })
  return (
    <motion.div animate={{ rotateX:[0,360], rotateY:[0,360] }} transition={{ duration, delay, repeat:Infinity, ease:'linear' }}
      style={{ position:'absolute', left:x, top:y, width:size, height:size, transformStyle:'preserve-3d', opacity, pointerEvents:'none', zIndex:0 }}>
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
function Ring3D({ size=120, x, y, duration=8, delay=0, color='#7c3aed' }) {
  return (
    <motion.div animate={{ rotateX:[20,80,20], rotateY:[0,360] }} transition={{ duration, delay, repeat:Infinity, ease:'linear' }}
      style={{ position:'absolute', left:x, top:y, width:size, height:size, borderRadius:'50%', border:`2px solid ${color}45`, boxShadow:`0 0 20px ${color}20`, transformStyle:'preserve-3d', pointerEvents:'none', zIndex:0 }} />
  )
}

// ─── 3D Tilt Card ─────────────────────────────────────────────────────────────
function TiltCard({ children, style={} }) {
  const ref = useRef(null)
  const [tilt, setTilt] = useState({ x:0, y:0, glow:false })
  const handleMove = useCallback((e) => {
    const el = ref.current; if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width - 0.5
    const cy = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x:cy*-14, y:cx*14, glow:true })
  }, [])
  const handleLeave = useCallback(() => setTilt({ x:0, y:0, glow:false }), [])
  return (
    <motion.div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      animate={{ rotateX:tilt.x, rotateY:tilt.y, scale:tilt.glow?1.02:1 }}
      transition={{ type:'spring', stiffness:300, damping:25 }}
      style={{ transformStyle:'preserve-3d', perspective:800, cursor:'default', ...style }}>
      <div style={{ background:tilt.glow?'rgba(124,58,237,0.1)':'rgba(124,58,237,0.05)', border:`1px solid rgba(124,58,237,${tilt.glow?'0.35':'0.18'})`, borderRadius:16, padding:'32px 28px', transition:'background 0.3s, border-color 0.3s', boxShadow:tilt.glow?'0 20px 60px rgba(124,58,237,0.2)':'none', transform:'translateZ(20px)' }}>
        {children}
      </div>
    </motion.div>
  )
}

// ─── Scroll Reveal ────────────────────────────────────────────────────────────
function RevealSection({ children, delay=0, style={} }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once:true, margin:'-80px' })
  return (
    <motion.div ref={ref} initial={{ opacity:0, y:48 }} animate={inView?{ opacity:1, y:0 }:{}}
      transition={{ duration:0.9, delay, ease:[0.16,1,0.3,1] }} style={style}>
      {children}
    </motion.div>
  )
}

// ─── PIPELINE ANIMATION ───────────────────────────────────────────────────────
function PipelineAnimation() {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const inView = useInView(wrapRef, { once:false, margin:'-100px' })
  const hasStarted = useRef(false)
  const animState = useRef(null)

  useEffect(() => {
    if (!inView) return
    if (hasStarted.current) return
    hasStarted.current = true

    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const W = wrap.offsetWidth
    const H = 420
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    const Z1 = W * 0.16
    const Z2 = W * 0.5
    const Z3 = W * 0.84
    const cy = H / 2

    const PURPLE = '#7c3aed', LPURPLE = '#a855f7', GREEN = '#4edea3', RED = '#ff4d6d', AMBER = '#f59e0b'

    const RAW_LABELS = ['Nov-24, $12,400, —','null, $7,100, $1,400','Oct-24, #REF!, $2,900','Aug-24, $11,200, N/A','Sep-24, $8,600, $4,100','Jul-24, $9,820, $3,200']
    const INSIGHT_LABELS = [
      { text:'Health Score', val:'74', color:LPURPLE },
      { text:'Revenue Leak', val:'$4.2K', color:RED },
      { text:'Avg Revenue', val:'$9,540', color:GREEN },
      { text:'Trend', val:'+8.2%', color:GREEN },
      { text:'Anomaly', val:'Oct dip', color:AMBER },
    ]

    function lerp(a,b,t){ return a+(b-a)*t }
    function easeInOut(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2 }
    function easeOut(t){ return 1-Math.pow(1-t,3) }
    function roundRect(ctx,x,y,w,h,r){
      ctx.beginPath()
      ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r)
      ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r)
      ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r)
      ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r)
      ctx.closePath()
    }

    class RawToken {
      constructor(i) {
        this.x = Z1 + (Math.random()-0.5)*60
        this.y = H*0.22 + i*34 + (Math.random()-0.5)*6
        this.startX = this.x; this.startY = this.y
        this.alpha = 0; this.text = RAW_LABELS[i]
        this.dirty = true; this.state = 'idle'
        this.flyProgress = 0; this.bob = Math.random()*Math.PI*2
      }
      update(dt) {
        this.bob += dt * 0.8
        if (this.state==='idle') { this.alpha = Math.min(this.alpha+dt*2.5,1); this.y+=Math.sin(this.bob)*0.12 }
        else if (this.state==='flying') {
          this.flyProgress = Math.min(this.flyProgress+dt*1.2,1)
          const t = easeInOut(this.flyProgress)
          this.x = lerp(this.startX, Z2, t); this.y = lerp(this.startY, cy, t)
          this.alpha = this.flyProgress<0.8?1:1-(this.flyProgress-0.8)/0.2
          if (this.flyProgress>=1) this.state='dead'
        }
      }
      draw() {
        if (this.alpha<=0) return
        ctx.save(); ctx.globalAlpha = this.alpha
        const w=160,h=20
        ctx.fillStyle = this.dirty?'rgba(255,77,109,0.08)':'rgba(78,222,163,0.08)'
        roundRect(ctx,this.x-w/2,this.y-h/2,w,h,4); ctx.fill()
        ctx.strokeStyle = this.dirty?'rgba(255,77,109,0.3)':'rgba(78,222,163,0.3)'
        ctx.lineWidth=0.5; roundRect(ctx,this.x-w/2,this.y-h/2,w,h,4); ctx.stroke()
        ctx.font=`9px 'Courier New',monospace`
        ctx.fillStyle = this.dirty?'rgba(255,77,109,0.8)':'rgba(78,222,163,0.9)'
        ctx.textAlign='center'; ctx.textBaseline='middle'
        ctx.fillText(this.text.substring(0,22), this.x, this.y)
        ctx.restore()
      }
    }

    class EngineParticle {
      constructor() {
        const angle=Math.random()*Math.PI*2, r=20+Math.random()*40
        this.x=Z2+Math.cos(angle)*r; this.y=cy+Math.sin(angle)*r
        this.vx=(Math.random()-0.5)*90; this.vy=(Math.random()-0.5)*90
        this.life=1; this.size=1.5+Math.random()*2.5
        this.color=Math.random()>0.5?PURPLE:LPURPLE
      }
      update(dt) { this.x+=this.vx*dt; this.y+=this.vy*dt; this.vx*=0.93; this.vy*=0.93; this.life-=dt*1.2 }
      draw() {
        if(this.life<=0)return
        ctx.save(); ctx.globalAlpha=this.life*0.8; ctx.fillStyle=this.color
        ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,Math.PI*2); ctx.fill(); ctx.restore()
      }
    }

    class OutputCard {
      constructor(i, data) {
        this.targetX=Z3+(Math.random()-0.5)*20; this.targetY=H*0.18+i*46
        this.x=Z2; this.y=cy; this.alpha=0; this.data=data
        this.progress=0; this.state='flying'
        this.startX=Z2; this.startY=cy; this.bob=Math.random()*Math.PI*2
      }
      update(dt) {
        this.bob+=dt*0.7
        if(this.state==='flying'){
          this.progress=Math.min(this.progress+dt*1.4,1)
          const t=easeOut(this.progress)
          this.x=lerp(this.startX,this.targetX,t); this.y=lerp(this.startY,this.targetY,t)
          this.alpha=this.progress; if(this.progress>=1)this.state='idle'
        } else { this.y=this.targetY+Math.sin(this.bob)*2 }
      }
      draw() {
        if(this.alpha<=0)return
        ctx.save(); ctx.globalAlpha=this.alpha
        const w=128,h=34,x=this.x-w/2,y=this.y-h/2
        ctx.shadowColor=this.data.color; ctx.shadowBlur=10*this.alpha
        ctx.fillStyle='rgba(124,58,237,0.08)'; roundRect(ctx,x,y,w,h,6); ctx.fill()
        ctx.strokeStyle=this.data.color+'66'; ctx.lineWidth=1; roundRect(ctx,x,y,w,h,6); ctx.stroke()
        ctx.shadowBlur=0
        ctx.font='8px system-ui'; ctx.fillStyle='rgba(153,153,187,0.8)'; ctx.textAlign='left'; ctx.textBaseline='middle'
        ctx.fillText(this.data.text, x+10, this.y-6)
        ctx.font='bold 13px system-ui'; ctx.fillStyle=this.data.color
        ctx.fillText(this.data.val, x+10, this.y+8)
        ctx.restore()
      }
    }

    class StreamTrail {
      constructor(fx,fy,tx,ty,color) {
        this.fx=fx;this.fy=fy;this.tx=tx;this.ty=ty;this.color=color
        this.points=[]; this.alive=true
        for(let i=0;i<8;i++) this.points.push({t:i/8,life:0.6+Math.random()*0.4})
      }
      update(dt) {
        this.points.forEach(p=>{p.t+=dt*1.5;p.life-=dt*1.5})
        this.points=this.points.filter(p=>p.life>0)
        if(this.points.length===0)this.alive=false
      }
      draw() {
        this.points.forEach(p=>{
          if(p.t>1)return
          const x=lerp(this.fx,this.tx,easeInOut(p.t)),y=lerp(this.fy,this.ty,easeInOut(p.t))
          ctx.save(); ctx.globalAlpha=p.life*0.7; ctx.fillStyle=this.color
          ctx.shadowColor=this.color; ctx.shadowBlur=6
          ctx.beginPath(); ctx.arc(x,y,2.5,0,Math.PI*2); ctx.fill(); ctx.restore()
        })
      }
    }

    class GlowRing {
      constructor(x,y,r,color){this.x=x;this.y=y;this.r=r;this.color=color;this.alpha=0.7;this.alive=true}
      update(dt){this.r+=dt*65;this.alpha-=dt*1.3;if(this.alpha<=0)this.alive=false}
      draw(){
        ctx.save();ctx.globalAlpha=this.alpha;ctx.strokeStyle=this.color
        ctx.lineWidth=1.5;ctx.shadowColor=this.color;ctx.shadowBlur=8
        ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.stroke();ctx.restore()
      }
    }

    let rawTokens=[], engineParticles=[], outputCards=[], dataStreams=[], glowRings=[]
    let bgTime=0, phase=0, engineActive=false, healthScore=0, healthTarget=0
    let lastTime=null, seqIdx=0, sequenceTimer=0

    function startFlyingTokens(){
      rawTokens.forEach((tok,i)=>{
        setTimeout(()=>{
          if(!tok)return
          tok.startX=tok.x;tok.startY=tok.y;tok.state='flying';tok.flyProgress=0
          setTimeout(()=>{
            for(let j=0;j<8;j++)engineParticles.push(new EngineParticle())
            glowRings.push(new GlowRing(Z2,cy,15,LPURPLE))
            if(i<3) dataStreams.push(new StreamTrail(Z2,cy,Z3-65,H*0.18+i*46,LPURPLE))
          },700)
        },i*200)
      })
    }

    function startOutputCards(){
      INSIGHT_LABELS.forEach((data,i)=>{
        setTimeout(()=>{
          outputCards.push(new OutputCard(i,data))
          glowRings.push(new GlowRing(Z3,H*0.18+i*46,8,data.color))
        },i*280)
      })
    }

    const SEQ=[
      {t:0.3,fn:()=>{ phase=1; rawTokens=RAW_LABELS.map((_,i)=>new RawToken(i)) }},
      {t:1.5,fn:()=>{ phase=2; engineActive=true; startFlyingTokens() }},
      {t:2.8,fn:()=>{ phase=3; healthTarget=74; startOutputCards() }},
    ]

    function drawBg(){
      ctx.fillStyle='#05050a'; ctx.fillRect(0,0,W,H)
      for(let i=0;i<5;i++){
        ctx.save(); ctx.globalAlpha=0.025+Math.sin(bgTime*0.4+i)*0.01
        ctx.strokeStyle='#7c3aed'; ctx.lineWidth=1
        ctx.beginPath(); ctx.moveTo(0,H*(0.25+i*0.12)+Math.sin(bgTime*0.3+i)*8)
        for(let x=0;x<W;x+=24) ctx.lineTo(x,H*(0.25+i*0.12)+Math.sin(bgTime*0.3+i+x*0.01)*8)
        ctx.stroke(); ctx.restore()
      }
      const divX1=Z1+W*0.17, divX2=Z2+W*0.17
      ;[divX1,divX2].forEach(x=>{
        const g=ctx.createLinearGradient(x,0,x,H)
        g.addColorStop(0,'transparent');g.addColorStop(0.5,'rgba(124,58,237,0.1)');g.addColorStop(1,'transparent')
        ctx.fillStyle=g; ctx.fillRect(x,0,1,H)
      })
    }

    function drawEngine(){
      const x=Z2,y=cy
      const pulse=engineActive?0.5+Math.sin(bgTime*4)*0.3:0.15
      const grad=ctx.createRadialGradient(x,y,0,x,y,80)
      grad.addColorStop(0,`rgba(124,58,237,${pulse*0.25})`); grad.addColorStop(1,'transparent')
      ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(x,y,80,0,Math.PI*2); ctx.fill()
      for(let r=0;r<3;r++){
        const radius=38+r*16, speed=(r%2===0?1:-1)*(0.4+r*0.2)
        ctx.save(); ctx.translate(x,y); ctx.rotate(bgTime*speed)
        ctx.strokeStyle=`rgba(${r===0?'168,85,247':r===1?'124,58,237':'192,132,252'},${0.3+pulse*0.3})`
        ctx.lineWidth=r===0?1.5:1
        if(r===2)ctx.setLineDash([4,8])
        ctx.beginPath(); ctx.arc(0,0,radius,0,Math.PI*1.8); ctx.stroke()
        ctx.setLineDash([])
        const dx=Math.cos(bgTime*speed)*radius, dy=Math.sin(bgTime*speed)*radius
        ctx.fillStyle=r===0?LPURPLE:PURPLE; ctx.globalAlpha=0.8
        ctx.beginPath(); ctx.arc(dx,dy,2.5,0,Math.PI*2); ctx.fill()
        ctx.restore()
      }
      ctx.save()
      ctx.shadowColor=LPURPLE; ctx.shadowBlur=engineActive?20:8
      ctx.strokeStyle=`rgba(168,85,247,${0.5+pulse*0.4})`; ctx.lineWidth=1.5
      ctx.beginPath(); ctx.arc(x,y,22,0,Math.PI*2); ctx.stroke()
      ctx.fillStyle=`rgba(124,58,237,${0.1+pulse*0.15})`; ctx.fill()
      ctx.fillStyle=`rgba(168,85,247,${0.7+pulse*0.3})`; ctx.font='18px system-ui'
      ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('⬡',x,y)
      ctx.restore()
      if(healthScore>0){
        ctx.save(); ctx.shadowColor=LPURPLE; ctx.shadowBlur=15
        ctx.font='bold 16px system-ui'; ctx.fillStyle=LPURPLE
        ctx.textAlign='center'; ctx.textBaseline='middle'
        ctx.fillText(Math.round(healthScore),x,y+52)
        ctx.font='8px system-ui'; ctx.fillStyle='rgba(153,153,187,0.6)'
        ctx.fillText('HEALTH',x,y+64); ctx.restore()
      }
    }

    function drawPaths(){
      const la=phase>=1?0.15+Math.sin(bgTime*2)*0.05:0.05
      const ra=phase>=3?0.15+Math.sin(bgTime*2+1)*0.05:0.05
      drawArrow(Z1+80,cy,Z2-42,cy,la,PURPLE)
      drawArrow(Z2+42,cy,Z3-68,cy,ra,LPURPLE)
    }

    function drawArrow(x1,y1,x2,y2,alpha,color){
      ctx.save(); ctx.globalAlpha=alpha; ctx.strokeStyle=color; ctx.lineWidth=1
      ctx.setLineDash([6,8]); ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke()
      ctx.setLineDash([])
      const angle=Math.atan2(y2-y1,x2-x1)
      ctx.fillStyle=color; ctx.globalAlpha=alpha*2
      ctx.beginPath(); ctx.moveTo(x2,y2)
      ctx.lineTo(x2-10*Math.cos(angle-0.4),y2-10*Math.sin(angle-0.4))
      ctx.lineTo(x2-10*Math.cos(angle+0.4),y2-10*Math.sin(angle+0.4))
      ctx.closePath(); ctx.fill(); ctx.restore()
    }

    function drawZoneLabels(){
      ctx.save(); ctx.font='9px system-ui'; ctx.letterSpacing='0.2em'
      ;[
        {label:'RAW DATA',x:Z1,alpha:0.5},
        {label:'ENGINE',x:Z2,alpha:0.5},
        {label:'INSIGHTS',x:Z3,alpha:0.5},
      ].forEach(({label,x,alpha})=>{
        ctx.globalAlpha=alpha; ctx.fillStyle='#a855f7'
        ctx.textAlign='center'; ctx.textBaseline='top'
        ctx.fillText(label,x,14)
      })
      ctx.restore()
    }

    let raf
    function tick(ts){
      if(!lastTime)lastTime=ts
      const dt=Math.min((ts-lastTime)/1000,0.05); lastTime=ts; bgTime+=dt; sequenceTimer+=dt
      if(seqIdx<SEQ.length&&sequenceTimer>=SEQ[seqIdx].t){ SEQ[seqIdx].fn(); seqIdx++ }
      if(healthTarget>0&&healthScore<healthTarget) healthScore=Math.min(healthScore+dt*35,healthTarget)
      if(engineActive&&Math.random()<0.3) engineParticles.push(new EngineParticle())
      drawBg(); drawPaths(); drawZoneLabels()
      dataStreams.forEach(s=>s.update(dt)); dataStreams=dataStreams.filter(s=>s.alive); dataStreams.forEach(s=>s.draw())
      rawTokens.forEach(t=>t.update(dt)); rawTokens.filter(t=>t.state!=='dead').forEach(t=>t.draw())
      drawEngine()
      engineParticles.forEach(p=>p.update(dt)); engineParticles=engineParticles.filter(p=>p.life>0); engineParticles.forEach(p=>p.draw())
      outputCards.forEach(c=>c.update(dt)); outputCards.forEach(c=>c.draw())
      glowRings.forEach(r=>r.update(dt)); glowRings=glowRings.filter(r=>r.alive); glowRings.forEach(r=>r.draw())
      raf=requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    animState.current = { raf, reset: () => {
      cancelAnimationFrame(raf)
      rawTokens=[];engineParticles=[];outputCards=[];dataStreams=[];glowRings=[]
      phase=0;engineActive=false;healthScore=0;healthTarget=0
      sequenceTimer=0;seqIdx=0;bgTime=0;lastTime=null
      hasStarted.current=false
    }}

    return () => { cancelAnimationFrame(raf) }
  }, [inView])

  return (
    <div ref={wrapRef} style={{ position:'relative', width:'100%', borderRadius:16, overflow:'hidden', border:'1px solid rgba(124,58,237,0.2)' }}>
      <canvas ref={canvasRef} style={{ display:'block', width:'100%', height:420 }} />
    </div>
  )
}

// ─── Waitlist Form ────────────────────────────────────────────────────────────
function WaitlistForm() {
  const [email,setEmail]=useState(''); const [name,setName]=useState(''); const [submitted,setSubmitted]=useState(false); const [loading,setLoading]=useState(false)
  const handleSubmit = async () => {
    if(!email)return; setLoading(true)
    try {
      const {createClient}=await import('@supabase/supabase-js')
      const supabase=createClient('https://tdiwozgrrzpmzubulfcq.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaXdvemdycnpwbXp1YnVsZmNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzA5ODEsImV4cCI6MjA5MTk0Njk4MX0.fTBwKhRfaPq9fNQdt3rau2qkr2NZNBixNiH217lXS28')
      await supabase.from('waitlist').insert([{name,email}]); setSubmitted(true)
    } catch(e){console.error(e)}
    setLoading(false)
  }
  if(submitted) return <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} style={{textAlign:'center',color:'#4edea3',fontSize:17,fontWeight:600}}>✓ You're on the list. We'll be in touch.</motion.div>
  return (
    <div style={{display:'flex',flexDirection:'column',gap:12,maxWidth:420,margin:'0 auto'}}>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={inputStyle} />
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email" type="email" style={inputStyle} />
      <motion.button onClick={handleSubmit} disabled={loading} whileHover={{scale:1.03,boxShadow:'0 0 48px rgba(124,58,237,0.6)'}} whileTap={{scale:0.97}}
        style={{background:'linear-gradient(135deg,#7c3aed,#a855f7)',border:'none',borderRadius:10,color:'#fff',fontSize:14,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',padding:'14px 28px',cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,boxShadow:'0 0 32px rgba(124,58,237,0.4)'}}>
        {loading?'Joining...':'Join the Waitlist'}
      </motion.button>
    </div>
  )
}

const inputStyle={background:'rgba(255,255,255,0.04)',border:'1px solid rgba(124,58,237,0.25)',borderRadius:10,color:'#e4e1ea',fontSize:15,outline:'none',padding:'13px 16px',width:'100%',boxSizing:'border-box'}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0,600], [0,-120])
  const heroScale = useTransform(scrollY, [0,600], [1,0.92])
  const heroOpacity = useTransform(scrollY, [0,400], [1,0])

  const line1Words = 'YOU KNOW WHAT YOU MADE.'.split(' ')
  const line2Words = "YOU DON'T KNOW WHAT YOU LOST.".split(' ')
  const line1Duration = line1Words.length * 0.09
  const pauseBetween = 0.55
  const line2Start = 0.4 + line1Duration + pauseBetween
  const line2Duration = line2Words.length * 0.09
  const sublineDelay = line2Start + line2Duration + 0.3
  const ctaDelay = sublineDelay + 0.45

  return (
    <div style={{background:'#05050a',minHeight:'100vh',color:'#e4e1ea',fontFamily:'system-ui,-apple-system,sans-serif',overflowX:'hidden'}}>
      <ShaderBackground />

      {/* NAV */}
      <motion.nav initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} transition={{duration:1,delay:0.1}}
        style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'22px 48px',backdropFilter:'blur(16px)',background:'rgba(5,5,10,0.7)',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
        <div style={{fontSize:15,fontWeight:800,letterSpacing:'0.22em',textTransform:'uppercase',color:'#fff'}}>REVELA</div>
        <motion.a href="https://revela-app-neon.vercel.app" whileHover={{scale:1.05}} whileTap={{scale:0.97}}
          style={{background:'linear-gradient(135deg,#7c3aed,#a855f7)',borderRadius:8,color:'#fff',fontSize:12,fontWeight:700,letterSpacing:'0.12em',padding:'9px 20px',textDecoration:'none',textTransform:'uppercase',boxShadow:'0 0 20px rgba(124,58,237,0.35)'}}>
          Get Access
        </motion.a>
      </motion.nav>

      {/* HERO */}
      <section style={{position:'relative',zIndex:1,minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'120px 24px 80px',overflow:'hidden',perspective:'1200px'}}>
        <FloatingOrb size={320} x="-8%" y="5%" color="#7c3aed" duration={14} delay={0} blur={8} />
        <FloatingOrb size={200} x="78%" y="60%" color="#a855f7" duration={11} delay={2} blur={4} />
        <FloatingOrb size={140} x="85%" y="8%" color="#7c3aed" duration={9} delay={1} />
        <FloatingOrb size={100} x="5%" y="70%" color="#a855f7" duration={13} delay={3} />
        <WireframeCube size={70} x="12%" y="20%" duration={15} delay={0} opacity={0.2} />
        <WireframeCube size={45} x="82%" y="25%" duration={10} delay={2} opacity={0.15} />
        <Ring3D size={160} x="75%" y="10%" duration={12} delay={1} color="#7c3aed" />
        <Ring3D size={90} x="3%" y="55%" duration={9} delay={0.5} color="#a855f7" />

        <motion.div animate={{opacity:[0.2,0.38,0.2],scale:[1,1.12,1]}} transition={{duration:5,repeat:Infinity}}
          style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:900,height:500,background:'radial-gradient(ellipse at center,rgba(124,58,237,0.22) 0%,transparent 65%)',pointerEvents:'none',zIndex:0}} />

        <motion.div style={{y:heroY,scale:heroScale,opacity:heroOpacity,zIndex:1,width:'100%'}}>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2,duration:1}}
            style={{fontSize:11,fontWeight:700,letterSpacing:'0.28em',textTransform:'uppercase',color:'#7c3aed',marginBottom:48}}>
            Business Intelligence · Powered by Data Science
          </motion.div>

          <div style={{overflow:'hidden',display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'0 0.22em',marginBottom:'0.04em'}}>
            {line1Words.map((word,i)=>(
              <motion.span key={i} initial={{y:'115%',opacity:0}} animate={{y:'0%',opacity:1}}
                transition={{delay:0.4+i*0.09,duration:0.8,ease:[0.16,1,0.3,1]}}
                style={{display:'inline-block',fontSize:'clamp(34px,6.2vw,86px)',fontWeight:900,letterSpacing:'-0.01em',lineHeight:1.0,color:'#e4e1ea',
                  textShadow:'0 1px 0 rgba(124,58,237,0.6),0 2px 0 rgba(124,58,237,0.45),0 3px 0 rgba(124,58,237,0.3),0 4px 0 rgba(124,58,237,0.18),0 8px 20px rgba(124,58,237,0.25),0 16px 40px rgba(0,0,0,0.5)'}}>
                {word}
              </motion.span>
            ))}
          </div>

          <motion.div initial={{scaleX:0,opacity:0}} animate={{scaleX:1,opacity:1}}
            transition={{delay:0.4+line1Duration+0.1,duration:pauseBetween*0.7,ease:[0.16,1,0.3,1]}}
            style={{width:48,height:1.5,background:'linear-gradient(90deg,transparent,#7c3aed,transparent)',margin:'18px auto',transformOrigin:'center'}} />

          <div style={{overflow:'hidden',display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'0 0.22em'}}>
            {line2Words.map((word,i)=>(
              <motion.span key={i} initial={{y:'115%',opacity:0}} animate={{y:'0%',opacity:1}}
                transition={{delay:line2Start+i*0.09,duration:0.8,ease:[0.16,1,0.3,1]}}
                style={{display:'inline-block',fontSize:'clamp(34px,6.2vw,86px)',fontWeight:900,letterSpacing:'-0.01em',lineHeight:1.0,color:'#a855f7',
                  textShadow:'0 1px 0 rgba(168,85,247,0.7),0 2px 0 rgba(168,85,247,0.5),0 3px 0 rgba(168,85,247,0.3),0 5px 0 rgba(168,85,247,0.1),0 8px 24px rgba(168,85,247,0.3),0 20px 50px rgba(0,0,0,0.5)'}}>
                {word}
              </motion.span>
            ))}
          </div>

          <motion.p initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:sublineDelay,duration:0.9}}
            style={{fontSize:'clamp(15px,1.8vw,19px)',color:'#6a5f80',fontWeight:400,maxWidth:520,lineHeight:1.7,margin:'36px auto 0'}}>
            Upload your sales data. Revela's data science engine finds exactly where your business is losing money — in plain English.
          </motion.p>

          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:ctaDelay,duration:0.9}}
            style={{marginTop:52,display:'flex',gap:16,flexWrap:'wrap',justifyContent:'center'}}>
            <motion.a href="https://revela-app-neon.vercel.app" whileHover={{scale:1.05,boxShadow:'0 0 60px rgba(124,58,237,0.65)',y:-3}} whileTap={{scale:0.97}}
              style={{background:'linear-gradient(135deg,#7c3aed,#a855f7)',borderRadius:12,color:'#fff',display:'inline-block',fontSize:14,fontWeight:700,letterSpacing:'0.12em',padding:'16px 36px',textDecoration:'none',textTransform:'uppercase',boxShadow:'0 0 40px rgba(124,58,237,0.45)'}}>
              Analyze My Business Free
            </motion.a>
            <motion.a href="#pipeline" whileHover={{color:'#a855f7',borderColor:'rgba(168,85,247,0.5)'}}
              style={{border:'1px solid rgba(124,58,237,0.3)',borderRadius:12,color:'#9999bb',display:'inline-flex',alignItems:'center',gap:8,fontSize:14,fontWeight:600,letterSpacing:'0.08em',padding:'16px 28px',textDecoration:'none',textTransform:'uppercase',backdropFilter:'blur(8px)',transition:'color 0.2s,border-color 0.2s'}}>
              See It Work ↓
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div initial={{opacity:0}} animate={{opacity:[0,0.45,0]}} transition={{delay:ctaDelay+1.5,duration:2.5,repeat:Infinity}}
          style={{position:'absolute',bottom:36,left:'50%',transform:'translateX(-50%)',fontSize:11,letterSpacing:'0.2em',color:'#6a5f80',textTransform:'uppercase'}}>
          scroll
        </motion.div>
      </section>

      {/* PIPELINE ANIMATION SECTION */}
      <section id="pipeline" style={{position:'relative',zIndex:1,padding:'80px 24px 100px',overflow:'hidden'}}>
        <Ring3D size={200} x="88%" y="10%" duration={16} delay={2} color="#7c3aed" />
        <div style={{maxWidth:960,margin:'0 auto'}}>
          <RevealSection>
            <div style={{textAlign:'center',marginBottom:48}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.28em',textTransform:'uppercase',color:'#7c3aed',marginBottom:20}}>Watch It Work</div>
              <div style={{fontSize:'clamp(24px,3.5vw,44px)',fontWeight:900,color:'#e4e1ea',lineHeight:1.1}}>
                Raw data in.<br /><span style={{color:'#a855f7'}}>Answers out.</span>
              </div>
              <p style={{fontSize:15,color:'#6a5f80',maxWidth:460,margin:'16px auto 0',lineHeight:1.7}}>
                Watch Revela clean your data, run the engine, and surface exactly where money is leaking — in real time.
              </p>
            </div>
          </RevealSection>
          <RevealSection delay={0.2}>
            <PipelineAnimation />
          </RevealSection>
        </div>
      </section>

      {/* STAT STRIP */}
      <RevealSection style={{position:'relative',zIndex:1,borderTop:'1px solid rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.04)',padding:'60px 24px'}}>
        <div style={{maxWidth:900,margin:'0 auto',display:'flex',justifyContent:'space-around',flexWrap:'wrap',gap:40}}>
          {[{value:'23%',label:'Average revenue leak found'},{value:'<2 min',label:'To your first insight'},{value:'$0',label:'To run your first report'}].map((stat,i)=>(
            <motion.div key={i} whileHover={{scale:1.06,y:-4}} transition={{type:'spring',stiffness:300}} style={{textAlign:'center',cursor:'default'}}>
              <div style={{fontSize:'clamp(36px,5vw,60px)',fontWeight:900,color:'#a855f7',letterSpacing:'-0.02em',textShadow:'0 0 40px rgba(168,85,247,0.4)'}}>{stat.value}</div>
              <div style={{fontSize:12,color:'#6a5f80',letterSpacing:'0.1em',textTransform:'uppercase',marginTop:8}}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </RevealSection>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{position:'relative',zIndex:1,padding:'120px 24px',overflow:'hidden'}}>
        <WireframeCube size={100} x="5%" y="10%" duration={20} delay={0} opacity={0.1} />
        <Ring3D size={200} x="88%" y="40%" duration={16} delay={2} color="#7c3aed" />
        <div style={{maxWidth:1000,margin:'0 auto'}}>
          <RevealSection>
            <div style={{textAlign:'center',marginBottom:80}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.28em',textTransform:'uppercase',color:'#7c3aed',marginBottom:20}}>The Process</div>
              <div style={{fontSize:'clamp(28px,4vw,52px)',fontWeight:900,color:'#e4e1ea',lineHeight:1.1}}>Three steps.<br /><span style={{color:'#a855f7'}}>Real answers.</span></div>
            </div>
          </RevealSection>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:24}}>
            {[
              {step:'01',icon:'↑',title:'Upload Your Data',desc:'CSV, Excel, QuickBooks export — anything. Revela reads it in seconds. No reformatting required.'},
              {step:'02',icon:'⬡',title:'The Engine Runs',desc:'A Python data science engine cleans, analyzes, and stress-tests every number. No guessing.'},
              {step:'03',icon:'◎',title:'Get Your Briefing',desc:'Plain English. Your Business Health Score. Exactly where money is leaking and what to do about it.'},
            ].map((item,i)=>(
              <RevealSection key={i} delay={i*0.12}>
                <TiltCard>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.22em',color:'#7c3aed',marginBottom:20}}>{item.step}</div>
                  <div style={{fontSize:36,marginBottom:20,color:'#a855f7',textShadow:'0 0 20px rgba(168,85,247,0.5)'}}>{item.icon}</div>
                  <div style={{fontSize:18,fontWeight:800,color:'#e4e1ea',marginBottom:14}}>{item.title}</div>
                  <div style={{fontSize:15,color:'#6a5f80',lineHeight:1.7}}>{item.desc}</div>
                </TiltCard>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{position:'relative',zIndex:1,padding:'80px 24px 120px',overflow:'hidden'}}>
        <FloatingOrb size={400} x="60%" y="20%" color="#7c3aed" duration={18} delay={0} blur={20} />
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <RevealSection>
            <div style={{textAlign:'center',marginBottom:72}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.28em',textTransform:'uppercase',color:'#7c3aed',marginBottom:20}}>What You Get</div>
              <div style={{fontSize:'clamp(28px,4vw,52px)',fontWeight:900,color:'#e4e1ea',lineHeight:1.1}}>Every angle.<br /><span style={{color:'#a855f7'}}>One score.</span></div>
            </div>
          </RevealSection>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20}}>
            {[
              {icon:'◉',title:'Business Health Score',desc:'One number, 0–100, updated every week. Know where you actually stand.'},
              {icon:'⚠',title:'Revenue Leak Detector',desc:'Finds silent money drains — late invoices, underpriced services, overspend.'},
              {icon:'☀',title:'Monday Briefing',desc:'Plain English email every Monday. What changed, what it means, what to do.'},
              {icon:'◈',title:'Cash Flow Forecast',desc:'30, 60, and 90-day projections so you stop guessing what next month looks like.'},
              {icon:'⬡',title:'Pricing Optimizer',desc:'See current vs recommended pricing by product or service line.'},
              {icon:'⊹',title:'Expense Anomaly Alerts',desc:'Unusual spending gets flagged before it becomes a pattern.'},
            ].map((f,i)=>(
              <RevealSection key={i} delay={i*0.07}>
                <TiltCard>
                  <div style={{fontSize:32,marginBottom:16,textShadow:'0 0 20px rgba(168,85,247,0.5)'}}>{f.icon}</div>
                  <div style={{fontSize:15,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'#a855f7',marginBottom:10}}>{f.title}</div>
                  <div style={{fontSize:15,lineHeight:1.65,color:'#9999bb'}}>{f.desc}</div>
                </TiltCard>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{position:'relative',zIndex:1,padding:'80px 24px 120px',overflow:'hidden'}}>
        <Ring3D size={300} x="80%" y="20%" duration={20} delay={0} color="#7c3aed" />
        <div style={{maxWidth:780,margin:'0 auto',textAlign:'center',position:'relative'}}>
          <RevealSection><div style={{fontSize:11,fontWeight:700,letterSpacing:'0.28em',textTransform:'uppercase',color:'#7c3aed',marginBottom:32}}>The Problem</div></RevealSection>
          {[
            {text:'Most small business owners know their revenue.',s:'clamp(17px,2.2vw,24px)',c:'#e4e1ea',w:400},
            {text:"Almost none of them know where it's going.",s:'clamp(17px,2.2vw,24px)',c:'#e4e1ea',w:400},
            {text:'Spreadsheets nobody reads. Accountants who categorize, not strategize. Dashboards that show everything except what actually matters.',s:'clamp(14px,1.6vw,18px)',c:'#6a5f80',w:400},
            {text:'Revela fixes that.',s:'clamp(22px,3.5vw,40px)',c:'#a855f7',w:900},
          ].map((line,i)=>(
            <RevealSection key={i} delay={i*0.15} style={{marginBottom:i<3?28:0}}>
              <p style={{fontSize:line.s,fontWeight:line.w,color:line.c,lineHeight:1.5,textShadow:line.w===900?'0 0 40px rgba(168,85,247,0.4)':'none'}}>{line.text}</p>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{position:'relative',zIndex:1,padding:'80px 24px 120px',overflow:'hidden'}}>
        <WireframeCube size={120} x="2%" y="15%" duration={18} delay={1} opacity={0.12} />
        <WireframeCube size={80} x="90%" y="60%" duration={14} delay={0} opacity={0.1} />
        <div style={{maxWidth:1000,margin:'0 auto'}}>
          <RevealSection>
            <div style={{textAlign:'center',marginBottom:72}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.28em',textTransform:'uppercase',color:'#7c3aed',marginBottom:20}}>Pricing</div>
              <div style={{fontSize:'clamp(28px,4vw,52px)',fontWeight:900,color:'#e4e1ea',lineHeight:1.1}}>Simple. No surprises.</div>
            </div>
          </RevealSection>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:24}}>
            {[
              {name:'Starter',price:'$49',features:['3 data uploads/month','Business Health Score','Revenue Leak Report','AI-powered explanations','Basic charts'],cta:'Get Started',highlight:false},
              {name:'Growth',price:'$97',features:['Unlimited uploads','Monday Morning Briefing','AI chat — ask your data','Historical tracking','Cash flow forecast'],cta:'Most Popular',highlight:true},
              {name:'Pro',price:'$197',features:['Everything in Growth','Monthly 30-min strategy call','Priority analysis','Custom report templates','Direct Slack access'],cta:'Go Pro',highlight:false},
            ].map((tier,i)=>(
              <RevealSection key={i} delay={i*0.12}>
                <TiltCard>
                  <div style={{position:'relative'}}>
                    {tier.highlight&&<div style={{position:'absolute',top:-44,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#7c3aed,#a855f7)',borderRadius:20,fontSize:11,fontWeight:700,letterSpacing:'0.12em',padding:'4px 14px',color:'#fff',textTransform:'uppercase',whiteSpace:'nowrap'}}>Most Popular</div>}
                    <div style={{fontSize:13,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'#7c3aed',marginBottom:16}}>{tier.name}</div>
                    <div style={{display:'flex',alignItems:'baseline',gap:4,marginBottom:28}}>
                      <span style={{fontSize:52,fontWeight:900,color:'#e4e1ea',letterSpacing:'-0.03em',textShadow:'0 0 30px rgba(168,85,247,0.2)'}}>{tier.price}</span>
                      <span style={{fontSize:14,color:'#6a5f80'}}>/month</span>
                    </div>
                    <div style={{marginBottom:32}}>
                      {tier.features.map((f,fi)=>(
                        <div key={fi} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                          <span style={{color:'#4edea3',fontSize:13}}>✓</span>
                          <span style={{fontSize:14,color:'#9999bb'}}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <motion.a href="https://revela-app-neon.vercel.app" whileHover={{scale:1.03}} whileTap={{scale:0.97}}
                      style={{display:'block',textAlign:'center',background:tier.highlight?'linear-gradient(135deg,#7c3aed,#a855f7)':'transparent',border:tier.highlight?'none':'1px solid rgba(124,58,237,0.35)',borderRadius:10,color:'#fff',fontSize:13,fontWeight:700,letterSpacing:'0.1em',padding:'13px',textDecoration:'none',textTransform:'uppercase',boxShadow:tier.highlight?'0 0 28px rgba(124,58,237,0.3)':'none'}}>
                      {tier.cta}
                    </motion.a>
                  </div>
                </TiltCard>
              </RevealSection>
            ))}
          </div>
          <RevealSection delay={0.3}><p style={{textAlign:'center',color:'#6a5f80',fontSize:14,marginTop:32}}>First report free. No credit card required.</p></RevealSection>
        </div>
      </section>

      {/* WAITLIST */}
      <section style={{position:'relative',zIndex:1,padding:'100px 24px 120px',overflow:'hidden'}}>
        <FloatingOrb size={500} x="30%" y="10%" color="#7c3aed" duration={20} delay={0} blur={30} />
        <Ring3D size={250} x="5%" y="20%" duration={15} delay={1} color="#a855f7" />
        <div style={{maxWidth:560,margin:'0 auto',textAlign:'center',position:'relative',zIndex:1}}>
          <RevealSection>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.28em',textTransform:'uppercase',color:'#7c3aed',marginBottom:24}}>Early Access</div>
            <div style={{fontSize:'clamp(28px,4vw,48px)',fontWeight:900,color:'#e4e1ea',lineHeight:1.1,marginBottom:18}}>
              Find your leaks.<br /><span style={{color:'#a855f7',textShadow:'0 0 40px rgba(168,85,247,0.4)'}}>Stop them.</span>
            </div>
            <p style={{fontSize:16,color:'#6a5f80',lineHeight:1.7,marginBottom:44}}>Join the waitlist. Get early access and the first report free.</p>
            <WaitlistForm />
          </RevealSection>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{position:'relative',zIndex:1,borderTop:'1px solid rgba(255,255,255,0.04)',padding:'36px 48px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
        <div style={{fontSize:13,fontWeight:800,letterSpacing:'0.2em',color:'#3d3550'}}>REVELA</div>
        <div style={{fontSize:12,color:'#3d3550',letterSpacing:'0.05em'}}>Built by a data scientist. For business owners who hate spreadsheets.</div>
      </footer>
    </div>
  )
}