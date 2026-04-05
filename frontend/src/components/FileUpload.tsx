import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, X, Paperclip } from 'lucide-react';
import { uploadFile } from '@/src/visaApi';

interface UploadedFile {
  filename: string;
  originalName: string;
}

interface Props {
  onUploadComplete: (filenames: string[]) => void;
  label?: string;
  existingFiles?: string[];
}

export function FileUpload({ onUploadComplete, label = 'Attachments', existingFiles = [] }: Props) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>(
    existingFiles.map(f => ({ filename: f, originalName: f.replace(/^\d+-/, '') }))
  );
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList) => {
    setUploading(true);
    setError(null);
    const newFiles: UploadedFile[] = [];
    try {
      for (let i = 0; i < fileList.length; i++) {
        const result = await uploadFile(fileList[i]);
        newFiles.push({ filename: result.filename, originalName: result.originalName });
      }
      const updated = [...files, ...newFiles];
      setFiles(updated);
      onUploadComplete(updated.map(f => f.filename));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onUploadComplete(updated.map(f => f.filename));
  };

  return (
    <div>
      <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2 mb-2">
        <Paperclip size={16} /> {label}
      </label>

      {/* Uploaded files list */}
      {files.length > 0 && (
        <div className="mb-3 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-surface-container-low rounded-lg px-4 py-2">
              <FileText size={16} className="text-primary flex-shrink-0" />
              <span className="text-sm text-on-surface flex-1 truncate">{f.originalName}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="p-1 text-on-surface-variant hover:text-error rounded transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => ref.current?.click()}
        onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
        onDragOver={e => e.preventDefault()}
        className="border-2 border-dashed border-outline-variant/30 rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
      >
        <input
          ref={ref}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
          multiple
          className="hidden"
          onChange={e => { if (e.target.files?.length) { handleFiles(e.target.files); e.target.value = ''; } }}
        />
        {uploading ? (
          <p className="text-sm text-primary animate-pulse">Uploading...</p>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={24} className="text-on-surface-variant/50" />
            <p className="text-xs text-on-surface-variant">
              Drop files here or click to browse
              <span className="block text-[10px] mt-1 text-on-surface-variant/60">PDF, DOC, DOCX, JPG, PNG, XLS, XLSX — Max 10MB each</span>
            </p>
          </div>
        )}
        {error && <p className="text-xs text-error mt-2">{error}</p>}
      </div>
    </div>
  );
}

/* Read-only attachment display for detail views */
export function AttachmentList({ files, label = 'Attachments' }: { files: string[]; label?: string }) {
  if (!files || files.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-surface-container-low rounded-xl">
      <p className="text-xs font-bold text-on-surface-variant uppercase mb-3 flex items-center gap-2">
        <Paperclip size={14} /> {label} ({files.length})
      </p>
      <div className="space-y-2">
        {files.map((f, i) => {
          const displayName = f.replace(/^\d+-/, '');
          return (
            <a
              key={i}
              href={`/api/uploads/${f}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-surface-container-lowest rounded-lg px-4 py-2.5 hover:bg-primary/5 transition-colors group"
            >
              <FileText size={16} className="text-primary flex-shrink-0" />
              <span className="text-sm text-on-surface flex-1 truncate group-hover:text-primary transition-colors">{displayName}</span>
              <span className="text-[10px] text-on-surface-variant uppercase font-bold px-2 py-0.5 bg-surface-container rounded">
                {displayName.split('.').pop()}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
