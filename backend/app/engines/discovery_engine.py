import xml.etree.ElementTree as ET
import random
from typing import List, Dict, Any

class DiscoveryEngine:
    """Nmap Scanner Integration & Network Discovery Engine."""
    
    @staticmethod
    def parse_nmap_xml(xml_content: str) -> List[Dict[str, Any]]:
        """Parses Nmap XML output and extracts hosts, ports, services, and OS tags."""
        discovered_assets = []
        try:
            root = ET.fromstring(xml_content)
            for host in root.findall('host'):
                # Check host state
                status = host.find('status')
                if status is not None and status.get('state') != 'up':
                    continue
                
                # IP & MAC Address
                ip_addr = None
                mac_addr = None
                for addr in host.findall('address'):
                    if addr.get('addrtype') == 'ipv4':
                        ip_addr = addr.get('addr')
                    elif addr.get('addrtype') == 'mac':
                        mac_addr = addr.get('addr')
                
                if not ip_addr:
                    continue
                
                # Hostname
                hostname = f"Host-{ip_addr.split('.')[-1]}"
                hostnames = host.find('hostnames')
                if hostnames is not None:
                    hnode = hostnames.find('hostname')
                    if hnode is not None and hnode.get('name'):
                        hostname = hnode.get('name')
                
                # Ports & Services
                services = []
                ports_node = host.find('ports')
                if ports_node is not None:
                    for port in ports_node.findall('port'):
                        port_id = int(port.get('portid'))
                        protocol = port.get('protocol', 'tcp').upper()
                        
                        state_node = port.find('state')
                        if state_node is not None and state_node.get('state') == 'open':
                            service_node = port.find('service')
                            svc_name = service_node.get('name', 'unknown') if service_node is not None else 'unknown'
                            svc_ver = service_node.get('product', '') if service_node is not None else ''
                            if service_node is not None and service_node.get('version'):
                                svc_ver += " " + service_node.get('version')
                            
                            services.append({
                                "port": port_id,
                                "protocol": protocol,
                                "service_name": svc_name.upper(),
                                "version": svc_ver.strip() or "Standard Service"
                            })
                
                # OS Match
                os_name = "Linux / Ubuntu 22.04"
                os_node = host.find('os')
                if os_node is not None:
                    osmatch = os_node.find('osmatch')
                    if osmatch is not None and osmatch.get('name'):
                        os_name = osmatch.get('name')
                
                discovered_assets.append({
                    "ip_address": ip_addr,
                    "hostname": hostname,
                    "mac_address": mac_addr or f"52:54:00:{random.randint(10,99)}:{random.randint(10,99)}:{random.randint(10,99)}",
                    "os_name": os_name,
                    "category": "Domain Controller" if "dc" in hostname.lower() else "Server" if len(services) > 3 else "Workstation",
                    "services": services
                })
        except Exception as e:
            print(f"Error parsing Nmap XML: {e}")
        
        return discovered_assets

    @staticmethod
    def simulate_subnet_scan(target_subnet: str) -> List[Dict[str, Any]]:
        """Simulates an active authorized Nmap scan against a specified subnet."""
        prefix = ".".join(target_subnet.split(".")[:3]) if "." in target_subnet else "192.168.1"
        scanned_results = []
        
        sample_profiles = [
            {"ip": f"{prefix}.10", "name": "DC-PRIMARY-01", "os": "Windows Server 2022", "cat": "Domain Controller", 
             "services": [{"port": 53, "protocol": "UDP", "service_name": "DNS", "version": "BIND 9"},
                          {"port": 88, "protocol": "TCP", "service_name": "KERBEROS", "version": "MS Kerberos"},
                          {"port": 389, "protocol": "TCP", "service_name": "LDAP", "version": "Active Directory"},
                          {"port": 445, "protocol": "TCP", "service_name": "SMB", "version": "SMBv3"}]},
            
            {"ip": f"{prefix}.25", "name": "WEB-PROD-APP01", "os": "Ubuntu Linux 22.04 LTS", "cat": "Server",
             "services": [{"port": 22, "protocol": "TCP", "service_name": "SSH", "version": "OpenSSH 8.9p1"},
                          {"port": 80, "protocol": "TCP", "service_name": "HTTP", "version": "nginx 1.18.0"},
                          {"port": 443, "protocol": "TCP", "service_name": "HTTPS", "version": "nginx 1.18.0"}]},
            
            {"ip": f"{prefix}.99", "name": "SHADOW-NAS-UNAUTH", "os": "Debian NAS OS", "cat": "Workstation", "is_unknown": True,
             "services": [{"port": 21, "protocol": "TCP", "service_name": "FTP", "version": "vsftpd 2.3.4 (Vulnerable)"},
                          {"port": 23, "protocol": "TCP", "service_name": "TELNET", "version": "Insecure Telnetd"},
                          {"port": 8080, "protocol": "TCP", "service_name": "HTTP-ALT", "version": "Apache Tomcat 9.0"}]}
        ]
        
        for item in sample_profiles:
            scanned_results.append({
                "ip_address": item["ip"],
                "hostname": item["name"],
                "mac_address": f"00:1A:2B:{random.randint(10,99)}:{random.randint(10,99)}:{random.randint(10,99)}",
                "os_name": item["os"],
                "category": item["cat"],
                "is_unknown": item.get("is_unknown", False),
                "services": item["services"]
            })
            
        return scanned_results
