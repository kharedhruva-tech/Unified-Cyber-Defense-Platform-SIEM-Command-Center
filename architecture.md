# System Architecture & Technical Specifications
## Unified Cyber Defense Solution

---

### 1. High-Level System Architecture

This diagram presents the core multi-layer architecture of the Unified Cyber Defense Solution, showing the flow from the React Single Page Application (SPA) frontend to the FastAPI REST API gateway, the decoupled analytical telemetry engines, and the resilient dual-tier database layer.

![System Architecture Diagram](./assets/system_architecture.jpg)

```mermaid
graph TD
    subgraph Client Layer (React 18 SPA)
        UI["React SPA (Vite 5 + TypeScript)"]
        AuthGuard["JWT Auth Guard & Presets"]
        SiemMod["SIEM Live Dashboard"]
        GisMod["GIS Threat Map (Canvas)"]
        AssetMod["Asset Inventory & Scan View"]
        AdMod["Active Directory Audit View"]
        IncMod["Incident Response Board"]
    end

    subgraph API Gateway & Middleware Layer (FastAPI)
        Router["APIRouter (/api/v1)"]
        CORS["CORSMiddleware"]
        LogMiddleware["HTTP Logging & Audit Middleware"]
        SecurityHandler["SHA-256 / JWT Auth Handler"]
    end

    subgraph Analytical & Telemetry Engines Layer
        SimEngine["Activity Simulator Engine"]
        LogParser["Log Parser Engine"]
        RuleEngine["Threat Detection Rule Engine"]
        DiscEngine["Asset Discovery Engine"]
        RiskEngine["Risk Scoring Engine"]
        GisEngine["GIS Geolocation Engine"]
        PcapEngine["PCAP DPI Engine"]
        AdEngine["AD Security Audit Engine"]
        ReportEngine["Report Generator"]
    end

    subgraph Resilient Data Layer
        SQLA["SQLAlchemy 2.0 ORM + Pydantic"]
        Supabase["Primary: Supabase PostgreSQL (Cloud)"]
        SQLite["Fallback: Local SQLite (cyber_defense.db)"]
    end

    UI --> AuthGuard
    AuthGuard --> SiemMod & GisMod & AssetMod & AdMod & IncMod
    SiemMod & GisMod & AssetMod & AdMod & IncMod --> Router
    Router --> CORS --> LogMiddleware --> SecurityHandler

    SecurityHandler --> SimEngine & LogParser & RuleEngine & DiscEngine & RiskEngine & GisEngine & PcapEngine & AdEngine & ReportEngine

    SimEngine & LogParser & RuleEngine & DiscEngine & RiskEngine & GisEngine & PcapEngine & AdEngine & ReportEngine --> SQLA

    SQLA -->|Primary Connection| Supabase
    SQLA -.->|Failover on Connection Timeout| SQLite
```

---

### 2. Authentication & User Alias Resolution Flow

This sequence diagram illustrates how operator login requests are processed, including automatic username alias normalization (`sox_manager` → `soc_manager`), password verification, JWT creation, and audit logging.

![Authentication & User Alias Resolution Diagram](./assets/auth_flow_diagram.jpg)

```mermaid
sequenceDiagram
    autonumber
    actor Operator as SOC Operator
    participant UI as React LoginPage.tsx
    participant API as Auth API (/api/v1/auth/login)
    participant Alias as USER_ALIASES Resolver
    participant DB as Resilient DB Session
    participant Sec as Security Engine
    participant Audit as AuditLog Logger

    Operator->>UI: Enter Username & Password (or click Role Preset)
    UI->>API: POST /api/v1/auth/login { username, password }
    API->>Alias: Case Normalization & Alias Lookup
    Note over Alias: Maps 'sox_manager', 'socmanager', 'manager' -> 'soc_manager'
    Alias-->>API: Canonical Username ('soc_manager')
    
    alt Match DEMO_PRESETS
        API->>Sec: Verify against preset hash
    else Database Lookup
        API->>DB: Query User table by canonical_user
        DB-->>API: Return User Model (hashed_password)
        API->>Sec: verify_password(raw_pass, hashed_password)
    end

    alt Password Valid
        Sec-->>API: Password Verified OK
        API->>Sec: create_access_token(subject, role)
        Sec-->>API: Signed JWT Token
        API->>Audit: Add AuditLog (action="USER_LOGIN")
        Audit-->>DB: Commit Audit Record
        API-->>UI: 200 OK { access_token, role, username }
        UI-->>Operator: Render Authorized SOC Portal Dashboard
    else Invalid Password
        API-->>UI: 401 Unauthorized { detail: "Invalid username or password" }
        UI-->>Operator: Display Red Alert Banner
    end
```

---

### 3. Real-Time Telemetry & Threat Detection Pipeline

