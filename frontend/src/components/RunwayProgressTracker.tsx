import React from 'react';
import { Check, X } from 'lucide-react';
import { STEP_LABELS, STATUS_TO_STEP, STATUS_LABELS, type VisaRequestStatus } from '@/src/visaApi';

interface Props {
  status: VisaRequestStatus;
  currentStep: number;
}

const REJECTED_STATUSES: VisaRequestStatus[] = ['COST_CENTRE_REJECTED', 'EVP_REJECTED'];

const ZONE_TAGS = [
  'CHECK-IN', 'CUSTOMS', 'CLEARANCE', 'TERMINAL', 'SCHEDULE',
  'DISPATCH', 'PASSENGER', 'CONTROL', 'TAKEOFF',
];

/* Short one-liner comments for each step */
const STEP_COMMENTS: Record<number, string> = {
  1: 'HR received your request',
  2: 'Cost proposal being prepared',
  3: 'Awaiting cost centre sign-off',
  4: 'Vendor has been contacted',
  5: 'Appointment slots available',
  6: 'Dates sent to applicant',
  7: 'Applicant picked their slot',
  8: 'EVP reviewing for approval',
  9: 'Booking confirmed — bon voyage!',
};

export function RunwayProgressTracker({ status, currentStep }: Props) {
  const activeStep = STATUS_TO_STEP[status] || currentStep;
  const isRejected = REJECTED_STATUSES.includes(status);
  const isFinal = status === 'APPOINTMENT_CONFIRMED';
  const statusLabel = STATUS_LABELS[status] || '';

  const totalSteps = 9;
  const completed = isFinal ? totalSteps : activeStep - 1;
  const pct = Math.min((completed / totalSteps) * 100, 100);

  const accent = isFinal ? '#10b981' : isRejected ? '#ef4444' : '#38bdf8';

  return (
    <div className="w-full py-4">
      <div className="relative rounded-2xl overflow-hidden"
           style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.03)' }}>

        {/* ── Night sky background ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0"
               style={{ background: 'linear-gradient(180deg, #050d1a 0%, #0a1628 30%, #0f1f3d 55%, #162a4a 80%, #1c3558 100%)' }} />

          {/* Stars */}
          {[...Array(45)].map((_, i) => (
            <div key={`s${i}`} className="absolute rounded-full bg-white"
                 style={{
                   width: Math.random() * 2 + 0.5, height: Math.random() * 2 + 0.5,
                   top: `${Math.random() * 30}%`, left: `${Math.random() * 100}%`,
                   opacity: Math.random() * 0.5 + 0.15,
                   animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
                   animationDelay: `${Math.random() * 4}s`,
                 }} />
          ))}

          {/* Moon */}
          <div className="absolute top-3 right-10 w-8 h-8 rounded-full"
               style={{
                 background: 'radial-gradient(circle at 35% 35%, #fef9c3, #fde68a, #fcd34d)',
                 boxShadow: '0 0 20px rgba(253,230,138,0.25)',
               }} />

          {/* Clouds */}
          <svg className="absolute top-6 left-[12%] opacity-[0.05]" width="100" height="32" viewBox="0 0 100 32">
            <ellipse cx="50" cy="22" rx="45" ry="10" fill="#fff"/>
            <ellipse cx="32" cy="16" rx="24" ry="12" fill="#fff"/>
            <ellipse cx="68" cy="14" rx="26" ry="11" fill="#fff"/>
          </svg>

          {/* Control tower */}
          <svg className="absolute bottom-0 right-[6%]" width="40" height="65" viewBox="0 0 40 65" style={{ opacity: 0.1 }}>
            <rect x="16" y="25" width="8" height="40" fill="#fff"/>
            <rect x="8" y="14" width="24" height="12" rx="2" fill="#fff"/>
            <line x1="20" y1="0" x2="20" y2="14" stroke="#fff" strokeWidth="1.5"/>
            <circle cx="20" cy="3" r="2" fill={accent} opacity="0.8"/>
          </svg>

          {/* Terminal */}
          <svg className="absolute bottom-0 left-[4%]" width="80" height="40" viewBox="0 0 80 40" style={{ opacity: 0.06 }}>
            <rect x="0" y="12" width="80" height="28" rx="2" fill="#fff"/>
            <path d="M8,12 Q40,0 72,12" fill="none" stroke="#fff" strokeWidth="1"/>
            {[0,1,2,3,4].map(i => (
              <rect key={i} x={5 + i * 16} y={17} width="10" height="6" rx="1" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.5"/>
            ))}
          </svg>

          {/* City skyline */}
          <svg className="absolute bottom-0 left-0 right-0" height="50" viewBox="0 0 1200 50" preserveAspectRatio="none" style={{ opacity: 0.04 }}>
            <path d="M0,50 L0,35 L40,35 L40,25 L50,20 L60,25 L60,35 L120,35 L120,20 L130,15 L140,20 L140,35 L200,35 L200,28 L210,22 L220,28 L220,38 L300,38 L300,30 L310,24 L320,30 L320,40 L400,40 L400,30 L420,30 L420,22 L430,16 L440,22 L440,35 L500,35 L500,42 L600,42 L600,30 L620,30 L620,20 L630,14 L640,20 L640,35 L700,35 L700,40 L800,40 L800,28 L820,28 L820,18 L830,12 L840,18 L840,32 L900,32 L900,38 L1000,38 L1000,30 L1020,30 L1020,20 L1030,14 L1040,20 L1040,35 L1100,35 L1100,40 L1200,40 L1200,50Z" fill="#fff"/>
          </svg>
        </div>

        {/* ── Top accent strip ── */}
        <div className="h-[3px] relative overflow-hidden z-10">
          <div className="absolute inset-0"
               style={{
                 background: `linear-gradient(90deg, ${accent}80, ${accent}, ${accent}80)`,
                 backgroundSize: '200% 100%',
                 animation: 'shimmer 3s linear infinite',
               }} />
        </div>

        {/* ── Header ── */}
        <div className="relative z-10 px-5 pt-3 pb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: `${accent}15`, border: `1px solid ${accent}20` }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0011.5 2 1.5 1.5 0 0010 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill={accent} opacity="0.85"/>
              </svg>
            </div>
            <div>
              <div className="text-[8px] font-mono tracking-[0.3em] uppercase" style={{ color: `${accent}80` }}>Flight Control</div>
              <div className="text-white text-xs font-bold tracking-wide">Visa Journey Tracker</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md text-[9px] font-bold"
               style={{ background: `${accent}10`, border: `1px solid ${accent}20`, color: accent }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent, animation: isFinal || isRejected ? 'none' : 'pulse 2s ease-in-out infinite' }} />
            {isFinal ? 'VISA CONFIRMED' : isRejected ? 'REJECTED' : statusLabel.toUpperCase()}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            SINGLE RUNWAY STRIP — checkpoints + airplane + comments
            ══════════════════════════════════════════════════════════ */}
        <div className="relative z-10 px-5 pt-1 pb-4">
          <div className="relative rounded-xl overflow-visible"
               style={{
                 background: 'linear-gradient(180deg, rgba(20,28,44,0.9) 0%, rgba(26,34,50,0.95) 100%)',
                 border: '1px solid rgba(255,255,255,0.04)',
                 backdropFilter: 'blur(8px)',
               }}>

            {/* Runway label */}
            <div className="px-3 pt-2 pb-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 4px ${accent}` }} />
                <span className="text-[7px] font-mono font-bold tracking-[0.15em] uppercase" style={{ color: `${accent}70` }}>
                  RWY 09/27 — {isFinal ? 'Cleared for takeoff' : isRejected ? 'Hold position' : 'Taxiing'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-mono" style={{ color: `${accent}90` }}>{completed}/{totalSteps}</span>
                <div className="px-1.5 py-[1px] rounded text-[8px] font-mono font-bold"
                     style={{ background: `${accent}12`, color: accent }}>{Math.round(pct)}%</div>
                {isFinal && (
                  <div className="px-1.5 py-[1px] rounded text-[8px] font-bold bg-emerald-500/15 text-emerald-400 flex items-center gap-0.5">
                    <Check size={9} strokeWidth={3} /> CLEARED
                  </div>
                )}
              </div>
            </div>

            {/* ── Edge lights top ── */}
            <div className="absolute left-3 right-3 flex justify-between" style={{ top: 32 }}>
              {[...Array(50)].map((_, i) => (
                <div key={`t${i}`} className="w-[2.5px] h-[2.5px] rounded-full transition-all duration-500"
                     style={{
                       background: i / 49 <= pct / 100 ? accent : 'rgba(255,255,255,0.04)',
                       boxShadow: i / 49 <= pct / 100 ? `0 0 4px ${accent}50` : 'none',
                     }} />
              ))}
            </div>

            {/* ── Edge lights bottom ── */}
            <div className="absolute left-3 right-3 flex justify-between" style={{ bottom: 8 }}>
              {[...Array(50)].map((_, i) => (
                <div key={`b${i}`} className="w-[2.5px] h-[2.5px] rounded-full transition-all duration-500"
                     style={{
                       background: i / 49 <= pct / 100 ? accent : 'rgba(255,255,255,0.04)',
                       boxShadow: i / 49 <= pct / 100 ? `0 0 4px ${accent}50` : 'none',
                     }} />
              ))}
            </div>

            {/* ── Center dashes ── */}
            <div className="absolute left-8 right-8 flex items-center gap-[3px]" style={{ top: '50%', transform: 'translateY(-50%)' }}>
              {[...Array(55)].map((_, i) => (
                <div key={`d${i}`} className="flex-1 h-[1.5px] rounded"
                     style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'transparent' }} />
              ))}
            </div>

            {/* ── Progress glow overlay ── */}
            <div className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-1000"
                 style={{ background: `linear-gradient(90deg, ${accent}08 0%, ${accent}04 ${pct}%, transparent ${pct + 3}%)` }} />

            {/* ── AIRPLANE on the runway ── */}
            <div className="absolute z-20 transition-all duration-1000 ease-out"
                 style={{
                   left: `calc(${Math.max(3, Math.min(pct, 93))}%)`,
                   top: '50%',
                   transform: 'translateY(-50%)',
                 }}>
              <div style={{
                animation: isFinal || isRejected ? 'none' : 'planeHover 2s ease-in-out infinite',
              }}>
                {/* Shadow */}
                <div className="absolute left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full"
                     style={{
                       top: 24,
                       background: 'rgba(0,0,0,0.25)', filter: 'blur(2px)',
                       transform: isFinal ? 'translateY(6px) scale(0.5)' : 'none',
                       transition: 'transform 1s ease',
                     }} />

                {/* Plane SVG */}
                <svg width="28" height="28" viewBox="0 0 40 40" fill="none"
                     style={{
                       filter: `drop-shadow(0 0 8px ${accent}90)`,
                       transform: isFinal ? 'rotate(-30deg) translateY(-6px) scale(1.15)' : isRejected ? 'rotate(8deg)' : 'rotate(0deg)',
                       transition: 'transform 1s cubic-bezier(0.4,0,0.2,1)',
                     }}>
                  <ellipse cx="20" cy="20" rx="12" ry="3" fill={accent} opacity="0.9"/>
                  <path d="M32 20 L38 19.5 L38 20.5 Z" fill={accent}/>
                  <path d="M16 20 L22 20 L24 10 L20 12 Z" fill={accent} opacity="0.7"/>
                  <path d="M16 20 L22 20 L24 30 L20 28 Z" fill={accent} opacity="0.7"/>
                  <path d="M8 20 L10 20 L11 15 L9 16 Z" fill={accent} opacity="0.6"/>
                  <path d="M8 20 L10 20 L11 25 L9 24 Z" fill={accent} opacity="0.6"/>
                  <path d="M9 20 L10 14 L11 15 L10 20Z" fill={accent} opacity="0.8"/>
                  <ellipse cx="22" cy="19.5" rx="0.6" ry="0.6" fill="#fff" opacity="0.5"/>
                  <ellipse cx="24.5" cy="19.5" rx="0.6" ry="0.6" fill="#fff" opacity="0.5"/>
                  <ellipse cx="27" cy="19.5" rx="0.6" ry="0.6" fill="#fff" opacity="0.4"/>
                  <path d="M32 18.5 Q35 19 35 20 Q35 21 32 21.5" fill="#63e0ff" opacity="0.4"/>
                  <circle cx="24" cy="10" r="0.8" fill="#ef4444" opacity="0.8"/>
                  <circle cx="24" cy="30" r="0.8" fill="#22c55e" opacity="0.8"/>
                </svg>

                {/* Exhaust */}
                {!isRejected && (
                  <div className="absolute top-1/2 -translate-y-1/2 right-full flex gap-[1px] items-center">
                    {[...Array(7)].map((_, i) => (
                      <div key={`e${i}`} className="rounded-full"
                           style={{
                             width: Math.max(1, 7 - i),
                             height: Math.max(1, 3.5 - i * 0.4),
                             background: i < 2 ? '#fff' : accent,
                             opacity: Math.max(0.02, 0.35 - i * 0.05),
                             animation: `exhaustPulse ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
                           }} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Threshold markings (left) ── */}
            <div className="absolute left-[4px] flex flex-col justify-center gap-[3px]" style={{ top: 36, bottom: 12 }}>
              {[...Array(5)].map((_, i) => (
                <div key={`lm${i}`} className="w-[10px] h-[2px] rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
              ))}
            </div>

            {/* ── Threshold markings (right) ── */}
            <div className="absolute right-[4px] flex flex-col justify-center gap-[3px]" style={{ top: 36, bottom: 12 }}>
              {[...Array(5)].map((_, i) => (
                <div key={`rm${i}`} className="w-[10px] h-[2px] rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
              ))}
            </div>

            {/* ── Approach lights (blinking, far end) ── */}
            <div className="absolute right-[18px] flex gap-[3px] items-center" style={{ top: '50%', transform: 'translateY(-50%)' }}>
              {[0, 1, 2].map(i => (
                <div key={`ap${i}`} className="w-[3px] h-[3px] rounded-full"
                     style={{
                       background: isFinal ? '#10b981' : '#fbbf24',
                       animation: `approachBlink ${1 + i * 0.3}s ease-in-out infinite alternate`,
                       boxShadow: `0 0 4px ${isFinal ? 'rgba(16,185,129,0.6)' : 'rgba(251,191,36,0.5)'}`,
                     }} />
              ))}
            </div>

            {/* ══════════════════════════════════════
                 9 STEP MARKERS ON THE RUNWAY
                ══════════════════════════════════════ */}
            <div className="relative flex items-stretch justify-between px-5 pt-3 pb-2" style={{ minHeight: 120 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((step, idx) => {
                const done = step < activeStep || (step === activeStep && isFinal);
                const active = step === activeStep && !done;
                const rej = active && isRejected;

                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center relative" style={{ zIndex: 10, flex: '0 0 auto', width: 68 }}>

                      {/* Zone tag */}
                      <div className="px-1.5 py-[1px] rounded text-[5.5px] font-black tracking-[0.12em] uppercase mb-1 transition-all duration-500"
                           style={{
                             background: done ? `${accent}20` : active ? `${accent}12` : 'transparent',
                             color: done ? accent : active ? accent : 'rgba(148,163,184,0.25)',
                             border: done || active ? `1px solid ${accent}20` : '1px solid transparent',
                           }}>
                        {ZONE_TAGS[idx]}
                      </div>

                      {/* Node */}
                      <div className="relative">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all duration-500"
                             style={{
                               background: done ? accent : rej ? '#ef4444' : active ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                               color: done || rej ? '#fff' : active ? accent : 'rgba(148,163,184,0.25)',
                               border: active ? `2px solid ${rej ? '#ef4444' : accent}` : done ? 'none' : '1px solid rgba(255,255,255,0.04)',
                               boxShadow: done ? `0 0 12px ${accent}40, 0 3px 8px rgba(0,0,0,0.3)` : active ? `0 0 16px ${rej ? 'rgba(239,68,68,0.25)' : `${accent}25`}` : 'none',
                             }}>
                          {done ? <Check size={14} strokeWidth={3} /> : rej ? <X size={14} strokeWidth={3} /> : step}
                        </div>
                        {active && !rej && (
                          <div className="absolute -inset-1 rounded-lg animate-ping pointer-events-none"
                               style={{ border: `1.5px solid ${accent}`, opacity: 0.1, animationDuration: '2.5s' }} />
                        )}
                        {/* Taxiway light */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full transition-all"
                             style={{ background: done ? accent : 'rgba(255,255,255,0.06)', boxShadow: done ? `0 0 5px ${accent}50` : 'none' }} />
                      </div>

                      {/* Step label */}
                      <div className={`mt-2.5 text-[6.5px] font-bold uppercase tracking-wider text-center leading-tight max-w-[60px] transition-colors duration-500 ${
                        done ? 'text-emerald-300/80' : rej ? 'text-red-300/80' : active ? 'text-white/80' : 'text-slate-600/30'
                      }`}>
                        {STEP_LABELS[step]}
                      </div>

                      {/* Comment */}
                      <div className={`mt-0.5 text-[5.5px] italic text-center leading-tight max-w-[62px] transition-all duration-500 ${
                        done ? 'text-emerald-400/40' : active ? `text-sky-300/50` : 'text-transparent'
                      }`}
                      style={{ color: rej ? 'rgba(248,113,113,0.4)' : undefined }}>
                        {(done || active) ? STEP_COMMENTS[step] : '\u00A0'}
                      </div>
                    </div>

                    {/* Connector */}
                    {idx < 8 && (
                      <div className="flex-1 flex items-center mx-0.5" style={{ marginTop: 22 }}>
                        <div className="w-full h-[2px] rounded-full relative overflow-hidden transition-all duration-700"
                             style={{ background: done ? `${accent}45` : 'rgba(255,255,255,0.025)' }}>
                          {done && (
                            <div className="absolute inset-0"
                                 style={{ background: `linear-gradient(90deg, transparent, ${accent}70, transparent)`, animation: 'connectorGlow 2.5s ease-in-out infinite' }} />
                          )}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* ── DEPARTURE / ARRIVAL footer ── */}
            <div className="px-4 pb-2 flex items-center justify-between">
              <span className="text-[7px] font-mono text-slate-600 tracking-wider flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600">
                  <rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="10" r="3"/>
                </svg>
                DEPARTURE
              </span>
              <span className="text-[7px] font-mono tracking-wider" style={{ color: `${accent}60` }}>
                {completed} of {totalSteps} checkpoints cleared
              </span>
              <span className="text-[7px] font-mono text-slate-600 tracking-wider flex items-center gap-1">
                ARRIVAL
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600">
                  <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0011.5 2 1.5 1.5 0 0010 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* CSS */}
        <style>{`
          @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
          @keyframes twinkle { 0%,100%{opacity:.15;transform:scale(1)} 50%{opacity:.7;transform:scale(1.3)} }
          @keyframes connectorGlow { 0%,100%{opacity:.3} 50%{opacity:1} }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
          @keyframes planeHover { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
          @keyframes exhaustPulse { 0%{opacity:.15;transform:scaleX(.8)} 100%{opacity:.4;transform:scaleX(1.2)} }
          @keyframes approachBlink { 0%{opacity:.3} 100%{opacity:1} }
        `}</style>
      </div>
    </div>
  );
}
