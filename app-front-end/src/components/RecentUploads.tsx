// src/components/RecentUploads.tsx
import React, { useState, useEffect } from 'react';
import './RecentUploads.css';
import check from '../assets/check-circle.png';
import cross from '../assets/x-circle.png';
import fileService, { UserFile } from '../services/file';

interface File {
  id: number;
  name: string;
  type: string;
  uploadedBy: string;
  uploadDate: string;
  status: 'processed' | 'faulty';
}

const mockUploads: File[] = [
  {
    id: 1,
    name: 'components_config_2023-10-15.csv',
    type: 'csv',
    uploadedBy: 'Ahmed',
    uploadDate: '2023-10-15 14:30',
    status: 'processed'
  },
  {
    id: 2,
    name: 'components_config_2023-10-15.csv',
    type: 'csv',
    uploadedBy: 'Mohamed',
    uploadDate: '2023-10-14 09:15',
    status: 'processed'
  },
  {
    id: 3,
    name: 'components_config_2023-10-15.csv',
    type: 'xml',
    uploadedBy: 'Youssef',
    uploadDate: '2023-10-13 16:45',
    status: 'faulty'
  },
  {
    id: 4,
    name: 'components_config_2023-10-15.csv',
    type: 'csv',
    uploadedBy: 'Ali',
    uploadDate: '2023-10-12 11:20',
    status: 'processed'
  },
  {
    id: 5,
    name: 'components_config_2023-10-15.csv',
    type: 'xml',
    uploadedBy: 'Omar',
    uploadDate: '2023-10-11 13:10',
    status: 'faulty'
  }
];

const RecentUploads: React.FC = () => {
  const [userFiles, setUserFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserFiles = async () => {
      try {
        const files = await fileService.getUserFiles();
        setUserFiles(files);
        setLoading(false);
      } catch (err) {
        setError('Failed to load recent uploads');
        setLoading(false);
      }
    };

    fetchUserFiles();
  }, []);

  const handleRowClick = (fileId: number) => {
    // You can implement navigation to file details here
    console.log(`Clicked file ID: ${fileId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return <div className="loading-files">Loading recent uploads...</div>;
  }

  if (error) {
    return <div className="error-files">{error}</div>;
  }

  return (
    <div className="recent-uploads-wrapper">
      {userFiles.length === 0 ? (
        <div className="no-uploads">No files uploaded yet</div>
      ) : (
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
          {[...userFiles]
  .sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime()) // Sort by newest
  .slice(0, 5) // Take last 5
  .map((file) => (
              <tr
                key={file.id}
                className="upload-row"
                onClick={() => handleRowClick(file.id)}
              >
                <td className='file-name'>{file.filename}</td>
                <td className='file-type'>{file.file_type.toUpperCase()}</td>
                <td>{formatDate(file.upload_date)}</td>
                <td className={file.status === 'processed' ? 'status status-processed' : 'status status-faulty'}>
                  {file.status === 'processed' ? <img className='check-cross' alt='check' src={check}/> : 
                  <img className='check-cross' alt='cross' src={cross}/>}
                  {file.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RecentUploads;