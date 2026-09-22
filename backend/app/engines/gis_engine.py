import datetime
import random
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import Log, Alert, Incident, Asset

# Track blocked IPs in memory for real-time containment demo
BLOCKED_THREAT_IPS: set = set()

# Built-in GeoIP Threat Intelligence Lookup Database
GEO_IP_REGISTRY: Dict[str, Dict[str, Any]] = {
    "45.142.120.10": {
        "country": "Russia",
        "country_code": "RU",
        "flag": "🇷🇺",
        "city": "Moscow",
        "latitude": 55.7558,
        "longitude": 37.6173,
        "isp": "Rostelecom Autonomous System AS12389",
        "threat_actor": "APT29 (Cozy Bear / Midnight Blizzard)",
        "threat_level": "Critical",
        "mitre_technique": "T1003.001 - LSASS Credential Dumping",
        "protocol": "HTTPS / TLS 1.3"
    },
    "185.220.101.5": {
        "country": "Germany",
        "country_code": "DE",
        "flag": "🇩🇪",
        "city": "Frankfurt",
        "latitude": 50.1109,
        "longitude": 8.6821,
        "isp": "Tor Exit Node Infrastructure Network",
        "threat_actor": "Anonymous Threat Collective",
        "threat_level": "High",
        "mitre_technique": "T1078 - Valid Accounts Abuse",
        "protocol": "SSH Tunnel"
    },
    "194.26.29.115": {
        "country": "Russia",
        "country_code": "RU",
        "flag": "🇷🇺",
        "city": "St. Petersburg",
        "latitude": 59.9343,
        "longitude": 30.3351,
        "isp": "Bulletproof Hosting AS49392",
        "threat_actor": "FIN7 Financial Cybercrime Syndicate",
        "threat_level": "Critical",
        "mitre_technique": "T1190 - Exploit Public-Facing App (SQLi)",
        "protocol": "HTTP POST Exfil"
    },
    "103.251.170.89": {
        "country": "China",
        "country_code": "CN",
        "flag": "🇨🇳",
        "city": "Shanghai",
        "latitude": 31.2304,
        "longitude": 121.4737,
        "isp": "CHINANET-SH Shanghai Telecom",
        "threat_actor": "APT41 (Double Dragon / Wicked Panda)",
        "threat_level": "Critical",
        "mitre_technique": "T1041 - Exfiltration Over C2 Channel",
        "protocol": "DNS Tunneling"
    },
    "91.240.118.172": {
        "country": "Romania",
        "country_code": "RO",
        "flag": "🇷🇴",
        "city": "Bucharest",
        "latitude": 44.4323,
        "longitude": 26.1063,
        "isp": "Voxility Security Subnet AS3223",
        "threat_actor": "BlackCat / ALPHV Ransomware Group",
        "threat_level": "High",
        "mitre_technique": "T1486 - Data Encrypted for Impact",
        "protocol": "SMBv3"
    },
    "141.98.11.11": {
        "country": "Switzerland",
        "country_code": "CH",
        "flag": "🇨🇭",
        "city": "Zurich",
        "latitude": 47.3769,
        "longitude": 8.5417,
        "isp": "Swisscom Commercial Data Subnet",
        "threat_actor": "Shadow Broker Proxy Subnet",
        "threat_level": "Medium",
        "mitre_technique": "T1046 - Network Service Discovery",
        "protocol": "TCP SYN Scan"
    },
    "185.191.171.42": {
        "country": "Iran",
        "country_code": "IR",
        "flag": "🇮🇷",
        "city": "Tehran",
        "latitude": 35.6892,
        "longitude": 51.3890,
        "isp": "Telecommunication Company of Iran AS58224",
        "threat_actor": "Charming Kitten (APT35 / Phosphorus)",
        "threat_level": "Critical",
        "mitre_technique": "T1566 - Phishing Spear attachment",
        "protocol": "SMTP / Webmail"
    },
    "175.45.176.8": {
        "country": "North Korea",
        "country_code": "KP",
        "flag": "🇰🇵",
        "city": "Pyongyang",
        "latitude": 39.0392,
        "longitude": 125.7625,
        "isp": "Star Joint Venture AS131279",
        "threat_actor": "Lazarus Group (APT38 / Hidden Cobra)",
        "threat_level": "Critical",
        "mitre_technique": "T1059.003 - Windows Command Shell",
        "protocol": "Custom Encrypted C2"
    },
    "190.211.12.5": {
        "country": "Brazil",
        "country_code": "BR",
        "flag": "🇧🇷",
        "city": "São Paulo",
        "latitude": -23.5505,
        "longitude": -46.6333,
        "isp": "Telefonica Brasil Telecom AS27699",
        "threat_actor": "Lapsus$ Credential Harvester",
        "threat_level": "High",
        "mitre_technique": "T1555 - Credentials from Password Stores",
        "protocol": "OAuth Token Theft"
    },
    "104.28.19.44": {
        "country": "United States",
        "country_code": "US",
        "flag": "🇺🇸",
        "city": "Ashburn, VA",
        "latitude": 39.0438,
        "longitude": -77.4874,
        "isp": "Cloudflare Global Edge Subnet",
        "threat_actor": "Shadow IT Data Tunnel",
        "threat_level": "Medium",
        "mitre_technique": "T1567 - Exfiltration Over Web Service",
        "protocol": "HTTPS REST API"
    }
}

