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

export const targetPercent = 76;
export const errorTarget = 58;
export const distinctErrorTarget = 13;

export const errorRateTimelineData = [
  {
    name: 'File 5',
    errorRate: 21,
    uploadDate: '27/12/24'
  },
  {
    name: 'File 4',
    errorRate: 45,
    uploadDate: '28/12/24'
  },
  {
    name: 'File 3',
    errorRate: 70,
    uploadDate: '05/01/25'
  },
  {
    name: 'File 2',
    errorRate: 42,
    uploadDate: '10/01/25',

  },
  {
    name: 'Current',
    errorRate: 76,
    uploadDate: '12/01/25',
    isCurrent: true
  }
];

export const COLORS1 = ['#026DB5', '#eeeeee'];
export const COLORS_COMPONENTS1 = [
  '#026DB5',
  '#0285DB',
  '#029DFF',
  '#02B5FF',
  '#02CDFF',
  '#4AD9FF',
  '#7CE5FF',
  '#A7F0FF',
  '#D1FAFF',
  '#E8FDFF'
];

export const componentErrorData = [
  { name: 'Battery Pack', errors: 42, percentage: 32 },
  { name: 'Motor Controller', errors: 38, percentage: 29 },
  { name: 'Charging Port', errors: 25, percentage: 19 },
  { name: 'DC Converter', errors: 15, percentage: 11 },
  { name: 'Thermal System', errors: 10, percentage: 8 },
];

export const frequentErrorsData = [
  { name: 'Overheating', count: 28, color: '#026DB5' },
  { name: 'Voltage Fluctuation', count: 22, color: '#0285DB' },
  { name: 'Connection Failure', count: 18, color: '#029DFF' },
  { name: 'Short Circuit', count: 15, color: '#02B5FF' },
  { name: 'Calibration Error', count: 12, color: '#02CDFF' },
];
export const allErrorsData = [
  { id: 1, component: 'Battery Pack', error: 'Overheating', frequency: 'High' },
  { id: 2, component: 'Motor Controller', error: 'Voltage Fluctuation', frequency: 'Medium' },
  { id: 3, component: 'Charging Port', error: 'Connection Failure', frequency: 'High' },
  { id: 4, component: 'DC Converter', error: 'Short Circuit', frequency: 'Critical' },
  { id: 5, component: 'Thermal System', error: 'Calibration Error', frequency: 'Low' },
  { id: 6, component: 'Battery Pack', error: 'Cell Imbalance', frequency: 'Medium' },
  { id: 7, component: 'Motor Controller', error: 'Signal Noise', frequency: 'Low' },
  { id: 8, component: 'Battery Pack', error: 'Overheating', frequency: 'High' },
  { id: 9, component: 'Charging Port', error: 'Connection Failure', frequency: 'High' },
  { id: 10, component: 'DC Converter', error: 'Short Circuit', frequency: 'Critical' },
];