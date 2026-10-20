import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Eye,
  HeartHandshake,
  Target,
  FileSpreadsheet,
  TrendingUp,
  CheckSquare,
  GitBranch,
  FileText,
  Database,
  UserCog,
  History,
  Layers,
  Sparkles,
  FileCheck2,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'lazuardi-matrix'
  | 'work-results'
  | 'classes'
  | 'students'
  | 'emotion-tracker'
  | 'ldss-screening'
  | 'supervisions'
  | 'case-conferences'
  | 'behavior'
  | 'social-emotional'
  | 'support-plans'
  | 'intervention-logs'
  | 'progress'
  | 'follow-ups'
  | 'mtss-reviews'
  | 'reports'
  | 'master-data'
  | 'user-mgmt'
  | 'audit-trail';


interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  reviewFlagCount?: number;
  followUpCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  reviewFlagCount = 0,
  followUpCount = 0,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { isGuru, isKoordinator, isKonselor, isAdmin, isPimpinan, currentUser } = useAuth();

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard MTSS',
      icon: <LayoutDashboard className="w-4 h-4" />,
      allowed: true,
    },
    {
      id: 'lazuardi-matrix' as NavTab,
      label: 'Dashboard Support Lazuardi',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      badge: 'Form Keluhan',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      allowed: true,
    },
    {
      id: 'work-results' as NavTab,
      label: 'Hasil Kerja & Dokumen MTSS',
      icon: <FileCheck2 className="w-4 h-4" />,
      badge: 'Firebase',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold',
      allowed: true,
    },
    {
      id: 'emotion-tracker' as NavTab,
      label: 'Check-In & Out Emosi',
      icon: <Sparkles className="w-4 h-4" />,
      badge: 'CICO 21x',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold',
      allowed: true,
    },

    {
      id: 'classes' as NavTab,
      label: 'Data Kelas & Paralel',
      icon: <Layers className="w-4 h-4" />,
      allowed: true,
    },
    {
      id: 'students' as NavTab,
      label: isGuru ? 'Siswa Kelas Saya' : 'Data Siswa & Tier 1/2/3',
      icon: <Users className="w-4 h-4" />,
      allowed: true,
    },
    {
      id: 'ldss-screening' as NavTab,
      label: 'Pengisian Skrining LDSS',
      icon: <FileText className="w-4 h-4" />,
      allowed: true,
    },
    {
      id: 'supervisions' as NavTab,
      label: 'Supervisi Kepsek & Kabid',
      icon: <GitBranch className="w-4 h-4" />,
      allowed: true,
    },
    {
      id: 'case-conferences' as NavTab,
      label: 'Jadwal Case Conference',
      icon: <HeartHandshake className="w-4 h-4" />,
      allowed: true,
    },
    {
      id: 'behavior' as NavTab,
      label: 'Observasi Perilaku',
      icon: <Eye className="w-4 h-4" />,
      allowed: !isPimpinan,
    },
    {
      id: 'social-emotional' as NavTab,
      label: 'Sosial Emosional (CASEL)',
      icon: <HeartHandshake className="w-4 h-4" />,
      allowed: !isPimpinan,
    },
    {
      id: 'support-plans' as NavTab,
      label: 'Rencana Intervensi MTSS',
      icon: <Target className="w-4 h-4" />,
      allowed: !isPimpinan,
    },
    {
      id: 'intervention-logs' as NavTab,
      label: 'Log Sesi Intervensi',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      allowed: !isPimpinan,
    },
    {
      id: 'progress' as NavTab,
      label: 'Progress Monitoring',
      icon: <TrendingUp className="w-4 h-4" />,
      allowed: true,
    },
    {
      id: 'follow-ups' as NavTab,
      label: 'Tindak Lanjut & Tugas',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: followUpCount > 0 ? `${followUpCount}` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      allowed: !isPimpinan,
    },
    {
      id: 'mtss-reviews' as NavTab,
      label: 'Alur Review MTSS',
      icon: <GitBranch className="w-4 h-4" />,
      badge: reviewFlagCount > 0 ? `${reviewFlagCount} Flag` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold',
      allowed: isKoordinator || isKonselor || isAdmin || isGuru,
    },
    {
      id: 'reports' as NavTab,
      label: 'Laporan & Analisis',
      icon: <FileText className="w-4 h-4" />,
      allowed: true,
    },
  ];

  const adminItems = [
    {
      id: 'master-data' as NavTab,
      label: 'Master Data & Konfigurasi',
      icon: <Database className="w-4 h-4" />,
      allowed: isAdmin || isKoordinator,
    },
    {
      id: 'user-mgmt' as NavTab,
      label: 'Manajemen Pengguna & Role',
      icon: <UserCog className="w-4 h-4" />,
      allowed: isAdmin,
    },
    {
      id: 'audit-trail' as NavTab,
      label: 'Audit Trail & Keamanan',
      icon: <History className="w-4 h-4" />,
      allowed: isAdmin || isKoordinator || isPimpinan,
    },
  ];

  const filteredNav = navItems.filter(i => i.allowed);
  const filteredAdmin = adminItems.filter(i => i.allowed);

  // Generate User Initials
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 z-40 md:z-auto w-64 h-full bg-[#1E293B] text-white flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white leading-none">
                MTSS <span className="text-blue-400">Behavior</span>
              </h1>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 mt-1 font-semibold">
                Sistem Pendukung Siswa SD
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Feed */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {/* Main Module */}
          <div className="space-y-0.5">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Modul Utama
            </div>
            {filteredNav.map(item => {
              const isActive = activeTab === item.id;
              return (
                <div
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-md flex items-center justify-between text-xs font-medium cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isActive ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    ) : (
                      <span className="text-slate-400">{item.icon}</span>
                    )}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeColor || 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Admin Section */}
          {filteredAdmin.length > 0 && (
            <div className="space-y-0.5 pt-2 border-t border-slate-700/60">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pengaturan & Audit
              </div>
              {filteredAdmin.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <div
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-3 py-2 rounded-md flex items-center gap-2.5 text-xs font-medium cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {isActive ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    ) : (
                      <span className="text-slate-400">{item.icon}</span>
                    )}
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </nav>

        {/* User Card at bottom of High Density sidebar */}
        <div className="p-3.5 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs">
              {getInitials(currentUser?.name)}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-white truncate">{currentUser?.name}</span>
              <span className="text-[10px] text-slate-400 italic leading-none truncate mt-0.5">
                {currentUser?.roleTitle}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
