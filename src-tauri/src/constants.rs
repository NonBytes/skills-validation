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

pub struct MitreTactic {
    pub id: &'static str,
    pub name: &'static str,
    pub skill_names: &'static [&'static str],
}

pub const MITRE_TACTICS: &[MitreTactic] = &[
    MitreTactic {
        id: "TA0043",
        name: "Reconnaissance",
        skill_names: &["nmap", "masscan", "rustscan", "amass", "subfinder", "assetfinder",
                        "dnsrecon", "attack-prioritization", "backend-storage-xamz",
                        "backend-vs-exposed-services", "information-disclosure"],
    },
    MitreTactic {
        id: "TA0042",
        name: "Resource Development",
        skill_names: &[],
    },
    MitreTactic {
        id: "TA0001",
        name: "Initial Access",
        skill_names: &["sql-injection", "xss", "ssti", "xxe", "ssrf",
                        "insecure-file-uploads", "oauth-oidc", "open-redirect",
                        "header-injection", "http-request-smuggling"],
    },
    MitreTactic {
        id: "TA0002",
        name: "Execution",
        skill_names: &["rce", "deserialization", "sqlmap", "metasploit",
                        "nuclei", "api-tester"],
    },
    MitreTactic {
        id: "TA0003",
        name: "Persistence",
        skill_names: &["insecure-file-uploads", "wordpress"],
    },
    MitreTactic {
        id: "TA0004",
        name: "Privilege Escalation",
        skill_names: &["idor", "broken-function-level-authorization", "mass-assignment",
                        "path-traversal-lfi-rfi", "deserialization"],
    },
    MitreTactic {
        id: "TA0005",
        name: "Defense Evasion",
        skill_names: &[],
    },
    MitreTactic {
        id: "TA0006",
        name: "Credential Access",
        skill_names: &["hydra", "password-cracking", "authentication-jwt",
                        "authentication-cheap-alternatives", "kerberos",
                        "responder", "crackmapexec", "netexec"],
    },
    MitreTactic {
        id: "TA0007",
        name: "Discovery",
        skill_names: &["gobuster", "feroxbuster", "ffuf", "nikto", "wpscan",
                        "swagger-openapi-schema-followup", "graphql",
                        "whatweb", "enum4linux-ng", "snmp", "ldap"],
    },
    MitreTactic {
        id: "TA0008",
        name: "Lateral Movement",
        skill_names: &["smb", "ssh", "rdp", "evil-winrm", "impacket",
                        "crackmapexec", "netexec", "bloodhound",
                        "active-directory-architecture", "ad-attack-paths"],
    },
    MitreTactic {
        id: "TA0009",
        name: "Collection",
        skill_names: &["ctf-flag-hunt"],
    },
    MitreTactic {
        id: "TA0011",
        name: "Command and Control",
        skill_names: &["chisel"],
    },
    MitreTactic {
        id: "TA0010",
        name: "Exfiltration",
        skill_names: &[],
    },
    MitreTactic {
        id: "TA0040",
        name: "Impact",
        skill_names: &["race-conditions", "business-logic"],
    },
];

pub struct CweEntry {
    pub id: &'static str,
    pub name: &'static str,
    pub skill_names: &'static [&'static str],
}

