import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Shield,
  Layers,
  ChevronDown,
  CheckCircle2,
  Menu,
  Search,
  Calendar,
  Flame,
  RefreshCw,
  Database,
  FileCheck2,
  Plus,
  UserCheck,
} from 'lucide-react';
import { pushLocalToFirestore, subscribeSyncStatus, SyncStatus } from '../../lib/firebaseSync';
import { firebaseConfig } from '../../lib/firebase';
import { SaveWorkResultModal } from '../modals/SaveWorkResultModal';
import { SaveNameModal } from '../modals/SaveNameModal';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onSearch?: (query: string) => void;
  onNavigateTab?: (tab: any) => void;
}


export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onSearch, onNavigateTab }) => {
  const { currentUser, allUsers, switchUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [isSaveWorkOpen, setIsSaveWorkOpen] = useState(false);
  const [isSaveNameOpen, setIsSaveNameOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncedAt: null,
    syncedCounts: { students: 0, emotions: 0, ldss: 0, supervisions: 0, caseConferences: 0, workResults: 0, users: 0 },
    error: null,
  });


  useEffect(() => {
    const unsubscribe = subscribeSyncStatus(status => {
      setSyncStatus(status);
    });
    return unsubscribe;
  }, []);

  const handleSyncFirebase = async () => {
    await pushLocalToFirestore();
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'guru':
        return { label: 'Guru Kelas', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'koordinator_mtss':
        return { label: 'Koordinator MTSS', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'konselor':
        return { label: 'Konselor BK', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'admin':
        return { label: 'Admin', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'pimpinan':
        return { label: 'Kepsek', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      default:
        return { label: 'Staff', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <header className="bg-white border-b border-slate-200 shrink-0 z-20">
      {/* Top High Density Simulator Bar for fast RBAC validation */}
      <div className="bg-[#0F172A] text-slate-300 px-4 sm:px-6 py-1.5 text-[11px] flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
          <span className="font-semibold text-white">Simulasi Peran RBAC:</span>
          <span className="text-slate-400 hidden sm:inline">Pilih peran aktif untuk menguji hak akses:</span>
        </div>

        <div className="flex items-center gap-1">
          {allUsers.map(user => {
            const isActive = user.id === currentUser?.id;
            return (
              <button
                key={user.id}
                onClick={() => switchUser(user.id)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                  isActive
                    ? 'bg-blue-500 text-white font-bold shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {user.role === 'guru' ? (user.assignedClassIds?.[0] === 'cls-2a' ? 'Guru 2-A' : 'Guru 3-A') : ''}
                {user.role === 'koordinator_mtss' ? 'Koord. MTSS' : ''}
                {user.role === 'konselor' ? 'Konselor BK' : ''}
                {user.role === 'admin' ? 'Admin' : ''}
                {user.role === 'pimpinan' ? 'Kepsek' : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="h-14 sm:h-16 px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="text-slate-400 font-normal">Tahun Ajaran:</span>
            <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
              2026/2027 Ganjil
            </span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchVal}
              onChange={handleSearchChange}
              placeholder="Cari siswa atau modul..."
              className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs w-48 lg:w-64 outline-none focus:ring-1 ring-blue-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Firebase Database Status & Sync Pill */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 rounded-xl px-2.5 py-1 text-xs">
            <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <div className="hidden lg:flex flex-col text-left leading-tight">
              <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                <span>Firebase Database:</span>
                <span className="font-mono text-[10px] text-amber-700 bg-amber-100/70 px-1 rounded">{firebaseConfig.projectId}</span>
              </span>
              <span className="text-[9px] text-amber-700/80">
                {syncStatus.lastSyncedAt ? `Tersinkron: ${syncStatus.lastSyncedAt}` : 'Firestore Terhubung'}
              </span>
            </div>
            <button
              onClick={handleSyncFirebase}
              disabled={syncStatus.isSyncing}
              title="Sinkronkan data MTSS lokal ke Cloud Firestore"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-200/60 hover:bg-amber-200 px-2 py-0.5 rounded-lg transition-colors ml-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 text-amber-700 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
              <span>{syncStatus.isSyncing ? 'Menyimpan...' : 'Sinkron Cloud'}</span>
            </button>
          </div>

          {/* Quick Simpan Hasil Kerja Button */}
          <button
            onClick={() => setIsSaveWorkOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
            title="Simpan nama & data hasil kerja ke Firebase Firestore"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Simpan Hasil Kerja</span>
          </button>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                alt={currentUser?.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
              />
              <div className="text-left hidden md:block pr-1">
                <div className="text-xs font-semibold text-slate-900 leading-tight">{currentUser?.name}</div>
                <div className="text-[10px] text-slate-400 leading-none mt-0.5">{currentUser?.roleTitle}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                  <p className="text-[10px] text-slate-500">{currentUser?.email}</p>
                  <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${roleInfo.bg}`}>
                    {roleInfo.label}
                  </span>
                </div>

                {/* Edit / Simpan Nama Action */}
                <div className="p-2 border-b border-slate-100">
                  <button
                    onClick={() => {
                      setIsSaveNameOpen(true);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50/80 hover:bg-blue-100 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ubah / Simpan Nama Saya</span>
                  </button>
                </div>

                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Ganti Akun Pengguna
                </div>

                <div className="max-h-52 overflow-y-auto space-y-0.5 px-1">
                  {allUsers.map(user => {
                    const isSelected = user.id === currentUser?.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUser(user.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                          isSelected ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-medium text-slate-900">{user.name}</div>
                          <div className="text-[10px] text-slate-400">{user.roleTitle}</div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <SaveWorkResultModal
        isOpen={isSaveWorkOpen}
        onClose={() => setIsSaveWorkOpen(false)}
        onSuccess={() => {
          // If onNavigateTab is provided, navigate to work-results
          if (onNavigateTab) onNavigateTab('work-results');
        }}
      />

      <SaveNameModal
        isOpen={isSaveNameOpen}
        onClose={() => setIsSaveNameOpen(false)}
      />
    </header>
  );
};

