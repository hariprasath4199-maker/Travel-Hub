import React from 'react';
import { Check, X } from 'lucide-react';
import {
  STATUS_TO_STEP as TICKET_STATUS_TO_STEP,
  STATUS_LABELS,
  type TicketBookingStatus,
  type TicketBooking,
} from '@/src/ticketApi';

interface Props {
  currentStep: number;
  status?: string;
  booking?: TicketBooking;
}

const REJECTED_STATUSES: TicketBookingStatus[] = ['EVP_REJECTED'];

const STEPS = [
  { num: 1, label: 'Request Raised',      tag: 'CHECK-IN'   },
  { num: 2, label: 'Itinerary Requested', tag: 'SECURITY'   },
  { num: 3, label: 'Options Received',    tag: 'LOUNGE'     },
  { num: 4, label: 'Approval Pending',    tag: 'GATE'       },
  { num: 5, label: 'Booking Confirmed',   tag: 'BOARDING'   },
  { num: 6, label: 'Ticket Delivered',    tag: 'TAKEOFF'    },
];

/* country → rough IATA-style code mapping for display */
const DEST_CODES: Record<string, string> = {
  germany: 'FRA', finland: 'HEL', norway: 'OSL', sweden: 'ARN', denmark: 'CPH',
  france: 'CDG', spain: 'MAD', italy: 'FCO', uk: 'LHR', usa: 'JFK',
  india: 'DEL', japan: 'NRT', australia: 'SYD', canada: 'YYZ', brazil: 'GRU',
  netherlands: 'AMS', switzerland: 'ZRH', austria: 'VIE', belgium: 'BRU',
  portugal: 'LIS', ireland: 'DUB', poland: 'WAW', czech: 'PRG', greece: 'ATH',
};

function getAirportCode(dest: string): string {
  const lower = dest.toLowerCase().trim();
  return DEST_CODES[lower] || dest.substring(0, 3).toUpperCase();
}

