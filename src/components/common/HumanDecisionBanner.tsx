import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface HumanDecisionBannerProps {
  compact?: boolean;
  className?: string;
}

export const HumanDecisionBanner: React.FC<HumanDecisionBannerProps> = ({ compact = false, className = '' }) => {
  if (compact) {
    return (
      <div
        id="human-decision-banner-compact"
        className={`flex items-center gap-2 px-3 py-2 text-xs text-sky-800 bg-sky-50 border border-sky-200 rounded-lg ${className}`}
      >
        <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
        <span>
          <strong>Prinsip MTSS:</strong> Sistem ini adalah alat pendukung keputusan observasional. Keputusan intervensi dan penetapan tier wajib melalui musyawarah tim sekolah.
        </span>
      </div>
    );
  }

  return (
    <div
      id="human-decision-banner-full"
      className={`p-4 bg-gradient-to-r from-sky-50 via-indigo-50 to-blue-50 border border-sky-200/80 rounded-xl shadow-xs ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-sky-600 text-white rounded-lg shadow-xs shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 text-sm text-slate-700 leading-relaxed">
          <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
            <span>Landasan Etis & Pendukung Keputusan MTSS</span>
            <span className="text-[11px] font-medium px-2 py-0.5 bg-sky-100 text-sky-800 rounded-full">
              Non-Diagnosis Klinis
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Aplikasi ini berfungsi mencatat observasi faktual, memantau kemajuan, dan mengidentifikasi pola untuk bahan diskusi. Sistem <strong>TIDAK</strong> menghasilkan diagnosis psikologis/medis otomatis, vonis kedisiplinan, ataupun pemindahan tier sepihak. Seluruh rekomendasi ditinjau oleh guru, konselor, dan tim MTSS berwenang.
          </p>
        </div>
      </div>
    </div>
  );
};
