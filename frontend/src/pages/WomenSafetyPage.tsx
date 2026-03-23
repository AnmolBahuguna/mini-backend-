import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";

/* ─── DATA ──────────────────────────────────────────────────────────────────── */
const EC = [
  { name:"Police",       num:"100",          icon:"🚔", c:"#ef4444" },
  { name:"Women Help",   num:"1091",          icon:"👩", c:"#a855f7" },
  { name:"NCW",          num:"7827-170-170",  icon:"⚖️", c:"#8b5cf6" },
  { name:"Cyber Crime",  num:"1930",          icon:"💻", c:"#3b82f6" },
];
const NGOS = [
  { name:"iCall",                  state:"Maharashtra", city:"Mumbai",    spec:"Cyber Harassment", ph:"9152987821",  v:true,  f:true,  d:"Free psychological counseling for cyber abuse victims" },
  { name:"Cyber Peace Foundation", state:"Delhi",       city:"New Delhi", spec:"Cyber Harassment", ph:"1800111363",  v:true,  f:false, d:"Digital safety and cyber crime awareness" },
  { name:"Lawyers Collective",     state:"Maharashtra", city:"Mumbai",    spec:"Legal Aid",        ph:"02224941248", v:true,  f:true,  d:"Free legal assistance for women in distress" },
  { name:"SNEHI",                  state:"Delhi",       city:"New Delhi", spec:"Counseling",       ph:"01165978181", v:true,  f:true,  d:"24/7 emotional support helpline" },
  { name:"SEWA",                   state:"Gujarat",     city:"Ahmedabad", spec:"Legal Aid",        ph:"07927660385", v:true,  f:false, d:"Women empowerment and legal rights" },
  { name:"Shakti Shalini",         state:"Delhi",       city:"New Delhi", spec:"Sextortion",       ph:"01124373737", v:true,  f:true,  d:"Support for gender-based violence and sextortion" },
  { name:"Majlis",                 state:"Maharashtra", city:"Mumbai",    spec:"Legal Aid",        ph:"02223700702", v:true,  f:true,  d:"Legal advocacy for women and children" },
  { name:"Praja Foundation",       state:"Karnataka",   city:"Bengaluru", spec:"Counseling",       ph:"08025501639", v:false, f:false, d:"Mental health support for digital abuse survivors" },
];
const LAWYERS = [
  { name:"Adv. Priya Sharma", city:"New Delhi", spec:"Cyber Law & IT Act",    r:4.9, pb:true,  exp:"12 yrs", av:"PS", c:"#7c3aed" },
  { name:"Adv. Meera Iyer",   city:"Mumbai",    spec:"Sextortion & Privacy",  r:4.8, pb:true,  exp:"8 yrs",  av:"MI", c:"#9333ea" },
  { name:"Adv. Sunita Rao",   city:"Bengaluru", spec:"Digital Harassment",    r:4.7, pb:false, exp:"15 yrs", av:"SR", c:"#6d28d9" },
  { name:"Adv. Kavita Nair",  city:"Chennai",   spec:"Women's Rights & IPC",  r:4.6, pb:true,  exp:"10 yrs", av:"KN", c:"#7c3aed" },
];
const LAWS = [
  { s:"Sec 66C",      t:"Identity Theft",          d:"Fraudulently using electronic signature or password of another person.", p:"3 yrs + ₹1L fine" },
  { s:"Sec 66E",      t:"Privacy Violation",        d:"Capturing or publishing private images without consent — voyeurism, non-consensual intimate images.", p:"3 yrs + ₹2L fine" },
  { s:"Sec 67A",      t:"Sexually Explicit Content",d:"Publishing sexually explicit content electronically without consent, including deepfakes.", p:"5 yrs + ₹10L fine" },
  { s:"Sec 354D IPC", t:"Cyberstalking",            d:"Following a woman online or monitoring her internet activities despite her clear disinterest.", p:"3 yrs imprisonment" },
  { s:"Sec 507 IPC",  t:"Anonymous Threats",        d:"Criminal intimidation through anonymous communication — fake accounts, anonymous messages.", p:"2 yrs imprisonment" },
];
const QR = [
  "I'm being blackmailed with photos",
  "Someone is harassing me online",
  "My intimate images were shared",
  "I received threats via messages",
  "How do I file a cyber complaint?",
  "How to collect evidence safely?",
];
const TACTICS = [
  { c:'"I have your videos — pay or I\'ll send them"',   t:"Sextortion. Paying never stops them — it escalates. Block, screenshot, report 1930.", i:"🎭" },
  { c:'"You are under digital arrest"',                   t:"NO such thing in India. Always 100% a scam. Hang up, call 100 immediately.", i:"🚔" },
  { c:'"Pay ₹X to close the case / recover files"',      t:"Never pay. Take screenshots of everything → report at cybercrime.gov.in.", i:"💰" },
  { c:'"We are from CBI/ED — stay on video call"',       t:"Real law enforcement NEVER demands money via call. Hang up, call 100.", i:"⚠️" },
];

/* ─── HOOK: window width ────────────────────────────────────────────────────── */
function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

