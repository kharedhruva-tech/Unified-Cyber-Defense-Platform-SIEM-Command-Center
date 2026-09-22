# Unified Cyber Defense Solution — CompTIA Security+ SY0-701 Lab

An enterprise-grade **Unified Cyber Defense Platform & SIEM Command Center** built to satisfy the **CompTIA Security+ SY0-701 Course-End Project** specifications. This solution integrates real-time threat detection, credentialed vulnerability management, log analytics, packet capture analysis, Active Directory security, and automated infrastructure hardening into a single unified console.

---

## 🛠️ CompTIA Security+ 701 Technology & Tools Matrix

| Category | Technology / Tool | Purpose in Project | Live UI Integration |
| :--- | :--- | :--- | :--- |
| **Operating Systems** | **Kali Linux** & **Windows Server 2022** | Baseline security testing environment & enterprise target Domain Controller. | System Hardening & Active Directory Modules |
| **Network Scanning** | **Nmap Subnet Engine** | Network & service discovery, live host discovery, and open port enumeration. | Asset Discovery (`/assets`) |
| **Vulnerability Assessment** | **Tenable Nessus Expert** | Credentialed vulnerability scanning against Windows Server 2022 and CVE scoring. | Vulnerability Management (`/vulnerabilities`) |
| **Penetration Testing** | **Metasploit Framework** | Testing MS17-010 SMB vulnerabilities and honeypot attack validation. | Threat Detection (`/threat-detection`) |
| **Network Analysis** | **Wireshark & PCAP Inspector** | Deep packet capture, ARP spoofing detection, MITM analysis, and TLS inspection. | Network Intelligence (`/network`) |
| **Log Analysis** | **System & SSH Logs** | Parsing system events, failed login spikes, and brute-force detection. | Log Analytics (`/logs`) |
| **SIEM Concepts** | **Unified SIEM Engine** | Correlating logs, alerts, and SIGMA rules across all host endpoints. | Executive Dashboard & Security Alerts |
| **Scripting & Automation** | **Bash/Shell & Python Scripts** | Automating log parsing, detection rules, and automated SOAR response. | Threat Engine & AI Copilot |
| **Identity & Access** | **Active Directory (AD DS)** | Managing Domain Controller roles, Security Groups, OUs, and user accounts. | Active Directory Module (`/active-directory`) |
| **Security Policies** | **Group Policy (GPO)** | Enforcing password lockout rules, account policies, and infrastructure hardening. | System Hardening Module (`/hardening`) |
| **Network Security** | **HTTPS / SSL/TLS Certificates** | Certificate detail validation, TLS cipher inspection, and encrypted payloads. | Network Analysis (`/network`) |
| **Cloud Security** | **Cloud Resources & GIS Map** | Real-time breach geo-mapping, cloud perimeter security, and IP containment. | GIS Breach Map (`/gis-map`) |

---

## 🚀 Key Features

* **🤖 AI Security Copilot**: Plain-English threat analysis powered by GPT-SOC logic with voice dictation, Markdown code blocks, one-click playbook execution, and an auto-refreshing live log/alert ticker.
* **🌐 3D Interactive Attack Globe (Three.js)**: Real-time WebGL visualization of active cyberattack vectors and perimeter nodes.
* **🗺️ GIS Breach Heatmap (Leaflet)**: Live IP geolocation breach tracking with automated firewall IP containment.
* **🔐 Active Directory & GPO Auditor**: Audits AD users, security groups, kerberos tickets, and Group Policy password rules.
* **⚡ SIGMA Correlation Rules**: Automated threat detection engine running SIGMA rules against streaming telemetry logs.
* **📊 Multichannel Notifications & PDF Reports**: Web Push, Slack/Discord webhooks, CSV export, and PDF report downloads.

---

## 🛠️ Quick Start & Local Setup

### Prerequisites
* **Python 3.10+**
* **Node.js 18+** & `npm`

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
*Backend API will run at `http://localhost:8000/api/v1`*

### 2. Frontend Setup (React, Vite & Tailwind)
```bash
cd frontend
npm install
npm run dev
```
*Frontend app will run at `http://localhost:5173`*

---

## 👤 Default Login Credentials

* **Admin**: `admin` / `admin123`
* **SOC Manager**: `manager` / `manager123`
* **Analyst**: `analyst` / `analyst123`

---

## 📄 Compliance & Project References

* **Task 1**: Lesson 7 — Establishing a Secure Foundation (Kali Linux Baseline)
* **Tasks 2-4**: Lesson 8 — Application and System Security (Nessus Scans & Metasploit MS17-010)
* **Tasks 5-7**: Lesson 2 — Detecting & Correlating Security Threats (Wireshark PCAP & Shell Automation)
* **Tasks 8-10**: Lesson 10 — Identity, Access, and Incident Management (AD DS, Groups & GPO Policies)
