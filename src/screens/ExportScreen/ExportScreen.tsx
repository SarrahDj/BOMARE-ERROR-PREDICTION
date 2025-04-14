import React, { useState } from 'react';
import './ExportScreen.css';
import { FaChartLine } from 'react-icons/fa';
import { FiUpload, FiShare2, FiPrinter } from 'react-icons/fi';
import { HiDownload } from 'react-icons/hi';
import pdfIcon from '../../assets/pdf.png'; // replace with your actual path
import Header from '../../components/Header';
import RightSidebar from '../../components/RightSideBar';


const ExportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('export');

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <>
      <Header />
      <RightSidebar />
      <div className="export-content">
        <span className='page-title'>Export Results</span>

        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => handleTabClick('export')}
          >
            <FiUpload />
            Export
          </button>
          <button
            className={`tab-button ${activeTab === 'share' ? 'active' : ''}`}
            onClick={() => handleTabClick('share')}
          >
            <FiShare2 />
            Share
          </button>
          <button
            className={`tab-button ${activeTab === 'print' ? 'active' : ''}`}
            onClick={() => handleTabClick('print')}
          >
            <FiPrinter />
            Print
          </button>
        </div>

        <div className="view-analytics">
          <FaChartLine className="analytics-icon" />
          <span>View Analytics</span>
        </div>

        <p className="download-description">
          Download a copy of the results of the prediction to share with others
        </p>

        <div className="pdf-export-box">
          <div className="left">
            <img src={pdfIcon} alt="PDF" />
            <span>Export to PDF</span>
          </div>
          <HiDownload className="download-icon" />
        </div>

        <div className="note-box">
          <p>
            Note: we don’t currently support Excel or PowerPoint export, but we’ll be exploring this in the future
          </p>
        </div>
      </div>
    </>
  );
};

export default ExportPage;