/* ─── CHATBOT ────────────────────────────────────────────────────────────────── */
function Chatbot({ onClose }: { onClose?: () => void }) {
  const [msgs, setMsgs] = useState([{
    role:"assistant",
    text:"Namaste 🙏 I'm your confidential safety companion. Everything you share is completely private — no data stored, no account needed.\n\nYou are not alone. You are not at fault. How can I help you today?",
    t: new Date(),
  }]);
  const [val, setVal]   = useState("");
  const [busy, setBusy] = useState(false);
  const [showQ, setShowQ] = useState(true);
  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hist     = useRef<{role: string, content: string}[]>([]);

  useEffect(() => {
    const el = endRef.current;
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior:"smooth" });
    }
  }, [msgs, busy]);

  const send = useCallback(async (txt?: string) => {
    const text = (txt || val).trim();
    if (!text || busy) return;
    setVal(""); setShowQ(false);
    setMsgs(p => [...p, { role:"user", text, t:new Date() }]);
    setBusy(true);
    hist.current = [...hist.current, { role:"user", content:text }];
    try {
      // TODO: replace with secure server-side proxy for AI responses
      const { data } = await api.post<{ reply?: string }>("/api/support-chat", {
        history: hist.current,
        message: text,
      })
      const reply = data?.reply || "I'm here with you. Could you share a bit more so I can help?";
      hist.current = [...hist.current, { role:"assistant", content:reply }];
      setMsgs(p => [...p, { role:"assistant", text:reply, t:new Date() }]);
    } catch {
      setMsgs(p => [...p, { role:"assistant", text:"I'm here for you. Connection issue — please call 1091 (Women Helpline) or 1930 (Cyber Crime) for immediate support.", t:new Date() }]);
    } finally {
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [val, busy]);

  const fmt = (d: Date) => d.toLocaleTimeString("en-IN",{ hour:"2-digit", minute:"2-digit", hour12:true });

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#08001a]">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-purple-500/20"
           style={{ background:"linear-gradient(135deg,rgba(124,58,237,0.18),rgba(109,40,217,0.06))" }}>
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
               style={{ background:"linear-gradient(135deg,#7c3aed,#9333ea)" }}>🤝</div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[#08001a]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-none truncate">DHIP Safety Companion</p>
          <p className="text-purple-300 text-xs mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0 animate-pulse" />
            Confidential · Anonymous · AI
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline text-[10px] px-2 py-1 rounded-full border"
                style={{ background:"rgba(139,92,246,0.2)", color:"#c084fc", borderColor:"rgba(139,92,246,0.4)" }}>24/7</span>
          {onClose && (
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all text-lg">✕</button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3"
           style={{ scrollbarWidth:"thin", scrollbarColor:"rgba(139,92,246,0.3) transparent" }}>
        {msgs.map((m,i) => (
          <div key={i} className={`flex gap-2 items-end ${m.role==="user" ? "flex-row-reverse" : ""}`}>
            {m.role==="assistant" && (
              <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-sm"
                   style={{ background:"rgba(124,58,237,0.3)" }}>🤝</div>
            )}
            <div className={`max-w-[85%] flex flex-col gap-1 ${m.role==="user" ? "items-end" : "items-start"}`}>
              <div className="px-3 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words"
                   style={{
                     borderRadius: m.role==="user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                     background:   m.role==="user" ? "linear-gradient(135deg,#7c3aed,#9333ea)" : "rgba(22,14,38,0.95)",
                     border:       m.role==="user" ? "none" : "1px solid rgba(139,92,246,0.2)",
                     color:        m.role==="user" ? "#f3e8ff" : "#e2d9f3",
                     boxShadow:    m.role==="user" ? "0 3px 10px rgba(124,58,237,0.35)" : "none",
                   }}>
                {m.text}
              </div>
              <span className="text-[10px] text-gray-600 px-1">{fmt(m.t)}</span>
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex gap-2 items-end">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                 style={{ background:"rgba(124,58,237,0.3)" }}>🤝</div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm"
                 style={{ background:"rgba(22,14,38,0.95)", border:"1px solid rgba(139,92,246,0.2)" }}>
              <div className="flex gap-1 items-center">
                {[0,1,2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block"
                        style={{ animation:`chatBounce 1s infinite`, animationDelay:`${i*0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick replies */}
      {showQ && (
        <div className="shrink-0 px-3 pb-2">
          <p className="text-gray-600 text-[10px] uppercase tracking-widest mb-2">Tap a topic to start</p>
          <div className="flex flex-wrap gap-1.5">
            {QR.map(q => (
              <button key={q} onClick={() => send(q)}
                className="text-[11px] px-3 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer"
                style={{ background:"rgba(124,58,237,0.12)", border:"1px solid rgba(139,92,246,0.3)", color:"#c4b5fd", fontFamily:"inherit",
                         WebkitTapHighlightColor:"transparent" }}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(124,58,237,0.28)";e.currentTarget.style.borderColor="rgba(139,92,246,0.6)"}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(124,58,237,0.12)";e.currentTarget.style.borderColor="rgba(139,92,246,0.3)"}}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 px-3 pb-4 pt-2 border-t border-purple-500/10">
        <div className="flex gap-2 items-end">
          <textarea ref={inputRef} value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); send(); } }}
            placeholder="Type here… (Enter to send)"
            rows={1}
            className="flex-1 text-sm resize-none focus:outline-none leading-relaxed"
            style={{
              background:"rgba(22,14,38,0.85)", border:"1px solid rgba(139,92,246,0.25)",
              borderRadius:12, padding:"10px 13px", color:"#e9d5ff",
              fontFamily:"inherit", maxHeight:80, overflowY:"auto",
              transition:"border-color 0.2s", WebkitTextSizeAdjust:"100%",
            }}
            onFocus={e => e.currentTarget.style.borderColor="rgba(139,92,246,0.6)"}
            onBlur={e  => e.currentTarget.style.borderColor="rgba(139,92,246,0.25)"}
          />
          <button onClick={() => send()} disabled={!val.trim() || busy}
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-90 text-base"
            style={{
              background: val.trim() && !busy ? "linear-gradient(135deg,#7c3aed,#9333ea)" : "rgba(40,30,60,0.8)",
              border:"none", cursor: val.trim() && !busy ? "pointer" : "not-allowed", color:"#fff",
              boxShadow: val.trim() && !busy ? "0 4px 12px rgba(124,58,237,0.45)" : "none",
              WebkitTapHighlightColor:"transparent",
            }}>
            {busy
              ? <span className="w-4 h-4 border-2 rounded-full inline-block"
                      style={{ borderColor:"rgba(167,139,250,0.3)", borderTopColor:"#a78bfa", animation:"chatSpin 0.8s linear infinite" }} />
              : "➤"}
          </button>
        </div>
        <p className="text-[10px] text-center mt-1.5 text-gray-700">🔒 End-to-end confidential · No messages stored</p>
      </div>
    </div>
  );
}

/* ─── PANIC BUTTON ───────────────────────────────────────────────────────────── */
function PanicButton() {
  const [st, setSt] = useState("idle");
  const [cd, setCd] = useState(3);
  const [gps, setGps] = useState<{lat: string; lng: string} | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const cfgMap = {
    idle:     { g:"#b91c1c,#dc2626", ring:"#ef4444", icon:"🆘", lbl:"PANIC / SOS", sub:"Hold to send alert",     glow:"rgba(239,68,68,0.55)",     pulse:true  },
    countdown:{ g:"#991b1b,#b91c1c", ring:"#fca5a5", icon:String(cd), lbl:"ACTIVATING", sub:"Tap again to cancel", glow:"rgba(239,68,68,0.65)",  pulse:false },
    locating: { g:"#b91c1c,#c2410c", ring:"#fb923c", icon:"📍", lbl:"LOCATING",   sub:"Acquiring GPS…",          glow:"rgba(249,115,22,0.5)",     pulse:true  },
    sending:  { g:"#c2410c,#b91c1c", ring:"#fbbf24", icon:"📡", lbl:"SENDING",    sub:"Alerting contacts…",      glow:"rgba(251,191,36,0.5)",     pulse:true  },
    sent:     { g:"#065f46,#047857", ring:"#34d399", icon:"✅", lbl:"ALERT SENT", sub:"3 contacts notified",     glow:"rgba(52,211,153,0.55)",    pulse:false },
    offline:  { g:"#374151,#4b5563", ring:"#9ca3af", icon:"📵", lbl:"SMS MODE",   sub:"Opening SMS app…",        glow:"rgba(156,163,175,0.3)",    pulse:true  },
  } as const

  const cfg = cfgMap[st as keyof typeof cfgMap] ?? cfgMap.idle;

  const startPanic = () => {
    if (st !== "idle") return;
    setSt("countdown"); let c = 3; setCd(c);
    timer.current = setInterval(() => {
      c--; setCd(c);
      if (c <= 0) { if (timer.current) clearInterval(timer.current); go(); }
    }, 1000);
  };
  const cancel = () => { if (st!=="countdown") return; if (timer.current) clearInterval(timer.current); setSt("idle"); setCd(3); };
  const go = () => {
    if (!navigator.onLine) {
      setSt("offline");
      window.location.href = `sms:100?body=${encodeURIComponent("🆘 EMERGENCY! I need help! Sent via DHIP")}`;
      return setTimeout(() => setSt("idle"), 3000);
    }
    setSt("locating");
    navigator.geolocation?.getCurrentPosition(
      p => { setGps({ lat:p.coords.latitude.toFixed(4), lng:p.coords.longitude.toFixed(4) }); finish(); },
      () => finish(), { timeout:5000 }
    );
  };
  const finish = () => {
    setSt("sending");
    setTimeout(() => { setSt("sent"); setTimeout(() => { setSt("idle"); setGps(null); }, 4000); }, 2000);
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Rings + Button */}
      <div className="relative flex items-center justify-center">
        {cfg.pulse && <>
          <div className="absolute rounded-full border-2 opacity-25"
               style={{ width:210, height:210, borderColor:cfg.ring, animation:"panicPing 1.6s cubic-bezier(0,0,0.2,1) infinite" }} />
          <div className="absolute rounded-full border opacity-15"
               style={{ width:185, height:185, borderColor:cfg.ring, animation:"panicPing 1.6s cubic-bezier(0,0,0.2,1) infinite", animationDelay:"0.4s" }} />
        </>}
        <button
          onMouseDown={startPanic}
          onTouchStart={e => { e.preventDefault(); startPanic(); }}
          onClick={st==="countdown" ? cancel : undefined}
          className="relative flex flex-col items-center justify-center rounded-full select-none transition-transform active:scale-95"
          style={{
            width:160, height:160,
            background:`linear-gradient(135deg,${cfg.g})`,
            border:`3px solid ${cfg.ring}`,
            outline:`5px solid ${cfg.ring}20`, outlineOffset:3,
            boxShadow:`0 0 50px ${cfg.glow}, 0 12px 35px rgba(0,0,0,0.6)`,
            cursor:"pointer", WebkitTapHighlightColor:"transparent",
          }}
          aria-label="🆘 PANIC">
          <span style={{ fontSize: st==="countdown" ? 46 : 38, lineHeight:1 }}>{cfg.icon}</span>
          <span className="text-white font-black text-sm mt-1.5 tracking-widest">{cfg.lbl}</span>
          <span className="text-white/70 text-[10px] mt-0.5 text-center px-3 leading-tight">{cfg.sub}</span>
        </button>
      </div>

      {gps && (
        <div className="text-[11px] px-4 py-2 rounded-xl font-mono"
             style={{ background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", color:"#86efac" }}>
          📍 {gps.lat}, {gps.lng} — Location sent
        </div>
      )}

      {/* Quick dial — responsive grid */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-xs sm:max-w-sm">
        {EC.map(c => (
          <a key={c.name} href={`tel:${c.num.replace(/[-\s]/g,"")}`}
             className="flex flex-col items-center gap-1 rounded-2xl py-3 px-1 transition-all no-underline active:scale-95"
             style={{ background:`${c.c}15`, border:`1px solid ${c.c}40`, WebkitTapHighlightColor:"transparent" }}
             onMouseEnter={e=>{e.currentTarget.style.background=`${c.c}28`;e.currentTarget.style.borderColor=`${c.c}70`}}
             onMouseLeave={e=>{e.currentTarget.style.background=`${c.c}15`;e.currentTarget.style.borderColor=`${c.c}40`}}>
            <span style={{ fontSize:18 }}>{c.icon}</span>
            <span className="text-white font-black text-[11px] font-mono leading-tight text-center">{c.num}</span>
            <span className="text-gray-500 text-[9px] leading-tight text-center">{c.name}</span>
          </a>
        ))}
      </div>
      <p className="text-gray-600 text-[10px] text-center max-w-[260px] leading-relaxed">
        3-second countdown · GPS + SMS via Twilio · Works offline too
      </p>
    </div>
  );
}

/* ─── LAYER 1 ────────────────────────────────────────────────────────────────── */
function Layer1({ onChat }: { onChat: () => void }) {
  const [rc, setRc] = useState(false);
  const tools = [
    { icon:"🤖", t:"AI Safety Companion",   d:"24/7 judgment-free AI chat. Anonymous, no account.", btn:"Open Chat", fn:onChat,          a:"#7c3aed" },
    { icon:"🔐", t:"Evidence Vault",          d:"Store files encrypted on device. We can't read them.", btn:"Open Vault",              a:"#2563eb" },
    { icon:"🧠", t:"Reality Check",           d:"Identify scammer tactics and know your options.",     btn:rc?"Close ✕":"Check Now", fn:()=>setRc(o=>!o), a:"#d97706" },
    { icon:"📋", t:"AI Safety Planner",       d:"Personalized step-by-step plan for your situation.",  btn:"Get Plan",                a:"#059669" },
  ];
  return (
    <div className="space-y-4">
      {/* Privacy banner */}
      <div className="rounded-2xl p-4 flex gap-3"
           style={{ background:"rgba(124,58,237,0.1)", border:"1px solid rgba(139,92,246,0.3)" }}>
        <span className="text-2xl shrink-0">🔒</span>
        <div>
          <p className="text-purple-300 font-bold text-sm m-0">Zero Disclosure — Complete Privacy</p>
          <p className="text-purple-300/60 text-xs mt-1 leading-relaxed m-0">All tools work without an account. No data stored on our servers.</p>
        </div>
      </div>

      {/* Tool cards — 1 col mobile, 2 col sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map(t => (
          <div key={t.t}
               className="rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200"
               style={{ background:"rgba(10,5,20,0.85)", border:`1px solid ${t.a}30`, cursor:"default" }}
               onMouseEnter={e=>{e.currentTarget.style.borderColor=`${t.a}65`;e.currentTarget.style.transform="translateY(-1px)"}}
               onMouseLeave={e=>{e.currentTarget.style.borderColor=`${t.a}30`;e.currentTarget.style.transform="translateY(0)"}}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                 style={{ background:`${t.a}20` }}>{t.icon}</div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm m-0">{t.t}</p>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed m-0">{t.d}</p>
            </div>
            <button onClick={t.fn}
              className="text-xs font-semibold px-3 py-2.5 rounded-xl transition-all active:scale-95"
              style={{ background:`${t.a}18`, border:`1px solid ${t.a}45`, color:"#e9d5ff", cursor:"pointer", fontFamily:"inherit", WebkitTapHighlightColor:"transparent" }}
              onMouseEnter={e=>e.currentTarget.style.background=`${t.a}38`}
              onMouseLeave={e=>e.currentTarget.style.background=`${t.a}18`}>
              {t.btn} →
            </button>
          </div>
        ))}
      </div>

      {/* Reality check panel */}
      {rc && (
        <div className="rounded-2xl p-4 space-y-3"
             style={{ background:"rgba(10,5,20,0.9)", border:"1px solid rgba(217,119,6,0.35)" }}>
          <div className="flex justify-between items-center">
            <p className="text-amber-400 font-bold text-sm m-0">🧠 Reality Check — Scammer Tactics</p>
            <button onClick={()=>setRc(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-all"
              style={{ background:"none", border:"none", cursor:"pointer", fontSize:16 }}>✕</button>
          </div>
          {TACTICS.map((t,i) => (
            <div key={i} className="rounded-xl p-3"
                 style={{ background:"rgba(22,14,38,0.7)", border:"1px solid rgba(75,60,100,0.4)" }}>
              <p className="text-xs font-mono mb-2 m-0 leading-relaxed" style={{ color:"#fca5a5" }}>
                {t.i} They say: <em style={{ color:"#fcd34d" }}>"{t.c}"</em>
              </p>
              <div style={{ borderTop:"1px solid rgba(75,60,100,0.4)", paddingTop:8 }}>
                <p className="text-green-400 text-[10px] font-bold uppercase tracking-wider mb-1 m-0">✅ Reality:</p>
                <p className="text-green-100 text-xs leading-relaxed m-0">{t.t}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── LAYER 2 ────────────────────────────────────────────────────────────────── */
function Layer2() {
  const [sf, setSf] = useState("All");
  const [spf, setSpf] = useState("All");
  const states = ["All", ...new Set(NGOS.map(n=>n.state))];
  const specs  = ["All", ...new Set(NGOS.map(n=>n.spec))];
  const list   = NGOS.filter(n=>(sf==="All"||n.state===sf)&&(spf==="All"||n.spec===spf));

  const HLS = [
    { l:"NCW Women Helpline",  n:"7827-170-170", i:"⚖️", c:"#7c3aed" },
    { l:"Cyber Crime Helpline",n:"1930",          i:"💻", c:"#2563eb" },
    { l:"Women in Distress",   n:"1091",          i:"🆘", c:"#be123c" },
    { l:"Police Emergency",    n:"100",           i:"🚔", c:"#991b1b" },
  ];
  const ss = {
    background:"rgba(22,14,38,0.85)", border:"1px solid rgba(139,92,246,0.25)",
    color:"#e9d5ff", fontSize:12, padding:"8px 26px 8px 10px",
    borderRadius:10, outline:"none", cursor:"pointer", fontFamily:"inherit",
    appearance:"none" as const, WebkitAppearance:"none" as const, width:"100%",
  };
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-gray-300 text-sm m-0">Connect to trusted NGOs, helplines, and community groups at your own pace.</p>
        <Link to="/community" className="text-purple-300 text-sm font-semibold no-underline hover:text-purple-200 transition-colors">Open Community Feed</Link>
      </div>
      {/* Helplines — 2 col always */}
      <div>
        <p className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold mb-3 m-0">Quick-Dial Helplines</p>
        <div className="grid grid-cols-2 gap-3">
          {HLS.map(h => (
            <a key={h.n} href={`tel:${h.n.replace(/[-\s]/g,"")}`}
               className="flex items-center gap-3 rounded-2xl p-3 sm:p-4 no-underline transition-all active:scale-95"
               style={{ background:`${h.c}22`, border:`1px solid ${h.c}45`, WebkitTapHighlightColor:"transparent" }}
               onMouseEnter={e=>{e.currentTarget.style.background=`${h.c}35`;e.currentTarget.style.transform="translateY(-1px)"}}
               onMouseLeave={e=>{e.currentTarget.style.background=`${h.c}22`;e.currentTarget.style.transform="translateY(0)"}}>
              <span style={{ fontSize:24 }}>{h.i}</span>
              <div>
                <p className="text-white font-black text-base sm:text-xl m-0 font-mono tracking-wide">{h.n}</p>
                <p className="text-gray-400 text-[10px] mt-0.5 m-0 leading-tight">{h.l}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* NGO Directory */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <p className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold m-0">NGO Directory</p>
          <div className="flex gap-2">
            {[{ v:sf, sv:setSf, opts:states }, { v:spf, sv:setSpf, opts:specs }].map((s,i) => (
              <div key={i} className="relative flex-1 sm:flex-none">
                <select value={s.v} onChange={e=>s.sv(e.target.value)} style={ss}>
                  {s.opts.map(o=><option key={o} value={o} style={{ background:"#1a0533" }}>{o}</option>)}
                </select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[9px]">▼</span>
              </div>
            ))}
          </div>
        </div>
        {/* 1 col mobile, 2 col sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {list.map(n => (
            <div key={n.name} className="rounded-2xl p-4 flex flex-col gap-2 transition-all"
                 style={{ background:"rgba(10,5,20,0.85)", border:"1px solid rgba(75,85,99,0.35)" }}
                 onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(139,92,246,0.45)"}
                 onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(75,85,99,0.35)"}>
              <div className="flex justify-between items-start gap-2">
                <p className="text-white font-bold text-sm m-0">{n.name}</p>
                <div className="flex gap-1.5 flex-wrap justify-end shrink-0">
                  {n.v && <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background:"rgba(20,184,166,0.15)", color:"#5eead4", border:"1px solid rgba(20,184,166,0.3)" }}>✓ Verified</span>}
                  {n.f && <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background:"rgba(34,197,94,0.15)", color:"#86efac", border:"1px solid rgba(34,197,94,0.3)" }}>Free</span>}
                </div>
              </div>
              <p className="text-gray-500 text-[10px] m-0">{n.city}, {n.state} · {n.spec}</p>
              <p className="text-gray-400 text-xs leading-relaxed m-0 flex-1">{n.d}</p>
              <a href={`tel:${n.ph}`} className="text-blue-400 text-xs font-mono mt-1 no-underline hover:text-blue-300 transition-colors">📞 {n.ph}</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── LAYER 3 ────────────────────────────────────────────────────────────────── */
function Layer3() {
  const [ol, setOl] = useState<number | null>(null);
  const steps = [
    { l:"Evidence Collected",       done:true,   i:"📁" },
    { l:"FIR Filed at Cyber Cell",  done:true,   i:"📝" },
    { l:"Investigation in Progress",active:true, i:"🔍" },
    { l:"Charge Sheet Filed",                    i:"⚖️", done:false, active:false },
    { l:"Trial / Resolution",                    i:"🏛️", done:false, active:false },
  ];
  const iS = {
    width:"100%", background:"rgba(22,14,38,0.75)",
    border:"1px solid rgba(139,92,246,0.2)", borderRadius:10,
    padding:"9px 12px", color:"#e9d5ff", fontSize:13,
    outline:"none", fontFamily:"inherit", boxSizing:"border-box" as const,
    transition:"border-color 0.2s",
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p className="text-gray-300 text-sm m-0">Secure evidence, file complaints, and track your legal journey.</p>
        <Link to="/evidence" className="text-blue-300 text-sm font-semibold no-underline hover:text-blue-200 transition-colors">Open Evidence Vault</Link>
      </div>
      {/* File complaint */}
      <div className="rounded-2xl p-4 sm:p-5"
           style={{ background:"rgba(10,5,20,0.85)", border:"1px solid rgba(59,130,246,0.22)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
               style={{ background:"rgba(59,130,246,0.15)" }}>🏛️</div>
          <div>
            <p className="text-white font-bold text-sm m-0">File Complaint — Cyber Cell</p>
            <p className="text-gray-500 text-xs mt-0.5 m-0">Submit to National Cyber Crime Portal</p>
          </div>
        </div>
        {/* 1 col mobile, 2 col sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {[["Your Name (optional)","Anonymous allowed"],["State","Select your state"],["Incident Type","e.g. Sextortion, Harassment"],["Date","When did this happen?"]].map(([l,p]) => (
            <div key={l}>
              <label className="text-gray-500 text-[10px] block mb-1">{l}</label>
              <input placeholder={p} style={iS}
                onFocus={e=>e.currentTarget.style.borderColor="rgba(139,92,246,0.55)"}
                onBlur={e =>e.currentTarget.style.borderColor="rgba(139,92,246,0.2)"} />
            </div>
          ))}
        </div>
        <div className="mb-4">
          <label className="text-gray-500 text-[10px] block mb-1">Brief Description</label>
          <textarea rows={3} placeholder="Describe what happened (encrypted and private)…"
            style={{ ...iS, resize:"none" }}
            onFocus={e=>e.currentTarget.style.borderColor="rgba(139,92,246,0.55)"}
            onBlur={e =>e.currentTarget.style.borderColor="rgba(139,92,246,0.2)"} />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer"
             className="flex-1 text-white font-bold text-sm py-3 rounded-xl text-center no-underline transition-all active:scale-95"
             style={{ background:"linear-gradient(135deg,#1d4ed8,#2563eb)", boxShadow:"0 4px 12px rgba(37,99,235,0.35)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            🌐 File on cybercrime.gov.in
          </a>
          <button className="flex-1 text-purple-300 font-semibold text-sm py-3 rounded-xl transition-all active:scale-95"
            style={{ background:"rgba(22,14,38,0.85)", border:"1px solid rgba(139,92,246,0.3)", cursor:"pointer", fontFamily:"inherit" }}>
            📤 Forward via DHIP
          </button>
        </div>
      </div>

      {/* IT Act accordion */}
      <div>
        <p className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold mb-3 m-0">Relevant Laws — Know Your Rights</p>
        <div className="space-y-2">
          {LAWS.map((s,i) => (
            <div key={i} className="rounded-xl overflow-hidden"
                 style={{ background:"rgba(10,5,20,0.85)", border:"1px solid rgba(75,85,99,0.35)" }}>
              <button onClick={()=>setOl(ol===i?null:i)}
                className="w-full flex items-center justify-between px-3 sm:px-4 py-3 transition-colors"
                style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.06)"}
                onMouseLeave={e=>e.currentTarget.style.background="none"}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold shrink-0"
                        style={{ background:"rgba(139,92,246,0.2)", color:"#c084fc", border:"1px solid rgba(139,92,246,0.4)" }}>{s.s}</span>
                  <span className="text-white font-semibold text-xs sm:text-sm truncate">{s.t}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded font-bold"
                        style={{ background:"rgba(239,68,68,0.15)", color:"#fca5a5", border:"1px solid rgba(239,68,68,0.3)" }}>{s.p}</span>
                  <span className="text-gray-500 text-xs inline-block transition-transform duration-200"
                        style={{ transform:ol===i?"rotate(180deg)":"rotate(0)" }}>▼</span>
                </div>
              </button>
              {ol===i && (
                <div className="px-3 sm:px-4 pb-4 pt-2"
                     style={{ borderTop:"1px solid rgba(75,85,99,0.3)" }}>
                  <p className="text-gray-300 text-xs leading-relaxed m-0">{s.d}</p>
                  <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded font-bold sm:hidden"
                        style={{ background:"rgba(239,68,68,0.15)", color:"#fca5a5", border:"1px solid rgba(239,68,68,0.3)" }}>⚖️ {s.p}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lawyers — 1 col mobile, 2 col sm+ */}
      <div>
        <p className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold mb-3 m-0">Verified Lawyer Network</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LAWYERS.map(l => (
            <div key={l.name} className="rounded-2xl p-4 flex flex-col gap-3 transition-all"
                 style={{ background:"rgba(10,5,20,0.85)", border:"1px solid rgba(75,85,99,0.35)" }}
                 onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(139,92,246,0.5)"}
                 onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(75,85,99,0.35)"}>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-purple-300 text-sm shrink-0"
                     style={{ background:`${l.c}35` }}>{l.av}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-bold text-xs m-0">{l.name}</p>
                    {l.pb && <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background:"rgba(34,197,94,0.15)", color:"#86efac", border:"1px solid rgba(34,197,94,0.3)" }}>Pro Bono</span>}
                  </div>
                  <p className="text-gray-500 text-[10px] mt-0.5 m-0">{l.city} · {l.exp}</p>
                  <p className="text-gray-400 text-xs mt-0.5 m-0">{l.spec}</p>
                  <div className="flex gap-0.5 mt-1.5 items-center">
                    {"★★★★★".split("").map((_,i)=>(
                      <span key={i} className="text-xs" style={{ color:i<Math.floor(l.r)?"#fbbf24":"#374151" }}>★</span>
                    ))}
                    <span className="text-gray-500 text-[10px] ml-1">{l.r}</span>
                  </div>
                </div>
              </div>
              <button className="w-full text-xs font-semibold py-2.5 rounded-xl transition-all active:scale-95"
                style={{ background:"rgba(124,58,237,0.12)", border:"1px solid rgba(139,92,246,0.28)", color:"#c4b5fd", cursor:"pointer", fontFamily:"inherit", WebkitTapHighlightColor:"transparent" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(124,58,237,0.28)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(124,58,237,0.12)"}>
                Request Consultation →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Case tracker */}
      <div className="rounded-2xl p-4 sm:p-5"
           style={{ background:"rgba(10,5,20,0.85)", border:"1px solid rgba(75,85,99,0.35)" }}>
        <p className="text-white font-bold text-sm mb-4 flex items-center gap-2 m-0">
          <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
                style={{ background:"rgba(20,184,166,0.2)" }}>📌</span>
          Case Progress Tracker
        </p>
        <div className="relative" style={{ paddingLeft:20 }}>
          <div className="absolute top-4 bottom-4" style={{ left:15, width:1, background:"rgba(75,85,99,0.4)" }} />
          <div className="space-y-4">
            {steps.map((s,i) => (
              <div key={i} className="flex items-center gap-3" style={{ opacity:s.done||s.active?1:0.35 }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 relative z-10"
                     style={{
                       background:s.done?"rgba(34,197,94,0.2)":s.active?"rgba(59,130,246,0.2)":"rgba(22,14,38,0.8)",
                       border:`2px solid ${s.done?"#22c55e":s.active?"#3b82f6":"#374151"}`,
                       animation:s.active?"layerPulse 2s infinite":"none",
                     }}>
                  {s.done ? <span className="text-green-400 font-black">✓</span> : s.i}
                </div>
                <div>
                  <p className="font-semibold text-sm m-0"
                     style={{ color:s.done?"#86efac":s.active?"#93c5fd":"#6b7280" }}>{s.l}</p>
                  {s.active && <p className="text-xs m-0" style={{ color:"#60a5fa", animation:"layerPulse 2s infinite" }}>In progress…</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────────── */
export function WomenSafetyPage() {
  const [tab, setTab]           = useState(1);
  const [chatOpen, setChatOpen] = useState(false);
  const width                   = useWidth();
  const isDesktop               = width >= 1024;

  const layers = [
    { id:1, icon:"🔒", label:"Private Help",    sub:"Zero disclosure tools"  },
    { id:2, icon:"🤝", label:"Support Network", sub:"NGOs & helplines"        },
    { id:3, icon:"⚖️", label:"Legal Action",    sub:"File & track case"       },
  ];

  return (
    <div className="min-h-screen text-white"
         style={{ background:"radial-gradient(ellipse at 30% 0%,#1a0533 0%,#0a0015 45%,#060010 100%)", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      {/* Subtle grid texture */}
      <div className="fixed inset-0 pointer-events-none"
           style={{ opacity:0.025, backgroundImage:"linear-gradient(#a855f7 1px,transparent 1px),linear-gradient(90deg,#a855f7 1px,transparent 1px)", backgroundSize:"44px 44px" }} />

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center"
           style={{ height:56, background:"rgba(8,0,18,0.93)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(139,92,246,0.2)", WebkitBackdropFilter:"blur(16px)" }}>
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm"
                 style={{ background:"linear-gradient(135deg,#7c3aed,#9333ea)" }}>D</div>
            <span className="font-black text-white text-base tracking-wide">DHIP</span>
            <span className="text-gray-600 mx-1 hidden sm:block">·</span>
            <span className="text-purple-300 text-sm hidden sm:block">Women Safety Hub</span>
          </div>
          <a href="tel:1091"
             className="flex items-center gap-1.5 text-xs font-bold px-3 sm:px-4 py-2 rounded-xl no-underline transition-all active:scale-95"
             style={{ background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.4)", color:"#fca5a5", WebkitTapHighlightColor:"transparent" }}
             onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,0.28)"}
             onMouseLeave={e=>e.currentTarget.style.background="rgba(239,68,68,0.15)"}>
            🆘 <span className="hidden xs:inline">Emergency:</span> 1091
          </a>
        </div>
      </nav>

      <div style={{ paddingTop:56 }}>
        {/* ── HERO ── */}
        <div className="text-center py-8 sm:py-10 px-4 relative">
          <div className="absolute inset-0 pointer-events-none"
               style={{ background:"radial-gradient(ellipse at 50% 100%,rgba(139,92,246,0.12) 0%,transparent 70%)" }} />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mb-4 text-2xl sm:text-3xl"
                 style={{ background:"linear-gradient(135deg,#7c3aed,#9333ea)", boxShadow:"0 0 40px rgba(139,92,246,0.4)" }}>🛡️</div>
            <h1 className="font-black text-white mb-2 leading-tight"
                style={{ fontSize:"clamp(24px,5vw,42px)", margin:"0 0 8px" }}>
              Women{" "}
              <span style={{ background:"linear-gradient(90deg,#c084fc,#f0abfc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Safety Hub</span>
            </h1>
            <p className="text-sm mb-5 max-w-sm sm:max-w-md mx-auto leading-relaxed"
               style={{ color:"rgba(196,146,246,0.65)", margin:"0 auto 20px" }}>
              Comprehensive protection, legal resources, and emergency tools — completely confidential
            </p>

            {/* Layer tabs — scrollable on mobile */}
            <div className="inline-flex rounded-2xl p-1.5 gap-1"
                 style={{ background:"rgba(10,5,20,0.9)", border:"1px solid rgba(139,92,246,0.25)", maxWidth:"100%" }}>
              {layers.map(l => (
                <button key={l.id} onClick={()=>setTab(l.id)}
                  aria-label={`Layer ${l.id}: ${l.label}`}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95"
                  style={{
                    border:"none", cursor:"pointer", fontFamily:"inherit",
                    background:tab===l.id?"linear-gradient(135deg,#7c3aed,#9333ea)":"transparent",
                    color:tab===l.id?"#fff":"#9ca3af",
                    boxShadow:tab===l.id?"0 4px 12px rgba(124,58,237,0.4)":"none",
                    whiteSpace:"nowrap", WebkitTapHighlightColor:"transparent",
                  }}>
                  <span>{l.icon}</span>
                  <span className="hidden xs:inline sm:inline">{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="max-w-6xl mx-auto px-3 sm:px-5 pb-20"
             style={{ display:"grid", gridTemplateColumns: isDesktop && tab===1 ? "1fr 400px" : "1fr", gap:20, alignItems:"start" }}>

          {/* Left / full column */}
          <div className="space-y-4 sm:space-y-5 min-w-0">

            {/* PANIC card */}
            <div className="rounded-3xl p-5 sm:p-7"
                 style={{ background:"rgba(6,0,12,0.8)", border:"1px solid rgba(239,68,68,0.18)", boxShadow:"0 0 40px rgba(239,68,68,0.04)" }}>
              <div className="text-center mb-5">
                <h2 className="font-black text-white tracking-widest m-0" style={{ fontSize:"clamp(14px,3vw,18px)" }}>EMERGENCY SOS</h2>
                <p className="text-gray-600 text-xs mt-1 m-0">GPS + alert sent to contacts via SMS (Twilio)</p>
              </div>
              <PanicButton />
            </div>

            {/* Layer content card */}
            <div className="rounded-3xl p-4 sm:p-5"
                 style={{ background:"rgba(6,0,12,0.6)", border:"1px solid rgba(139,92,246,0.15)" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                     style={{ background:"rgba(124,58,237,0.2)" }}>{layers[tab-1].icon}</div>
                <div>
                  <p className="text-white font-bold text-sm m-0">Layer {tab}: {layers[tab-1].label}</p>
                  <p className="text-gray-600 text-xs mt-0.5 m-0">{layers[tab-1].sub}</p>
                </div>
                {/* Mobile chat button — only layer 1 */}
                {tab===1 && !isDesktop && (
                  <button onClick={()=>setChatOpen(true)}
                    className="ml-auto flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all active:scale-95 shrink-0"
                    style={{ background:"rgba(124,58,237,0.2)", border:"1px solid rgba(139,92,246,0.4)", color:"#c4b5fd", cursor:"pointer", fontFamily:"inherit", WebkitTapHighlightColor:"transparent" }}>
                    🤝 Chat
                  </button>
                )}
              </div>
              {tab===1 && <Layer1 onChat={()=>{ if(!isDesktop) setChatOpen(true); }} />}
              {tab===2 && <Layer2 />}
              {tab===3 && <Layer3 />}
            </div>
          </div>

          {/* Right column — desktop chatbot (layer 1 only) */}
          {isDesktop && tab===1 && (
            <div style={{ position:"sticky", top:68 }}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse" />
                  <span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold">AI Safety Companion</span>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full"
                      style={{ background:"rgba(139,92,246,0.15)", color:"#a78bfa", border:"1px solid rgba(139,92,246,0.3)" }}>
                  Powered by Claude
                </span>
              </div>
              <div style={{ height:640, border:"1px solid rgba(139,92,246,0.28)", borderRadius:22, overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 0 50px rgba(139,92,246,0.1), inset 0 1px 0 rgba(255,255,255,0.02)" }}>
                <Chatbot />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE CHAT MODAL ── */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center"
             style={{ background:"rgba(0,0,0,0.82)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", animation:"fdIn 0.2s ease-out" }}
             onClick={e=>{ if(e.target===e.currentTarget) setChatOpen(false); }}>
          <div className="w-full flex flex-col"
               style={{ maxWidth:520, height:"88vh", background:"rgba(6,0,12,0.98)", border:"1px solid rgba(139,92,246,0.3)", borderRadius:"22px 22px 0 0", overflow:"hidden", boxShadow:"0 -20px 60px rgba(139,92,246,0.2)", animation:"slUp 0.3s ease-out" }}>
            {/* Drag handle */}
            <div className="flex justify-center py-3 shrink-0">
              <div className="w-9 h-1 rounded-full" style={{ background:"rgba(139,92,246,0.4)" }} />
            </div>
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <Chatbot onClose={()=>setChatOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* ── GLOBAL KEYFRAMES ── */}
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0}
        a{text-decoration:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(139,92,246,0.3);border-radius:2px}
        input,textarea,select{font-size:16px!important} /* prevents iOS zoom */

        @keyframes panicPing{75%,100%{transform:scale(1.6);opacity:0}}
        @keyframes chatBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes chatSpin{to{transform:rotate(360deg)}}
        @keyframes layerPulse{0%,100%{opacity:1}50%{opacity:0.45}}
        @keyframes fdIn{from{opacity:0}to{opacity:1}}
        @keyframes slUp{from{transform:translateY(28px);opacity:0}to{transform:translateY(0);opacity:1}}

        @media(max-width:479px){
          .xs\\:inline{display:none!important}
        }
      `}</style>
    </div>
  );
}
