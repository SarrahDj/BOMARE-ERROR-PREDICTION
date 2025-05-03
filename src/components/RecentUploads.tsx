import React from 'react';
import './RecentUploads.css';

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
  return (
    <div className="recent-uploads-wrapper">
      <table className="recent-uploads-table">
        <thead>
          <tr>
            <th>File Name</th>
            <th className='type-th'>Type</th>
            <th className='status-th'>Uploaded By</th>
            <th className='status-th'>Upload Date</th>
            <th className='status-th'>Status</th>
          </tr>
        </thead>
        <tbody>
          {mockUploads.map((file) => (
            <tr key={file.id} className="upload-row">
              <td className='file-name-upload'>{file.name}</td>
              <td className='file-type-upload'>{file.type.toUpperCase()}</td>
              <td>{file.uploadedBy}</td>
              <td>{file.uploadDate}</td>
              <td className={file.status === 'processed' ? 'status status-processed' : 'status status-faulty'}>
                {file.status === 'processed' ? 'Processed' : 'Faulty'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentUploads;