import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './DragDrop.css';
import upload from '../assets/upload-icon.png';
import csv from '../assets/csv.png';
import bin from '../assets/bin.png';
import next from '../assets/next.png';
import { useNavigate } from 'react-router-dom';

const DragDrop: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setLoading(true);
      setTimeout(() => {
        setSelectedFile(acceptedFiles[0]);
        setLoading(false);
      }, 1500);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/csv': [],
      'application/xml': [],
      'text/xml': [],
    },
    multiple: false,
    onDrop,
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      setSelectedFile(null);
    }
  };

  const handleResume = () => {
    navigate('/ProcessingScreen');
  };

  return (
    <div className="dragdrop-wrapper">
      <div className={`dropzone-transition ${!selectedFile && !loading ? 'visible' : 'hidden'}`}>
        <div {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          <img src={upload} alt="upload" className="upload-icon" />
          <p className="field-text">
            Drag & Drop or <span className="choose-file">Choose file</span> to upload.
          </p>
          <p className="types-text">CSV or XML</p>
        </div>
      </div>

      <div className={`loading-transition ${loading ? 'visible' : 'hidden'}`}>
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Please wait for file loading...</p>
        </div>
      </div>

      <div className={`preview-transition ${selectedFile && !loading ? 'visible' : 'hidden'}`}>
        {selectedFile && (
          <div className="file-preview">
            <img src={bin} alt="delete" className="delete-btn" onClick={handleDelete} />
            <img src={csv} alt="csv-file" className="csv-icon" />
            <span className="file-name">{selectedFile.name}</span>
            <span className="file-size">{(selectedFile.size / 1024).toFixed(2)} KB</span>
            <button className="resume-btn" onClick={handleResume}>
              Resume
              <img src={next} alt="next" className="next-icon" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DragDrop;
