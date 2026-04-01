import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function ActionPage() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const decision = searchParams.get('decision');

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!token) {
      setResult({ success: false, message: 'Missing action token.' });
      setLoading(false);
      return;
    }

    const url = decision
      ? `/api/action/${token}?decision=${decision}`
      : `/api/action/${token}`;

    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed with status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setResult({
          success: true,
          message: data.message || (decision === 'approve' ? 'Action approved successfully.' : decision === 'reject' ? 'Action rejected.' : 'Action processed successfully.'),
        });
      })
      .catch((err) => {
        setResult({ success: false, message: err.message || 'An error occurred while processing the action.' });
      })
      .finally(() => setLoading(false));
  }, [token, decision]);

  return (
    <div className="p-10 max-w-xl mx-auto min-h-[60vh] flex items-center justify-center">
      <div className="bg-surface-container-lowest rounded-3xl shadow-sm p-10 w-full text-center space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline">Visa Workflow Action</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {decision === 'approve' ? 'Approving request...' : decision === 'reject' ? 'Rejecting request...' : 'Processing action...'}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 size={48} className="animate-spin text-primary" />
            <p className="text-sm text-on-surface-variant">Processing your action, please wait...</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
              result.success ? 'bg-emerald-100' : 'bg-red-100'
            }`}>
              {result.success ? (
                <CheckCircle size={40} className="text-emerald-600" />
              ) : (
                <XCircle size={40} className="text-red-600" />
              )}
            </div>

            <h2 className={`text-xl font-bold ${result.success ? 'text-emerald-700' : 'text-red-700'}`}>
              {result.success ? 'Action Completed' : 'Action Failed'}
            </h2>

            <p className="text-sm text-on-surface-variant max-w-sm mx-auto">{result.message}</p>

            {!result.success && (
              <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl">
                <AlertTriangle size={16} />
                <span className="text-xs font-bold">This link may have expired or already been used.</span>
              </div>
            )}

            <div className="pt-4">
              <a
                href="/visa-requests"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95"
              >
                Go to Visa Workflow
              </a>
            </div>
          </div>
        )}

        {/* Token info */}
        {token && (
          <p className="text-[10px] text-on-surface-variant/50 font-mono break-all">
            Token: {token}
          </p>
        )}
      </div>
    </div>
  );
}
