import { type StepActionPanelProps } from '../StepActionPanel';
import { CheckCircle, MapPin, Calendar, User } from 'lucide-react';

export default function Step1SubmitForm({ request }: StepActionPanelProps) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center">
          <CheckCircle size={20} className="text-on-tertiary-container" />
        </div>
        <div>
          <h3 className="text-on-surface font-semibold text-base">Request Submitted Successfully</h3>
          <p className="text-on-surface-variant text-xs">
            Submitted on {new Date(request.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="flex items-start gap-2">
          <User size={16} className="text-on-surface-variant mt-0.5" />
          <div>
            <p className="text-on-surface-variant text-xs font-medium">Employee</p>
            <p className="text-on-surface text-sm font-semibold">{request.employeeName}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin size={16} className="text-on-surface-variant mt-0.5" />
          <div>
            <p className="text-on-surface-variant text-xs font-medium">Destination</p>
            <p className="text-on-surface text-sm font-semibold">{request.destination}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Calendar size={16} className="text-on-surface-variant mt-0.5" />
          <div>
            <p className="text-on-surface-variant text-xs font-medium">Duration</p>
            <p className="text-on-surface text-sm font-semibold">{request.numberOfDays} days</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <User size={16} className="text-on-surface-variant mt-0.5" />
          <div>
            <p className="text-on-surface-variant text-xs font-medium">Manager</p>
            <p className="text-on-surface text-sm font-semibold">{request.managerName}</p>
          </div>
        </div>
      </div>

      {request.managerComments && (
        <div className="bg-surface-container rounded-xl p-4 mt-2">
          <p className="text-on-surface-variant text-xs font-medium mb-1">Manager Comments</p>
          <p className="text-on-surface text-sm">{request.managerComments}</p>
        </div>
      )}
    </div>
  );
}
