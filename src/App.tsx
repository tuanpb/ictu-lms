import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';

import AppLayout from './components/ui/AppLayout';
import ProtectedRoute from './components/ui/ProtectedRoute';
import ScrollToTop from './components/ui/ScrollToTop';

import { LoginPage, RegisterPage } from './features/auth';
import { SubjectListPage } from './features/subjects';
import { AnswerKeyPage } from './features/exam-lookup';
import WalletPage from './features/wallet/WalletPage';
import { useAuthStore } from './store/authStore';
import { useExamStore } from './store/examStore';

const App = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const initializeData = useExamStore((state) => state.initializeData);
  const subscribeToSubjects = useExamStore((state) => state.subscribeToSubjects);
  const currentUserId = useAuthStore((state) => state.currentUser?.id);

  useEffect(() => {
    let cleanup = () => {};
    let active = true;

    void initializeAuth().then((unsubscribe) => {
      if (active) {
        cleanup = unsubscribe;
      } else {
        unsubscribe();
      }
    });

    return () => {
      active = false;
      cleanup();
    };
  }, [initializeAuth]);

  useEffect(() => {
    if (currentUserId) {
      initializeData();
    }
  }, [currentUserId, initializeData]);

  useEffect(() => {
    const unsubscribe = subscribeToSubjects();
    return () => unsubscribe();
  }, [subscribeToSubjects]);

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          fontFamily: "Outfit, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          colorPrimary: '#6366f1',
          borderRadius: 8,
        },
      }}
    >
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<SubjectListPage />} />
            <Route path="/subjects/:subjectId" element={<AnswerKeyPage />} />
            <Route path="/wallet" element={<WalletPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
