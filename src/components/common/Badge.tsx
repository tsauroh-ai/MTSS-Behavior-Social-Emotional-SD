import React from 'react';
import { TierLevel, SocialEmotionalScale, SupportPlanStatus, FollowUpStatus, PriorityLevel } from '../../types';

interface TierBadgeProps {
  tier: TierLevel;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  const tierStyles: Record<TierLevel, string> = {
    'Tier 1': 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
    'Tier 2': 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-600/20',
    'Tier 3': 'bg-rose-50 text-rose-800 border-rose-200 ring-rose-600/20',
  };

  const tierSubtext: Record<TierLevel, string> = {
    'Tier 1': 'Universal',
    'Tier 2': 'Targeted Support',
    'Tier 3': 'Intensive Individual',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs tracking-tight ${tierStyles[tier]} ${sizeClasses[size]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{tier}</span>
      {size !== 'sm' && <span className="opacity-60 text-[10px] font-normal">({tierSubtext[tier]})</span>}
    </span>
  );
};

export const SocialEmotionalBadge: React.FC<{ scale: SocialEmotionalScale; size?: 'sm' | 'md' }> = ({
  scale,
  size = 'md',
}) => {
  const mapping: Record<SocialEmotionalScale, { label: string; style: string }> = {
    belum_terlihat: {
      label: 'Belum Terlihat',
      style: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    mulai_berkembang: {
      label: 'Mulai Berkembang',
      style: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    berkembang: {
      label: 'Berkembang',
      style: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    konsisten: {
      label: 'Konsisten',
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  };

  const item = mapping[scale] || mapping.mulai_berkembang;
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center font-medium rounded-md border ${item.style} ${sizeClass}`}>
      {item.label}
    </span>
  );
};

export const SupportStatusBadge: React.FC<{ status: SupportPlanStatus }> = ({ status }) => {
  const styles: Record<SupportPlanStatus, string> = {
    Draft: 'bg-slate-100 text-slate-700 border-slate-300',
    Active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'Under Review': 'bg-amber-50 text-amber-800 border-amber-200',
    Completed: 'bg-blue-50 text-blue-700 border-blue-200',
    Discontinued: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {status}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel }> = ({ priority }) => {
  const styles: Record<PriorityLevel, string> = {
    Rendah: 'bg-slate-100 text-slate-700 border-slate-200',
    Sedang: 'bg-amber-50 text-amber-800 border-amber-200',
    Tinggi: 'bg-rose-50 text-rose-800 border-rose-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${styles[priority]}`}>
      {priority}
    </span>
  );
};

export const FollowUpStatusBadge: React.FC<{ status: FollowUpStatus }> = ({ status }) => {
  const styles: Record<FollowUpStatus, string> = {
    Pending: 'bg-amber-50 text-amber-800 border-amber-200',
    'In Progress': 'bg-sky-50 text-sky-800 border-sky-200',
    Completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status}
    </span>
  );
};
