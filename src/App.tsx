/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './lib/api';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Views
import { DashboardView } from './views/DashboardView';
import { LazuardiSupportDashboardView } from './views/LazuardiSupportDashboardView';
import { EmotionTrackerView } from './views/EmotionTrackerView';
import { WorkResultsView } from './views/WorkResultsView';
import { ClassesView } from './views/ClassesView';

import { LdssScreeningView } from './views/LdssScreeningView';
import { SupervisionsView } from './views/SupervisionsView';
import { CaseConferencesView } from './views/CaseConferencesView';
import { StudentsView } from './views/StudentsView';
import { StudentDetailView } from './views/StudentDetailView';
import { BehaviorObservationsView } from './views/BehaviorObservationsView';
import { SocialEmotionalView } from './views/SocialEmotionalView';
import { SupportPlansView } from './views/SupportPlansView';
import { InterventionLogsView } from './views/InterventionLogsView';
import { ProgressMonitoringView } from './views/ProgressMonitoringView';
import { FollowUpsView } from './views/FollowUpsView';
import { MtssReviewWorkflowView } from './views/MtssReviewWorkflowView';
import { ReportsView } from './views/ReportsView';
import { MasterDataView } from './views/MasterDataView';
import { UserManagementView } from './views/UserManagementView';
import { AuditTrailView } from './views/AuditTrailView';

const MainApp: React.FC = () => {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Badge counters
  const [flagCount, setFlagCount] = useState(0);
  const [followUpCount, setFollowUpCount] = useState(0);

  const loadBadges = async () => {
    try {
      const [students, followUps] = await Promise.all([
        api.getStudents(),
        api.getFollowUps(),
      ]);
      setFlagCount(students.filter(s => s.needsReviewFlag).length);
      setFollowUpCount(followUps.filter(f => f.status === 'Pending').length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBadges();
  }, [currentUser, activeTab]);

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    setSelectedStudentId(null);
    setIsMobileSidebarOpen(false);
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
  };

  const handleBackToStudents = () => {
    setSelectedStudentId(null);
  };

  return (
    <div className="flex h-screen w-full bg-[#F1F5F9] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar with High Density Theme */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        reviewFlagCount={flagCount}
        followUpCount={followUpCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onNavigateTab={handleSelectTab}
        />

        {/* Scrollable Container with High Density layout */}
        <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
          {selectedStudentId ? (
            <StudentDetailView
              studentId={selectedStudentId}
              onBack={handleBackToStudents}
              onSelectStudent={handleSelectStudent}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  onNavigateTab={handleSelectTab}
                  onSelectStudent={handleSelectStudent}
                />
              )}
              {activeTab === 'lazuardi-matrix' && (
                <LazuardiSupportDashboardView
                  onSelectStudent={handleSelectStudent}
                  onNavigateToTab={handleSelectTab}
                />
              )}
              {activeTab === 'work-results' && (
                <WorkResultsView onSelectStudent={handleSelectStudent} />
              )}
              {activeTab === 'emotion-tracker' && (
                <EmotionTrackerView onSelectStudent={handleSelectStudent} />
              )}
              {activeTab === 'classes' && (
                <ClassesView
                  onSelectStudent={handleSelectStudent}
                  onNavigateToTab={handleSelectTab}
                />
              )}

              {activeTab === 'students' && (
                <StudentsView onSelectStudent={handleSelectStudent} />
              )}
              {activeTab === 'ldss-screening' && (
                <LdssScreeningView onSelectStudent={handleSelectStudent} />
              )}
              {activeTab === 'supervisions' && (
                <SupervisionsView onSelectStudent={handleSelectStudent} />
              )}
              {activeTab === 'case-conferences' && (
                <CaseConferencesView onSelectStudent={handleSelectStudent} />
              )}
              {activeTab === 'behavior' && (
                <BehaviorObservationsView onSelectStudent={handleSelectStudent} />
              )}
              {activeTab === 'social-emotional' && (
                <SocialEmotionalView onSelectStudent={handleSelectStudent} />
              )}
              {activeTab === 'support-plans' && (
                <SupportPlansView onSelectStudent={handleSelectStudent} />
              )}
              {activeTab === 'intervention-logs' && (
                <InterventionLogsView onSelectStudent={handleSelectStudent} />
              )}
              {activeTab === 'progress' && (
                <ProgressMonitoringView onSelectStudent={handleSelectStudent} />
              )}
              {activeTab === 'follow-ups' && (
                <FollowUpsView onSelectStudent={handleSelectStudent} />
              )}
              {activeTab === 'mtss-reviews' && (
                <MtssReviewWorkflowView onSelectStudent={handleSelectStudent} />
              )}
              {activeTab === 'reports' && <ReportsView />}
              {activeTab === 'master-data' && <MasterDataView />}
              {activeTab === 'user-mgmt' && <UserManagementView />}
              {activeTab === 'audit-trail' && <AuditTrailView />}
            </>
          )}
        </div>

        {/* Footer in High Density theme */}
        <footer className="h-10 bg-slate-50 border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-500 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>MTSS Dashboard • SD Lazuardi GCS • Firebase Firestore Database (<strong className="text-slate-700">mtss-a23e4</strong>)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Cloud Database: Terhubung
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
