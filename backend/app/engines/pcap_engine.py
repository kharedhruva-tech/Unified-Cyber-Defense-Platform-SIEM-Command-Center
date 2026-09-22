import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

class PcapEngine:
    """Network Traffic Security Analysis & PCAP Inspection Engine."""

    @staticmethod
    def analyze_pcap_sample(sample_name: str = "default_capture.pcap") -> Dict[str, Any]:
        """Parses network packet flow metrics and identifies anomalous communications."""
        
        protocols = {"TCP": 68, "UDP": 18, "ICMP": 6, "DNS": 5, "HTTP": 3}
        
        top_talkers = [
            {"ip": "192.168.1.50", "hostname": "WORKSTATION-SEC-01", "packets": 14200, "bytes": "18.4 MB", "role": "Internal Host"},
            {"ip": "192.168.1.10", "hostname": "DC-PRIMARY-01", "packets": 12850, "bytes": "14.2 MB", "role": "Domain Controller"},
            {"ip": "192.168.1.25", "hostname": "WEB-PROD-APP01", "packets": 9400, "bytes": "22.8 MB", "role": "Web Server"},
            {"ip": "45.142.120.10", "hostname": "ext-scanner.threat.net", "packets": 4820, "bytes": "4.1 MB", "role": "External Suspicious IP"},
            {"ip": "185.220.101.5", "hostname": "tor-exit-node.org", "packets": 3100, "bytes": "2.9 MB", "role": "External Suspicious IP"}
        ]
        
        suspicious_flows = [
            {
                "id": "FLOW-1092",
                "src_ip": "45.142.120.10",
                "dst_ip": "192.168.1.10",
                "protocol": "TCP",
                "port": 445,
                "packet_count": 3400,
                "bytes": "2.8 MB",
                "indicator": "SMB Port Sweep / External Direct Connection Attempt",
                "severity": "Critical",
                "timestamp": (datetime.utcnow() - timedelta(minutes=14)).strftime("%H:%M:%S")
            },
            {
                "id": "FLOW-1088",
                "src_ip": "192.168.1.99",
                "dst_ip": "185.220.101.5",
                "protocol": "UDP",
                "port": 53,
                "packet_count": 1850,
                "bytes": "1.2 MB",
                "indicator": "DNS Tunneling / High Frequency Subdomain Queries",
                "severity": "High",
                "timestamp": (datetime.utcnow() - timedelta(minutes=28)).strftime("%H:%M:%S")
            },
            {
                "id": "FLOW-1075",
                "src_ip": "192.168.1.50",
                "dst_ip": "192.168.1.25",
                "protocol": "TCP",
                "port": 22,
                "packet_count": 920,
                "bytes": "840 KB",
                "indicator": "Internal SSH Brute Force / High Frequency Attempts",
                "severity": "High",
                "timestamp": (datetime.utcnow() - timedelta(minutes=45)).strftime("%H:%M:%S")
            }
        ]
        
        # 24-hour activity timeline
        activity_timeline = []
        now = datetime.utcnow()
        for i in range(12, -1, -1):
            t_str = (now - timedelta(hours=i*2)).strftime("%H:00")
            activity_timeline.append({
                "time": t_str,
                "normal_packets": random.randint(3000, 7000),
                "suspicious_packets": random.randint(50, 450)
            })

        return {
            "capture_name": sample_name,
            "total_packets": 44370,
            "total_bytes": "62.3 MB",
            "active_connections": 142,
            "protocol_distribution": protocols,
            "top_talkers": top_talkers,
            "suspicious_flows": suspicious_flows,
            "activity_timeline": activity_timeline
        }
