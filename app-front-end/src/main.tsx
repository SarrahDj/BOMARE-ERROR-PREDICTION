import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'; // Import BrowserRouter
import './index.css';
import ProcessingScreen from './screens/ProcessingScreen/ProcessingScreen';
import ExportScreen from './screens/ExportScreen/ExportScreen';
import UploadScreen from './screens/UploadScreen/UploadScreen';
import AnalyticsScreen from './screens/AnalyticsScreen/AnalyticsScreen';
import AdminPanel from './screens/AdminPanelScreen/AdminPanelScreen';
import LoginPage from './screens/LoginScreen/LoginScreen';
import { AuthProvider } from './services/auth_context';
import ProtectedRoute from './components/ProtectedRoute';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/UploadScreen" element={<UploadScreen />} />
            <Route path="/ProcessingScreen" element={<ProcessingScreen />} />
            <Route path="/ExportScreen" element={<ExportScreen />} />
            <Route path="/Analytics" element={<AnalyticsScreen />} />
            <Route path="/Admin" element={<AdminPanel />} />


          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>

    </Router>
  </StrictMode>
);
