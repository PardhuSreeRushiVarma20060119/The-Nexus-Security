declare module 'node-virustotal' {
  export class NodeVirustotal {
    constructor(apiKey: string);
    uploadFile(filePath: string, callback: (error: any, result: any) => void): void;
    getFileReport(resource: string, callback: (error: any, result: any) => void): void;
  }
} 