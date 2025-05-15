import React, { useState, useEffect, useRef } from 'react';
import './AnalyticsScreen.css';
import Header from '../../components/Header';
import RightSidebar from '../../components/RightSideBar';
import { FiLayers, FiBox, FiPackage, FiShare2 } from 'react-icons/fi';
import { FaEye } from 'react-icons/fa';
import csvIcon from '../../assets/csv.png';
import excelIcon from '../../assets/excel.png';
import { HiDownload } from 'react-icons/hi';
import { RiPuzzle2Line } from "react-icons/ri";
import { distinctErrorTarget, errorTarget, targetPercent } from '../../data/mockUploads';
import OverviewScreen from './sub-pages/OverviewScreen';
import ShapesScreen from './sub-pages/ShapesScreen';
import ComponentsScreen from './sub-pages/ComponentsScreen';
import ModulesScreen from './sub-pages/ModulesScreen';

const AnalyticsScreen: React.FC = () => {

  const headerRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const updateLayout = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
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

  useEffect(() => {
    let p = 0;
    let e = 0;
    let d = 0;
    const interval = setInterval(() => {
      if (p > targetPercent && e > errorTarget && d > distinctErrorTarget) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, []);



  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewScreen />
      case 'shapes':
        return <ShapesScreen />
      case 'component':
        return <ComponentsScreen />
      case 'modules':
        return <ModulesScreen />
      case 'export':
        return (
          <>
            <div className="view-analytics">
              <FaEye className="analytics-icon" />
              <span>View File</span>
            </div><p className="download-description">
              Download a copy of the results of the prediction to share with others
            </p><div className="export-boxes">
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
            </div></>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Header ref={headerRef} />
      <RightSidebar ref={sidebarRef} />
      <div
        className="analytics-content"
        style={{
          marginTop: `${headerHeight}px`,

          height: `calc(100vh - ${headerHeight}px)`,

        }}
      >
        <div className="page-title">Analytics & Statistics</div>

        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabClick('overview')}
          >
            <FiLayers className='tab-button-icon' />
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'shapes' ? 'active' : ''}`}
            onClick={() => handleTabClick('shapes')}
          >
            <RiPuzzle2Line  className='tab-button-icon shape-icon' />
            Shapes
          </button>
          <button
            className={`tab-button ${activeTab === 'component' ? 'active' : ''}`}
            onClick={() => handleTabClick('component')}
          >
            <FiBox className='tab-button-icon' />
            Component
          </button>
          <button
            className={`tab-button ${activeTab === 'modules' ? 'active' : ''}`}
            onClick={() => handleTabClick('modules')}
          >
            <FiPackage className='tab-button-icon' />
            Modules
          </button>
          <button
            className={`tab-button ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => handleTabClick('export')}
          >
            <FiShare2 className='tab-button-icon' />
            Export
          </button>
        </div>

        {renderTabContent()}
      </div>
    </>
  );
};

export default AnalyticsScreen;