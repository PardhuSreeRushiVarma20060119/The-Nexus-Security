import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SecurityInsight {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  recommendation: string;
  relatedFindings: any[];
}

export class AIInsightsService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async generateInsights(): Promise<SecurityInsight[]> {
    try {
      // Fetch recent security data
      const [recentScans, recentLogs, settings] = await Promise.all([
        prisma.scanResult.findMany({
          where: {
            userId: this.userId,
            status: 'COMPLETED',
          },
          orderBy: {
            startTime: 'desc',
          },
          take: 10,
        }),
        prisma.securityLog.findMany({
          where: {
            userId: this.userId,
          },
          orderBy: {
            timestamp: 'desc',
          },
          take: 50,
        }),
        prisma.settings.findUnique({
          where: {
            userId: this.userId,
          },
        }),
      ]);

      // Prepare data for analysis
      const securityData = {
        scans: recentScans,
        logs: recentLogs,
        settings,
      };

      // Generate insights using AI
      const insights = await this.analyzeSecurityData(securityData);

      // Log insights generation
      await prisma.securityLog.create({
        data: {
          userId: this.userId,
          type: 'AI_INSIGHTS_GENERATED',
          severity: 'LOW',
          description: 'AI security insights generated',
          metadata: { insights: JSON.stringify(insights) },
        },
      });

      return insights;
    } catch (error) {
      console.error('Error generating AI insights:', error);
      throw error;
    }
  }

  private async analyzeSecurityData(data: any): Promise<SecurityInsight[]> {
    const insights: SecurityInsight[] = [];

    // Analyze scan findings patterns
    const allFindings = data.scans.flatMap((scan: any) => scan.findings || []);
    const findingTypes = new Set(allFindings.map((f: any) => f.type));

    for (const type of findingTypes) {
      const typeFindings = allFindings.filter((f: any) => f.type === type);
      const frequency = typeFindings.length;
      const maxSeverity = this.getMaxSeverity(typeFindings);

      if (frequency >= 3) {
        insights.push({
          type: 'RECURRING_THREAT',
          severity: maxSeverity,
          description: `Detected recurring ${type} threats (${frequency} occurrences)`,
          recommendation: await this.getAIRecommendation('recurring_threat', {
            threatType: type,
            frequency,
            findings: typeFindings,
          }),
          relatedFindings: typeFindings,
        });
      }
    }

    // Analyze suspicious network activity
    const suspiciousActivities = data.logs.filter(
      (log: any) => log.type === 'SUSPICIOUS_NETWORK_ACTIVITY'
    );

    if (suspiciousActivities.length > 0) {
      insights.push({
        type: 'NETWORK_ANOMALY',
        severity: 'HIGH',
        description: `Detected ${suspiciousActivities.length} suspicious network activities`,
        recommendation: await this.getAIRecommendation('network_anomaly', {
          activities: suspiciousActivities,
        }),
        relatedFindings: suspiciousActivities,
      });
    }

    // Analyze security settings
    const settingsInsight = await this.analyzeSecuritySettings(data.settings);
    if (settingsInsight) {
      insights.push(settingsInsight);
    }

    return insights;
  }

  private async getAIRecommendation(context: string, data: any): Promise<string> {
    try {
      const prompt = this.buildPrompt(context, data);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a cybersecurity expert providing concise, actionable recommendations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'No recommendation available';
    } catch (error) {
      console.error('Error getting AI recommendation:', error);
      return 'Unable to generate AI recommendation at this time';
    }
  }

  private buildPrompt(context: string, data: any): string {
    switch (context) {
      case 'recurring_threat':
        return `Provide a specific recommendation to address recurring ${data.threatType} threats that have occurred ${data.frequency} times. Consider the severity and potential impact.`;
      
      case 'network_anomaly':
        return `Analyze these suspicious network activities and provide a specific recommendation to enhance network security: ${JSON.stringify(data.activities)}`;
      
      case 'security_settings':
        return `Review these security settings and suggest improvements: ${JSON.stringify(data)}`;
      
      default:
        return 'Provide a general security recommendation based on the available data.';
    }
  }

  private async analyzeSecuritySettings(settings: any): Promise<SecurityInsight | null> {
    if (!settings) return null;

    const weaknesses = [];

    if (!settings.twoFactorEnabled) {
      weaknesses.push('Two-factor authentication is disabled');
    }
    if (!settings.firewallEnabled) {
      weaknesses.push('Firewall protection is disabled');
    }
    if (settings.scanInterval > 24) {
      weaknesses.push('Scan interval is set too high');
    }

    if (weaknesses.length > 0) {
      return {
        type: 'SECURITY_CONFIGURATION',
        severity: 'MEDIUM',
        description: 'Detected potential security configuration issues',
        recommendation: await this.getAIRecommendation('security_settings', {
          weaknesses,
          settings,
        }),
        relatedFindings: weaknesses,
      };
    }

    return null;
  }

  private getMaxSeverity(findings: any[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const severityOrder = {
      'LOW': 1,
      'MEDIUM': 2,
      'HIGH': 3,
      'CRITICAL': 4,
    };

    const maxSeverity = findings.reduce((max, finding) => {
      const severityScore = severityOrder[finding.severity as keyof typeof severityOrder] || 0;
      return Math.max(max, severityScore);
    }, 0);

    return Object.entries(severityOrder).find(([_, score]) => score === maxSeverity)?.[0] as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' || 'LOW';
  }
} 