This sequence diagram traces incoming log streams from raw ingestion to rule evaluation, alert creation, and automated incident response triggers.

![Real-time SIEM Threat Detection Pipeline Diagram](./assets/threat_detection_flow.jpg)

```mermaid
sequenceDiagram
    autonumber
    participant Telemetry as Telemetry Source / Simulator
    participant Ingest as Log Ingest API (/logs/ingest)
    participant Parser as Log Parser Engine
    participant RuleEng as Threat Detection Rule Engine
    participant DB as PostgreSQL / SQLite DB
    participant Front as React SiemDashboard (SSE / Poll)

    Telemetry->>Ingest: Ingest Raw Log Stream (Windows/SSH/Web/Firewall)
    Ingest->>Parser: Extract JSON fields (event_code, source_ip, host_name)
    Parser->>DB: Persist Log Record into public.logs

    Ingest->>RuleEng: Evaluate log against active Detection Rules
    
    loop For each Active Rule in Rule Table
        RuleEng->>RuleEng: Check regex/pattern match (e.g., EventCode 4625, SQLi pattern)
    end

    alt Threat Rule Pattern Matched
        RuleEng->>DB: Create Alert (severity=High/Critical, source_ip)
        alt Severity is Critical or High
            RuleEng->>DB: Auto-Generate Incident Record
            RuleEng->>DB: Add AuditLog Entry
        end
        RuleEng-->>Front: Real-Time Threat Trigger Notification
        Front->>Front: Increment Threat Counters & Render Live Alert Card
    end
```

---

### 4. Asset Discovery & Risk Scoring Architecture

This diagram illustrates how network scan data or Nmap XML imports are ingested by the Discovery Engine, updated in the inventory, and evaluated by the Risk Scoring Engine.

![Asset Discovery & Dynamic Risk Scoring Diagram](./assets/asset_discovery_diagram.jpg)

```mermaid
flowchart LR
    subgraph Inputs
        Nmap["Nmap XML Upload"]
        Subnet["Subnet IP Range Scan"]
        Sim["Background Network Stream"]
    end

    subgraph Discovery Engine
        Parser["XML / IP Parser"]
        ShadowCheck["Shadow IT Inspector"]
    end

    subgraph Asset Inventory Data
        AssetDB[(Asset Table)]
        ShadowFlag["Flag: is_unknown = True"]
    end

    subgraph Risk Scoring Engine
        Scorer["Risk Score Calculator"]
        CVEEval["CVE Severity Evaluator"]
        AlertEval["Active Alert Evaluator"]
    end

    subgraph UI Output
        Badge["Dynamic Risk Badge (0.0 - 100.0)"]
        Dashboard["Asset Inventory Dashboard"]
    end

    Nmap & Subnet & Sim --> Parser
    Parser --> ShadowCheck
    ShadowCheck -- Known Host --> AssetDB
    ShadowCheck -- Unregistered Host --> ShadowFlag --> AssetDB

    AssetDB --> Scorer
    CVEEval & AlertEval --> Scorer
    Scorer --> AssetDB
    AssetDB --> Dashboard & Badge
```

---

### 5. Dual-Tier Database Resiliency & Failover Flow

This flowchart explains the automatic database connection failover mechanism implemented in `app/core/database.py`.

![Dual-Tier Database Resiliency Diagram](./assets/database_resiliency.jpg)

```mermaid
flowchart TD
    Start["FastAPI App / Engine Startup"] --> GetURL["Read DATABASE_URL from Configuration"]
    GetURL --> CheckType{"Is SQLite in URL?"}
    
    CheckType -- Yes --> InitSQLite["Initialize SQLite Engine (cyber_defense.db)"]
    CheckType -- No --> TryPostgres["Attempt Connection to Primary Supabase PostgreSQL"]

    TryPostgres --> ExecuteTest["Execute 'SELECT 1' Connection Test (5s Timeout)"]
    
    ExecuteTest -- Success --> UsePostgres["Set SessionLocal -> Primary Supabase Cloud Postgres"]
    ExecuteTest -- Connection Timeout / Network Error --> CatchError["Catch Connection Error Exception"]

    CatchError --> LogWarning["Log Warning: Primary Database Connection Failed"]
    LogWarning --> FallbackSQLite["Engage Fallback: sqlite:///./cyber_defense.db"]
    FallbackSQLite --> UseSQLite["Set SessionLocal -> Local SQLite DB"]

    UsePostgres --> AppReady["Application Ready & Serving REST Traffic"]
    UseSQLite --> AppReady
```

---

### 6. GIS Geolocation & Threat Containment Flow

This sequence diagram depicts how external threat IP addresses are mapped geolocationaly and contained via the interactive GIS Threat Map.