pub const CWE_TOP_25: &[CweEntry] = &[
    CweEntry { id: "CWE-787", name: "Out-of-bounds Write", skill_names: &[] },
    CweEntry { id: "CWE-79", name: "Cross-site Scripting (XSS)", skill_names: &["xss"] },
    CweEntry { id: "CWE-89", name: "SQL Injection", skill_names: &["sql-injection", "sqlmap"] },
    CweEntry { id: "CWE-416", name: "Use After Free", skill_names: &[] },
    CweEntry { id: "CWE-78", name: "OS Command Injection", skill_names: &["rce"] },
    CweEntry { id: "CWE-20", name: "Improper Input Validation", skill_names: &["api-tester", "header-injection"] },
    CweEntry { id: "CWE-125", name: "Out-of-bounds Read", skill_names: &[] },
    CweEntry { id: "CWE-22", name: "Path Traversal", skill_names: &["path-traversal-lfi-rfi"] },
    CweEntry { id: "CWE-352", name: "Cross-Site Request Forgery", skill_names: &["csrf"] },
    CweEntry { id: "CWE-434", name: "Unrestricted File Upload", skill_names: &["insecure-file-uploads"] },
    CweEntry { id: "CWE-862", name: "Missing Authorization", skill_names: &["idor", "broken-function-level-authorization"] },
    CweEntry { id: "CWE-476", name: "NULL Pointer Dereference", skill_names: &[] },
    CweEntry { id: "CWE-287", name: "Improper Authentication", skill_names: &["authentication-jwt", "authentication-cheap-alternatives", "oauth-oidc"] },
    CweEntry { id: "CWE-190", name: "Integer Overflow", skill_names: &[] },
    CweEntry { id: "CWE-502", name: "Deserialization of Untrusted Data", skill_names: &["deserialization"] },
    CweEntry { id: "CWE-77", name: "Command Injection", skill_names: &["rce"] },
    CweEntry { id: "CWE-119", name: "Buffer Overflow", skill_names: &[] },
    CweEntry { id: "CWE-798", name: "Hard-coded Credentials", skill_names: &["information-disclosure"] },
    CweEntry { id: "CWE-918", name: "Server-Side Request Forgery", skill_names: &["ssrf"] },
    CweEntry { id: "CWE-306", name: "Missing Authentication", skill_names: &["authentication-cheap-alternatives"] },
    CweEntry { id: "CWE-362", name: "Race Condition", skill_names: &["race-conditions"] },
    CweEntry { id: "CWE-269", name: "Improper Privilege Management", skill_names: &["broken-function-level-authorization", "mass-assignment"] },
    CweEntry { id: "CWE-94", name: "Code Injection", skill_names: &["ssti", "xxe"] },
    CweEntry { id: "CWE-863", name: "Incorrect Authorization", skill_names: &["idor"] },
    CweEntry { id: "CWE-276", name: "Incorrect Default Permissions", skill_names: &["information-disclosure"] },
];

pub struct PtesPhase {
    pub id: &'static str,
    pub name: &'static str,
    pub skill_names: &'static [&'static str],
}

pub const PTES_PHASES: &[PtesPhase] = &[
    PtesPhase {
        id: "PTES-1",
        name: "Pre-engagement Interactions",
        skill_names: &[],
    },
    PtesPhase {
        id: "PTES-2",
        name: "Intelligence Gathering",
        skill_names: &["nmap", "masscan", "amass", "subfinder", "assetfinder",
                        "dnsrecon", "whatweb", "attack-prioritization",
                        "backend-storage-xamz", "backend-vs-exposed-services"],
    },
    PtesPhase {
        id: "PTES-3",
        name: "Threat Modeling",
        skill_names: &["attack-chain-patterns", "cms-framework-cve-chains"],
    },
    PtesPhase {
        id: "PTES-4",
        name: "Vulnerability Analysis",
        skill_names: &["nuclei", "nikto", "wpscan", "gobuster", "feroxbuster",
                        "ffuf", "swagger-openapi-schema-followup", "graphql",
                        "tls-testing", "information-disclosure"],
    },
    PtesPhase {
        id: "PTES-5",
        name: "Exploitation",
        skill_names: &["sql-injection", "xss", "ssrf", "ssti", "xxe",
                        "rce", "deserialization", "metasploit", "sqlmap",
                        "hydra", "path-traversal-lfi-rfi"],
    },
    PtesPhase {
        id: "PTES-6",
        name: "Post Exploitation",
        skill_names: &["bloodhound", "impacket", "crackmapexec", "netexec",
                        "evil-winrm", "smb", "ssh", "rdp", "kerberos",
                        "active-directory-architecture", "ad-attack-paths",
                        "password-cracking", "ctf-flag-hunt"],
    },
    PtesPhase {
        id: "PTES-7",
        name: "Reporting",
        skill_names: &[],
    },
];
