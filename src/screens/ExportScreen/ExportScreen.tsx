import React, { useEffect, useRef, useState } from 'react';
import './ExportScreen.css';
import { FaChartLine } from 'react-icons/fa';
import { FiUpload, FiPrinter } from 'react-icons/fi';
import { HiDownload } from 'react-icons/hi';
import pdfIcon from '../../assets/pdf.png';
import csvIcon from '../../assets/csv.png';
import excelIcon from '../../assets/excel.png';
import Header from '../../components/Header';
import RightSidebar from '../../components/RightSideBar';


const ExportPage: React.FC = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const [activeTab, setActiveTab] = useState('export');

  useEffect(() => {
      const updateLayout = () => {
        if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
        if (sidebarRef.current) setSidebarWidth(sidebarRef.current.offsetWidth);
      };
      
      updateLayout();
      
      const resizeObserver = new ResizeObserver(updateLayout);
      if (headerRef.current) resizeObserver.observe(headerRef.current);
      if (sidebarRef.current) resizeObserver.observe(sidebarRef.current);
      
      window.addEventListener('resize', updateLayout);
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', updateLayout);
      };
    }, []);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <>
      <Header ref={headerRef}/>
      <RightSidebar ref={sidebarRef}/>
      <div 
      className="export-content"
      style={{
        marginTop: `${headerHeight}px`,
        marginRight: `${sidebarWidth}px`,
        height: `calc(100vh - ${headerHeight}px)`,
  
      }}
      >
        <span className='page-title'>Export Results</span>

          <div className="selected-file-export">

            <div className="left-export">
                    <img src={csvIcon} alt="CSV" />
                    <div className="file-text-export">
                      <span>file_name.csv</span>
                      <span className="file-size-export">File size: 2.5MB</span>
                      <span className="file-size-export">Uploaded by: user2</span>
                      <span className="file-size-export">Date of upload: 12 Jan 2025</span>
                    </div>
                  </div>

            <div className="change-file-export">Change</div>
          </div>
        <div className="tabs-container-export">
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

        <div className="export-boxes">
          <div className="export-box">
            <div className="icon-and-text-left">
              <img src={csvIcon} alt="PDF" />
              <span>Export to CSV</span>
            </div>
            <HiDownload className="download-icon" />
          </div>

          <div className="export-box">
            <div className="icon-and-text-left">
              <img src={excelIcon} alt="PDF" />
              <span>Export to Excel</span>
            </div>
            <HiDownload className="download-icon" />
          </div>
        </div>

      </div>
    </>
  );
};

export default ExportPage;
