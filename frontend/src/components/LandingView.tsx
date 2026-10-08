import React, { useEffect, useRef, useState } from 'react';
import spsuLogo from '../spsu_logo.png';
import orbitLogo from '../../assets/logo2.png';

interface LandingViewProps {
  onBrowseListings: () => void;
  onStartAuth: (mode: 'login' | 'register') => void;
}

/* ── Animated counter hook ── */
function useCounter(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

/* ── Intersection observer hook ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ── Company marquee data ── */
const COMPANIES = [
  'Google', 'Microsoft', 'Infosys', 'TCS', 'Wipro', 'Capgemini',
  'Deloitte', 'Amazon', 'Adobe', 'Accenture', 'HCL', 'Cognizant',
  'IBM', 'Oracle', 'Siemens', 'L&T', 'Reliance', 'KPMG',
];

/* ── Process steps ── */
const STEPS = [
  { icon: 'fa-user-plus',          label: 'Register',          desc: 'Create your verified student profile with academic details, skills and resume.' },
  { icon: 'fa-wand-magic-sparkles', label: 'AI Match Audit',    desc: 'Our AI scans your profile against job requirements and gives a compatibility score.' },
  { icon: 'fa-paper-plane',         label: 'Apply Instantly',   desc: 'Submit targeted applications with a single click. Track every status in real-time.' },
  { icon: 'fa-trophy',              label: 'Get Placed',         desc: 'Receive offer letters, negotiate packages, and celebrate your placement success.' },
];

/* ── Feature cards ── */
const FEATURES = [
  {
    icon:  'fa-briefcase',
    color: 'from-violet-500 to-purple-600',
    bg:    'bg-violet-50',
    title: 'Curated Placement Board',
    desc:  'Browse faculty-verified job listings from top-tier companies. Filter by CTC, domain, location, and deadline — all in one sleek board.',
  },
  {
    icon:  'fa-brain',
    color: 'from-fuchsia-500 to-brand-600',
    bg:    'bg-fuchsia-50',
    title: 'AI Smart-Match Engine',
    desc:  'Llama AI evaluates your bio, skills, GPA, and certificates against each listing. Only candidates scoring 60%+ can apply — ensuring quality.',
  },
  {
    icon:  'fa-chart-line',
    color: 'from-indigo-500 to-brand-700',
    bg:    'bg-indigo-50',
    title: 'Live Application Tracker',
    desc:  'A visual Kanban pipeline showing every stage: Applied → Screening → Interview → Offer. Receive automated updates via your inbox.',
  },
  {
    icon:  'fa-shield-halved',
    color: 'from-purple-500 to-violet-600',
    bg:    'bg-purple-50',
    title: 'Faculty Verification Layer',
    desc:  'Coordinators review student profiles and recruiter legitimacy. Only verified students with Genuine-flagged recruiters appear in the pipeline.',
  },
  {
    icon:  'fa-message',
    color: 'from-brand-600 to-brand-800',
    bg:    'bg-brand-50',
    title: 'Integrated Messaging',
    desc:  'Direct inbox between students, coordinators, and recruiters. Automated receipt confirmations and status alerts keep everyone aligned.',
  },
  {
    icon:  'fa-robot',
    color: 'from-emerald-500 to-teal-600',
    bg:    'bg-emerald-50',
    title: 'Career Advisor Chatbot',
    desc:  'Your personal SPSU AI advisor. Ask about CV writing, interview prep, grade optimization, and get actionable markdown-formatted guidance.',
  },
];

/* ── Testimonials ── */
const TESTIMONIALS = [
  {
    quote: "The AI Match Auditor spotted missing AWS certs in my profile. I updated them, got verified by faculty, and landed a Stripe interview the next week. Unreal.",
    name:  "Aditya Singhal",
    role:  "B.Tech CSE '26 · Got offer at Stripe",
    initials: 'AS',
  },
  {
    quote: "Placera's messaging feature let me directly ask the recruiter for clarification on job scope. That conversation moved me to the top of their list.",
    name:  "Prerna Sharma",
    role:  "MBA Finance '26 · Placed at Deloitte",
    initials: 'PS',
  },
  {
    quote: "The AI career advisor gave me a full structured resume rewrite in Markdown with bullet points. I literally copy-pasted it into my CV. Got shortlisted in 48 hrs.",
    name:  "Rohan Meena",
    role:  "B.Tech ECE '26 · Placed at Siemens",
    initials: 'RM',
  },
];

/* ── Role cards ── */
const ROLES = [
  {
    role:  'Student',
    icon:  'fa-graduation-cap',
    color: 'from-brand-600 to-brand-800',
    perks: ['Build verified portfolio', 'AI match scoring', 'Track applications live', 'Career advisor chatbot'],
  },
  {
    role:  'Recruiter',
    icon:  'fa-building',
    color: 'from-violet-600 to-fuchsia-700',
    perks: ['Post placement listings', 'Review AI-filtered candidates', 'Kanban pipeline management', 'Direct inbox messaging'],
  },
  {
    role:  'Coordinator',
    icon:  'fa-user-tie',
    color: 'from-indigo-600 to-brand-700',
    perks: ['Verify student profiles', 'Approve recruiter legitimacy', 'Monitor placements', 'Full activity audit logs'],
  },
];

export default function LandingView({ onBrowseListings, onStartAuth }: LandingViewProps) {
  const [scrolled, setScrolled] = useState(false);
  const statsRef  = useInView(0.2);
  const studentsCount  = useCounter(1200, 1600, statsRef.inView);
  const placementsCount = useCounter(380,  1800, statsRef.inView);
  const companiesCount  = useCounter(45,   1400, statsRef.inView);
  const rateCount       = useCounter(94,   1500, statsRef.inView);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf5ff] flex flex-col font-sans overflow-x-hidden selection:bg-brand-600/20 selection:text-brand-700">

      {/* ══════════ NAVBAR ══════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 backdrop-blur-xl shadow-lg shadow-brand-500/5 border-b border-brand-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-18 flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-brand-700 to-brand-500 rounded-xl flex items-center justify-center text-white font-serif text-lg font-bold shadow-md shadow-brand-500/30">
              P
            </div>
            <span className="font-serif text-2xl tracking-tight text-editorial font-bold font-display">Placera</span>
            <div className="h-5 w-px bg-brand-200 mx-1 hidden sm:block" />
            <img src={spsuLogo} alt="SPSU Logo" className="h-8 object-contain hidden sm:block" />
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-7">
            {[
              { label: 'Features',    onClick: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) },
              { label: 'How It Works', onClick: () => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }) },
              { label: 'Browse Jobs',  onClick: onBrowseListings },
            ].map(({ label, onClick }) => (
              <button key={label} onClick={onClick}
                className="text-xs font-semibold text-text-muted hover:text-brand-600 transition-colors cursor-pointer">
                {label}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <button onClick={() => onStartAuth('login')}
              className="text-xs font-semibold text-editorial hover:text-brand-700 transition-colors cursor-pointer hidden sm:block">
              Sign In
            </button>
            <button onClick={() => onStartAuth('register')}
              className="text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-brand-500/20 hover:shadow-brand-500/35 hover:scale-[1.03]">
              Get Started <i className="fa-solid fa-arrow-right ml-1 text-[10px]" />
            </button>
          </div>
        </div>
      </header>

      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-gradient-radial from-brand-300/25 to-transparent rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] bg-gradient-radial from-violet-300/15 to-transparent rounded-full blur-[120px]" />
          <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] bg-gradient-radial from-fuchsia-300/10 to-transparent rounded-full blur-[90px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'linear-gradient(#7e22ce 1px, transparent 1px), linear-gradient(to right, #7e22ce 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-16">
          {/* Left copy */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-200/70 text-[11px] font-mono uppercase tracking-widest text-brand-700 font-bold animate-fadeInUp">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sir Padampat Singhania University — Placement Hub
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-editorial leading-[1.1] font-bold tracking-tight font-display animate-fadeInUp delay-100">
              Your Career{' '}
              <span className="relative inline-block">
                <span className="shimmer-text">Starts Here</span>
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-500 to-brand-700 rounded-full" />
              </span>
              <br />at SPSU.
            </h1>

            <p className="text-base text-text-muted leading-relaxed max-w-lg animate-fadeInUp delay-200">
              Placera is the AI-powered placement platform built exclusively for SPSU. Connect with verified recruiters, build a certified academic portfolio, and land your dream role — all from one intelligent dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 animate-fadeInUp delay-300">
              <button onClick={() => onStartAuth('register')}
                className="group px-7 py-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-2xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02]">
                <i className="fa-solid fa-rocket-launch" />
                Register as Student
                <i className="fa-solid fa-arrow-right text-[11px] group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={onBrowseListings}
                className="px-7 py-4 glass-card text-editorial hover:bg-white rounded-2xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 hover:shadow-md">
                <i className="fa-solid fa-magnifying-glass text-brand-500" />
                Browse Placements
              </button>
            </div>

            {/* Trust strip */}
            <div className="flex items-center gap-6 animate-fadeInUp delay-500 pt-2">
              <div className="flex -space-x-2">
                {['AS', 'PS', 'RM', 'KG', 'SJ'].map((init, i) => (
                  <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-500 to-brand-700 border-2 border-white text-white text-[9px] font-bold flex items-center justify-center">
                    {init}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-editorial">1,200+ students placed</p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[1,2,3,4,5].map(s => <i key={s} className="fa-solid fa-star text-amber-400 text-[9px]" />)}
                  <span className="text-[10px] text-text-muted ml-1 font-mono">4.9/5 rating</span>
                </div>
              </div>
            </div>
          </div>


          {/* Right — Solar System */}
          <div className="relative hidden lg:flex items-center justify-center flex-shrink-0" style={{ width: '540px', height: '600px' }}>

            {/* Orbit keyframes — each node on its own ring, counter-rotated to stay upright */}
            <style>{`
              @keyframes orb1 {
                from { transform: rotate(0deg)   translateX(108px) rotate(0deg);   }
                to   { transform: rotate(360deg)  translateX(108px) rotate(-360deg); }
              }
              @keyframes orb2 {
                from { transform: rotate(90deg)  translateX(162px) rotate(-90deg);  }
                to   { transform: rotate(450deg)  translateX(162px) rotate(-450deg); }
              }
              @keyframes orb3 {
                from { transform: rotate(190deg) translateX(212px) rotate(-190deg); }
                to   { transform: rotate(550deg)  translateX(212px) rotate(-550deg); }
              }
              @keyframes orb4 {
                from { transform: rotate(300deg) translateX(248px) rotate(-300deg); }
                to   { transform: rotate(660deg)  translateX(248px) rotate(-660deg); }
              }
              .on1 { animation: orb1 18s linear infinite; }
              .on2 { animation: orb2 28s linear infinite; }
              .on3 { animation: orb3 40s linear infinite; }
              .on4 { animation: orb4 54s linear infinite; }
            `}</style>

            {/* ── Visible orbit rings (diameter = 2×radius) ── */}
            <div className="absolute rounded-full" style={{ width: '216px',  height: '216px',  border: '1.5px dashed rgba(147,51,234,0.40)' }} />
            <div className="absolute rounded-full" style={{ width: '324px',  height: '324px',  border: '1.5px dashed rgba(139,92,246,0.30)' }} />
            <div className="absolute rounded-full" style={{ width: '424px',  height: '424px',  border: '1.5px dashed rgba(167,139,250,0.22)' }} />
            <div className="absolute rounded-full" style={{ width: '496px',  height: '496px',  border: '1.5px dashed rgba(196,181,253,0.15)' }} />

            {/* Ambient glow behind center */}
            <div className="absolute rounded-full blur-[70px] pointer-events-none" style={{ width: '200px', height: '200px', background: 'rgba(147,51,234,0.18)' }} />

            {/* ── Centre — logo2 image ── */}
            <div className="relative z-30 flex-shrink-0">
              <div className="w-28 h-28 rounded-full overflow-hidden shadow-2xl border-4 border-white/50 animate-glow-pulse bg-white flex items-center justify-center">
                <img src={orbitLogo} alt="SPSU Placera" className="w-full h-full object-contain p-1" />
              </div>
              {/* Glow rings */}
              <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: '0 0 0 6px rgba(147,51,234,0.15), 0 0 0 14px rgba(147,51,234,0.07)' }} />
            </div>

            {/* ── Orbit node 1 — Job Match (ring r=70) ── */}
            <div className="absolute on1 z-20">
              <div className="flex flex-col items-center gap-1.5">
                {/* Planet dot */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-2 border-white"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}>
                  <i className="fa-solid fa-briefcase text-white text-xs" />
                </div>
                {/* Label pill */}
                <div className="glass-card rounded-xl px-2.5 py-1.5 text-center shadow-md"
                  style={{ minWidth: '88px', border: '1px solid rgba(147,51,234,0.18)' }}>
                  <p className="text-[9px] font-bold text-editorial leading-none whitespace-nowrap">Cloud Architect</p>
                  <p className="text-[8px] text-emerald-600 font-mono mt-0.5">87% match ✓</p>
                </div>
              </div>
            </div>

            {/* ── Orbit node 2 — Student profile (ring r=128) ── */}
            <div className="absolute on2 z-20">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-2 border-white"
                  style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)' }}>
                  <i className="fa-solid fa-user-graduate text-white text-xs" />
                </div>
                <div className="glass-card rounded-xl px-2.5 py-1.5 text-center shadow-md"
                  style={{ minWidth: '84px', border: '1px solid rgba(147,51,234,0.18)' }}>
                  <p className="text-[9px] font-bold text-editorial leading-none whitespace-nowrap">Rohan Verma</p>
                  <p className="text-[8px] text-brand-600 font-mono mt-0.5">Verified ✓ CSE '26</p>
                </div>
              </div>
            </div>

            {/* ── Orbit node 3 — Offer toast (ring r=178) ── */}
            <div className="absolute on3 z-20">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-2 border-white"
                  style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                  <i className="fa-solid fa-trophy text-white text-xs" />
                </div>
                <div className="glass-card rounded-xl px-2.5 py-1.5 text-center shadow-md"
                  style={{ minWidth: '84px', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <p className="text-[9px] font-bold text-editorial leading-none">Offer! 🎉</p>
                  <p className="text-[8px] text-emerald-600 font-mono mt-0.5">Microsoft · ₹22L</p>
                </div>
              </div>
            </div>

            {/* ── Orbit node 4 — AI Advisor (ring r=218) ── */}
            <div className="absolute on4 z-20">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-2 border-white"
                  style={{ background: 'linear-gradient(135deg, #9333ea, #c026d3)' }}>
                  <i className="fa-solid fa-robot text-white text-xs" />
                </div>
                <div className="glass-card rounded-xl px-2.5 py-1.5 text-center shadow-md"
                  style={{ minWidth: '80px', border: '1px solid rgba(147,51,234,0.18)' }}>
                  <p className="text-[9px] font-bold text-editorial leading-none">AI Advisor</p>
                  <p className="text-[8px] text-brand-600 font-mono mt-0.5">+15% boost</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-brand-400 animate-bounce">
          <span className="text-[9px] font-mono uppercase tracking-widest">Scroll</span>
          <i className="fa-solid fa-chevron-down text-xs" />
        </div>
      </section>


      {/* ══════════ MARQUEE ══════════ */}
      <div className="border-y border-brand-100 bg-white py-4 overflow-hidden select-none">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...COMPANIES, ...COMPANIES].map((c, i) => (
            <span key={i} className="inline-flex items-center gap-2 mx-8 text-xs font-semibold text-text-muted font-mono uppercase tracking-widest">
              <i className="fa-solid fa-building text-brand-300 text-[10px]" />
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════ STATS ══════════ */}
      <section ref={statsRef.ref} className="py-20 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: studentsCount,    suffix: '+', label: 'Students Registered' },
            { value: placementsCount,  suffix: '+', label: 'Successful Placements' },
            { value: companiesCount,   suffix: '+', label: 'Hiring Partners' },
            { value: rateCount,        suffix: '%', label: 'Placement Rate' },
          ].map(({ value, suffix, label }, i) => (
            <div key={i} className="glass-card rounded-3xl p-6 text-center hover:shadow-lg hover:shadow-brand-500/10 transition-all">
              <p className="font-serif text-4xl font-bold text-editorial font-display">
                {value.toLocaleString()}{suffix}
              </p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mt-2">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section id="how-it-works" className="py-20 px-6 lg:px-12 relative overflow-hidden">
        {/* Soft accent blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(147,51,234,0.07)' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(139,92,246,0.06)' }} />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-[11px] font-mono uppercase text-brand-600 tracking-widest font-bold bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">Simple 4-Step Journey</span>
            <h2 className="font-serif text-4xl font-bold text-editorial mt-4 font-display">How Placera Works</h2>
            <p className="text-sm text-text-muted mt-3 max-w-lg mx-auto leading-relaxed">From profile creation to receiving your first offer letter — the entire process is streamlined, transparent, and AI-assisted.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-brand-300 to-transparent" />

            {STEPS.map(({ icon, label, desc }, i) => (
              <div key={i} className="premium-card flex flex-col items-center text-center p-7 rounded-3xl hover:border-brand-300/60 transition-all group">
                <div className="relative mb-5">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-800 flex items-center justify-center text-white text-xl shadow-xl shadow-brand-500/25 group-hover:scale-110 transition-transform">
                    <i className={`fa-solid ${icon}`} />
                  </div>
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-editorial mb-2">{label}</h3>
                <p className="text-[11px] text-text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES GRID ══════════ */}
      <section id="features" className="py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[11px] font-mono uppercase text-brand-600 tracking-widest font-bold bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">Platform Features</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-editorial font-display">
              Everything you need to{' '}
              <span className="shimmer-text">get placed.</span>
            </h2>
            <p className="text-sm text-text-muted max-w-xl mx-auto leading-relaxed">
              Built specifically for SPSU students, faculty coordinators, and recruiters — with AI at every step of the placement lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon, color, bg, title, desc }, i) => (
              <div key={i} className="premium-card rounded-3xl p-7 group cursor-default relative overflow-hidden">
                {/* Hover shimmer */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer rounded-3xl" />
                <div className={`h-12 w-12 rounded-2xl ${bg} flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform`}>
                  <i className={`fa-solid ${icon} text-lg bg-gradient-to-r ${color} bg-clip-text`}
                    style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
                </div>
                <h3 className="font-bold text-base text-editorial mb-2">{title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{desc}</p>
                <div className="mt-5 pt-4 border-t border-brand-50 flex items-center text-[11px] font-bold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <i className="fa-solid fa-arrow-right ml-1.5 text-[9px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ ROLE SHOWCASE ══════════ */}
      <section className="py-24 px-6 lg:px-12 bg-white border-y border-brand-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[11px] font-mono uppercase text-brand-600 tracking-widest font-bold">Built For Everyone</span>
            <h2 className="font-serif text-4xl font-bold text-editorial mt-3 font-display">One platform, three powerful roles.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROLES.map(({ role, icon, color, perks }, i) => (
              <div key={i} className={`rounded-3xl p-8 relative overflow-hidden bg-gradient-to-br ${color} text-white shadow-2xl`}>
                {/* Background pattern */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                  <div className="h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center mb-5 border border-white/20">
                    <i className={`fa-solid ${icon} text-xl`} />
                  </div>
                  <h3 className="font-serif font-bold text-xl mb-4 font-display">{role}</h3>
                  <ul className="space-y-2.5">
                    {perks.map((perk, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-white/90">
                        <i className="fa-solid fa-check text-[9px] bg-white/20 p-1 rounded-full" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      if (role === 'Student') {
                        onStartAuth('register');
                      } else {
                        // Open pre-filled mailto for non-student roles
                        const subject = encodeURIComponent(`${role} Access Request — Placera SPSU`);
                        const body = encodeURIComponent(
                          `Hello Admin,\n\nI would like to request ${role} credentials on the Placera SPSU Placement Portal.\n\nName: \nDesignation / Company: \nContact Number: \n\nKindly create my account and share login details.\n\nRegards`
                        );
                        window.location.href = `mailto:admin@spsu.ac.in?subject=${subject}&body=${body}`;
                      }
                    }}
                    className="mt-7 w-full py-3 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer">
                    {role === 'Student' ? 'Register Free' : `Request ${role} Access`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 p-2.5 bg-amber-50 rounded-2xl border border-amber-100 mb-4">
              {[1,2,3,4,5].map(s => <i key={s} className="fa-solid fa-star text-amber-400 text-sm" />)}
            </div>
            <h2 className="font-serif text-4xl font-bold text-editorial font-display">Loved by SPSU students</h2>
            <p className="text-sm text-text-muted mt-3">Real stories from graduates who launched their careers with Placera.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ quote, name, role, initials }, i) => (
              <div key={i} className="premium-card rounded-3xl p-8 text-left space-y-5 relative group hover:-translate-y-1">
                {/* Quote mark */}
                <div className="text-6xl font-serif text-brand-100 leading-none absolute top-4 right-6 select-none group-hover:text-brand-200 transition-colors">"</div>

                <div className="flex gap-0.5 mb-1">
                  {[1,2,3,4,5].map(s => <i key={s} className="fa-solid fa-star text-amber-400 text-xs" />)}
                </div>

                <p className="text-xs text-text-muted italic leading-relaxed relative z-10">"{quote}"</p>

                <div className="flex items-center gap-3 pt-3 border-t border-brand-50">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white text-[11px] font-bold flex items-center justify-center shadow-md">
                    {initials}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-editorial">{name}</p>
                    <p className="text-[9px] font-mono text-text-light uppercase tracking-wide">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="py-24 px-6 lg:px-12 relative overflow-hidden">
        {/* Soft purple blobs */}
        <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(147,51,234,0.09)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(139,92,246,0.07)' }} />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 border border-brand-200 text-[11px] font-mono uppercase tracking-widest text-brand-700 font-bold">
            <i className="fa-solid fa-graduation-cap text-brand-600" />
            Class of 2026 Placements Now Open
          </div>

          {/* Headline */}
          <h2 className="font-serif text-5xl sm:text-6xl font-bold text-editorial leading-tight font-display">
            Ready to unlock your{' '}
            <span className="shimmer-text">placement potential?</span>
          </h2>

          {/* Subtext */}
          <p className="text-base text-text-muted max-w-md mx-auto leading-relaxed">
            Join 1,200+ SPSU students who've already built their profiles. It takes under 5 minutes to register and the AI advisor is available 24/7.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <button onClick={() => onStartAuth('register')}
              className="group px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-2xl text-sm font-bold transition-all cursor-pointer shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] flex items-center gap-2 justify-center">
              <i className="fa-solid fa-rocket-launch" />
              Create Free Account
              <i className="fa-solid fa-arrow-right text-[11px] group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={onBrowseListings}
              className="px-8 py-4 glass-card text-editorial hover:bg-white rounded-2xl text-sm font-bold transition-all cursor-pointer hover:shadow-md flex items-center gap-2 justify-center">
              <i className="fa-solid fa-briefcase text-brand-500" />
              Browse Open Positions
            </button>
          </div>

          {/* Footnote */}
          <p className="text-[10px] font-mono text-text-light uppercase tracking-widest">
            No credit card needed · Exclusively for SPSU students
          </p>
        </div>
      </section>


      {/* ══════════ FOOTER ══════════ */}
      <footer className="border-t border-brand-100 bg-white px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-brand-700 to-brand-500 rounded-lg flex items-center justify-center text-white font-serif font-bold text-sm">P</div>
            <span className="font-serif text-lg font-bold text-editorial font-display">Placera</span>
            <span className="text-[10px] font-mono text-text-light">× SPSU Career Hub</span>
          </div>

          <div className="flex items-center gap-6 text-[10px] font-mono text-text-light uppercase tracking-wider">
            <button onClick={() => onStartAuth('login')}    className="hover:text-brand-600 transition-colors cursor-pointer">Sign In</button>
            <button onClick={() => onStartAuth('register')} className="hover:text-brand-600 transition-colors cursor-pointer">Register</button>
            <button onClick={onBrowseListings}              className="hover:text-brand-600 transition-colors cursor-pointer">Browse Jobs</button>
          </div>

          <p className="text-[10px] font-mono text-text-light text-center">
            © 2026 Sir Padampat Singhania University. Powered by Placera.
          </p>
        </div>
      </footer>

    </div>
  );
}
