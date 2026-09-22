import React from 'react';
import { FileCheck, Download, FileText, Table } from 'lucide-react';
import { SiemService } from '../../services/api';

export const SecurityReports: React.FC = () => {
  const handleDownloadPdf = (reportType: string) => {
    window.open(SiemService.getReportPdfUrl(reportType), '_blank');
  };

  const handleDownloadCsv = (reportType: string) => {
    window.open(SiemService.getReportCsvUrl(reportType), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <FileCheck className="h-6 w-6 text-blue-600" />
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">Executive Security Report Generation & Compliance Exporter</h2>
        </div>
        <p className="text-xs text-slate-500 max-w-2xl">
          Generate formal PDF reports for executive briefings, vulnerability assessments, Active Directory security audits, infrastructure hardening benchmarks, and export raw CSV/Excel telemetry datasets.
        </p>
      </div>

      {/* PDF Reports Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-blue-50 w-fit border border-blue-200">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Vulnerability Assessment Report</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Comprehensive report containing all detected CVE vulnerabilities, affected assets, CVSS v3.1 scores, and technical remediation guides.
            </p>
          </div>
          <button
            onClick={() => handleDownloadPdf('Vulnerability Assessment')}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-bold text-white shadow-sm transition"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF Report</span>
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-rose-50 w-fit border border-rose-200">
              <FileText className="h-6 w-6 text-rose-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Executive SIEM Posture Briefing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              High-level executive briefing featuring overall security posture scores, critical alert counts, active threat incidents, and risk trends.
            </p>
          </div>
          <button
            onClick={() => handleDownloadPdf('Executive SIEM Posture')}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-700 py-2.5 text-xs font-bold text-white shadow-sm transition"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF Report</span>
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-emerald-50 w-fit border border-emerald-200">
              <FileText className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Infrastructure Hardening Report</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              CIS benchmark compliance breakdown across Windows Server and Linux hosts, listing passed controls, failed policies, and warnings.
            </p>
          </div>
          <button
            onClick={() => handleDownloadPdf('Hardening Assessment')}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-sm transition"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* Raw Data Export Exporters */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Table className="h-4 w-4 text-blue-600" />
          Raw CSV & Dataset Exporters
        </h3>
        <p className="text-xs text-slate-500">Export structured security datasets for external SIEM integration or audit archiving.</p>

        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={() => handleDownloadCsv('Vulnerabilities')}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            <Download className="h-4 w-4 text-blue-600" />
            <span>Export Vulnerabilities Dataset (CSV)</span>
          </button>

          <button
            onClick={() => handleDownloadCsv('Security Alerts')}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            <Download className="h-4 w-4 text-rose-600" />
            <span>Export Security Alerts Dataset (CSV)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
