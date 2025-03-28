import sampleData from '../data/sampleReports.json';

export const getReportData = () => {
  return new Promise((resolve) => {
    // Simulate API call with sample data
    setTimeout(() => {
      resolve(sampleData);
    }, 500);
  });
}; 