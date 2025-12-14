// Ergo address info API
// GET /api/ergo/address/[address] - Get address balance and transactions

import { NextRequest, NextResponse } from 'next/server';
import { ergoClient } from '@/lib/ergo/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  // Validate address format
  if (!ergoClient.isValidAddress(address)) {
    return NextResponse.json(
      { error: 'Invalid Ergo address format' },
      { status: 400 }
    );
  }

  try {
    const [balance, boxes, transactions] = await Promise.all([
      ergoClient.getAddressBalance(address),
      ergoClient.getUnspentBoxes(address, 10),
      ergoClient.getAddressTransactions(address, 10),
    ]);

    return NextResponse.json({
      address,
      balance: {
        erg: balance.nanoErgs / 1e9,
        nanoErg: balance.nanoErgs,
        tokens: balance.tokens,
      },
      boxCount: boxes.length,
      recentTransactions: transactions.slice(0, 5).map(tx => ({
        id: tx.id,
        confirmations: tx.confirmationsCount,
      })),
    });
  } catch (error) {
    console.error('Address API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch address info' },
      { status: 500 }
    );
  }
}