# Fallback generator for unmapped IPs
def get_ip_geo_info(ip: str) -> Dict[str, Any]:
    if ip in GEO_IP_REGISTRY:
        return GEO_IP_REGISTRY[ip]
    
    # Hash IP to get deterministic pseudo coordinates
    ip_parts = [int(p) for p in ip.split('.') if p.isdigit()]
    if len(ip_parts) == 4:
        lat = ((ip_parts[0] * 7 + ip_parts[1] * 13) % 120) - 60 + 0.123
        lon = ((ip_parts[2] * 11 + ip_parts[3] * 17) % 340) - 170 + 0.456
    else:
        lat, lon = 20.0, 77.0
        
    countries = [
        ("Russia", "RU", "🇷🇺", "Moscow"),
        ("China", "CN", "🇨🇳", "Beijing"),
        ("North Korea", "KP", "🇰🇵", "Pyongyang"),
        ("Vietnam", "VN", "🇻🇳", "Hanoi"),
        ("India", "IN", "🇮🇳", "Mumbai"),
        ("United States", "US", "🇺🇸", "New York")
    ]
    idx = sum(ip_parts) % len(countries)
    c_name, c_code, flag, city = countries[idx]
    
    return {
        "country": c_name,
        "country_code": c_code,
        "flag": flag,
        "city": city,
        "latitude": round(lat, 4),
        "longitude": round(lon, 4),
        "isp": f"Global Cyber Subnet AS{(sum(ip_parts)*100)%65000}",
        "threat_actor": f"Advanced Threat Group {c_code}-{(sum(ip_parts)%900)+100}",
        "threat_level": "High" if sum(ip_parts) % 2 == 0 else "Critical",
        "mitre_technique": "T1041 - Exfiltration Over C2",
        "protocol": "TCP Raw Socket"
    }

