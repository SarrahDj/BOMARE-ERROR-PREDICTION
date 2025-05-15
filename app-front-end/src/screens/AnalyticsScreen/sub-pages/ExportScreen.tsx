import React, { useEffect } from 'react';
import '../AnalyticsScreen.css';
import { FaEye } from 'react-icons/fa';
import csvIcon from '../../assets/csv.png';
import excelIcon from '../../assets/excel.png';
import { HiDownload } from 'react-icons/hi';
import { distinctErrorTarget, errorTarget, targetPercent } from '../../../data/mockUploads';
import './ExportScreen.css';

const ExportScreen: React.FC = () => {

  useEffect(() => {
    let p = 0;
    let e = 0;
    let d = 0;
    const interval = setInterval(() => {
      if (p > targetPercent && e > errorTarget && d > distinctErrorTarget) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, []);

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
};

export default ExportScreen;