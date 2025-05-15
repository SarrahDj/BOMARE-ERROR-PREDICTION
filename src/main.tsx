import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './index.css';
import ProcessingScreen from './screens/ProcessingScreen/ProcessingScreen';
import UploadScreen from './screens/UploadScreen/UploadScreen';
import LoginPage from './screens/LoginScreen/LoginScreen';
import AnalyticsScreen from './screens/AnalyticsScreen/AnalyticsScreen';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
    <Routes>
        <Route path="/a" element={<LoginPage />} />
        <Route path="/UploadScreen" element={<UploadScreen />} />
        <Route path="/ProcessingScreen" element={<ProcessingScreen />} />
        <Route path="/AnalyticsScreen" element={<AnalyticsScreen />} />
        <Route path="/" element={<AnalyticsScreen />} />
      </Routes>
    </Router>
  </StrictMode>
);
