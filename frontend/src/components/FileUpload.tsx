import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { uploadFile } from '@/src/visaApi';

interface Props { onUploadComplete: (filename: string) => void; label?: string; }

export function FileUpload({ onUploadComplete, label = 'Upload File' }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true); setError(null);
    try {
      const result = await uploadFile(file);
      setUploaded(result.originalName);
      onUploadComplete(result.filename);
    } catch (e: any) { setError(e.message); }
    finally { setUploading(false); }
  };

  return (
    <div>
      <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2 mb-2"><FileText size={16} /> {label}</label>
      <div
        onClick={() => ref.current?.click()}
        onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        onDragOver={e => e.preventDefault()}
        className="border-2 border-dashed border-outline-variant/30 rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
      >
        <input ref={ref} type="file" accept=".pdf,.doc,.docx,.jpg,.png" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        {uploading ? <p className="text-sm text-primary animate-pulse">Uploading...</p> :
         uploaded ? <div className="flex items-center justify-center gap-2 text-sm text-emerald-600"><CheckCircle size={16} />{uploaded}</div> :
         <div className="flex flex-col items-center gap-2"><Upload size={24} className="text-on-surface-variant/50" /><p className="text-xs text-on-surface-variant">Drop file here or click to browse</p></div>}
        {error && <p className="text-xs text-error mt-2">{error}</p>}
      </div>
    </div>
  );
}
