import re
import json
from datetime import datetime
from typing import Dict, Any, Optional

class LogParserEngine:
    """Centralized Multi-Source Security Log Parsing Engine."""

    @staticmethod
    def parse_log_line(log_type: str, raw_message: str, default_host: Optional[str] = None, default_ip: Optional[str] = None) -> Dict[str, Any]:
        """Normalizes heterogeneous raw log strings into structured JSON security telemetry."""
        
        parsed = {
            "timestamp": datetime.utcnow().isoformat(),
            "log_type": log_type,
            "event_code": "LOG_INFO",
            "source_ip": default_ip or "127.0.0.1",
            "host_name": default_host or "LOCAL-HOST",
            "category": "System",
            "severity": "Low",
            "parsed_json": {}
        }

        # 1. Windows Event Logs (e.g., Event ID 4625 - Failed Logon)
        if "4625" in raw_message or "Failed logon" in raw_message or "An account failed to log on" in raw_message:
            parsed["event_code"] = "4625"
            parsed["category"] = "Authentication"
            parsed["severity"] = "High"
            
            # Extract IP
            ip_match = re.search(r'Source Network Address:\s*([0-9\.]+)', raw_message)
            if not ip_match:
                ip_match = re.search(r'from ([0-9\.]+)', raw_message)
            if ip_match:
                parsed["source_ip"] = ip_match.group(1)
                
            user_match = re.search(r'Account Name:\s*([^\s]+)', raw_message)
            target_user = user_match.group(1) if user_match else "Administrator"
            
            parsed["parsed_json"] = {
                "event_name": "Windows Failed Logon",
                "target_username": target_user,
                "logon_type": "3 (Network)" if "Network" in raw_message else "10 (RemoteDesktop)",
                "failure_reason": "Unknown user name or bad password"
            }

        # 2. Windows Event ID 4728 / 4720 (Privilege Escalation / Account Creation)
        elif "4728" in raw_message or "member was added to a security-enabled global group" in raw_message:
            parsed["event_code"] = "4728"
            parsed["category"] = "Privilege Change"
            parsed["severity"] = "Critical"
            parsed["parsed_json"] = {
                "event_name": "Member Added to Privileged Group",
                "group_name": "Domain Admins",
                "added_member": "bad_actor_user",
                "performed_by": "SYSTEM"
            }

        # 3. Linux SSH Authentication Logs
        elif "Failed password for" in raw_message:
            parsed["event_code"] = "SSH_AUTH_FAIL"
            parsed["category"] = "Authentication"
            parsed["severity"] = "High"
            
            user_match = re.search(r'Failed password for (invalid user )?([^\s]+) from ([0-9\.]+)', raw_message)
            if user_match:
                target_user = user_match.group(2)
                parsed["source_ip"] = user_match.group(3)
            else:
                target_user = "root"
                
            parsed["parsed_json"] = {
                "event_name": "SSH Password Authentication Failure",
                "target_username": target_user,
                "service": "sshd"
            }

        elif "Accepted password for" in raw_message or "Accepted publickey for" in raw_message:
            parsed["event_code"] = "SSH_AUTH_SUCCESS"
            parsed["category"] = "Authentication"
            parsed["severity"] = "Informational"
            
            ip_match = re.search(r'from ([0-9\.]+)', raw_message)
            if ip_match:
                parsed["source_ip"] = ip_match.group(1)
                
            parsed["parsed_json"] = {
                "event_name": "SSH Successful Logon",
                "auth_method": "publickey" if "publickey" in raw_message else "password"
            }

        # 4. Web & Firewall Security Logs (SQLi / XSS / Port Scan)
        elif "SELECT" in raw_message.upper() or "UNION" in raw_message.upper() or "DROP TABLE" in raw_message.upper():
            parsed["event_code"] = "HTTP_SQLI_ATTACK"
            parsed["category"] = "Web Application Security"
            parsed["severity"] = "Critical"
            parsed["parsed_json"] = {
                "event_name": "SQL Injection Pattern Detected",
                "uri": "/api/v1/users?id=1' UNION SELECT username, password FROM users--"
            }
        
        else:
            parsed["parsed_json"] = {"raw": raw_message}

        return parsed
