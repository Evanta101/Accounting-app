import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  HardDrive, 
  RefreshCw, 
  Upload, 
  CheckCircle2, 
  ShieldCheck, 
  X,
  Clock,
  Database
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface BackupFile {
  name: string;
  sizeKb: number;
  createdAt: string;
  modifiedAt: string;
  isLatest: boolean;
}

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported: (data: any) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataImported,
}) => {
  const { showToast } = useToast();
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [creatingBackup, setCreatingBackup] = useState<boolean>(false);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backups');
      const data = await res.json();
      if (data.success) {
        setBackups(data.files || []);
      }
    } catch (err) {
      console.error('Failed to load backup files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBackups();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateNewBackup = async () => {
    setCreatingBackup(true);
    try {
      const res = await fetch('/api/backups/create', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('New Excel backup saved to ./data/backups/ directory!', 'success');
        setBackups(data.files || []);
      } else {
        showToast('Failed to create backup', 'error');
      }
    } catch (err) {
      showToast('Error generating Excel backup', 'error');
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleDownloadExcel = () => {
    window.open('/api/export-excel', '_blank');
    showToast('Downloading complete Excel ledger workbook (.xlsx)...', 'info');
  };

  const handleDownloadJson = () => {
    window.open('/api/export-json', '_blank');
    showToast('Downloading full JSON data backup...', 'info');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const jsonContent = JSON.parse(evt.target?.result as string);
        const res = await fetch('/api/import-json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jsonContent),
        });
        const data = await res.json();
        if (data.success) {
          onDataImported(data);
          showToast('Data imported and excel backup generated successfully!', 'success');
          fetchBackups();
        } else {
          showToast(data.error || 'Failed to import backup JSON', 'error');
        }
      } catch (err) {
        showToast('Invalid JSON file format', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E5E5EA] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#FAF9F6] border-b border-[#E5E5EA] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF3EC] border border-[#F8D4CC] flex items-center justify-center text-[#C1553D]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1D1D1F]">
                Excel Backups & Continuous Update Safety
              </h2>
              <p className="text-xs text-[#6E6E73]">
                Automated multi-sheet Excel records & uninterrupted app upgrades
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8E8E93] hover:text-[#1D1D1F] p-1.5 rounded-lg hover:bg-[#E5E5EA]/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-x-0 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Key Assurance Box */}
          <div className="bg-[#F4F9F6] border border-[#CDE5D8] rounded-xl p-4 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-[#2F8F6E] shrink-0 mt-0.5" />
            <div className="text-xs text-[#1D6C51] space-y-1">
              <p className="font-semibold text-sm">Will you lose data when updating code?</p>
              <p className="leading-relaxed">
                <strong>No, never!</strong> All your business records (Sales, Cloth Stock, Paints, Expenses, Profiles) are permanently stored in the <code className="bg-[#E2F0E8] px-1.5 py-0.5 rounded font-mono font-bold text-[#1D6C51]">./data/</code> folder on the server.
              </p>
              <p className="leading-relaxed">
                When you or developers update the app code, the <code className="bg-[#E2F0E8] px-1.5 py-0.5 rounded font-mono font-bold text-[#1D6C51]">data/</code> directory and Excel backups are preserved 100% untouched. You will never have to start over.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleDownloadExcel}
              className="flex items-center justify-between p-4 bg-[#FFF8E7] hover:bg-[#FFF3D6] border border-[#F5E2B3] rounded-xl transition cursor-pointer text-left group"
            >
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="w-6 h-6 text-[#9E5D00]" />
                <div>
                  <p className="text-xs font-semibold text-[#663C00]">Download Full Excel (.xlsx)</p>
                  <p className="text-[11px] text-[#9E5D00]">7 sheets: Sales, Stock, Paints, etc.</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-[#9E5D00] group-hover:translate-y-0.5 transition" />
            </button>

            <button
              onClick={handleCreateNewBackup}
              disabled={creatingBackup}
              className="flex items-center justify-between p-4 bg-[#FDF0ED] hover:bg-[#FCE2DC] border border-[#F8D4CC] rounded-xl transition cursor-pointer text-left group disabled:opacity-60"
            >
              <div className="flex items-center space-x-3">
                <RefreshCw className={`w-6 h-6 text-[#C1553D] ${creatingBackup ? 'animate-spin' : ''}`} />
                <div>
                  <p className="text-xs font-semibold text-[#822C1A]">Create Excel Snapshot</p>
                  <p className="text-[11px] text-[#C1553D]">Save copy to ./data/backups/ now</p>
                </div>
              </div>
              <HardDrive className="w-4 h-4 text-[#C1553D]" />
            </button>
          </div>

          {/* Server Excel Backups List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-[#6E6E73]" />
                <h3 className="text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider">
                  Automated Excel Records Directory (<code className="lowercase font-mono font-normal">./data/backups/</code>)
                </h3>
              </div>
              <button
                onClick={fetchBackups}
                className="text-xs text-[#C1553D] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-[#8E8E93]">Loading saved backup records...</div>
            ) : backups.length === 0 ? (
              <div className="p-4 bg-[#F5F5F7] rounded-xl text-center text-xs text-[#6E6E73]">
                No Excel backup files saved yet. Click "Create Excel Snapshot" above to generate your first backup file.
              </div>
            ) : (
              <div className="border border-[#E5E5EA] rounded-xl divide-y divide-[#E5E5EA] max-h-56 overflow-y-auto">
                {backups.map((f) => (
                  <div key={f.name} className="p-3 flex items-center justify-between hover:bg-[#FAF9F6] transition">
                    <div className="flex items-center space-x-3">
                      <FileSpreadsheet className={`w-4 h-4 ${f.isLatest ? 'text-[#2F8F6E]' : 'text-[#8E8E93]'}`} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-medium text-[#1D1D1F] font-mono">{f.name}</p>
                          {f.isLatest && (
                            <span className="bg-[#E2F0E8] text-[#1D6C51] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              Latest
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#8E8E93] flex items-center space-x-2 mt-0.5">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(f.modifiedAt).toLocaleString('en-IN')}</span>
                          </span>
                          <span>•</span>
                          <span>{f.sizeKb} KB</span>
                        </p>
                      </div>
                    </div>

                    <a
                      href={`/api/backups/download/${encodeURIComponent(f.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-white hover:bg-[#F5F5F7] border border-[#D2D2D7] rounded-lg text-xs font-medium text-[#1D1D1F] flex items-center space-x-1 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#6E6E73]" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Import / Export JSON Backup for Transfer */}
          <div className="pt-2 border-t border-[#E5E5EA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#2F8F6E]" />
              <span className="text-[#6E6E73]">JSON Backup & Portability</span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={handleDownloadJson}
                className="px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#F0EEEA] border border-[#D2D2D7] rounded-lg text-xs font-medium text-[#1D1D1F] flex items-center space-x-1 cursor-pointer transition"
              >
                <Download className="w-3.5 h-3.5 text-[#6E6E73]" />
                <span>Export JSON</span>
              </button>

              <label className="px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#F0EEEA] border border-[#D2D2D7] rounded-lg text-xs font-medium text-[#1D1D1F] flex items-center space-x-1 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-[#6E6E73]" />
                <span>Restore JSON File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