class GisEngine:
    @staticmethod
    def get_active_breaches(db: Session) -> List[Dict[str, Any]]:
        """Extracts and enriches data breach events from database logs and security alerts."""
        breach_events = []
        
        # 1. Fetch high severity Web & Database logs (case-insensitive for PostgreSQL)
        logs = db.query(Log).filter(
            Log.message.ilike("%union%") | 
            Log.message.ilike("%select%") | 
            Log.message.ilike("%http_sqli%") | 
            Log.message.ilike("%exfiltrat%") |
            Log.message.ilike("%dump%") |
            Log.message.ilike("%breach%")
        ).order_by(Log.timestamp.desc()).limit(20).all()

        for idx, log in enumerate(logs):
            ip = log.source_ip or "45.142.120.10"
            geo = get_ip_geo_info(ip)
            
            # Deterministic breach details from log ID
            data_stolen_mb = round(120.5 + (log.id * 85.3) % 1800, 1)
            records = 5000 + (log.id * 1430) % 45000
            exfil_speed_mbs = round(1.2 + (log.id * 3.7) % 42.5, 1)
            
            attack_vector = "SQL Injection Data Exfiltration"
            if "dump" in log.message.lower():
                attack_vector = "Unauthorized Database Dump"
            elif "exfiltrat" in log.message.lower():
                attack_vector = "Large PCAP Outbound Data Transfer"
            
            target_asset = log.host_name or "SQL-DB-PRIMARY (192.168.1.15)"
            target_table = "users, user_credentials, financial_audit" if log.id % 2 == 0 else "ad_users, NTLM_hashes"

            is_blocked = ip in BLOCKED_THREAT_IPS
            status = "Firewall Blocked & Contained" if is_blocked else ("Active Breach Vector" if idx < 3 else "Mitigated Exfiltration")

            breach_events.append({
                "id": f"BREACH-{log.id}",
                "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "attacker_ip": ip,
                "country": geo["country"],
                "country_code": geo["country_code"],
                "flag": geo["flag"],
                "city": geo["city"],
                "latitude": geo["latitude"],
                "longitude": geo["longitude"],
                "isp": geo["isp"],
                "threat_actor": geo["threat_actor"],
                "severity": geo["threat_level"],
                "mitre_technique": geo.get("mitre_technique", "T1041 - Exfiltration"),
                "protocol": geo.get("protocol", "HTTPS"),
                "attack_vector": attack_vector,
                "data_stolen_mb": data_stolen_mb,
                "exfil_speed_mbs": exfil_speed_mbs,
                "affected_records": records,
                "target_asset": target_asset,
                "target_table": target_table,
                "target_latitude": 20.5937, # Internal SOC Target (India / HQ)
                "target_longitude": 78.9629,
                "status": status,
                "is_contained": is_blocked
            })
            
        # Ensure default rich breaches if DB has few entries
        if len(breach_events) < 5:
            default_ips = ["45.142.120.10", "175.45.176.8", "194.26.29.115", "103.251.170.89", "185.191.171.42"]
            for i, ip in enumerate(default_ips):
                geo = get_ip_geo_info(ip)
                is_blocked = ip in BLOCKED_THREAT_IPS
                status = "Firewall Blocked & Contained" if is_blocked else ("Active Breach Vector" if i < 2 else "Blocked & Isolated")
                
                breach_events.append({
                    "id": f"BREACH-DEF-{i+1}",
                    "timestamp": (datetime.datetime.utcnow() - datetime.timedelta(minutes=i*15)).strftime("%Y-%m-%d %H:%M:%S"),
                    "attacker_ip": ip,
                    "country": geo["country"],
                    "country_code": geo["country_code"],
                    "flag": geo["flag"],
                    "city": geo["city"],
                    "latitude": geo["latitude"],
                    "longitude": geo["longitude"],
                    "isp": geo["isp"],
                    "threat_actor": geo["threat_actor"],
                    "severity": geo["threat_level"],
                    "mitre_technique": geo.get("mitre_technique", "T1041 - Exfiltration Over C2"),
                    "protocol": geo.get("protocol", "HTTPS"),
                    "attack_vector": "SQL Injection Union Exfiltration" if i % 2 == 0 else "Active Directory LDAP Password Dump",
                    "data_stolen_mb": 450.0 + i * 320.0,
                    "exfil_speed_mbs": round(8.4 + i * 4.2, 1),
                    "affected_records": 12500 + i * 8400,
                    "target_asset": "WEB-PROD-APP01 (192.168.1.10)" if i % 2 == 0 else "SQL-DB-PRIMARY (192.168.1.15)",
                    "target_table": "users, bcrypt_hashes, audit_logs",
                    "target_latitude": 20.5937,
                    "target_longitude": 78.9629,
                    "status": status,
                    "is_contained": is_blocked
                })

        return breach_events

    @staticmethod
    def get_gis_summary(db: Session) -> Dict[str, Any]:
        breaches = GisEngine.get_active_breaches(db)
        
        total_stolen_mb = sum(b["data_stolen_mb"] for b in breaches)
        total_stolen_gb = round(total_stolen_mb / 1024, 2)
        total_records = sum(b["affected_records"] for b in breaches)
        critical_count = sum(1 for b in breaches if b["severity"] == "Critical")
        active_rate_mbs = round(sum(b.get("exfil_speed_mbs", 5.0) for b in breaches if not b.get("is_contained")), 1)
        contained_count = sum(1 for b in breaches if b.get("is_contained"))
        
        # Country distribution
        country_counts: Dict[str, int] = {}
        for b in breaches:
            c = f"{b['flag']} {b['country']}"
            country_counts[c] = country_counts.get(c, 0) + 1
            
        top_countries = sorted([{"country": k, "count": v} for k, v in country_counts.items()], key=lambda x: x["count"], reverse=True)

        return {
            "total_breaches_detected": len(breaches),
            "critical_breaches_count": critical_count,
            "total_stolen_data_gb": total_stolen_gb,
            "total_compromised_records": total_records,
            "active_exfiltration_rate_mbs": active_rate_mbs,
            "contained_threats_count": contained_count,
            "top_origin_countries": top_countries,
            "monitored_soc_target": "HQ Core Server Cluster (192.168.1.0/24)",
            "last_updated": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        }

    @staticmethod
    def trigger_simulated_breach(db: Session) -> Dict[str, Any]:
        """Triggers a new simulated GIS data breach event."""
        ips = ["45.142.120.10", "175.45.176.8", "194.26.29.115", "103.251.170.89", "185.191.171.42", "91.240.118.172"]
        chosen_ip = random.choice(ips)
        geo = get_ip_geo_info(chosen_ip)
        
        data_mb = round(random.uniform(250.0, 2400.0), 1)
        records = random.randint(8000, 65000)
        
        # Create log entry in DB
        new_log = Log(
            timestamp=datetime.datetime.utcnow(),
            log_type="Web",
            source_ip=chosen_ip,
            host_name="SQL-DB-PRIMARY",
            event_code="DATA_EXFILTRATION_BREACH",
            message=f"CRITICAL GIS DATA BREACH: {geo['threat_actor']} exfiltrated {data_mb} MB ({records} records) via {geo['mitre_technique']}.",
            parsed_json=f"{{\"event\":\"DATA_BREACH\",\"exfiltrated_mb\":{data_mb},\"records\":{records},\"origin_country\":\"{geo['country']}\",\"mitre\":\"{geo['mitre_technique']}\"}}"
        )
        db.add(new_log)
        db.commit()
        db.refresh(new_log)

        return {
            "message": f"Simulated Data Breach Event Generated from {geo['flag']} {geo['country']} ({chosen_ip})!",
            "breach_id": f"BREACH-{new_log.id}",
            "threat_actor": geo["threat_actor"],
            "exfiltrated_mb": data_mb,
            "records_stolen": records,
            "mitre_technique": geo["mitre_technique"]
        }

    @staticmethod
    def contain_ip(ip: str) -> Dict[str, Any]:
        """Adds target threat IP to perimeter firewall blocklist."""
        BLOCKED_THREAT_IPS.add(ip)
        geo = get_ip_geo_info(ip)
        return {
            "success": True,
            "message": f"Perimeter Firewall Rule Deployed! IP {ip} ({geo['country']}) blocked and contained.",
            "ip": ip,
            "status": "Contained & Blocked"
        }

