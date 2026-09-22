<div align="center">

# 🛡️ Unified Cyber Defense Platform — SIEM Command Center

### An Enterprise-Grade Security Operations Console built for the CompTIA Security+ SY0-701 Course-End Project

[![Live Demo](https://img.shields.io/badge/Live%20Demo-unified--cyber--defence.netlify.app-2ea44f?style=for-the-badge&logo=netlify&logoColor=white)](https://unified-cyber-defence.netlify.app/)
[![Python](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](#)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react&logoColor=black)](#)
[![License](https://img.shields.io/badge/License-Educational%20Use-blue?style=flat-square)](#)

**[🚀 View Live Demo](https://unified-cyber-defence.netlify.app/)**

<br/>

![Dashboard Banner](./assets/banner.png)

</div>

---

## 📖 Overview

The **Unified Cyber Defense Platform** is a full-stack SIEM (Security Information and Event Management) command center that consolidates real-time threat detection, credentialed vulnerability management, log analytics, packet capture analysis, Active Directory security, and automated infrastructure hardening into a single, unified console.

Built to satisfy the **CompTIA Security+ SY0-701 Course-End Project** specifications, this platform demonstrates practical, end-to-end implementation of core security domains — from network reconnaissance and vulnerability scanning to identity governance and incident response — all wrapped in a modern, analyst-friendly interface.

**🔗 Live Demo:** [unified-cyber-defence.netlify.app](https://unified-cyber-defence.netlify.app/)

---

## 🚀 Key Features

| Feature | Description |
|---|---|
| 🤖 **AI Security Copilot** | Plain-English threat analysis powered by GPT-SOC logic, with voice dictation, Markdown-rendered responses, one-click playbook execution, and an auto-refreshing live log/alert ticker. |
| 🌐 **3D Interactive Attack Globe** | Real-time WebGL (Three.js) visualization of active cyberattack vectors and perimeter nodes across the network. |
| 🗺️ **GIS Breach Heatmap** | Live IP geolocation breach tracking (Leaflet) with automated firewall IP containment workflows. |
| 🔐 **Active Directory & GPO Auditor** | Audits AD users, security groups, Kerberos tickets, and Group Policy password enforcement rules. |
| ⚡ **SIGMA Correlation Engine** | Automated threat detection running SIGMA rules against streaming telemetry and log data. |
| 📊 **Multichannel Notifications & Reporting** | Web Push alerts, Slack/Discord webhook integration, CSV export, and downloadable PDF incident reports. |

---

## 🖼️ Screenshots

<div align="center">

| Executive Dashboard | AI Security Copilot |
|---|---|
| ![Executive Dashboard](./assets/dashboard.png) | ![AI Copilot](./assets/copilot.png) |

| 3D Attack Globe | GIS Breach Heatmap |
|---|---|
| ![Attack Globe](./assets/globe.png) | ![GIS Heatmap](./assets/gis-map.png) |

| Vulnerability Management | Active Directory Auditor |
|---|---|
| ![Vulnerability Management](./assets/vulnerabilities.png) | ![Active Directory](./assets/active-directory.png) |

</div>

> 📌 Screenshots are pulled from the `assets/` folder in this repository. Replace the placeholder filenames above with your own captures (e.g. `assets/dashboard.png`) — matching names already referenced here — to keep the README in sync automatically. You can also try the fully interactive version on the **[live demo](https://unified-cyber-defence.netlify.app/)**.

---

## 🛠️ Technology & Tools Matrix

Mapped directly to CompTIA Security+ SY0-701 domains:

| Category | Technology / Tool | Purpose in Project | Live Module |
|---|---|---|---|
| **Operating Systems** | Kali Linux & Windows Server 2022 | Baseline security testing environment & enterprise target Domain Controller | System Hardening & Active Directory |
| **Network Scanning** | Nmap Subnet Engine | Network/service discovery, live host discovery, open port enumeration | Asset Discovery (`/assets`) |
| **Vulnerability Assessment** | Tenable Nessus Expert | Credentialed vulnerability scanning against Windows Server 2022, CVE scoring | Vulnerability Management (`/vulnerabilities`) |
| **Penetration Testing** | Metasploit Framework | Testing MS17-010 SMB vulnerabilities and honeypot attack validation | Threat Detection (`/threat-detection`) |
| **Network Analysis** | Wireshark & PCAP Inspector | Deep packet capture, ARP spoofing detection, MITM analysis, TLS inspection | Network Intelligence (`/network`) |
| **Log Analysis** | System & SSH Logs | Parsing system events, failed login spikes, brute-force detection | Log Analytics (`/logs`) |
| **SIEM Concepts** | Unified SIEM Engine | Correlating logs, alerts, and SIGMA rules across all host endpoints | Executive Dashboard & Security Alerts |
| **Scripting & Automation** | Bash/Shell & Python | Automated log parsing, detection rules, SOAR-style response | Threat Engine & AI Copilot |
| **Identity & Access** | Active Directory (AD DS) | Domain Controller roles, Security Groups, OUs, user accounts | Active Directory (`/active-directory`) |
| **Security Policies** | Group Policy (GPO) | Password lockout rules, account policies, infrastructure hardening | System Hardening (`/hardening`) |
| **Network Security** | HTTPS / SSL / TLS | Certificate validation, TLS cipher inspection, encrypted payload analysis | Network Analysis (`/network`) |
| **Cloud Security** | Cloud Resources & GIS Map | Real-time breach geo-mapping, cloud perimeter security, IP containment | GIS Breach Map (`/gis-map`) |

---

## 🏗️ Architecture

The platform follows a decoupled client-server architecture:

- **Frontend:** React + Vite + Tailwind CSS — a responsive, real-time SOC dashboard
- **Backend:** FastAPI (Python) + SQLite — REST API serving telemetry, alerts, and analytics
- **Deployment:** Frontend hosted on [Netlify](https://unified-cyber-defence.netlify.app/); backend containerized via Docker Compose

> See [`architecture.md`](./architecture.md) and [`design.md`](./design.md) in the repository for detailed system diagrams and design rationale.

---

## ⚡ Quick Start & Local Setup

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and `npm`

### 1. Backend Setup (FastAPI & SQLite)

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

Backend API runs at: `http://localhost:8000/api/v1`

### 2. Frontend Setup (React, Vite & Tailwind)

```bash
cd frontend
npm install
npm run dev
```

Frontend app runs at: `http://localhost:5173`

### 3. Docker (optional)

```bash
docker-compose up --build
```

---

## 👤 Default Login Credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| SOC Manager | `manager` | `manager123` |
| Analyst | `analyst` | `analyst123` |

> ⚠️ **Note:** These are demo credentials for evaluation purposes only. Change them immediately in any production or persistent deployment.

---

## 📄 Compliance & Project References

This project was built against the following CompTIA Security+ SY0-701 course modules:

| Tasks | Lesson | Focus Area |
|---|---|---|
| Task 1 | Lesson 7 — Establishing a Secure Foundation | Kali Linux Baseline |
| Tasks 2–4 | Lesson 8 — Application and System Security | Nessus Scans & Metasploit MS17-010 |
| Tasks 5–7 | Lesson 2 — Detecting & Correlating Security Threats | Wireshark PCAP & Shell Automation |
| Tasks 8–10 | Lesson 10 — Identity, Access, and Incident Management | AD DS, Security Groups & GPO Policies |

---

## 📂 Project Structure

```
├── assets/              # Static assets & diagrams
├── backend/              # FastAPI application (API, models, business logic)
├── frontend/             # React + Vite SOC dashboard
├── architecture.md       # System architecture documentation
├── design.md             # UI/UX design documentation
├── prd.md                # Product requirements document
├── rules.md              # Detection & correlation rule definitions
├── tasks.md              # Course-end project task tracking
└── docker-compose.yml    # Multi-container orchestration
```

---

## 🤝 Contributing

Contributions, issue reports, and feature suggestions are welcome. Please open an issue or submit a pull request.

## 📜 License

This project was developed for educational purposes as part of a CompTIA Security+ SY0-701 course-end project.

---

<div align="center">

**[🔗 Live Demo: unified-cyber-defence.netlify.app](https://unified-cyber-defence.netlify.app/)**

</div>
