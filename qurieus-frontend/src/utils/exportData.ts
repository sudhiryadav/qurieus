import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

export interface ExportData {
  timestamp: string;
  activeVisitors: number;
  recentQueries: {
    document: string;
    query: string;
    responseTime: number;
    success: boolean;
    createdAt: string;
  }[];
  documentViews: {
    document: string;
    views: number;
    queries: number;
    lastViewed: string;
  }[];
}

export interface ExportOptions {
  dateFormat?: 'iso' | 'local' | 'relative';
  numberFormat?: 'raw' | 'formatted';
  includeCharts?: boolean;
  filter?: {
    startDate?: Date;
    endDate?: Date;
    minResponseTime?: number;
    successOnly?: boolean;
    minViews?: number;
  };
}

const formatDate = (date: string | Date, format: 'iso' | 'local' | 'relative' = 'local') => {
  const d = new Date(date);
  switch (format) {
    case 'iso':
      return d.toISOString();
    case 'relative':
      return new Date().getTime() - d.getTime() < 24 * 60 * 60 * 1000
        ? `${Math.round((new Date().getTime() - d.getTime()) / (60 * 60 * 1000))} hours ago`
        : d.toLocaleDateString();
    default:
      return d.toLocaleString();
  }
};

const formatNumber = (num: number, format: 'raw' | 'formatted' = 'raw') => {
  if (format === 'formatted') {
    return new Intl.NumberFormat().format(num);
  }
  return num.toString();
};

export function exportToCSV(data: ExportData, options: ExportOptions = {}) {
  const { dateFormat = 'local', numberFormat = 'raw', filter } = options;

  let filteredData = { ...data };
  if (filter) {
    filteredData = filterData(data, filter);
  }

  // Create CSV content for queries
  const queriesCSV = [
    ['Document', 'Query', 'Response Time (ms)', 'Success', 'Created At'],
    ...filteredData.recentQueries.map(q => [
      q.document,
      q.query,
      formatNumber(q.responseTime, numberFormat),
      q.success.toString(),
      formatDate(q.createdAt, dateFormat)
    ])
  ].map(row => row.join(',')).join('\n');

  // Create CSV content for document views
  const viewsCSV = [
    ['Document', 'Views', 'Queries', 'Last Viewed'],
    ...filteredData.documentViews.map(v => [
      v.document,
      formatNumber(v.views, numberFormat),
      formatNumber(v.queries, numberFormat),
      formatDate(v.lastViewed, dateFormat)
    ])
  ].map(row => row.join(',')).join('\n');

  // Combine all CSV content
  const csvContent = [
    'Analytics Export',
    `Timestamp: ${formatDate(filteredData.timestamp, dateFormat)}`,
    `Active Visitors: ${formatNumber(filteredData.activeVisitors, numberFormat)}`,
    '\nRecent Queries:',
    queriesCSV,
    '\nDocument Views:',
    viewsCSV
  ].join('\n');

  return csvContent;
}

export function exportToExcel(data: ExportData, options: ExportOptions = {}) {
  const { dateFormat = 'local', numberFormat = 'raw', filter } = options;

  let filteredData = { ...data };
  if (filter) {
    filteredData = filterData(data, filter);
  }

  const workbook = XLSX.utils.book_new();

  // Add overview sheet
  const overviewData = [
    ['Analytics Overview'],
    ['Timestamp', formatDate(filteredData.timestamp, dateFormat)],
    ['Active Visitors', formatNumber(filteredData.activeVisitors, numberFormat)],
    [],
    ['Recent Queries', formatNumber(filteredData.recentQueries.length, numberFormat)],
    ['Document Views', formatNumber(filteredData.documentViews.length, numberFormat)]
  ];
  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');

  // Add queries sheet
  const queriesData = [
    ['Document', 'Query', 'Response Time (ms)', 'Success', 'Created At'],
    ...filteredData.recentQueries.map(q => [
      q.document,
      q.query,
      formatNumber(q.responseTime, numberFormat),
      q.success,
      formatDate(q.createdAt, dateFormat)
    ])
  ];
  const queriesSheet = XLSX.utils.aoa_to_sheet(queriesData);
  XLSX.utils.book_append_sheet(workbook, queriesSheet, 'Queries');

  // Add document views sheet
  const viewsData = [
    ['Document', 'Views', 'Queries', 'Last Viewed'],
    ...filteredData.documentViews.map(v => [
      v.document,
      formatNumber(v.views, numberFormat),
      formatNumber(v.queries, numberFormat),
      formatDate(v.lastViewed, dateFormat)
    ])
  ];
  const viewsSheet = XLSX.utils.aoa_to_sheet(viewsData);
  XLSX.utils.book_append_sheet(workbook, viewsSheet, 'Document Views');

  return workbook;
}

