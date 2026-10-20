import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, X, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import { firebaseConfig } from '../../lib/firebase';

interface SaveNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (savedName: string) => void;
}

export const SaveNameModal: React.FC<SaveNameModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser, updateUserName } = useAuth();
  const [name, setName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setRoleTitle(currentUser.roleTitle || '');
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const ok = await updateUserName(name.trim(), roleTitle.trim());
      if (ok) {
        setSaveSuccess(true);
        if (onSuccess) onSuccess(name.trim());
        setTimeout(() => {
          setSaveSuccess(false);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const quickRoles = [
    'Wali Kelas 1 Kinabalu',
    'Wali Kelas 2 Yala',
    'Wali Kelas 3 Tongariro',
    'Koordinator Inklusif & MTSS',
    'Konselor BK / Psikolog',
    'Kepala Sekolah SD Lazuardi',
    'Guru Pendamping Khusus (GPK)',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Simpan & Perbarui Nama Pengisi</h3>
              <p className="text-[11px] text-blue-100">Nama otomatis tersimpan di Firebase Firestore</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Cloud Status Pill */}
          <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
            <Flame className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="text-[11px] leading-tight">
              Tersambung ke Cloud Firestore: <strong className="font-mono">{firebaseConfig.projectId}</strong>
              <div className="text-[10px] text-amber-700">Nama ini akan dijadikan identitas resmi pada semua data hasil kerja.</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap & Gelar <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Ibu Tsauroh, S.Pd. atau M. Ghofar, M.Psi."
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jabatan / Peran Pengisi
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={e => setRoleTitle(e.target.value)}
              placeholder="Contoh: Wali Kelas 1 Kinabalu, Koordinator MTSS, dll."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800"
            />

            {/* Quick role selection chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickRoles.slice(0, 4).map(r => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRoleTitle(r)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  + {r}
                </button>
              ))}
            </div>
          </div>

          {/* Success banner */}
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Nama berhasil disimpan dan disinkronkan ke Firebase!</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan ke Firebase...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  <span>Simpan Nama ke Firebase</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