function formatDate(d: string): string {
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

function formatTime(d: string): string {
  try { return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
  catch { return '--:--'; }
}

export function BoardingPassTracker({ currentStep, status, booking }: Props) {
  const ticketStatus = status as TicketBookingStatus | undefined;
  const activeStep = ticketStatus ? (TICKET_STATUS_TO_STEP[ticketStatus] || currentStep) : currentStep;
  const isRejected = ticketStatus ? REJECTED_STATUSES.includes(ticketStatus) : false;
  const isFinal = ticketStatus === 'COMPLETED' || ticketStatus === 'TICKET_SHARED';
  const statusLabel = ticketStatus ? STATUS_LABELS[ticketStatus] : '';
  const completedCount = isFinal ? 6 : activeStep - 1;

  /* Extract booking info */
  const passenger = booking?.applicantName || 'Passenger';
  const destination = booking?.destination || 'Destination';
  const destCode = getAirportCode(destination);
  const originCode = 'HEL'; // Helsinki as Zalaris default
  const flightNo = booking?.selectedItinerary?.flightNumber || booking?.itineraryOptions?.[0]?.flightNumber || 'ZA-' + (booking?.id?.slice(-4) || '0001');
  const airline = booking?.selectedItinerary?.airline || booking?.itineraryOptions?.[0]?.airline || 'Zalaris Air';
  const travelDate = booking?.travelStartDate ? formatDate(booking.travelStartDate) : '--';
  const depTime = booking?.selectedItinerary?.departureTime ? formatTime(booking.selectedItinerary.departureTime) : '--:--';
  const arrTime = booking?.selectedItinerary?.arrivalTime ? formatTime(booking.selectedItinerary.arrivalTime) : '--:--';
  const seatClass = booking?.selectedItinerary?.class || 'Economy';
  const ticketId = booking?.id || 'TB-0000';

  const accentColor = isFinal ? '#10b981' : isRejected ? '#ef4444' : '#0ea5e9';
  const accentBg = isFinal ? 'rgba(16,185,129,0.08)' : isRejected ? 'rgba(239,68,68,0.08)' : 'rgba(14,165,233,0.08)';

  return (
    <div className="w-full py-3">
      {/* === FLIGHT TICKET CONTAINER === */}
      <div className="relative flex rounded-2xl overflow-hidden"
           style={{
             background: '#fff',
             boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
             minHeight: 260,
           }}>

        {/* ─── LEFT: Main ticket body ─── */}
        <div className="flex-1 relative overflow-hidden">

          {/* Top colored strip */}
          <div className="h-2 relative overflow-hidden">
            <div className="absolute inset-0"
                 style={{
                   background: `linear-gradient(90deg, ${accentColor}, ${isFinal ? '#34d399' : isRejected ? '#f87171' : '#38bdf8'}, ${accentColor})`,
                   backgroundSize: '200% 100%',
                   animation: 'shimmer 4s linear infinite',
                 }} />
          </div>

          {/* Airline header */}
          <div className="px-6 pt-4 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Airplane logo */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                   style={{ background: accentBg, border: `1.5px solid ${accentColor}22` }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0011.5 2 1.5 1.5 0 0010 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                        fill={accentColor} opacity="0.85"/>
                </svg>
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: accentColor }}>{airline}</div>
                <div className="text-[10px] text-slate-400 font-mono">BOARDING PASS</div>
              </div>
            </div>
            {/* Status badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold"
                 style={{ background: accentBg, color: accentColor }}>
              <span className={`w-1.5 h-1.5 rounded-full ${isFinal ? 'bg-emerald-500' : isRejected ? 'bg-red-500' : 'bg-sky-500 animate-pulse'}`} />
              {isFinal ? 'COMPLETED' : isRejected ? 'REJECTED' : statusLabel.toUpperCase() || 'IN PROGRESS'}
            </div>
          </div>

          {/* ── Route section: FROM → TO ── */}
          <div className="px-6 pb-3 flex items-center gap-4">
            {/* Origin */}
            <div className="text-center">
              <div className="text-3xl font-black text-slate-800 tracking-wide leading-none">{originCode}</div>
              <div className="text-[9px] text-slate-400 font-medium mt-1">HELSINKI</div>
            </div>

            {/* Flight path visualization */}
            <div className="flex-1 relative flex items-center px-2" style={{ height: 36 }}>
              <div className="absolute left-0 right-0 top-1/2 h-[1px]" style={{ background: `${accentColor}30` }} />
              {/* Dashes */}
              <div className="absolute left-2 right-2 top-1/2 flex items-center gap-[3px] -translate-y-1/2">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="flex-1 h-[1px] rounded"
                       style={{
                         background: i / 19 <= completedCount / 6 ? accentColor : `${accentColor}20`,
                         transition: 'background 0.5s ease',
                       }} />
                ))}
              </div>
              {/* Moving airplane */}
              <div className="absolute transition-all duration-1000 ease-out -translate-y-1/2"
                   style={{
                     top: '50%',
                     left: `${Math.min((completedCount / 5) * 100, 96)}%`,
                   }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                     style={{
                       filter: `drop-shadow(0 0 6px ${accentColor}80)`,
                       transform: isFinal ? 'rotate(-15deg) scale(1.1)' : 'rotate(0deg)',
                       transition: 'transform 0.5s ease',
                     }}>
                  <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0011.5 2 1.5 1.5 0 0010 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                        fill={accentColor}/>
                </svg>
              </div>
              {/* Departure/Arrival circles */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2"
                   style={{ borderColor: accentColor, background: completedCount > 0 ? accentColor : '#fff' }} />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2"
                   style={{ borderColor: accentColor, background: isFinal ? accentColor : '#fff' }} />
            </div>

            {/* Destination */}
            <div className="text-center">
              <div className="text-3xl font-black text-slate-800 tracking-wide leading-none">{destCode}</div>
              <div className="text-[9px] text-slate-400 font-medium mt-1 uppercase">{destination}</div>
            </div>
          </div>

          {/* ── Flight details grid ── */}
          <div className="px-6 py-3 border-t border-dashed border-slate-200">
            <div className="grid grid-cols-5 gap-3">
              <div>
                <div className="text-[8px] font-bold text-slate-400 tracking-wider">PASSENGER</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5 truncate">{passenger.toUpperCase()}</div>
              </div>
              <div>
                <div className="text-[8px] font-bold text-slate-400 tracking-wider">FLIGHT</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5 font-mono">{flightNo}</div>
              </div>
              <div>
                <div className="text-[8px] font-bold text-slate-400 tracking-wider">DATE</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5">{travelDate}</div>
              </div>
              <div>
                <div className="text-[8px] font-bold text-slate-400 tracking-wider">DEPARTS</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5 font-mono">{depTime}</div>
              </div>
              <div>
                <div className="text-[8px] font-bold text-slate-400 tracking-wider">CLASS</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5">{seatClass.toUpperCase()}</div>
              </div>
            </div>
          </div>

          {/* ── Step journey (bottom) ── */}
          <div className="px-6 py-3 border-t border-slate-100" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            <div className="flex items-center justify-between">
              {STEPS.map((step, idx) => {
                const done = step.num < activeStep || (step.num === activeStep && isFinal);
                const active = step.num === activeStep && !done;
                const rejected = active && isRejected;

                return (
                  <React.Fragment key={step.num}>
                    <div className="flex flex-col items-center" style={{ minWidth: 52 }}>
                      {/* Circle node */}
                      <div className="relative">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500`}
                             style={{
                               background: done
                                 ? accentColor
                                 : rejected
                                 ? '#ef4444'
                                 : active
                                 ? '#fff'
                                 : '#e2e8f0',
                               color: done
                                 ? '#fff'
                                 : rejected
                                 ? '#fff'
                                 : active
                                 ? accentColor
                                 : '#94a3b8',
                               border: active ? `2px solid ${accentColor}` : rejected ? '2px solid #ef4444' : 'none',
                               boxShadow: done
                                 ? `0 2px 8px ${accentColor}40`
                                 : active
                                 ? `0 0 0 4px ${accentColor}15`
                                 : 'none',
                             }}>
                          {done ? <Check size={13} strokeWidth={3} /> : rejected ? <X size={13} strokeWidth={3} /> : step.num}
                        </div>
                        {active && !rejected && (
                          <div className="absolute -inset-1 rounded-full animate-ping opacity-20"
                               style={{ border: `2px solid ${accentColor}`, animationDuration: '2s' }} />
                        )}
                      </div>

                      {/* Tag label */}
                      <div className={`mt-1.5 px-1.5 py-0.5 rounded text-[7px] font-bold tracking-wider transition-all duration-300 ${
                        done ? 'text-white' : active ? 'text-white' : rejected ? 'text-white' : 'text-slate-400 bg-transparent'
                      }`}
                      style={{
                        background: done ? accentColor : active ? `${accentColor}cc` : rejected ? '#ef4444cc' : 'transparent',
                      }}>
                        {step.tag}
                      </div>
                      <div className={`text-[7px] mt-0.5 font-medium leading-tight text-center max-w-[56px] ${
                        done ? 'text-slate-600' : active ? 'text-slate-800' : 'text-slate-300'
                      }`}>
                        {step.label}
                      </div>
                    </div>

                    {/* Connector */}
                    {idx < STEPS.length - 1 && (
                      <div className="flex-1 mx-1 mt-[-18px]">
                        <div className="h-[2px] rounded-full relative overflow-hidden"
                             style={{ background: done ? `${accentColor}60` : '#e2e8f0' }}>
                          {done && (
                            <div className="absolute inset-0"
                                 style={{
                                   background: `linear-gradient(90deg, transparent, ${accentColor}90, transparent)`,
                                   animation: 'connectorGlow 2.5s ease-in-out infinite',
                                 }} />
                          )}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── PERFORATED EDGE ─── */}
        <div className="relative w-[1px] flex-shrink-0" style={{ background: 'transparent' }}>
          {/* Notch top */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-100 z-10" />
          {/* Notch bottom */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-100 z-10" />
          {/* Dashes */}
          <div className="absolute top-4 bottom-4 left-1/2 -translate-x-1/2 w-0 flex flex-col items-center gap-[6px]">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-[1px] h-[6px] rounded" style={{ background: '#cbd5e1' }} />
            ))}
          </div>
        </div>

        {/* ─── RIGHT: Ticket stub ─── */}
        <div className="w-[140px] flex-shrink-0 relative overflow-hidden"
             style={{ background: 'linear-gradient(180deg, #f8fafc, #f1f5f9)' }}>

          {/* Top strip matching main ticket */}
          <div className="h-2" style={{ background: accentColor }} />

          <div className="px-3 pt-4 pb-3 flex flex-col items-center h-full">
            {/* Airline */}
            <div className="text-[8px] font-bold tracking-[0.2em] text-slate-400 mb-3">{airline.toUpperCase()}</div>

            {/* Route mini */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-black text-slate-700">{originCode}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: 'rotate(90deg)' }}>
                <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0011.5 2 1.5 1.5 0 0010 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                      fill={accentColor} opacity="0.6"/>
              </svg>
              <span className="text-sm font-black text-slate-700">{destCode}</span>
            </div>

            {/* Stub details */}
            <div className="w-full space-y-2.5">
              <div>
                <div className="text-[7px] font-bold text-slate-400 tracking-wider">PASSENGER</div>
                <div className="text-[9px] font-bold text-slate-700 truncate">{passenger.split(' ')[0]?.toUpperCase()}</div>
              </div>
              <div>
                <div className="text-[7px] font-bold text-slate-400 tracking-wider">FLIGHT</div>
                <div className="text-[10px] font-bold text-slate-700 font-mono">{flightNo}</div>
              </div>
              <div>
                <div className="text-[7px] font-bold text-slate-400 tracking-wider">DATE</div>
                <div className="text-[10px] font-bold text-slate-700">{travelDate}</div>
              </div>
              <div>
                <div className="text-[7px] font-bold text-slate-400 tracking-wider">GATE</div>
                <div className="text-sm font-black" style={{ color: accentColor }}>
                  {isFinal ? 'DONE' : isRejected ? 'N/A' : `G${activeStep}`}
                </div>
              </div>
            </div>

            {/* Barcode simulation at bottom */}
            <div className="mt-auto pt-3 w-full">
              <div className="flex gap-[1.5px] justify-center items-end h-[28px]">
                {[...Array(32)].map((_, i) => (
                  <div key={i}
                       style={{
                         width: i % 3 === 0 ? 2 : 1,
                         height: 10 + Math.sin(i * 0.8) * 8 + Math.random() * 6,
                         background: '#334155',
                         borderRadius: 0.5,
                         opacity: 0.6,
                       }} />
                ))}
              </div>
              <div className="text-[7px] text-center text-slate-400 font-mono mt-1">{ticketId}</div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes connectorGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