export async function exportToPDF(data: ExportData, options: ExportOptions = {}) {
  const { dateFormat = 'local', numberFormat = 'raw', filter, includeCharts = true } = options;

  let filteredData = { ...data };
  if (filter) {
    filteredData = filterData(data, filter);
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Add title
  doc.setFontSize(20);
  doc.text('Analytics Export', margin, 20);

  // Add timestamp
  doc.setFontSize(12);
  doc.text(`Generated: ${formatDate(filteredData.timestamp, dateFormat)}`, margin, 30);

  // Add overview
  doc.setFontSize(14);
  doc.text('Overview', margin, 40);
  doc.setFontSize(12);
  doc.text(`Active Visitors: ${formatNumber(filteredData.activeVisitors, numberFormat)}`, margin, 50);
  doc.text(`Total Queries: ${formatNumber(filteredData.recentQueries.length, numberFormat)}`, margin, 60);
  doc.text(`Total Documents: ${formatNumber(filteredData.documentViews.length, numberFormat)}`, margin, 70);

  // Add queries table
  doc.setFontSize(14);
  doc.text('Recent Queries', margin, 90);
  const queriesData = filteredData.recentQueries.map(q => [
    q.document,
    q.query,
    formatNumber(q.responseTime, numberFormat),
    q.success ? 'Yes' : 'No',
    formatDate(q.createdAt, dateFormat)
  ]);
  (doc as any).autoTable({
    startY: 100,
    head: [['Document', 'Query', 'Response Time', 'Success', 'Created At']],
    body: queriesData,
    margin: { left: margin }
  });

  // Add document views table
  const viewsY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.text('Document Views', margin, viewsY);
  const viewsData = filteredData.documentViews.map(v => [
    v.document,
    formatNumber(v.views, numberFormat),
    formatNumber(v.queries, numberFormat),
    formatDate(v.lastViewed, dateFormat)
  ]);
  (doc as any).autoTable({
    startY: viewsY + 10,
    head: [['Document', 'Views', 'Queries', 'Last Viewed']],
    body: viewsData,
    margin: { left: margin }
  });

  return doc;
}

export async function exportChartImage(chartElement: HTMLElement) {
  const canvas = await html2canvas(chartElement, {
    scale: 2,
    useCORS: true,
    logging: false
  });
  return canvas.toDataURL('image/png');
}

function filterData(data: ExportData, filter: ExportOptions['filter']): ExportData {
  if (!filter) return data;

  const filteredData = { ...data };

  if (filter.startDate || filter.endDate) {
    filteredData.recentQueries = data.recentQueries.filter(q => {
      const date = new Date(q.createdAt);
      return (!filter.startDate || date >= filter.startDate) &&
             (!filter.endDate || date <= filter.endDate);
    });
  }

  if (filter.minResponseTime) {
    filteredData.recentQueries = filteredData.recentQueries.filter(
      q => q.responseTime >= filter.minResponseTime!
    );
  }

  if (filter.successOnly) {
    filteredData.recentQueries = filteredData.recentQueries.filter(q => q.success);
  }

  if (filter.minViews) {
    filteredData.documentViews = data.documentViews.filter(
      v => v.views >= filter.minViews!
    );
  }

  return filteredData;
}

export function downloadFile(content: string | XLSX.WorkBook | jsPDF, filename: string, type: string) {
  let blob: Blob;
  let url: string;

  if (type === 'application/json') {
    blob = new Blob([content as string], { type });
    url = URL.createObjectURL(blob);
  } else if (type === 'text/csv') {
    blob = new Blob([content as string], { type });
    url = URL.createObjectURL(blob);
  } else if (type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    const excelBuffer = XLSX.write(content as XLSX.WorkBook, { bookType: 'xlsx', type: 'array' });
    blob = new Blob([excelBuffer], { type });
    url = URL.createObjectURL(blob);
  } else if (type === 'application/pdf') {
    (content as jsPDF).save(filename);
    return;
  } else if (type === 'image/png') {
    blob = dataURLtoBlob(content as string);
    url = URL.createObjectURL(blob);
  } else {
    throw new Error('Unsupported file type');
  }

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
} 