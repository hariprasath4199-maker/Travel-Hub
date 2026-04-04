import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { fetchEmailLog } from '@/src/visaApi';

interface EmailLogEntry {
  id: string;
  timestamp: string;
  to: string;
  subject: string;
  status: 'sent' | 'dev_logged' | 'failed';
  templateName?: string;
}

interface EmailLogPanelProps {
  requestId: string;
}

const STATUS_STYLES: Record<string, string> = {
  sent: 'bg-green-100 text-green-800',
  dev_logged: 'bg-blue-100 text-blue-800',
  failed: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  sent: 'Sent',
  dev_logged: 'Dev Logged',
  failed: 'Failed',
};

export function EmailLogPanel({ requestId }: EmailLogPanelProps) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<EmailLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchEmailLog(requestId)
      .then((data) => setEntries(data as EmailLogEntry[]))
      .catch((err) => setError(err.message ?? 'Failed to load email log'))
      .finally(() => setLoading(false));
  }, [requestId]);

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-on-surface hover:bg-surface-container-high rounded-xl transition-colors"
      >
        <span className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-on-surface-variant" />
          Email History ({loading ? '...' : entries.length})
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-on-surface-variant" />
        ) : (
          <ChevronDown className="h-4 w-4 text-on-surface-variant" />
        )}
      </button>

      {open && (
        <div className="border-t border-outline-variant px-4 py-3">
          {loading && (
            <p className="text-sm text-on-surface-variant">Loading...</p>
          )}

          {error && (
            <p className="text-sm text-error">{error}</p>
          )}

          {!loading && !error && entries.length === 0 && (
            <p className="text-sm text-on-surface-variant">No emails sent yet.</p>
          )}

          {!loading && !error && entries.length > 0 && (
            <ul className="space-y-3">
              {entries.map((entry) => (
                <li
                  key={entry.id ?? `${entry.timestamp}-${entry.to}`}
                  className="rounded-lg bg-surface-container-low p-3 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-medium text-on-surface truncate">
                        {entry.subject}
                      </p>
                      <p className="text-on-surface-variant truncate">
                        To: {entry.to}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                        <span>
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                        {entry.templateName && (
                          <>
                            <span className="text-outline">|</span>
                            <span>{entry.templateName}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider',
                        STATUS_STYLES[entry.status] || 'bg-gray-100 text-gray-800',
                      )}
                    >
                      {STATUS_LABELS[entry.status] || entry.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
