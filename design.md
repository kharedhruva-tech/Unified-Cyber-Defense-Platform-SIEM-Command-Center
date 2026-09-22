# UI/UX Design System & Theme Specifications
## Unified Cyber Defense Solution

---

### 1. Design Aesthetics & Philosophy
The **Unified Cyber Defense Solution** uses a state-of-the-art **Modern SOC Cyber Aesthetic**. It combines a clean, light-mode background with vibrant dark/colored glassmorphic containers, dynamic ambient glows, and live telemetry indicators to give security operators immediate visual feedback.

* **Primary Feel**: High-tech SOC Operation Center console.
* **Visual Effects**: Ambient radial gradients, subtle grid line patterns, micro-pulse badges, and smooth hover state transitions.

---

### 2. Color Palette & Palette Tokens

#### 2.1 Core Neutral & Background Tokens
* **Page Background**: `bg-slate-50` (`#F8FAFC`) with radial ambient gradient `bg-[radial-gradient(circle_at_50%_20%,#eff6ff_0%,#f8fafc_70%)]`.
* **Grid Pattern Overlay**: `linear-gradient(#cbd5e1 1px, transparent 1px)` with 40px grid spacing.
* **Card Base**: `bg-white` / `bg-slate-900` with `border-slate-200` / `border-slate-800` and `shadow-xl`.

#### 2.2 Functional & Role Colors

| Role / Status | Tailwind Token | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **System Brand / Primary** | `blue-600` | `#2563EB` | Main CTAs, Active Nav Items, Primary Highlights |
| **Admin / Privileged** | `purple-700` | `#7E22CE` | Full Access badges, Admin role markers |
| **SOC Operations** | `indigo-700` | `#4338CA` | Operations Manager badges, Tactical widgets |
| **Security Analyst** | `blue-700` | `#1D4ED8` | SIEM Stream badges, Analyst presets |
| **IR Specialist / Critical Alert** | `rose-600` / `rose-700` | `#E11D48` | Incidents, Critical Severity, Failed Logon Alerts |
| **Vulnerability Analyst** | `amber-600` / `amber-700` | `#D97706` | CVE badges, Medium/High Vulnerability alerts |
| **Network Analyst / Telemetry** | `teal-600` / `teal-700` | `#0D9488` | PCAP analysis, GIS routes, Bandwidth graphs |
| **Auditor / Compliant Status** | `emerald-600` / `emerald-700` | `#059669` | Passed CIS Checks, Online status, System Healthy |
| **Executive / Secondary Text** | `slate-500` / `slate-700` | `#64748B` | Subtitles, Read-Only badges, Footers |

---

### 3. Layout & Navigation Hierarchy

```
+-----------------------------------------------------------------------------------+
|  [SHIELD] UNIFIED SOC PORTAL  | Status: ONLINE | Active User: soc_manager [Logout]|
+-----------------------------------------------------------------------------------+
|  SIDEBAR NAV       |  MAIN CONTENT VIEW CONTAINER                                |
|  - Dashboard       |  +---------------------------------------------------------+ |
|  - Asset Inventory |  |  Module Header Banner & Quick Action Buttons            | |
|  - Vulnerabilities |  +---------------------------------------------------------+ |
|  - Log Analytics   |  |  Metrics Cards Grid (4 Columns)                         | |
|  - Threat Detection|  +---------------------------------------------------------+ |
|  - Incident Response| |  Primary Data View / Map / Logs Table                   | |
|  - Active Directory|  |                                                         | |
|  - Hardening Audit |  |                                                         | |
|  - GIS Threat Map  |  +---------------------------------------------------------+ |
|  - Audit Trail     |  |  Live Telemetry Ticker / Audit Log Drawer                | |
+--------------------+--------------------------------------------------------------+
```

---

### 4. Interactive Components & Micro-Animations

* **Live Status Indicator**: Animated pulse badge (`animate-ping` / `animate-pulse`) on system online status.
* **Loading Spinner**: Rotating CPU icon (`Cpu` from `lucide-react`) with `animate-spin` during backend REST API calls.
* **Role Preset Buttons**: 8 interactive grid tiles with subtle background hover states (`hover:bg-purple-50`, `hover:bg-indigo-50`, `active:scale-[0.99]`).
* **GIS Threat Map**: Dynamic canvas rendering IP attack lines with pulsing origin and target markers.
* **Data Badges**: Rounded pills with 10px uppercase bold typography (`px-2.5 py-1 text-[10px] font-bold rounded-full`).
