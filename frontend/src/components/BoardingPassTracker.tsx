import { Check, X } from 'lucide-react';
import {
  STATUS_TO_STEP as TICKET_STATUS_TO_STEP,
  type TicketBookingStatus,
} from '@/src/ticketApi';

interface Props {
  currentStep: number;
  status?: string;
}

const REJECTED_STATUSES: TicketBookingStatus[] = ['EVP_REJECTED'];

/*  6-step airport boarding journey:
    1 — Check-in Counter   (Ticket Request)
    2 — Info Desk          (Itinerary Request)
    3 — Lounge Display     (Itinerary Provided)
    4 — Security Gate      (Share & EVP Approval)
    5 — Boarding Gate      (Booking Requested)
    6 — On-Board / Takeoff (Ticket Shared)                              */

const STEPS = [
  { num: 1, label: 'Check-In',       sub: 'Ticket Request',        icon: '\uD83D\uDECE\uFE0F' }, // 🛎️
  { num: 2, label: 'Info Desk',      sub: 'Itinerary Request',     icon: '\uD83D\uDCCB' },       // 📋
  { num: 3, label: 'Flight Board',   sub: 'Itinerary Provided',    icon: '\uD83D\uDDC3\uFE0F' }, // 🗃️
  { num: 4, label: 'Security',       sub: 'EVP Approval',          icon: '\uD83D\uDEE1\uFE0F' }, // 🛡️
  { num: 5, label: 'Boarding Gate',  sub: 'Booking Requested',     icon: '\uD83D\uDEAA' },       // 🚪
  { num: 6, label: 'On Board',       sub: 'Ticket Shared',         icon: '\u2708\uFE0F' },       // ✈️
];

