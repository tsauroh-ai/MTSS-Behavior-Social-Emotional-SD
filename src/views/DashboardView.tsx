import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  Users,
  Eye,
  HeartHandshake,
  Target,
  Clock,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GitBranch,
  FileText,
  Download,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { TierBadge, SocialEmotionalBadge, FollowUpStatusBadge, PriorityBadge } from '../components/common/Badge';
import { HumanDecisionBanner } from '../components/common/HumanDecisionBanner';
import { Student, BehaviorObservation, SocialEmotionalObservation, FollowUp, SupportPlan } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DashboardViewProps {
  onNavigateTab: (tab: any) => void;
  onSelectStudent: (studentId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab, onSelectStudent }) => {
  const { currentUser, isGuru, isKoordinator, isKonselor, isAdmin, isPimpinan } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [plans, setPlans] = useState<SupportPlan[]>([]);
  const [behaviorObs, setBehaviorObs] = useState<BehaviorObservation[]>([]);
  const [seObs, setSeObs] = useState<SocialEmotionalObservation[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, studentsData, plansData, behData, seData, flwData] = await Promise.all([
        api.getDashboardStats(),
        api.getStudents(),
        api.getSupportPlans(),
        api.getBehaviorObservations(),
        api.getSocialEmotionalObservations(),
        api.getFollowUps(),
      ]);
      setStats(statsData);
      setStudents(studentsData);
      setPlans(plansData);
      setBehaviorObs(behData);
      setSeObs(seData);
      setFollowUps(flwData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Memuat data dashboard MTSS High Density...</p>
        </div>
      </div>
    );
  }

  // Calculate tier distributions
  const tier1Count = students.filter(s => s.currentTier === 'Tier 1').length;
  const tier2Count = students.filter(s => s.currentTier === 'Tier 2').length;
  const tier3Count = students.filter(s => s.currentTier === 'Tier 3').length;
  const totalStudents = students.length || 1;

  const t1Percent = ((tier1Count / totalStudents) * 100).toFixed(1);
  const t2Percent = ((tier2Count / totalStudents) * 100).toFixed(1);
  const t3Percent = ((tier3Count / totalStudents) * 100).toFixed(1);

  const flaggedStudents = students.filter(s => s.needsReviewFlag);
  const activePlans = plans.filter(p => p.status === 'Active');
  const pendingFollowUps = followUps.filter(f => f.status === 'Pending' || f.status === 'In Progress');

  const tierChartData = [
    { name: 'Tier 1 (Universal)', count: tier1Count, color: '#3b82f6' },
    { name: 'Tier 2 (Targeted)', count: tier2Count, color: '#f59e0b' },
    { name: 'Tier 3 (Intensif)', count: tier3Count, color: '#f43f5e' },
  ];

  const classDistData = [
    { name: 'Kelas 1A', tier1: 22, tier2: 2, tier3: 0 },
    { name: 'Kelas 2A', tier1: 20, tier2: 4, tier3: 2 },
    { name: 'Kelas 3A', tier1: 21, tier2: 3, tier3: 1 },
    { name: 'Kelas 4A', tier1: 24, tier2: 3, tier3: 1 },
    { name: 'Kelas 5A', tier1: 25, tier2: 2, tier3: 0 },
    { name: 'Kelas 6A', tier1: 24, tier2: 2, tier3: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Human Decision Principles Banner */}
      <HumanDecisionBanner />

      {/* 4-Column High Density Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Siswa */}
        <div
          onClick={() => onNavigateTab('students')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-all"
        >
          <p className="text-xs text-slate-500 font-medium uppercase mb-1">Total Siswa</p>
          <h3 className="text-2xl font-bold text-slate-900">{students.length}</h3>
          <div className="mt-2 text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded inline-block font-semibold">
            Aktif Semester Ini
          </div>
        </div>

        {/* Card 2: Tier 1 */}
        <div
          onClick={() => onNavigateTab('students')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500 cursor-pointer hover:border-slate-300 transition-all"
        >
          <p className="text-xs text-blue-700 font-medium uppercase mb-1">Tier 1 (Universal)</p>
          <h3 className="text-2xl font-bold text-slate-900">{tier1Count}</h3>
          <p className="text-[10px] text-slate-400 mt-1">{t1Percent}% Populasi Sekolah</p>
        </div>

        {/* Card 3: Tier 2 */}
        <div
          onClick={() => onNavigateTab('students')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500 cursor-pointer hover:border-slate-300 transition-all"
        >
          <p className="text-xs text-amber-700 font-medium uppercase mb-1">Tier 2 (Targeted)</p>
          <h3 className="text-2xl font-bold text-slate-900">{tier2Count}</h3>
          <p className="text-[10px] text-slate-400 mt-1">{t2Percent}% Memerlukan Monitoring</p>
        </div>

        {/* Card 4: Tier 3 */}
        <div
          onClick={() => onNavigateTab('students')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-rose-500 cursor-pointer hover:border-slate-300 transition-all"
        >
          <p className="text-xs text-rose-700 font-medium uppercase mb-1">Tier 3 (Intensive)</p>
          <h3 className="text-2xl font-bold text-slate-900">{tier3Count}</h3>
          <p className="text-[10px] text-slate-400 mt-1">{t3Percent}% Rencana Individual</p>
        </div>
      </div>

      {/* 3-Column High Density Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Observasi Terbaru High Density Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[420px]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h4 className="font-bold text-sm text-slate-900">Observasi Perilaku Terbaru</h4>
              <button
                onClick={() => onNavigateTab('behavior')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                Lihat Semua ({behaviorObs.length})
              </button>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold text-slate-500">Nama Siswa</th>
                    <th className="px-4 py-2.5 font-semibold text-slate-500">Kelas</th>
                    <th className="px-4 py-2.5 font-semibold text-slate-500">Konteks / Perilaku</th>
                    <th className="px-4 py-2.5 font-semibold text-slate-500">Waktu</th>
                    <th className="px-4 py-2.5 font-semibold text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {behaviorObs.slice(0, 6).map(obs => (
                    <tr
                      key={obs.id}
                      onClick={() => onSelectStudent(obs.studentId)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">{obs.studentName}</td>
                      <td className="px-4 py-3 text-slate-600">{obs.className}</td>
                      <td className="px-4 py-3 text-slate-700 max-w-[220px] truncate" title={obs.behaviorObserved}>
                        {obs.behaviorObserved}
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{obs.time} WIB</td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                          Tercatat
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Flag Peninjauan + Dark Widget */}
        <div className="space-y-6">
          {/* Flag Peninjauan Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 min-h-[180px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span>Flag Peninjauan</span>
                  <span className="text-rose-500 text-sm leading-none">●</span>
                </h4>
                <button
                  onClick={() => onNavigateTab('mtss-reviews')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Forum ({flaggedStudents.length})
                </button>
              </div>

              {flaggedStudents.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  Semua siswa dalam status rutin.
                </div>
              ) : (
                <div className="space-y-2">
                  {flaggedStudents.slice(0, 2).map(std => (
                    <div
                      key={std.id}
                      onClick={() => onSelectStudent(std.id)}
                      className="flex gap-2.5 items-start p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-rose-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900">{std.fullName} ({std.className})</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {std.flagReason || 'Perlu evaluasi pola data observasi terkini.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {flaggedStudents.length > 0 && (
              <button
                onClick={() => onNavigateTab('mtss-reviews')}
                className="w-full mt-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
              >
                Buka Alur Review Tim
              </button>
            )}
          </div>

          {/* Dark Accent Widget: Laporan Mingguan & Rekap MTSS */}
          <div className="bg-[#1E293B] text-white rounded-xl shadow-lg p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">Laporan MTSS Sekolah</h4>
                <span className="text-[10px] text-blue-300 font-semibold bg-blue-500/20 px-2 py-0.5 rounded">
                  Semester Ganjil
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Dokumentasi terstruktur rekapitulasi intervensi & portfolio siswa.
              </p>

              {/* Decorative High-Density Mini Bar Visualizer */}
              <div className="flex items-end gap-2 h-16 pt-2 pb-1">
                <div className="flex-1 bg-blue-500/80 rounded-t" style={{ height: '40%' }} title="Senin" />
                <div className="flex-1 bg-blue-400 rounded-t" style={{ height: '65%' }} title="Selasa" />
                <div className="flex-1 bg-blue-600 rounded-t" style={{ height: '90%' }} title="Rabu" />
                <div className="flex-1 bg-blue-400 rounded-t" style={{ height: '55%' }} title="Kamis" />
                <div className="flex-1 bg-blue-500 rounded-t" style={{ height: '80%' }} title="Jumat" />
              </div>

              <button
                onClick={() => onNavigateTab('reports')}
                className="w-full mt-2 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-medium text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Rekapitulasi & Dokumen</span>
              </button>
            </div>

            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-blue-500/15 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      {/* Additional High Density Sections: Tier Distribution Chart & Social Emotional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Distribution Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900">Distribusi Dukungan MTSS per Rombel Kelas</h4>
            <span className="text-xs text-slate-400">6 Tingkat Kelas</span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Legend formatter={(value) => <span className="text-xs text-slate-600">{value}</span>} />
                <Bar dataKey="tier1" name="Tier 1 (Universal)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tier2" name="Tier 2 (Targeted)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tier3" name="Tier 3 (Intensif)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Social Emotional Observations Feed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-sm text-slate-900">Observasi Social-Emotional (5 Domain CASEL)</h4>
            </div>
            <button
              onClick={() => onNavigateTab('social-emotional')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Lihat Semua ({seObs.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {seObs.slice(0, 3).map(obs => (
              <div
                key={obs.id}
                onClick={() => onSelectStudent(obs.studentId)}
                className="p-3 bg-slate-50 hover:bg-blue-50/40 border border-slate-100 hover:border-blue-200 rounded-lg transition-all cursor-pointer space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{obs.studentName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-700 font-medium rounded">
                      {obs.className}
                    </span>
                  </div>
                  <SocialEmotionalBadge scale={obs.ratingScale} size="sm" />
                </div>
                <div className="text-[11px] font-medium text-blue-900">
                  {obs.indicatorGroupName} • {obs.indicatorName}
                </div>
                <p className="text-slate-600 line-clamp-1 text-[11px]">{obs.evidenceNotes}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
