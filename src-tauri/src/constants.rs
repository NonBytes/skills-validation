pub const VALID_PHASES: &[&str] = &[
    "reconnaissance",
    "scanning",
    "enumeration",
    "application_intelligence",
    "exploitation",
    "credential_access",
    "lateral_movement",
    "privilege_escalation",
    "post_exploitation",
];

pub const EXCLUDED_CATEGORIES: &[&str] = &["scan_modes", "coordination"];

pub const AGENT_TOOLS: &[&str] = &[
    "nmap", "masscan", "rustscan", "nuclei", "nikto", "gobuster", "feroxbuster",
    "dirb", "ffuf", "wfuzz", "sqlmap", "commix", "nosqlmap", "xsstrike",
    "dalfox", "hydra", "medusa", "john", "hashcat", "crackmapexec", "netexec",
    "impacket-secretsdump", "impacket-psexec", "impacket-wmiexec",
    "impacket-smbexec", "impacket-atexec", "impacket-dcomexec",
    "impacket-getTGT", "impacket-getST", "impacket-getPac",
    "impacket-ticketer", "impacket-ntlmrelayx", "responder",
    "bloodhound-python", "ldapsearch", "enum4linux-ng", "smbclient",
    "rpcclient", "evil-winrm", "chisel", "ligolo-ng", "socat",
    "ssh", "scp", "curl", "wget", "netcat", "ncat",
    "msfconsole", "msfvenom", "searchsploit",
    "wpscan", "droopescan", "joomscan",
    "testssl", "sslscan", "sslyze",
    "amass", "subfinder", "assetfinder", "httpx", "whatweb",
    "wafw00f", "arjun", "paramspider",
    "burpsuite", "zaproxy",
    "linpeas", "winpeas", "linux-exploit-suggester", "windows-exploit-suggester",
    "pspy", "sudo_killer",
    "mimikatz", "rubeus", "certipy", "petitpotam",
    "kerbrute", "getTGT", "getST",
    "aws-cli", "az-cli", "gcloud", "kubectl",
    "terraform", "ansible",
    "git", "svn",
    "python3", "perl", "php", "ruby",
    "gcc", "make",
    "docker", "podman",
    "wireshark", "tcpdump", "tshark",
    "enum4linux", "snmpwalk", "onesixtyone",
    "dnsrecon", "dnsenum", "fierce",
];

pub struct OwaspCategory {
    pub id: &'static str,
    pub name: &'static str,
    pub skill_names: &'static [&'static str],
}

pub const OWASP_TOP_10: &[OwaspCategory] = &[
    OwaspCategory {
        id: "A01",
        name: "Broken Access Control",
        skill_names: &["idor", "broken-function-level-authorization", "mass-assignment", "path-traversal-lfi-rfi"],
    },
    OwaspCategory {
        id: "A02",
        name: "Cryptographic Failures",
        skill_names: &["tls-testing"],
    },
    OwaspCategory {
        id: "A03",
        name: "Injection",
        skill_names: &["sql-injection", "nosql-injection", "xss", "ssti", "xxe", "header-injection"],
    },
    OwaspCategory {
        id: "A04",
        name: "Insecure Design",
        skill_names: &["business-logic", "race-conditions"],
    },
    OwaspCategory {
        id: "A05",
        name: "Security Misconfiguration",
        skill_names: &["information-disclosure", "open-redirect"],
    },
    OwaspCategory {
        id: "A06",
        name: "Vulnerable Components",
        skill_names: &[],
    },
    OwaspCategory {
        id: "A07",
        name: "Auth Failures",
        skill_names: &["authentication-jwt", "authentication-cheap-alternatives", "oauth-oidc", "csrf"],
    },
    OwaspCategory {
        id: "A08",
        name: "Data Integrity Failures",
        skill_names: &["deserialization", "insecure-file-uploads"],
    },
    OwaspCategory {
        id: "A09",
        name: "Logging Failures",
        skill_names: &[],
    },
    OwaspCategory {
        id: "A10",
        name: "SSRF",
        skill_names: &["ssrf", "http-request-smuggling", "subdomain-takeover"],
    },
];
