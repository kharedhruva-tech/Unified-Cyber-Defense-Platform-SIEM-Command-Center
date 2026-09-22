<div align="center">

# 🛡️ Unified Cyber Defense Platform — SIEM Command Center

An Enterprise-Grade Security Operations Console built for the **CompTIA Security+ SY0-701 Course-End Project**

[![Live Demo](https://img.shields.io/badge/Live_Demo-unified--cyber--defence.netlify.app-blue?style=for-the-badge&logo=netlify)](https://unified-cyber-defence.netlify.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/kharedhruva-tech/Unified-Cyber-Defense-Platform-SIEM-Command-Center)
[![CompTIA Security+](https://img.shields.io/badge/CompTIA-Security%2B_SY0--701-red?style=for-the-badge&logo=comptia)](https://github.com/kharedhruva-tech/Unified-Cyber-Defense-Platform-SIEM-Command-Center)

[🚀 View Live Demo Console](https://unified-cyber-defence.netlify.app/) • [📂 GitHub Repository](https://github.com/kharedhruva-tech/Unified-Cyber-Defense-Platform-SIEM-Command-Center)

---

</div>

## 📖 Overview

The **Unified Cyber Defense Platform** is a full-stack SIEM (Security Information and Event Management) command center that consolidates real-time threat detection, credentialed vulnerability management, log analytics, packet capture analysis, Active Directory security, and automated infrastructure hardening into a single, unified console.

Built to satisfy the **CompTIA Security+ SY0-701 Course-End Project** specifications, this platform demonstrates practical, end-to-end implementation of core security domains — from network reconnaissance and vulnerability scanning to identity governance and incident response — all wrapped in a modern, analyst-friendly interface.

* **🔗 Live Deployment**: [unified-cyber-defence.netlify.app](https://unified-cyber-defence.netlify.app/)
* **📂 GitHub Code Repository**: [kharedhruva-tech/Unified-Cyber-Defense-Platform-SIEM-Command-Center](https://github.com/kharedhruva-tech/Unified-Cyber-Defense-Platform-SIEM-Command-Center)

---

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| **🤖 AI Security Copilot** | Plain-English threat analysis powered by GPT-SOC logic, with voice dictation, Markdown-rendered responses, one-click playbook execution, and an auto-refreshing live log/alert ticker. |
| **🌐 3D Interactive Attack Globe** | Real-time WebGL (Three.js) visualization of active cyberattack vectors and perimeter nodes across the network. |
| **🗺️ GIS Breach Heatmap** | Live IP geolocation breach tracking (Leaflet) with automated firewall IP containment workflows. |
| **🔐 Active Directory & GPO Auditor** | Audits AD users, security groups, Kerberos tickets, and Group Policy password enforcement rules. |
| **⚡ SIGMA Correlation Engine** | Automated threat detection running SIGMA rules against streaming telemetry and log data. |
| **📊 Multichannel Notifications & Reporting** | Web Push alerts, Slack/Discord webhook integration, CSV export, and downloadable PDF incident reports. |

---

## 🛠️ Technology & Tools Matrix

Mapped directly to **CompTIA Security+ SY0-701** domains:

| Category | Technology / Tool | Purpose in Project | Live Module |
| :--- | :--- | :--- | :--- |
| **Operating Systems** | **Kali Linux** & **Windows Server 2022** | Baseline security testing environment & enterprise target Domain Controller | System Hardening & Active Directory |
| **Network Scanning** | **Nmap Subnet Engine** | Network/service discovery, live host discovery, open port enumeration | Asset Discovery (`/assets`) |
| **Vulnerability Assessment** | **Tenable Nessus Expert** | Credentialed vulnerability scanning against Windows Server 2022, CVE scoring | Vulnerability Management (`/vulnerabilities`) |
| **Penetration Testing** | **Metasploit Framework** | Testing MS17-010 SMB vulnerabilities and honeypot attack validation | Threat Detection (`/threat-detection`) |
| **Network Analysis** | **Wireshark & PCAP Inspector** | Deep packet capture, ARP spoofing detection, MITM analysis, TLS inspection | Network Intelligence (`/network`) |
| **Log Analysis** | **System & SSH Logs** | Parsing system events, failed login spikes, brute-force detection | Log Analytics (`/logs`) |
| **SIEM Concepts** | **Unified SIEM Engine** | Correlating logs, alerts, and SIGMA rules across all host endpoints | Executive Dashboard & Security Alerts |
| **Scripting & Automation** | **Bash/Shell & Python** | Automated log parsing, detection rules, SOAR-style response | Threat Engine & AI Copilot |
| **Identity & Access** | **Active Directory (AD DS)** | Domain Controller roles, Security Groups, OUs, user accounts | Active Directory (`/active-directory`) |
| **Security Policies** | **Group Policy (GPO)** | Password lockout rules, account policies, infrastructure hardening | System Hardening (`/hardening`) |
| **Network Security** | **HTTPS / SSL / TLS** | Certificate validation, TLS cipher inspection, encrypted payload analysis | Network Analysis (`/network`) |
| **Cloud Security** | **Cloud Resources & GIS Map** | Real-time breach geo-mapping, cloud perimeter security, IP containment | GIS Breach Map (`/gis-map`) |

---

## 🖼️ Platform Interface Showcase

Explore live previews of the Unified SOC Command Center console. Official source code: [https://github.com/kharedhruva-tech/Unified-Cyber-Defense-Platform-SIEM-Command-Center](https://github.com/kharedhruva-tech/Unified-Cyber-Defense-Platform-SIEM-Command-Center)

<div align="center">

### 🛡️ SOC Central Command Center Dashboard
[![SIEM Command Center](assets/dashboard.png)](https://github.com/kharedhruva-tech/Unified-Cyber-Defense-Platform-SIEM-Command-Center)

### 🔐 Secure Authentication & Portal Login
[![Secure Authentication](assets/login.png)](https://github.com/kharedhruva-tech/Unified-Cyber-Defense-Platform-SIEM-Command-Center)

### 📡 Real-Time Packet Capture & Network Analysis
[![Network Analysis](assets/network.png)](https://github.com/kharedhruva-tech/Unified-Cyber-Defense-Platform-SIEM-Command-Center)

### 📄 Executive Security Reports & Compliance Exporter
[![Executive Security Reports](assets/reports.png)](https://github.com/kharedhruva-tech/Unified-Cyber-Defense-Platform-SIEM-Command-Center)

</div>

---

## 🏗️ Architecture & Deployment

The platform follows a decoupled client-server architecture:
* **Frontend**: React 18 + Vite + Tailwind CSS — responsive, real-time SOC dashboard hosted on Netlify.
* **Backend**: FastAPI (Python 3.10+) + SQLite / PostgreSQL (Supabase) — REST API serving telemetry, alerts, and analytics.
* **Deployment**: Live client frontend hosted on [Netlify](https://unified-cyber-defence.netlify.app/); backend containerized via Docker Compose.

---

## ⚡ Quick Start & Local Setup

### Prerequisites
* **Python 3.10+**
* **Node.js 18+** and `npm`

### 1. Backend Setup (FastAPI & Database)
```bash
cd backend
python -m venv venv

# On Windows:
.\venv\Scripts\activate

# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python run.py
```
*Backend API server runs at: `http://localhost:8000/api/v1`*

### 2. Frontend Setup (React, Vite & Tailwind)
```bash
cd frontend
npm install
npm run dev
```
*Frontend application runs at: `http://localhost:5173`*

### 3. Docker Multi-Container Deployment (Optional)
```bash
docker-compose up --build
```

---

## 👤 Default Login Credentials

| Role Tier | Username | Default Password | Access Level |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin` | `admin123` | Full Read & Write Access |
| **🛡️ SOC Manager** | `manager` | `admin123` | Incidents, Containment & Reporting |
| **🔍 Security Analyst** | `analyst` | `admin123` | Telemetry, Logs & Threat Triage |
| **📋 Compliance Auditor** | `auditor` | `admin123` | Read-Only Governance & Compliance |

---

## 📄 Compliance & Course Project References

This project satisfies the following **CompTIA Security+ SY0-701** course-end project modules:

| Tasks | Security+ SY0-701 Lesson | Domain Focus Area |
| :--- | :--- | :--- |
| **Task 1** | Lesson 7 — Establishing a Secure Foundation | Kali Linux Baseline Environment |
| **Tasks 2–4** | Lesson 8 — Application and System Security | Nessus Vulnerability Scans & Metasploit MS17-010 |
| **Tasks 5–7** | Lesson 2 — Detecting & Correlating Security Threats | Wireshark PCAP Capture & Shell Automation |
| **Tasks 8–10** | Lesson 10 — Identity, Access, and Incident Management | AD DS, Security Groups & GPO Hardening Policies |

---

## 📂 Project Structure

```text
├── assets/                  # Architecture diagrams & visual assets
├── backend/                 # FastAPI backend (API routes, database, detection logic)
│   ├── app/                 # FastAPI application modules
│   ├── run.py               # Application entrypoint
│   └── requirements.txt     # Python dependencies
├── frontend/                # React 18 + Vite SOC Command Center
│   ├── src/                 # React components, modules, types & RBAC configs
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── architecture.md          # Comprehensive system architecture documentation
├── design.md                # UI/UX design & color palette documentation
├── prd.md                   # Product requirements document (PRD)
├── rules.md                 # SIGMA correlation rule definitions
├── tasks.md                 # CompTIA Security+ 701 course task tracking
├── netlify.toml             # Netlify deployment & SPA routing headers
└── docker-compose.yml       # Multi-container orchestration
```

---

## 📜 License & Citation

This project was developed for educational and professional demonstration purposes as part of a **CompTIA Security+ SY0-701** course-end project.

<div align="center">

[🔗 Live Demo: unified-cyber-defence.netlify.app](https://unified-cyber-defence.netlify.app/) • [📂 GitHub Repository](https://github.com/kharedhruva-tech/Unified-Cyber-Defense-Platform-SIEM-Command-Center)

</div>
