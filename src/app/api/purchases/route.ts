// Purchase API - Records asset purchases on blockchain
// POST /api/purchases - Create a new purchase record

import { NextRequest, NextResponse } from 'next/server';
import { ergoClient } from '@/lib/ergo/client';

interface PurchaseRequest {
  assetId: string;
  txId: string;
  walletAddress: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: PurchaseRequest = await req.json();
    const { assetId, txId, walletAddress } = body;

    // Validate required fields
    if (!assetId || !txId || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: assetId, txId, walletAddress' },
        { status: 400 }
      );
    }

    // Verify transaction exists on blockchain
    const tx = await ergoClient.getTransaction(txId);
    
    if (!tx) {
      return NextResponse.json(
        { error: 'Transaction not found on blockchain' },
        { status: 400 }
      );
    }

    // Check confirmations (require at least 1)
    if (tx.confirmationsCount < 1) {
      return NextResponse.json(
        { error: 'Transaction not yet confirmed' },
        { status: 400 }
      );
    }

    // TODO: When database is set up:
    // 1. Find or create user by walletAddress
    // 2. Get asset details from database
    // 3. Verify payment amount matches asset price
    // 4. Create purchase record
    // 5. Create user asset record
    // 6. Update asset sold count
    // 7. Update campaign raised amount

    return NextResponse.json({
      success: true,
      message: 'Purchase recorded - Database integration pending',
      data: {
        assetId,
        txId,
        walletAddress,
        confirmations: tx.confirmationsCount,
      },
    });
  } catch (error) {
    console.error('Purchase API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/purchases - Get user's purchases
export async function GET(req: NextRequest) {
  const walletAddress = req.headers.get('x-wallet-address');
  
  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address required' },
      { status: 401 }
    );
  }

  // TODO: Query database for user's purchases
  return NextResponse.json({
    message: 'Purchases retrieval - Database integration pending',
    walletAddress,
    purchases: [],
  });
}
