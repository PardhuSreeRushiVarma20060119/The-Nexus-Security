import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { NmapScanResult } from '../services/nmapService';

const styles = StyleSheet.create({
  page: { 
    padding: 30,
    fontFamily: 'Helvetica'
  },
  section: { 
    marginBottom: 10 
  },
  title: { 
    fontSize: 24,
    marginBottom: 20
  },
  heading: { 
    fontSize: 18,
    marginBottom: 10
  },
  text: { 
    fontSize: 12,
    marginBottom: 5
  }
});

export const NetworkScanReport: React.FC<{ scanResults: NmapScanResult[] }> = ({ scanResults }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Network Scan Report</Text>
        <Text style={styles.text}>Scan Date: {new Date().toLocaleString()}</Text>
        <Text style={styles.text}>Total Hosts Scanned: {scanResults.length}</Text>
      </View>

      {scanResults.map((host, hostIndex) => (
        <View key={hostIndex} style={styles.section}>
          <Text style={styles.heading}>Host: {host.ip}</Text>
          <Text style={styles.text}>Operating System: {host.os || 'Unknown'}</Text>
          
          <Text style={styles.heading}>Open Ports:</Text>
          {host.ports.map((port, portIndex) => (
            <Text key={portIndex} style={styles.text}>
              Port {port.port} ({port.service}) - {port.state}
            </Text>
          ))}

          {host.vulnerabilities && host.vulnerabilities.length > 0 && (
            <View>
              <Text style={styles.heading}>Vulnerabilities:</Text>
              {host.vulnerabilities.map((vuln, vulnIndex) => (
                <Text key={vulnIndex} style={styles.text}>
                  • {vuln}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}
    </Page>
  </Document>
);

export const generatePDFReport = (scanResults: NmapScanResult[]) => (
  <NetworkScanReport scanResults={scanResults} />
); 