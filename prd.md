# Product Requirements Document (PRD)
## Unified Cyber Defense Solution (SIEM & SOC Operations Platform)

---

### 1. Executive Summary
The **Unified Cyber Defense Solution** is an enterprise-grade Security Information and Event Management (SIEM) and Security Operations Center (SOC) platform designed for real-time threat monitoring, automated asset discovery, vulnerability management, network traffic inspection, geographic threat visualization (GIS), and Active Directory security auditing.

The system provides security analysts, incident responders, network engineers, compliance auditors, and executives with a centralized, high-performance interface for threat detection, containment, and reporting.

---

### 2. Problem Statement
Modern enterprises face fragmented security toolstacks:
* **Tool Sprawl**: Disconnected consoles for SIEM, vulnerability scanning, asset inventories, and incident response.
* **Alert Fatigue**: High volume of uncontextualized telemetry leading to missed critical threats.
* **Visibility Gaps**: Unmonitored Shadow IT assets, unhardened domain controllers, and unmapped network dependencies.
* **Delayed Response**: Manual triage process for containing compromised endpoints and malicious IPs.

The Unified Cyber Defense Solution solves this by correlating telemetry streams into actionable incidents and automated response workflows.

---

### 3. Key Feature Modules

#### 3.1 Authentication & Multi-Tier Role-Based Access Control (RBAC)
* **JWT Authentication**: Secure 256-bit token authentication with configurable salted password hashing.
* **8 Preserved Access Tiers**:
  1. `admin` (Full Operations & System Admin)
  2. `soc_manager` (SOC Operations & Escalations)
  3. `analyst` / `analyst_dhruva` (SIEM & Threat Monitoring)
  4. `incident_responder` / `responder_alex` (Incident Triage & Containment)
  5. `vuln_analyst` / `vuln_sarah` (CVE & Vulnerability Remediation)
  6. `network_analyst` / `net_marcus` (PCAP & GIS Traffic Analysis)
  7. `auditor` (Compliance & CIS Audit View)
  8. `viewer` / `executive_viewer` (Read-Only Executive Dashboard)

#### 3.2 Real-Time SIEM & Security Dashboard
* Live telemetry feeds streaming Windows Security Events, Firewall Logs, Web Traffic, and SSH Authentication events.
* Real-time metrics counters for Critical Alerts, Unassigned Incidents, High-Risk Assets, and System Health.
* Quick action shortcuts for running threat evaluations, manually triggering alerts, and generating reports.

#### 3.3 Automated Asset Discovery & Inventory
* Dynamic host classification (Domain Controller, Database Server, Web App, Workstation, Firewall, NAS).
* **Shadow IT Detection**: Flagging unknown/unregistered devices joining enterprise subnets.
* Automated Nmap XML import and subnet scanner engine (`/api/v1/assets/scan`).
* Dynamic asset risk scoring (0.0 – 100.0) calculated from open vulnerabilities, active alerts, and host category.

#### 3.4 Vulnerability Management
* Integrated CVE lookup and severity categorization (Critical, High, Medium, Low).
* Remediation status tracking (`Pending`, `In Progress`, `Resolved`, `Mitigated`).
* CVSS score aggregation and asset-level vulnerability mapping.

#### 3.5 Network Traffic & PCAP Inspection
* Deep Packet Inspection (DPI) simulation for PCAP file uploads.
* Protocol breakdown (HTTP, HTTPS, SSH, DNS, SMB, RDP).
* Bandwidth spike detection, unusual port activity identification, and rogue outbound connection tracking.

#### 3.6 Log Analytics & Cross-Host Dependency Engine
* Multi-source log ingestion (`/api/v1/logs/ingest`) with JSON payload parsing.
* Visual search and filtering by log level (`CRITICAL`, `ERROR`, `WARNING`, `INFO`), host name, source IP, and log type.
* Cross-host network dependency topology mapping.

#### 3.7 Threat Detection & Rule Engine
* Custom detection rule builder supporting SIGMA-style patterns and regex matching.
* Real-time rule evaluation engine checking incoming telemetry against active rules.
* Instant alert generation and automated incident escalation for high-severity rule breaches.

#### 3.8 Incident Response & Containment Workflow
* Incident lifecycle management (`Open`, `Investigating`, `Contained`, `Closed`).
* Automated response triggers:
  * **IP Isolation / Containment** (`/api/v1/gis/contain-ip`)
  * **Host Network Quarantine**
  * **Account Suspension**
* Playbook execution logging and automated audit log recording.

#### 3.9 Active Directory Security & Identity Audit
* Domain user and group audit engine.
* Identification of privileged accounts (Domain Admins, Enterprise Admins).
* Inspection of accounts with `Password Never Expires`, `Disabled`, or elevated failed logon counts (`EventCode 4625`).

#### 3.10 Geographic Threat Map (GIS Engine)
* Global IP geolocation plotting for external threats.
* Live attack vector visualization connecting source IPs to target datacenter nodes.
* Interactive IP containment control directly from the GIS threat map.

#### 3.11 Infrastructure Hardening & Compliance
* CIS Benchmark compliance auditing across Windows and Linux server baselines.
* Category breakdown: Account Policies, Audit Policies, Firewall Configurations, SSH Security.
* Automated creation of remediation tasks assigned to security teams.

#### 3.12 Compliance Reporting & Audit Logging
* On-demand generation of executive summary reports.
* Export capabilities for PDF and CSV compliance formats.
* Immutable audit log tracking all operator actions (Logins, Role Updates, IP Containment, Rule Toggles).

---

### 4. Non-Functional Requirements (NFR)
* **Performance**: Sub-100ms response time for API queries; real-time SSE / streaming updates.
* **Security**: Zero clear-text password storage; strict CORS origin checks; parameterized SQL queries to prevent SQLi.
* **Scalability**: Decoupled architecture allowing independent scaling of FastAPI backend and React frontend.
* **Reliability**: Dual-tier database resilience (Supabase PostgreSQL primary with local SQLite fallback).
