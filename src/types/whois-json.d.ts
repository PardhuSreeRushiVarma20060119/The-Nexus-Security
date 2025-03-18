declare module 'whois-json' {
  interface WhoisResult {
    domainName?: string;
    registrar?: string;
    registrarWhoisServer?: string;
    nameServer?: string | string[];
    createdDate?: string;
    updatedDate?: string;
    expirationDate?: string;
    status?: string | string[];
    // Alternative field names that might be returned
    created?: string;
    expires?: string;
    // Allow for additional properties
    [key: string]: any;
  }

  function whois(domain: string): Promise<WhoisResult>;
  export = whois;
} 