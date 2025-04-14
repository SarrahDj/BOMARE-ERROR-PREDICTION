import React from 'react';
import './RecentUploads.css';
import { mockUploads } from '../data/mockUploads';
import check from '../assets/check-circle.png';
import cross from '../assets/x-circle.png';

const RecentUploads: React.FC = () => {
  const handleRowClick = () => {
    alert('To implement');
  };

  return (
    <div className="recent-uploads-wrapper">
      <table className="recent-uploads-table">
        <thead>
          <tr>
            <th>File Name</th>
            <th className='type-th'>Type</th>
            <th className='status-th'>Upload Date</th>
            <th className='status-th'>Status</th>
          </tr>
        </thead>
        <tbody>
          {mockUploads.map((file, index) => (
            <tr
              key={index}
              className="upload-row"
              onClick={() => handleRowClick()}  // Add click handler to row
            >
              <td className='file-name'>{file.fileName}</td>
              <td className='file-type'>{file.type.toUpperCase()}</td>
              <td>{file.uploadDate}</td>
              <td className={file.status === 'processed' ? 'status status-processed' : 'status status-faulty'} >
                {file.status === 'processed' ? <img className='check-cross' alt='check' src={check}/> : 
                <img className='check-cross' alt='cross' src={cross}/>}
                {file.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentUploads;
