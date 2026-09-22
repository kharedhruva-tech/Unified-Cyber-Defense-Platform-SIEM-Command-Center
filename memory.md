# Memory & Knowledge Base
## Unified Cyber Defense Solution

---

### 1. Project Overview & Identity
* **Project Name**: Unified Cyber Defense Solution (SIEM, Asset Discovery, Vulnerability Management & Hardening Platform)
* **Backend Stack**: FastAPI (Python 3.11), SQLAlchemy 2.0, Pydantic v2, Uvicorn, WatchFiles
* **Frontend Stack**: React 18, TypeScript, Vite 5, Tailwind CSS, Lucide Icons
* **Primary Database**: Supabase Cloud PostgreSQL (`aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres`)
* **Fallback Database**: Local SQLite (`sqlite:///./cyber_defense.db`)
* **Default Backend Host/Port**: `http://127.0.0.1:8000`
* **Default Frontend Host/Port**: `http://localhost:5173` / `http://localhost:5174`

---

### 2. Verified Demo Account Credentials & Roles

| Username / Alias | Default Password | Role Key | Display Name | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| `admin` | `Admin123!` | `admin` | Administrator | Full Administrative Access |
| `soc_manager` / `sox_manager` / `manager` | `Manager123!` | `soc_manager` | SOC Operations Manager | Escalation, Containment & Operations |
| `analyst_dhruva` | `Analyst123!` | `analyst` | Security Analyst | SIEM Dashboard, Log Analytics, Rules |
| `responder_alex` | `Responder123!` | `incident_responder` | IR Specialist | Incident Management & Playbook Execution |
| `vuln_sarah` | `Vuln123!` | `vuln_analyst` | Vulnerability Analyst | CVE Scans & Status Remediation |
| `net_marcus` | `Net123!` | `network_analyst` | Network Analyst | PCAP Analysis & GIS Threat Map |
| `auditor` | `Auditor123!` | `auditor` | Compliance Auditor | CIS Hardening Audit & Compliance Reports |
| `executive_viewer` | `Viewer123!` | `viewer` | Executive Viewer | Read-Only Dashboards & Summaries |

---

### 3. Key Architecture Notes & Gotchas

#### 3.1 Username Alias Normalization
`app/api/auth.py` includes a `USER_ALIASES` map that normalizes common operator typos:
```python
USER_ALIASES = {
    "soc_manger": "soc_manager",
    "socmanger": "soc_manager",
    "socmanager": "soc_manager",
    "sox_manager": "soc_manager",
    "soxmanager": "soc_manager",
    "sox_manger": "soc_manager",
    "manager": "soc_manager",
    "soc_man": "soc_manager",
    "admin_soc": "admin",
    "administrator": "admin"
}
```

#### 3.2 Password Hashing & Salt
Passwords are SHA-256 hashed with salt `"cyber_defense_salt_2026"`:
`hashlib.sha256((password + "cyber_defense_salt_2026").encode('utf-8')).hexdigest()`

#### 3.3 Server Restart Protocol
If port 8000 becomes unresponsive or exhibits `500 Internal Server Error` due to stale child process handles on Windows:
```powershell
Get-Process | Where-Object ProcessName -like '*python*' | Stop-Process -Force
cd backend
python run.py
```

---

### 4. Important File Map

* `backend/app/main.py`: FastAPI entry point & middleware initialization
* `backend/app/core/database.py`: Dual-tier database connection manager (Supabase + SQLite fallback)
* `backend/app/core/seed_data.py`: Database seeder for demo assets, users, logs, and CVEs
* `backend/app/api/auth.py`: JWT authentication endpoints & user management
* `backend/app/models/models.py`: SQLAlchemy database models (User, Asset, Vulnerability, Alert, Incident, Log, AuditLog, etc.)
* `backend/supabase_schema_and_data.sql`: Production SQL schema & import data
* `frontend/src/components/auth/LoginPage.tsx`: React login component with preset role buttons
* `frontend/src/services/api.ts`: Axios API service layer connecting frontend to backend endpoints
