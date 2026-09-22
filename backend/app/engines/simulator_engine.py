import asyncio
import random
import threading
import time
import datetime
from app.core.database import SessionLocal
from app.models.models import Log, AuditLog, ADUser, User
from app.core.security import get_password_hash
from app.engines.log_parser_engine import LogParserEngine
from app.engines.rule_detection_engine import RuleDetectionEngine

class ActivitySimulatorEngine:
    """Automated Background Telemetry & Random User Activity Simulator Engine."""

    _instance = None
    _is_running = False
    _thread = None

    SAMPLE_USERS = ["dhruva_soc", "administrator", "alice_dev", "bob_finance", "carol_hr", "root", "svc_backup"]
    SAMPLE_IPS = ["192.168.1.50", "192.168.1.55", "192.168.1.25", "45.142.120.10", "185.220.101.5", "103.25.10.4"]
    SAMPLE_HOSTS = ["DC-PRIMARY-01", "WEB-PROD-APP01", "DB-POSTGRES-01", "WORKSTATION-SEC-01", "SHADOW-NAS-UNAUTH"]

    @classmethod
    def start_simulator(cls):
        """Starts the automated background user simulation thread."""
        if cls._is_running:
            return
        
        cls._is_running = True
        cls._thread = threading.Thread(target=cls._run_simulation_loop, daemon=True)
        cls._thread.start()
        print("[SIMULATOR] Background Automated User Activity & User Provisioning Simulator Started!")

    @classmethod
    def stop_simulator(cls):
        """Stops the simulator loop."""
        cls._is_running = False

    @classmethod
    def is_running(cls) -> bool:
        return cls._is_running

    @classmethod
    def _run_simulation_loop(cls):
        """Continuously generates automated random user logons, user creation, and threat events."""
        while cls._is_running:
            db = SessionLocal()
            try:
                cls.generate_random_activity(db)
            except Exception as e:
                print(f"[SIMULATOR] Error in user simulation loop: {e}")
                try:
                    db.rollback()
                except Exception:
                    pass
            finally:
                db.close()
            
            # Wait 5 seconds between simulation cycles
            time.sleep(5)

    @classmethod
    def generate_random_activity(cls, db):
        """Generates random user activity or automated burst threat telemetry."""
        user = random.choice(cls.SAMPLE_USERS)
        ip = random.choice(cls.SAMPLE_IPS)
        host = random.choice(cls.SAMPLE_HOSTS)
        
        event_types = [
            "user_creation", "windows_success", "windows_failed", "ssh_fail",
            "ssh_success", "web_access", "web_attack", "brute_burst",
            "privilege_escalation", "smb_sweep"
        ]
        event_type = random.choice(event_types)

        logs_to_add = []

        if event_type == "user_creation":
            # Automatically create a new random user account
            rnd_num = random.randint(100, 999)
            new_username = f"user_auto_{rnd_num}"
            new_display = f"Automated User {rnd_num}"
            
            # Check if user exists in ADUser or User
            existing_ad = db.query(ADUser).filter(ADUser.username == new_username).first()
            existing_sys = db.query(User).filter(User.username == new_username).first()
            
            if not existing_ad and not existing_sys:
                ad_u = ADUser(
                    username=new_username,
                    display_name=new_display,
                    user_principal_name=f"{new_username}@corp.local",
                    password_last_set=datetime.datetime.utcnow(),
                    is_admin=random.choice([True, False, False, False]),
                    is_disabled=False,
                    password_never_expires=random.choice([True, False]),
                    bad_pwd_count=random.randint(0, 4)
                )
                db.add(ad_u)

                sys_u = User(
                    username=new_username,
                    email=f"{new_username}@cyberdefense.lab",
                    hashed_password=get_password_hash("AutoUserPass123!"),
                    role="analyst"
                )
                db.add(sys_u)

                if new_username not in cls.SAMPLE_USERS:
                    cls.SAMPLE_USERS.append(new_username)

                msg = f"A user account was created in Active Directory. Account Name: {new_username}. Created By: SYSTEM"
                log_type = "Windows Event"
                
                db.add(AuditLog(
                    username="SYSTEM_AUTOMATION", 
                    action="AUTO_USER_CREATED", 
                    target=new_username, 
                    details=f"Automatically provisioned new user {new_username} ({new_display}).",
                    ip_address="127.0.0.1"
                ))
                try:
                    db.commit()
                except Exception as db_err:
                    db.rollback()
                    print(f"[SIMULATOR] Error committing user creation: {db_err}")
            else:
                msg = f"An account was successfully logged on. Account Name: {user}. Source Network Address: {ip}"
                log_type = "Windows Event"
            
            logs_to_add.append((log_type, msg, host, ip))

        elif event_type == "brute_burst":
            # Generate a burst of 5-6 failed logins from same IP to trigger brute force rule
            attacker_ip = random.choice(["45.142.120.10", "185.220.101.5", "103.25.10.4"])
            target_host = "DC-PRIMARY-01"
            for _ in range(random.randint(5, 7)):
                msg = f"An account failed to log on. Account Name: Administrator. Source Network Address: {attacker_ip}"
                logs_to_add.append(("Windows Event", msg, target_host, attacker_ip))

        elif event_type == "privilege_escalation":
            msg = f"A member was added to a security-enabled global group Domain Admins. Added Member: {user}. Modified By: SYSTEM"
            logs_to_add.append(("Windows Event", msg, "DC-PRIMARY-01", "192.168.1.10"))

        elif event_type == "smb_sweep":
            msg = f"Outbound SMB_SWEEP port scan detected targeting port 445 on DC-PRIMARY-01 from source IP {ip}"
            logs_to_add.append(("Firewall", msg, host, ip))

        elif event_type == "windows_success":
            msg = f"An account was successfully logged on. Account Name: {user}. Source Network Address: {ip}"
            logs_to_add.append(("Windows Event", msg, host, ip))
        elif event_type == "windows_failed":
            msg = f"An account failed to log on. Account Name: {user}. Source Network Address: {ip}"
            logs_to_add.append(("Windows Event", msg, host, ip))
        elif event_type == "ssh_fail":
            msg = f"Failed password for invalid user {user} from {ip} port {random.randint(10000, 60000)} ssh2"
            logs_to_add.append(("SSH", msg, host, ip))
        elif event_type == "ssh_success":
            msg = f"Accepted publickey for {user} from {ip} port {random.randint(10000, 60000)} ssh2"
            logs_to_add.append(("SSH", msg, host, ip))
        elif event_type == "web_access":
            msg = f"GET /api/v1/assets HTTP/1.1 200 OK User-Agent: Mozilla/5.0 Client IP: {ip}"
            logs_to_add.append(("Web", msg, host, ip))
        else: # web_attack
            msg = f"GET /api/v1/users?id=1' UNION SELECT username, password FROM users-- HTTP/1.1 403 Forbidden Client IP: {ip}"
            logs_to_add.append(("Web", msg, host, ip))

        # Ingest created logs
        import sys
        for l_type, l_msg, l_host, l_ip in logs_to_add:
            try:
                parsed = LogParserEngine.parse_log_line(l_type, l_msg, l_host, l_ip)
                log_entry = Log(
                    log_type=l_type,
                    message=l_msg,
                    source_ip=parsed["source_ip"],
                    host_name=parsed["host_name"],
                    event_code=parsed["event_code"],
                    parsed_json=str(parsed["parsed_json"])
                )
                db.add(log_entry)

                ts = datetime.datetime.now().strftime("%H:%M:%S")
                log_line = f"[{ts}] [LIVE] [LOG STREAM] [{l_type}] Code: {parsed['event_code']} | Host: {l_host} | IP: {l_ip} | Msg: {l_msg[:65]}"
                print(log_line, flush=True)
                sys.stderr.write(log_line + "\n")
                sys.stderr.flush()
            except Exception as log_err:
                print(f"[SIMULATOR] Error staging log entry: {log_err}")

        try:
            db.commit()
        except Exception as commit_err:
            db.rollback()
            print(f"[SIMULATOR] Error committing logs: {commit_err}")
            return
        
        # Evaluate threat detection rules on newly ingested log(s)
        RuleDetectionEngine.evaluate_rules_on_logs(db)

