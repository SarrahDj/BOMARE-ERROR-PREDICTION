// src/components/RecentUploads.tsx
import React, { useState, useEffect } from 'react';
import './RecentUploads.css';
import check from '../assets/check-circle.png';
import cross from '../assets/x-circle.png';
import fileService, { UserFile } from '../services/file';
import { useLocation, useNavigate } from 'react-router-dom';
interface File {
  id: number;
  name: string;
  type: string;
  uploadedBy: string;
  uploadDate: string;
  status: 'processed' | 'faulty';
}


const RecentUploads: React.FC = () => {
  const [userFiles, setUserFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
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
        navigate('/Analytics', { 
      state: { 
        fileId: fileId
      } 
    });

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
                <td className={file.status === 'processed' ? 'status file-status-processed' : 'status file-status-faulty'}>
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