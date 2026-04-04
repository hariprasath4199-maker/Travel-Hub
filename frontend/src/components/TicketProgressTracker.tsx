import { Send, FileSearch, FileText, UserCheck, CreditCard, CheckCircle2 } from 'lucide-react';

interface TicketProgressTrackerProps {
  currentStep: number;
  status?: string;
}

const STEPS = [
  { number: 1, label: 'Ticket Request', icon: Send },
  { number: 2, label: 'Itinerary Request', icon: FileSearch },
  { number: 3, label: 'Itinerary Provided', icon: FileText },
  { number: 4, label: 'Share & EVP Approval', icon: UserCheck },
  { number: 5, label: 'Booking Requested', icon: CreditCard },
  { number: 6, label: 'Ticket Shared', icon: CheckCircle2 },
];

export function TicketProgressTracker({ currentStep, status }: TicketProgressTrackerProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-8 overflow-x-auto">
      <div className="flex items-center justify-between min-w-max gap-4">
        {STEPS.map((step, idx) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          const Icon = step.icon;

          return (
            <div key={step.number} className="flex flex-col items-center">
              <div className="flex items-center gap-4">
                {/* Circle and Icon */}
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : isActive
                        ? 'bg-primary text-on-primary ring-4 ring-primary/20'
                        : 'bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={28} strokeWidth={2} />
                  ) : (
                    <Icon size={24} />
                  )}
                </div>

                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={`h-1 w-12 transition-all ${
                      isCompleted ? 'bg-emerald-200' : 'bg-surface-container-low'
                    }`}
                  />
                )}
              </div>

              {/* Label */}
              <p
                className={`mt-4 text-xs font-bold uppercase tracking-wider text-center w-24 transition-all ${
                  isActive ? 'text-primary' : isCompleted ? 'text-emerald-800' : 'text-on-surface-variant'
                }`}
              >
                {step.label}
              </p>
              <p className="text-[11px] text-on-surface-variant mt-1">Step {step.number}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
