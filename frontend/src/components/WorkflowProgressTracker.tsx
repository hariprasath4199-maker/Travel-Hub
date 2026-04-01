import { Check, X } from 'lucide-react';
import { STEP_LABELS, STATUS_TO_STEP, type VisaRequestStatus } from '@/src/visaApi';

interface Props { status: VisaRequestStatus; currentStep: number; }

const REJECTED_STATUSES: VisaRequestStatus[] = ['COST_CENTRE_REJECTED', 'EVP_REJECTED'];

export function WorkflowProgressTracker({ status, currentStep }: Props) {
  const activeStep = STATUS_TO_STEP[status] || currentStep;
  const isRejected = REJECTED_STATUSES.includes(status);

  return (
    <div className="w-full overflow-x-auto py-4">
      <div className="flex items-center justify-between min-w-[800px] px-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((step, i) => {
          const isCompleted = step < activeStep || (step === activeStep && status === 'APPOINTMENT_CONFIRMED');
          const isActive = step === activeStep && !isCompleted;
          const isRejectedStep = isActive && isRejected;

          return (
            <div key={step} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isCompleted ? 'bg-primary text-on-primary' :
                  isRejectedStep ? 'bg-red-500 text-white ring-4 ring-red-100' :
                  isActive ? 'bg-primary/20 text-primary ring-4 ring-primary/10 animate-pulse' :
                  'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {isCompleted ? <Check size={18} /> : isRejectedStep ? <X size={18} /> : step}
                </div>
                <span className={`mt-2 text-[10px] uppercase tracking-widest font-bold text-center max-w-[80px] leading-tight ${
                  isCompleted || isActive ? 'text-primary' : 'text-on-surface-variant/60'
                }`}>
                  {STEP_LABELS[step]}
                </span>
              </div>
              {i < 8 && (
                <div className={`flex-1 h-[2px] mx-2 mt-[-20px] ${isCompleted ? 'bg-primary' : 'bg-surface-container-high'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
