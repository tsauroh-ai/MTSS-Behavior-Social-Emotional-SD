import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  MasterClass,
  MasterIndicatorGroup,
  MasterStrategy,
  ReviewThresholdRule,
} from '../types';
import {
  Database,
  Layers,
  Sparkles,
  Sliders,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const MasterDataView: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'classes' | 'indicators' | 'strategies' | 'thresholds'>('classes');
  const [classes, setClasses] = useState<MasterClass[]>([]);
  const [indicatorGroups, setIndicatorGroups] = useState<MasterIndicatorGroup[]>([]);
  const [strategies, setStrategies] = useState<MasterStrategy[]>([]);
  const [rules, setRules] = useState<ReviewThresholdRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Strategy Modal
  const [isStratModalOpen, setIsStratModalOpen] = useState(false);
  const [stratForm, setStratForm] = useState({
    name: '',
    category: 'Regulasi Emosi',
    tierSuitability: ['Tier 1', 'Tier 2'],
    description: '',
    steps: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [clsData, indData, strData, rulData] = await Promise.all([
        api.getClasses(),
        api.getIndicatorGroups(),
        api.getStrategies(),
        api.getThresholdRules(),
      ]);
      setClasses(clsData);
      setIndicatorGroups(indData);
      setStrategies(strData);
      setRules(rulData);
    } catch (err) {
      console.error('Failed to load master data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createStrategy({
        ...stratForm,
        steps: stratForm.steps.split('\n').filter(s => s.trim().length > 0),
      });
      setIsStratModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan strategi');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Master Data & Konfigurasi MTSS</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengaturan rombongan belajar, 5 domain kompetensi CASEL, bank strategi dukungan, dan aturan penandaan otomatis.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('classes')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'classes'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          1. Rombongan Belajar (Kelas)
        </button>
        <button
          onClick={() => setActiveTab('indicators')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'indicators'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          2. Indikator Social-Emotional (5 Domain CASEL)
        </button>
        <button
          onClick={() => setActiveTab('strategies')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'strategies'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          3. Bank Strategi & Intervensi ({strategies.length})
        </button>
        <button
          onClick={() => setActiveTab('thresholds')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'thresholds'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          4. Aturan Ambang Batas Review
        </button>
      </div>

      {/* Tab 1: Rombel Kelas */}
      {activeTab === 'classes' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Daftar Rombongan Belajar Aktif</h3>
            <span className="text-xs text-slate-400">{classes.length} Kelas Terdaftar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map(c => (
              <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[10px]">
                    Tingkat {c.grade}
                  </span>
                </div>
                <div className="text-slate-600">
                  Wali Kelas: <strong className="text-slate-900">{c.homeroomTeacherName}</strong>
                </div>
                <div className="text-[11px] text-slate-400">Tahun Ajaran: {c.academicYear}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Indikator SE CASEL */}
      {activeTab === 'indicators' && (
        <div className="space-y-4">
          {indicatorGroups.map(grp => (
            <div key={grp.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{grp.name}</h3>
                  <p className="text-xs text-slate-500">{grp.description}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                  {grp.indicators.length} Indikator
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {grp.indicators.map(ind => (
                  <div key={ind.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                    <div className="font-bold text-slate-900">{ind.name}</div>
                    <p className="text-slate-600">{ind.description}</p>
                    <div className="text-[10px] text-blue-700 font-semibold pt-1">
                      Contoh Bukti: {ind.exampleEvidence}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Strategies Bank */}
      {activeTab === 'strategies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Koleksi strategi berbasis bukti yang dapat dipilih saat menyusun Support Plan atau memberikan respons cepat.
            </p>
            {isAdmin && (
              <button
                onClick={() => setIsStratModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Strategi</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategies.map(strat => (
              <div key={strat.id} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-700">{strat.category}</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{strat.name}</h4>
                  </div>
                  <div className="flex gap-1">
                    {strat.tierSuitability.map((t, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-700 font-medium rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed">{strat.description}</p>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Langkah Penerapan:</div>
                  <ul className="space-y-1 text-slate-800">
                    {strat.steps.map((st, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="font-bold text-slate-400">{idx + 1}.</span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Review Thresholds */}
      {activeTab === 'thresholds' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Aturan Ambang Batas Penandaan Otomatis (Review Flags)</h3>
              <p className="text-xs text-slate-500">
                Aturan objektif sekolah untuk menandai perlunya musyawarah tim tanpa membuat diagnosis psikologis otomatis.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {rules.map(rule => (
              <div key={rule.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{rule.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rule.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {rule.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <p className="text-slate-700">{rule.description}</p>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>Pesan Flag: </strong>{rule.suggestedFlagReason}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategy Add Modal */}
      <Modal
        isOpen={isStratModalOpen}
        onClose={() => setIsStratModalOpen(false)}
        title="Tambah Strategi Dukungan Baru"
      >
        <form onSubmit={handleSaveStrategy} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Strategi *</label>
            <input
              type="text"
              required
              value={stratForm.name}
              onChange={e => setStratForm({ ...stratForm, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
            <input
              type="text"
              value={stratForm.category}
              onChange={e => setStratForm({ ...stratForm, category: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
            <textarea
              rows={2}
              value={stratForm.description}
              onChange={e => setStratForm({ ...stratForm, description: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Langkah-Langkah (Satu langkah per baris)</label>
            <textarea
              rows={3}
              value={stratForm.steps}
              onChange={e => setStratForm({ ...stratForm, steps: e.target.value })}
              placeholder="Langkah 1&#10;Langkah 2&#10;Langkah 3"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsStratModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-xs"
            >
              Simpan Strategi
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
