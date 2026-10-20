import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  borderAccentColor?: string;
  badge?: {
    text: string;
    type?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-blue-50 text-blue-600',
  borderAccentColor,
  badge,
  onClick,
}) => {
  const badgeStyles = {
    default: 'bg-slate-100 text-slate-700',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
  };

  const accentClass = borderAccentColor ? `border-l-4 ${borderAccentColor}` : '';

  return (
    <div
      onClick={onClick}
      className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all ${accentClass} ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs text-slate-500 font-medium uppercase mb-1 tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
          </div>
          {badge && (
            <div className="mt-2">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded inline-block ${
                  badgeStyles[badge.type || 'default']
                }`}
              >
                {badge.text}
              </span>
            </div>
          )}
          {subtitle && <p className="text-[10px] text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`p-2 rounded-lg shrink-0 ${iconBgColor}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