export function BoardingPassTracker({ currentStep, status }: Props) {
  const ticketStatus = status as TicketBookingStatus | undefined;
  const activeStep = ticketStatus ? (TICKET_STATUS_TO_STEP[ticketStatus] || currentStep) : currentStep;
  const isRejected = ticketStatus ? REJECTED_STATUSES.includes(ticketStatus) : false;
  const isFinalCompleted = ticketStatus === 'COMPLETED' || ticketStatus === 'TICKET_SHARED';

  const totalSteps = 6;
  const completedSteps = isFinalCompleted ? totalSteps : activeStep - 1;
  const progressPercent = (completedSteps / (totalSteps - 1)) * 100;

  return (
    <div className="w-full py-6 px-2">
      {/* Airport terminal container */}
      <div className="relative rounded-2xl overflow-hidden"
           style={{
             background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 70%, #475569 100%)',
             minHeight: '320px',
           }}>

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-5"
             style={{
               backgroundImage: `
                 linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)
               `,
               backgroundSize: '40px 40px',
             }} />

        {/* Terminal windows glow at top */}
        <div className="absolute top-0 left-0 right-0 h-1"
             style={{ background: 'linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6, #06b6d4)' }} />

        {/* Header — styled like a departure board */}
        <div className="relative pt-5 pb-3 px-6">
          <div className="flex items-center justify-between">
            {/* Left: boarding pass style */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-lg px-4 py-2 flex items-center gap-3">
                  <span style={{ fontSize: '20px' }}>{'\u2708\uFE0F'}</span>
                  <div>
                    <div className="text-amber-300 text-[10px] font-mono tracking-[0.2em] uppercase">Boarding Pass</div>
                    <div className="text-white text-sm font-bold tracking-wider">TICKET JOURNEY</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: flight status display */}
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold tracking-wider ${
                isFinalCompleted
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : isRejected
                  ? 'bg-red-500/20 border border-red-500/40 text-red-300'
                  : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
              }`}>
                {isFinalCompleted ? '\u2705 BOARDED' : isRejected ? '\u274C DENIED' : `GATE ${activeStep} / ${totalSteps}`}
              </div>
            </div>
          </div>
        </div>

        {/* FIDS — Flight Information Display System bar */}
        <div className="mx-6 mb-4 rounded-lg overflow-hidden"
             style={{
               background: 'linear-gradient(180deg, #0c0c0c 0%, #1a1a2e 100%)',
               boxShadow: '0 0 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
             }}>

          {/* FIDS Header row */}
          <div className="flex items-center justify-between px-4 py-1.5"
               style={{ background: 'rgba(6,182,212,0.1)', borderBottom: '1px solid rgba(6,182,212,0.15)' }}>
            <span className="text-cyan-400 text-[10px] font-mono tracking-[0.15em] uppercase">Departures</span>
            <div className="flex gap-6">
              <span className="text-cyan-400/60 text-[10px] font-mono tracking-wider">STATUS</span>
              <span className="text-cyan-400/60 text-[10px] font-mono tracking-wider">ZONE</span>
            </div>
          </div>

          {/* Steps as departure board rows */}
          <div className="divide-y divide-white/5">
            {STEPS.map((step) => {
              const isCompleted = step.num < activeStep || (step.num === activeStep && isFinalCompleted);
              const isActive = step.num === activeStep && !isCompleted;
              const isRejectedStep = isActive && isRejected;

              return (
                <div key={step.num}
                     className={`flex items-center px-4 py-2.5 transition-all duration-500 ${
                       isActive ? 'bg-white/[0.03]' : ''
                     }`}>
                  {/* Step icon & number */}
                  <div className="flex items-center gap-3 w-12">
                    <span style={{ fontSize: '16px' }}>{step.icon}</span>
                  </div>

                  {/* Label & sublabel */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold tracking-wide ${
                      isCompleted ? 'text-emerald-300' :
                      isRejectedStep ? 'text-red-300' :
                      isActive ? 'text-white' :
                      'text-slate-500'
                    }`}>
                      {step.label}
                    </div>
                    <div className={`text-[10px] font-mono tracking-wider mt-0.5 ${
                      isCompleted ? 'text-emerald-500/60' :
                      isActive ? 'text-cyan-400/60' :
                      'text-slate-600'
                    }`}>
                      {step.sub}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="w-28 text-right">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                        <Check size={10} /> CLEARED
                      </span>
                    ) : isRejectedStep ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded">
                        <X size={10} /> DENIED
                      </span>
                    ) : isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-1 rounded animate-pulse">
                        {'\u25CF'} NOW
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-600">
                        WAITING
                      </span>
                    )}
                  </div>

                  {/* Zone indicator */}
                  <div className={`w-10 text-center ml-4 text-xs font-mono font-bold ${
                    isCompleted ? 'text-emerald-400' :
                    isRejectedStep ? 'text-red-400' :
                    isActive ? 'text-cyan-300' :
                    'text-slate-600'
                  }`}>
                    {step.num}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conveyor belt / progress section */}
        <div className="mx-6 mb-2">
          {/* Terminal walkway visualization */}
          <div className="relative h-14 rounded-lg overflow-hidden"
               style={{
                 background: 'linear-gradient(180deg, #1e1e2e 0%, #2a2a3e 50%, #1e1e2e 100%)',
                 boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
               }}>

            {/* Floor arrows / moving walkway pattern */}
            <div className="absolute inset-0 flex items-center px-3">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="flex-1 mx-0.5 flex items-center justify-center">
                  <div className="text-[10px] transition-all duration-500"
                       style={{
                         color: i / 19 <= progressPercent / 100
                           ? 'rgba(6,182,212,0.6)'
                           : 'rgba(255,255,255,0.08)',
                         transform: 'scaleX(1.5)',
                       }}>
                    {'\u276F'}
                  </div>
                </div>
              ))}
            </div>

            {/* Traveler icon moving along */}
            <div className="absolute top-0 h-full flex items-center transition-all duration-1000 ease-out"
                 style={{
                   left: `${Math.min(progressPercent, 95)}%`,
                   transform: 'translateX(-50%)',
                   zIndex: 10,
                 }}>
              <div className={`relative ${!isFinalCompleted && !isRejected ? '' : ''}`}>
                {/* Glow behind icon */}
                <div className="absolute -inset-3 rounded-full"
                     style={{
                       background: isRejected
                         ? 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)'
                         : isFinalCompleted
                         ? 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)'
                         : 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)',
                     }} />
                <span style={{
                  fontSize: '26px',
                  filter: isFinalCompleted
                    ? 'drop-shadow(0 0 8px rgba(16,185,129,0.6))'
                    : isRejected
                    ? 'drop-shadow(0 0 8px rgba(239,68,68,0.6))'
                    : 'drop-shadow(0 0 8px rgba(6,182,212,0.6))',
                }}>
                  {isFinalCompleted ? '\u2708\uFE0F' : isRejected ? '\uD83D\uDEAB' : '\uD83E\uDDF3'}
                </span>
              </div>
            </div>

            {/* Gate markers */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
              {STEPS.map((step) => {
                const pos = ((step.num - 1) / (totalSteps - 1)) * 100;
                const isCompleted = step.num < activeStep || (step.num === activeStep && isFinalCompleted);
                const isActive = step.num === activeStep && !isCompleted;
                return (
                  <div key={step.num}
                       className="flex flex-col items-center"
                       style={{ position: 'absolute', left: `${pos}%`, transform: 'translateX(-50%)', bottom: '2px' }}>
                    <div className={`w-1.5 h-3 rounded-t transition-all ${
                      isCompleted ? 'bg-emerald-400' :
                      isActive ? 'bg-cyan-400' :
                      'bg-slate-600'
                    }`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress percentage bar */}
          <div className="mt-2 relative">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-1000 ease-out"
                   style={{
                     width: `${progressPercent}%`,
                     background: isRejected
                       ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                       : isFinalCompleted
                       ? 'linear-gradient(90deg, #10b981, #059669)'
                       : 'linear-gradient(90deg, #06b6d4, #3b82f6)',
                     boxShadow: isRejected
                       ? '0 0 8px rgba(239,68,68,0.4)'
                       : isFinalCompleted
                       ? '0 0 8px rgba(16,185,129,0.4)'
                       : '0 0 8px rgba(6,182,212,0.4)',
                   }} />
            </div>
            <div className="flex justify-between mt-1.5 mb-1">
              <span className="text-[9px] text-slate-500 font-mono tracking-wider">CHECK-IN</span>
              <span className="text-[9px] font-mono tracking-wider"
                    style={{
                      color: isRejected ? '#ef4444' : isFinalCompleted ? '#10b981' : '#06b6d4',
                    }}>
                {Math.round(progressPercent)}% THROUGH TERMINAL
              </span>
              <span className="text-[9px] text-slate-500 font-mono tracking-wider">BOARDING</span>
            </div>
          </div>
        </div>

        {/* Bottom decorative terminal lights */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 pb-1">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full"
                 style={{
                   background: i / 11 <= progressPercent / 100
                     ? 'rgba(6,182,212,0.5)'
                     : 'rgba(255,255,255,0.05)',
                   boxShadow: i / 11 <= progressPercent / 100
                     ? '0 0 3px rgba(6,182,212,0.3)'
                     : 'none',
                 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
