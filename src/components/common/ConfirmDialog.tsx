import React from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  reasonRequired?: boolean;
  reason?: string;
  onReasonChange?: (val: string) => void;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  isDestructive = false,
  reasonRequired = false,
  reason = '',
  onReasonChange,
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-full shrink-0 ${
              isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isDestructive ? <AlertTriangle className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-700 leading-relaxed">{message}</p>
          </div>
        </div>

        {reasonRequired && (
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-slate-700">
              Alasan Tindakan / Perubahan <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => onReasonChange && onReasonChange(e.target.value)}
              placeholder="Tuliskan justifikasi musyawarah tim atau latar belakang perubahan..."
              rows={2}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading || (reasonRequired && !reason.trim())}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-xs ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 disabled:opacity-50'
                : 'bg-sky-600 hover:bg-sky-700 disabled:opacity-50'
            }`}
          >
            {loading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
