import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout';
import { ToastProvider } from '@/components/ui';
import DesignTokens from '@/pages/DesignTokens';
import AssessmentsPage from '@/pages/AssessmentsPage';
import ChecklistPage from '@/pages/ChecklistPage';
import InterviewPage from '@/pages/InterviewPage';
import ReviewPage from '@/pages/ReviewPage';

const App = () => (
  <ToastProvider>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/assessments" replace />} />

        <Route element={<AppShell />}>
          <Route path="/assessments" element={<AssessmentsPage />} />
          <Route path="/assessments/:sessionId/interview" element={<InterviewPage />} />
          <Route path="/assessments/:sessionId/checklist" element={<ChecklistPage />} />
          <Route path="/assessments/:sessionId/review" element={<ReviewPage />} />
        </Route>

        <Route path="/tokens" element={<DesignTokens />} />
      </Routes>
    </HashRouter>
  </ToastProvider>
);

export default App;
