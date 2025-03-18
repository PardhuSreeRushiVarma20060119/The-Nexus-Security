import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    // Use start command on Windows to open in a new window
    const command = process.platform === 'win32'
      ? 'start cmd /c "npx prisma studio --port 5555"'
      : 'npx prisma studio --port 5555 &';

    await execAsync(command);
    
    // Give Prisma Studio a moment to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return NextResponse.json({
      success: true,
      message: 'Prisma Studio launched successfully',
      url: 'http://localhost:5555'
    });
  } catch (error) {
    console.error('Failed to launch Prisma Studio:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to launch Prisma Studio',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 