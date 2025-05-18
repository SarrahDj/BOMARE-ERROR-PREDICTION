import React, { useEffect, useState } from 'react';
import '../../AnalyticsScreen/AnalyticsScreen.css';
import { FaEye } from 'react-icons/fa';
import csvIcon from '../../../assets/csv.png';
import excelIcon from '../../../assets/excel.png';
import { HiDownload } from 'react-icons/hi';
import fileProcessingService from '../../../services/processing'; 
import '../sub-pages/ExportScreen.css';

interface ExportScreenProps {
  resultId: number;
  onViewFile: () => void;
}

const ExportScreen: React.FC<ExportScreenProps> = ({ resultId, onViewFile }) => {
  const [isDownloading, setIsDownloading] = useState<{[key: string]: boolean}>({
    csv: false,
    xlsx: false
  });
  const handleDownload = async (exportType: string) => {
    if (!resultId || isDownloading[exportType.toLowerCase()]) return;
     console.log("dakhlt hna ")

    try {
      setIsDownloading(prev => ({...prev, [exportType.toLowerCase()]: true}));
      
      // Call our new service method to download the file
      const blob = await fileProcessingService.downloadExportByType(resultId, exportType);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feeder-error-prediction-${resultId}.${exportType.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(`Error downloading ${exportType} file:`, err);
      alert(`Failed to download ${exportType} file. Please try again.`);
    } finally {
      setIsDownloading(prev => ({...prev, [exportType.toLowerCase()]: false}));
    }
  };

  return (
    <>
      <div className="view-analytics" onClick={onViewFile}>
        {/* <FaEye className="analytics-icon" /> */}
        {/* <span>View File</span> */}
      </div>
      <p className="download-description">
        Download a copy of the results of the prediction to share with others
      </p>
      <div className="export-boxes">
        <div 
          className={`export-box ${isDownloading.csv ? 'disabled' : ''}`} 
          onClick={() => handleDownload('csv')}
        >
          <div className="icon-and-text-left">
            <img src={csvIcon} alt="CSV" />
            <span>Export to CSV</span>
          </div>
          <HiDownload className="download-icon" />
          {isDownloading.csv && <span className="download-spinner"></span>}
        </div>

        <div 
          className={`export-box ${isDownloading.xlsx ? 'disabled' : ''}`}
          onClick={() => handleDownload('xlsx')}
        >
          <div className="icon-and-text-left">
            <img src={excelIcon} alt="Excel" />
            <span>Export to Excel</span>
          </div>
          <HiDownload className="download-icon" />
          {isDownloading.xlsx && <span className="download-spinner"></span>}
        </div>
      </div>
    </>
  );
};

export default ExportScreen;