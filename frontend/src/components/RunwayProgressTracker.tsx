import { Check, X, Plane } from 'lucide-react';
import { STEP_LABELS, STATUS_TO_STEP, type VisaRequestStatus } from '@/src/visaApi';

interface Props {
  status: VisaRequestStatus;
  currentStep: number;
}

const REJECTED_STATUSES: VisaRequestStatus[] = ['COST_CENTRE_REJECTED', 'EVP_REJECTED'];

// Step icons — small runway markers
const STEP_ICONS: Record<number, string> = {
  1: '\u2709',   // envelope — Submit to HR
  2: '\uD83D\uDCB0', // money bag — Cost Proposal
  3: '\u2705',   // check — Cost Centre Approval
  4: '\uD83C\uDFE2', // office — Vendor Request
  5: '\uD83D\uDCC5', // calendar — Vendor Dates
  6: '\uD83D\uDCE4', // outbox — Share Dates
  7: '\uD83D\uDC64', // person — Applicant Selection
  8: '\uD83D\uDD12', // lock — EVP Approval
  9: '\u2708',   // airplane — Booking Confirmed
};

export function RunwayProgressTracker({ status, currentStep }: Props) {
  const activeStep = STATUS_TO_STEP[status] || currentStep;
  const isRejected = REJECTED_STATUSES.includes(status);
  const isFinalCompleted = status === 'APPOINTMENT_CONFIRMED';

  // Calculate airplane position (percentage along the runway)
  const totalSteps = 9;
  const completedSteps = isFinalCompleted ? totalSteps : activeStep - 1;
  const airplanePercent = (completedSteps / (totalSteps - 1)) * 100;

  return (
    <div className="w-full py-6 px-2">
      {/* Sky gradient background */}
      <div className="relative rounded-2xl overflow-hidden"
           style={{
             background: 'linear-gradient(180deg, #0c1445 0%, #1a237e 30%, #283593 50%, #3949ab 70%, #5c6bc0 85%, #9fa8da 100%)',
             minHeight: '280px',
           }}>

        {/* Stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                top: `${Math.random() * 40}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.6 + 0.2,
                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Moon */}
        <div className="absolute top-4 right-8 w-10 h-10 rounded-full"
             style={{
               background: 'radial-gradient(circle at 35% 35%, #fff9c4, #fff176, #ffee58)',
               boxShadow: '0 0 20px rgba(255,249,196,0.4), 0 0 40px rgba(255,249,196,0.2)',
             }} />

        {/* Clouds */}
        <div className="absolute top-12 left-[15%] opacity-20">
          <svg width="80" height="30" viewBox="0 0 80 30">
            <ellipse cx="40" cy="20" rx="35" ry="10" fill="white"/>
            <ellipse cx="25" cy="15" rx="20" ry="12" fill="white"/>
            <ellipse cx="55" cy="14" rx="22" ry="11" fill="white"/>
          </svg>
        </div>
        <div className="absolute top-20 right-[25%] opacity-15">
          <svg width="60" height="25" viewBox="0 0 60 25">
            <ellipse cx="30" cy="16" rx="28" ry="9" fill="white"/>
            <ellipse cx="18" cy="12" rx="16" ry="10" fill="white"/>
            <ellipse cx="42" cy="11" rx="18" ry="9" fill="white"/>
          </svg>
        </div>

        {/* Title */}
        <div className="relative pt-4 pb-2 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
              <Plane size={16} className="text-amber-300" />
              <span className="text-white/90 text-xs font-bold uppercase tracking-widest">
                Visa Journey Tracker
              </span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <span className="text-white/70 text-xs font-mono">
              {isFinalCompleted ? 'ARRIVED' : isRejected ? 'GROUNDED' : `STEP ${activeStep} OF ${totalSteps}`}
            </span>
          </div>
        </div>

        {/* Main runway area */}
        <div className="relative px-6 pt-8 pb-6">

          {/* Runway strip */}
          <div className="relative mx-auto" style={{ maxWidth: '95%' }}>

            {/* Runway background */}
            <div className="relative h-16 rounded-lg overflow-hidden"
                 style={{
                   background: 'linear-gradient(180deg, #37474f 0%, #455a64 50%, #37474f 100%)',
                   boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.05)',
                 }}>

              {/* Runway center dashes */}
              <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex items-center justify-between px-4">
                {[...Array(25)].map((_, i) => (
                  <div key={i} className="h-[2px] flex-1 mx-1 rounded"
                       style={{
                         background: i % 2 === 0 ? 'rgba(255,255,255,0.35)' : 'transparent',
                       }} />
                ))}
              </div>

              {/* Runway edge lights (top) */}
              <div className="absolute top-1 left-0 right-0 flex justify-between px-2">
                {[...Array(18)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full"
                       style={{
                         background: i / 17 <= airplanePercent / 100
                           ? '#4fc3f7'
                           : 'rgba(255,255,255,0.15)',
                         boxShadow: i / 17 <= airplanePercent / 100
                           ? '0 0 4px #4fc3f7, 0 0 8px rgba(79,195,247,0.3)'
                           : 'none',
                       }} />
                ))}
              </div>

              {/* Runway edge lights (bottom) */}
              <div className="absolute bottom-1 left-0 right-0 flex justify-between px-2">
                {[...Array(18)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full"
                       style={{
                         background: i / 17 <= airplanePercent / 100
                           ? '#4fc3f7'
                           : 'rgba(255,255,255,0.15)',
                         boxShadow: i / 17 <= airplanePercent / 100
                           ? '0 0 4px #4fc3f7, 0 0 8px rgba(79,195,247,0.3)'
                           : 'none',
                       }} />
                ))}
              </div>

              {/* Completed runway overlay (green glow) */}
              <div className="absolute inset-0 rounded-lg transition-all duration-1000"
                   style={{
                     background: `linear-gradient(90deg, rgba(76,175,80,0.15) 0%, rgba(76,175,80,0.08) ${airplanePercent}%, transparent ${airplanePercent}%)`,
                   }} />
            </div>

            {/* Airplane on the runway */}
            <div className="absolute top-0 h-16 flex items-center transition-all duration-1000 ease-out"
                 style={{
                   left: `${airplanePercent}%`,
                   transform: 'translateX(-50%)',
                   zIndex: 20,
                 }}>
              <div className={`relative ${isFinalCompleted ? '' : isRejected ? '' : 'animate-bounce'}`}
                   style={{ animationDuration: '2s' }}>
                {/* Airplane glow */}
                <div className="absolute inset-0 rounded-full"
                     style={{
                       background: isRejected
                         ? 'radial-gradient(circle, rgba(244,67,54,0.4) 0%, transparent 70%)'
                         : isFinalCompleted
                         ? 'radial-gradient(circle, rgba(76,175,80,0.4) 0%, transparent 70%)'
                         : 'radial-gradient(circle, rgba(255,193,7,0.4) 0%, transparent 70%)',
                       width: '60px',
                       height: '60px',
                       top: '-15px',
                       left: '-15px',
                     }} />
                {/* Airplane icon */}
                <div style={{
                  fontSize: '28px',
                  transform: isRejected ? 'rotate(90deg)' : isFinalCompleted ? 'rotate(-30deg)' : 'rotate(0deg)',
                  filter: isRejected
                    ? 'drop-shadow(0 0 6px rgba(244,67,54,0.8))'
                    : isFinalCompleted
                    ? 'drop-shadow(0 0 6px rgba(76,175,80,0.8))'
                    : 'drop-shadow(0 0 6px rgba(255,193,7,0.8))',
                  transition: 'all 0.5s ease',
                }}>
                  {isRejected ? '\uD83D\uDEEB' : isFinalCompleted ? '\uD83D\uDEEB' : '\u2708\uFE0F'}
                </div>
              </div>
            </div>

            {/* Step markers along the runway */}
            <div className="relative flex justify-between mt-4" style={{ maxWidth: '100%' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((step) => {
                const isCompleted = step < activeStep || (step === activeStep && isFinalCompleted);
                const isActive = step === activeStep && !isCompleted;
                const isRejectedStep = isActive && isRejected;

                return (
                  <div key={step} className="flex flex-col items-center" style={{ width: '11.11%' }}>
                    {/* Marker dot */}
                    <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg'
                        : isRejectedStep
                        ? 'bg-red-500 border-red-400 text-white shadow-lg'
                        : isActive
                        ? 'bg-amber-500 border-amber-400 text-white shadow-lg'
                        : 'bg-slate-700 border-slate-600 text-slate-400'
                    }`}
                    style={{
                      boxShadow: isCompleted
                        ? '0 0 10px rgba(76,175,80,0.5), 0 2px 8px rgba(0,0,0,0.3)'
                        : isRejectedStep
                        ? '0 0 10px rgba(244,67,54,0.5), 0 2px 8px rgba(0,0,0,0.3)'
                        : isActive
                        ? '0 0 10px rgba(255,193,7,0.5), 0 2px 8px rgba(0,0,0,0.3)'
                        : '0 2px 4px rgba(0,0,0,0.2)',
                    }}>
                      {isCompleted ? <Check size={14} /> : isRejectedStep ? <X size={14} /> : step}

                      {/* Pulse ring for active step */}
                      {isActive && !isRejected && (
                        <div className="absolute inset-0 rounded-full animate-ping"
                             style={{
                               border: '2px solid rgba(255,193,7,0.4)',
                               animationDuration: '2s',
                             }} />
                      )}
                    </div>

                    {/* Step label */}
                    <span className={`mt-2 text-[9px] uppercase tracking-wider font-bold text-center leading-tight max-w-[70px] ${
                      isCompleted ? 'text-emerald-300' :
                      isRejectedStep ? 'text-red-300' :
                      isActive ? 'text-amber-300' :
                      'text-slate-500'
                    }`}>
                      {STEP_LABELS[step]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress bar at bottom */}
          <div className="mt-6 mx-auto relative" style={{ maxWidth: '95%' }}>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-1000 ease-out"
                   style={{
                     width: `${airplanePercent}%`,
                     background: isRejected
                       ? 'linear-gradient(90deg, #ef5350, #f44336)'
                       : isFinalCompleted
                       ? 'linear-gradient(90deg, #66bb6a, #4caf50, #43a047)'
                       : 'linear-gradient(90deg, #42a5f5, #2196f3, #1e88e5)',
                     boxShadow: isRejected
                       ? '0 0 8px rgba(244,67,54,0.5)'
                       : isFinalCompleted
                       ? '0 0 8px rgba(76,175,80,0.5)'
                       : '0 0 8px rgba(33,150,243,0.5)',
                   }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-white/30 font-mono">DEPARTURE</span>
              <span className="text-[10px] text-white/30 font-mono">
                {Math.round(airplanePercent)}% COMPLETE
              </span>
              <span className="text-[10px] text-white/30 font-mono">ARRIVAL</span>
            </div>
          </div>
        </div>

        {/* CSS animations */}
        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.8; }
          }
        `}</style>
      </div>
    </div>
  );
}
