# Threat Detection Rules & Operational Standards
## Unified Cyber Defense Solution

---

### 1. Active Threat Detection Rules

The Rule Engine (`backend/app/engines/rule_detection_engine.py`) continuously evaluates incoming log events against pre-configured detection rules:

| Rule ID | Rule Name | Detection Pattern / Criteria | Severity | Automated Action Trigger |
| :--- | :--- | :--- | :--- | :--- |
| `RULE-001` | **Brute-Force Authentication Attempt** | `EventCode: 4625` OR `SSH_AUTH_FAIL` (> 5 failures within 60s from same IP) | `High` | Generates High Alert; Flagged for IP Containment |
| `RULE-002` | **Unauthorized Privilege Escalation** | Member added to `Domain Admins` or `Enterprise Admins` (`EventCode: 4728`) | `Critical` | Escalates to Critical Incident; Triggers AD Security Audit |
| `RULE-003` | **SQL Injection Pattern Detected** | URI contains `UNION SELECT`, `' OR '1'='1`, `sys.tables` | `High` | Blocks IP on Web Application Firewall (`WAF`); Triggers Log Alert |
| `RULE-004` | **Port Scanning / Reconnaissance** | Outbound SMB (445), RDP (3389), or SSH (22) sweep (> 10 target IPs in 30s) | `Medium` | Marks host as Suspicious; Computes Risk Score Adjustment |
| `RULE-005` | **Shadow IT Device Joined Subnet** | Unknown MAC/IP detected without Active Directory domain binding | `Low` | Adds device to Asset Inventory as `is_unknown = True` |
| `RULE-006` | **Ransomware File Extension Pattern** | Mass file rename event containing `.locked`, `.crypto`, `.enc` | `Critical` | Triggers Host Network Quarantine Playbook |
| `RULE-007` | **Kerberoasting / Ticket Extraction** | Service Principal Name (SPN) request with weak RC4 encryption | `High` | Generates Identity Audit Alert |
| `RULE-008` | **Geographic Anomaly / Impossible Travel** | Consecutive logons from different countries within 15 minutes | `High` | Suspends User Session; Requests MFA Re-authentication |

---

### 2. Operational Rules & Coding Standards

#### 2.1 Password Hashing & Auth Integrity
* All passwords **must** be hashed using `get_password_hash()` in `app.core.security`.
* Never hardcode unhashed passwords in database migrations or production seeds.
* Username inputs must be case-normalized and processed through `USER_ALIASES` to ensure user typos (e.g., `sox_manager`, `socmanager`) are properly mapped to canonical accounts.

#### 2.2 Error Handling & Logging
* Backend endpoints **must not** return generic unhandled 500 errors.
* Database operations must be wrapped in `try...except` blocks with rollback semantics:
  ```python
  try:
      db.commit()
  except Exception as e:
      db.rollback()
      raise HTTPException(status_code=500, detail=str(e))
  ```
* All security actions (IP containment, role changes, rule toggles) **must** record an entry in `AuditLog`.

#### 2.3 Database Connectivity Guidelines
* Always prefer `DATABASE_URL` (Supabase PostgreSQL).
* Fallback to SQLite (`cyber_defense.db`) must occur transparently without crashing application startup.
* SQLAlchemy sessions **must** be closed in FastAPI dependencies via `yield` / `finally` blocks.

#### 2.4 Frontend UX Rules
* Never leave buttons in a disabled or hanging loading state.
* Always present feedback banners (`AlertTriangle`, `CheckCircle2`) for user operations.
* Preset buttons on `LoginPage.tsx` **must** stay synchronized with backend seed credentials in `seed_data.py`.
