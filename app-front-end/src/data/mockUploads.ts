export interface UploadRecord {
    fileName: string;
    type: 'csv' | 'xml';
    uploadDate: string;
    status: 'processed' | 'faulty';
  }

  export const mockUploads: UploadRecord[] = [
    {
      fileName: 'comp1.csv',
      type: 'csv',
      uploadDate: '2025-04-03',
      status: 'processed',
    },
    {
      fileName: 'comp2.xml',
      type: 'xml',
      uploadDate: '2025-04-02',
      status: 'faulty',
    },
    {
      fileName: 'comp3.csv',
      type: 'csv',
      uploadDate: '2025-04-01',
      status: 'processed',
    },
  ];
  