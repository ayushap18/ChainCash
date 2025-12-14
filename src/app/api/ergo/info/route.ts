// Ergo blockchain info API
// Provides blockchain data to frontend

import { NextRequest, NextResponse } from 'next/server';
import { ergoClient } from '@/lib/ergo/client';

// GET /api/ergo/info - Get blockchain info
export async function GET(req: NextRequest) {
  try {
    const currentHeight = await ergoClient.getCurrentHeight();
    
    return NextResponse.json({
      network: ergoClient.getNetwork(),
      currentHeight,
      explorerUrl: ergoClient.getExplorerUrl(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Ergo info API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blockchain info' },
      { status: 500 }
    );
  }
}
