# Tasks & Development Roadmap
## Unified Cyber Defense Solution

---

### 1. Completed Milestones (v1.0 Baseline)

- [x] **Core SIEM & Dashboard**: Implemented live log telemetry streaming, real-time alert counters, and dashboard widgets.
- [x] **Asset Discovery & Management**: Built subnet IP range scanner, Nmap XML import parser, and Shadow IT device detection.
- [x] **Vulnerability Management**: Integrated CVE database mapping, CVSS scoring, and status transition tracking (`Pending` → `Resolved`).
- [x] **Network Traffic & PCAP Engine**: Created deep packet inspection simulation, protocol breakdown, and bandwidth anomaly detection.
- [x] **Log Analytics & Dependency Graph**: Developed multi-source log parser (`log_parser_engine.py`) and cross-host communication topology visualizer.
- [x] **Threat Detection Rule Engine**: Implemented SIGMA-style rule evaluator, rule toggle endpoints, and automated alert trigger.
- [x] **Incident Response Board**: Built incident containment playbooks (`IP Containment`, `Host Quarantine`, `User Suspension`).
- [x] **Active Directory Audit**: Created domain user audit engine, privileged group membership inspector, and Kerberos/NTLM health metrics.
- [x] **GIS Threat & Breach Map**: Developed interactive global IP threat visualization map with direct IP containment controls.
- [x] **Infrastructure Hardening**: Integrated CIS Benchmark compliance auditor and remediation task generator.
- [x] **Authentication & RBAC**: Fixed typo in `soc_manager` preset (`Manager123!`), normalized `USER_ALIASES` for typos (`sox_manager`), and configured 8 access tiers.
- [x] **Database Resiliency**: Implemented dual-tier PostgreSQL Supabase connection with automatic local SQLite fallback (`cyber_defense.db`).

---

### 2. In-Progress Tasks (v1.1 Hardening & Optimization)

- [ ] **WebSockets Integration for Live Telemetry**: Replace short-polling with WebSocket server endpoints for real-time log streaming.
- [ ] **Enhanced Rule Builder UI**: Add visual drag-and-drop SIGMA rule creator in `ThreatDetection.tsx`.
- [ ] **Automated PDF Report Styling**: Enhance HTML-to-PDF template formatting with enterprise branding logos and executive metrics summaries.
- [ ] **Exportable Audit Logs**: Enable JSON / CSV export for system audit logs in `AuditLogs.tsx`.

---

### 3. Upcoming Roadmap Items (v2.0 Advanced SOAR & AI Copilot)

- [ ] **AI SOC Assistant / Threat Copilot**: LLM-driven incident summary generation and automated playbook recommendations.
- [ ] **SOAR Automation Pipeline**: Event-driven webhook integration with external firewalls (Palo Alto, Fortinet) and EDR agents (CrowdStrike, Defender).
- [ ] **Multi-Tenant MSSP Support**: Support multi-organization data isolation and tenant-specific dashboards.
- [ ] **STIX / TAXII Threat Intelligence Feeds**: Ingest real-time indicators of compromise (IOCs) from open-source threat intelligence feeds.

---

### 4. Verification & Testing Checklist

- [x] `POST /api/v1/auth/login` returns `200 OK` for `admin` and `soc_manager`.
- [x] `GET /api/v1/assets` returns asset list without database errors.
- [x] `POST /api/v1/gis/contain-ip` logs action in `audit_logs` and returns updated status.
- [x] Frontend builds cleanly without TypeScript or React compilation errors.
