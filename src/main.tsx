import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'; // Import BrowserRouter
import './index.css';
import ProcessingScreen from './screens/ProcessingScreen/ProcessingScreen';
import ExportScreen from './screens/ExportScreen/ExportScreen';
import UploadScreen from './screens/UploadScreen/UploadScreen';
import LoginPage from './screens/LoginScreen/LoginScreen';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
    <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/UploadScreen" element={<UploadScreen />} />
        <Route path="/ProcessingScreen" element={<ProcessingScreen />} />
        <Route path="/ExportScreen" element={<ExportScreen />} />
      </Routes>
    </Router>
  </StrictMode>
);
