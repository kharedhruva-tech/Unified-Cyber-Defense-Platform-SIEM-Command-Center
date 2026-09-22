import axios from 'axios';

const API_BASE_URL = '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor for Auth Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('soc_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor for Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Optional: Handle unauthorized error
    }
    return Promise.reject(error);
  }
);

export const SiemService = {
  login: (username: string, password: string) => api.post('/auth/login', { username, password }),
  registerUser: (data: any) => api.post('/auth/register', data),
  getUsers: () => api.get('/auth/users'),
  updateUserRole: (userId: number, role: string) => api.put(`/auth/users/${userId}/role`, { role }),
  getPostureSummary: () => api.get('/reports/summary'),
  getAssets: () => api.get('/assets'),
  runSubnetScan: (target: string = '192.168.1.0/24') => api.post(`/assets/scan?target_range=${target}`),
  getVulnerabilities: () => api.get('/vulnerabilities'),
  getVulnerabilitySummary: () => api.get('/vulnerabilities/summary'),
  updateVulnerabilityStatus: (id: number, status: string) => api.patch(`/vulnerabilities/${id}/status?status=${status}`),
  getNetworkAnalysis: () => api.get('/network/analysis'),
  getLogs: (type: string = 'ALL', limit: number = 100) => api.get(`/logs?log_type=${type}&limit=${limit}`),
  getLogMetrics: () => api.get('/logs/metrics'),
  getLogNetworkDependencies: () => api.get('/logs/network-dependencies'),
  ingestLog: (log_type: string, message: string, source_ip?: string, host_name?: string) => api.post('/logs/ingest', { log_type, message, source_ip, host_name }),
  getRules: () => api.get('/threat-detection/rules'),
  createRule: (data: any) => api.post('/threat-detection/rules', data),
  toggleRule: (id: number) => api.patch(`/threat-detection/rules/${id}/toggle`),
  getAlerts: () => api.get('/threat-detection/alerts'),
  runEvaluation: () => api.post('/threat-detection/run-evaluation'),
  getIncidents: () => api.get('/incidents'),
  createIncident: (data: any) => api.post('/incidents', data),
  updateIncidentStatus: (id: number, status: string, assigned_analyst?: string, action_note?: string) => 
    api.patch(`/incidents/${id}/status`, { status, assigned_analyst, action_note }),
  executeContainment: (id: number, actionType: string) => api.post(`/incidents/${id}/action/${actionType}`),
  getADAudit: () => api.get('/active-directory/audit'),
  getADUsers: () => api.get('/active-directory/users'),
  getADGroups: () => api.get('/active-directory/groups'),
  getHardeningAudit: () => api.get('/hardening/audit'),
  getAuditLogs: () => api.get('/audit-logs'),
  getReportPdfUrl: (reportType: string) => `${API_BASE_URL}/reports/download/pdf?report_type=${encodeURIComponent(reportType)}`,
  getReportCsvUrl: (reportType: string) => `${API_BASE_URL}/reports/download/csv?report_type=${encodeURIComponent(reportType)}`,
  startSimulator: () => api.post('/simulator/start'),
  stopSimulator: () => api.post('/simulator/stop'),
  triggerSimulatedUserAction: () => api.post('/simulator/trigger-now'),
  getSimulatorStatus: () => api.get('/simulator/status'),
  getGisBreaches: () => api.get('/gis/breaches'),
  getGisSummary: () => api.get('/gis/summary'),
  triggerSimulatedBreach: () => api.post('/gis/simulate-breach'),
  containIp: (ip: string) => api.post('/gis/contain-ip', { ip })
};

export const AiCopilotService = {
  askCopilot: (prompt: string, context_module?: string) => api.post('/ai/copilot/query', { prompt, context_module }),
  explainAlert: (alert_id: number) => api.post('/ai/copilot/explain-alert', { alert_id }),
};

export const NotificationService = {
  testWebhook: (webhook_url: string, channel_type: string = 'slack') => 
    api.post('/notifications/webhook/test', { webhook_url, channel_type }),
  dispatchAlertWebhook: (payload: { webhook_url: string; alert_id: number; rule_name: string; severity: string; source_ip: string; mitre_tactic?: string; evidence: string }) => 
    api.post('/notifications/webhook/dispatch', payload)
};



