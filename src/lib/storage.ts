// Minimal session storage for scan history
export interface ScanRecord {
  id: string;
  hb: number;
  timestamp: string;
  severity: string;
  color: string;
}

const KEY = 'raktva_scans';

export function saveScans(scans: ScanRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(scans));
}

export function getScans(): ScanRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function addScan(scan: Omit<ScanRecord, 'id'>) {
  const scans = getScans();
  scans.unshift({ ...scan, id: Date.now().toString() });
  saveScans(scans.slice(0, 50)); // Keep last 50
}
