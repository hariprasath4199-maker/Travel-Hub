import React from 'react';
import { type VisaRequest, type AppUser, STATUS_TO_STEP, ROLE_LABELS } from '@/src/visaApi';
import { Clock } from 'lucide-react';
import Step1SubmitForm from './step-panels/Step1SubmitForm';
import Step2CostProposal from './step-panels/Step2CostProposal';
import Step3CostCentreApproval from './step-panels/Step3CostCentreApproval';
import Step4VendorRequest from './step-panels/Step4VendorRequest';
import Step5VendorDates from './step-panels/Step5VendorDates';
import Step6ShareDates from './step-panels/Step6ShareDates';
import Step7ApplicantSelection from './step-panels/Step7ApplicantSelection';
import Step8EvpApproval from './step-panels/Step8EvpApproval';
import Step9ConfirmBooking from './step-panels/Step9ConfirmBooking';

export interface StepActionPanelProps {
  request: VisaRequest;
  currentUser: AppUser;
  onActionComplete: () => void;
}

const STEP_ROLE_MAP: Record<number, string[]> = {
  1: ['MANAGER', 'EMPLOYEE', 'ADMIN'],
  2: ['HRBP', 'ADMIN'],
  3: ['HRBP', 'MANAGER', 'ADMIN'],
  4: ['HRBP', 'ADMIN'],
  5: ['VENDOR'],
  6: ['HRBP', 'ADMIN'],
  7: ['EMPLOYEE', 'ADMIN'],
  8: ['HRBP', 'EXECUTIVE', 'ADMIN'],
  9: ['HRBP', 'VENDOR', 'ADMIN'],
};

const STEP_COMPONENTS: Record<number, React.ComponentType<StepActionPanelProps>> = {
  1: Step1SubmitForm,
  2: Step2CostProposal,
  3: Step3CostCentreApproval,
  4: Step4VendorRequest,
  5: Step5VendorDates,
  6: Step6ShareDates,
  7: Step7ApplicantSelection,
  8: Step8EvpApproval,
  9: Step9ConfirmBooking,
};

export default function StepActionPanel({ request, currentUser, onActionComplete }: StepActionPanelProps) {
  const currentStep = STATUS_TO_STEP[request.status] ?? request.currentStep;
  const allowedRoles = STEP_ROLE_MAP[currentStep] || [];
  const StepComponent = STEP_COMPONENTS[currentStep];

  if (!StepComponent) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl p-6 text-on-surface-variant text-sm">
        Unknown step: {currentStep}
      </div>
    );
  }

  if (!allowedRoles.includes(currentUser.role)) {
    const roleLabels = allowedRoles.map(r => ROLE_LABELS[r as keyof typeof ROLE_LABELS] || r).join(' or ');
    return (
      <div className="bg-surface-container-lowest rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
          <Clock size={24} className="text-on-secondary-container" />
        </div>
        <p className="text-on-surface font-semibold text-base">Waiting for action</p>
        <p className="text-on-surface-variant text-sm">
          This step requires the <span className="font-semibold text-on-surface">{roleLabels}</span> to act.
        </p>
      </div>
    );
  }

  return <StepComponent request={request} currentUser={currentUser} onActionComplete={onActionComplete} />;
}