![GIS Threat Mapping & IP Containment Diagram](./assets/gis_threat_map_diagram.jpg)

```mermaid
sequenceDiagram
    autonumber
    actor Analyst as SOC Analyst
    participant MapUI as GisBreachMap.tsx Component
    participant GisAPI as GIS API Endpoint (/api/v1/gis)
    participant GisEng as GIS Geolocation Engine
    participant DB as Database (Logs / Audit)

    Analyst->>MapUI: Open Geographic Threat & Breach Map
    MapUI->>GisAPI: GET /api/v1/gis/summary
    GisAPI->>GisEng: Fetch Active Threat IPs & Coordinates
    GisEng->>DB: Query logs with external source_ip
    DB-->>GisEng: Return Log Stream IP Data
    GisEng-->>MapUI: Return Geolocation Array { ip, lat, lng, country, attack_count }
    MapUI->>MapUI: Render Attack Vector Lines & Pulsing Nodes on Map

    Analyst->>MapUI: Click "CONTAIN IP" on Malicious Node (e.g. 185.220.101.5)
    MapUI->>GisAPI: POST /api/v1/gis/contain-ip { ip_address }
    GisAPI->>DB: Update IP Status -> "CONTAINED"
    GisAPI->>DB: Create AuditLog Entry (action="CONTAIN_IP")
    GisAPI-->>MapUI: 200 OK { message: "IP 185.220.101.5 contained" }
    MapUI->>MapUI: Update Map Node Styling to Red Contained Shield Indicator
```

---

### 7. Entity Relationship Diagram (ERD)

This diagram visualizes the relational schema stored in Supabase PostgreSQL / SQLite.

![SIEM Database Schema ERD Diagram](./assets/database_erd_diagram.jpg)

```mermaid
erDiagram
    USERS {
        int id PK
        string username UK
        string email UK
        string hashed_password
        string role
        datetime created_at
    }

    ASSETS {
        int id PK
        string ip_address UK
        string hostname
        string mac_address
        string os_name
        string category
        string status
        float risk_score
        boolean is_unknown
        datetime created_at
    }

    SERVICES {
        int id PK
        int asset_id FK
        int port
        string service_name
        string protocol
        string status
    }

    VULNERABILITIES {
        int id PK
        int asset_id FK
        string cve_id
        string title
        string severity
        float cvss_score
        string status
    }

    ALERTS {
        int id PK
        int asset_id FK
        string rule_name
        string severity
        string source_ip
        datetime created_at
    }

    INCIDENTS {
        int id PK
        int asset_id FK
        string title
        string severity
        string status
        datetime created_at
    }

    LOGS {
        int id PK
        datetime timestamp
        string log_type
        string source_ip
        string host_name
        string event_code
        text message
        text parsed_json
    }

    AUDIT_LOGS {
        int id PK
        datetime timestamp
        string username
        string action
        string target
        text details
        string ip_address
    }

    ASSETS ||--o{ SERVICES : "hosts"
    ASSETS ||--o{ VULNERABILITIES : "contains"
    ASSETS ||--o{ ALERTS : "triggers"
    ASSETS ||--o{ INCIDENTS : "escalates"
```

---

### 8. Summary of Engine Responsibilities

| Engine Module | Primary File | Responsibilities |
| :--- | :--- | :--- |
| **Activity Simulator** | `simulator_engine.py` | Generates synthetic enterprise log telemetry (SSH, Windows 4625/4728, Web SQLi attacks) |
| **Log Parser** | `log_parser_engine.py` | Extracts structured JSON attributes (`target_username`, `uri`, `failure_reason`) from syslog |
| **Rule Detection** | `rule_detection_engine.py` | Matches incoming events against active rules and auto-generates alerts & incidents |
| **Asset Discovery** | `discovery_engine.py` | Scans subnet ranges, identifies Shadow IT devices, parses Nmap XML files |
| **Risk Scoring** | `risk_scoring_engine.py` | Dynamically updates asset risk scores based on open vulnerabilities and alert frequency |
| **GIS Geolocation** | `gis_engine.py` | Computes latitude/longitude for threat IPs, draws attack paths, manages IP containment |
| **PCAP Inspection** | `pcap_engine.py` | Performs Deep Packet Inspection simulation, protocol breakdown, and bandwidth tracking |
| **AD Security Audit** | `ad_security_engine.py` | Audits Domain Admins, accounts with expired passwords, and Kerberos ticket health |
| **Log Dependency** | `log_dependency_engine.py` | Builds host communication graphs from network log interaction records |
| **Infrastructure Hardening**| `hardening_engine.py` | Verifies system settings against CIS Benchmark standards for Windows/Linux |
| **Report Generator** | `report_generator.py` | Compiles executive summaries into downloadable PDF and CSV reports |
