import { type WorkflowEvent } from '@/src/visaApi';

export function WorkflowTimeline({ events }: { events: WorkflowEvent[] }) {
  const sorted = [...events].reverse();

  if (sorted.length === 0) return <p className="text-sm text-on-surface-variant">No workflow events yet.</p>;

  return (
    <div className="space-y-4">
      {sorted.map((evt) => (
        <div key={evt.id} className="relative pl-6">
          <div className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full ${
            evt.toStatus.includes('REJECTED') ? 'bg-red-500' :
            evt.toStatus.includes('APPROVED') || evt.toStatus === 'APPOINTMENT_CONFIRMED' ? 'bg-emerald-500' :
            'bg-primary'
          }`} />
          <p className="text-sm font-bold text-on-surface">{evt.action}</p>
          <p className="text-xs text-on-surface-variant">
            {evt.performedBy} ({evt.performedByRole}) &bull; {new Date(evt.timestamp).toLocaleString()}
          </p>
          {evt.comments && <p className="text-xs text-on-surface-variant mt-1 italic">"{evt.comments}"</p>}
        </div>
      ))}
    </div>
  );
}
