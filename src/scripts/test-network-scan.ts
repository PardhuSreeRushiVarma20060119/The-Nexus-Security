const { PrismaClient } = require('@prisma/client');
const nodeFetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const testPrisma = new PrismaClient();

async function createTestSession(userId: string) {
  const token = jwt.sign(
    { 
      sub: userId,
      email: 'test@example.com',
      name: 'Test User',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    },
    process.env.NEXTAUTH_SECRET || 'your-test-secret'
  );

  return token;
}

async function testNetworkScan() {
  try {
    // Create a test user if it doesn't exist
    const testUser = await testPrisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        hashedPassword: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpzQN.bwySqZge', // 'password123'
        settings: {
          create: {
            autoScanEnabled: true,
            scanInterval: 24,
            notificationsEnabled: true,
            twoFactorEnabled: false,
            firewallEnabled: true,
            networkMonitoring: true,
            aiInsightsEnabled: true
          }
        }
      }
    });

    // Create a test session
    const sessionToken = await createTestSession(testUser.id);

    // Test different scan types
    const scanTypes = ['quick', 'default', 'intense', 'vulnscan'];
    const targets = ['127.0.0.1', 'localhost'];

    for (const scanType of scanTypes) {
      for (const target of targets) {
        console.log(`Testing ${scanType} scan on ${target}...`);
        
        const response = await nodeFetch('http://localhost:3000/api/network-scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `next-auth.session-token=${sessionToken}`,
          },
          body: JSON.stringify({
            target,
            scanType,
          }),
        });

        const result = await response.json();
        console.log(`Results for ${scanType} scan on ${target}:`, JSON.stringify(result, null, 2));
      }
    }

    // Clean up test data
    await testPrisma.scanResult.deleteMany({
      where: { userId: testUser.id }
    });
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await testPrisma.$disconnect();
  }
}

testNetworkScan().catch(console.error); 