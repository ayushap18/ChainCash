// API Routes for ChainCash Crowdfunding Platform
// This file documents the API structure - actual implementation requires database setup

import { NextRequest, NextResponse } from 'next/server';

// Campaigns API
// GET /api/campaigns - List all campaigns
// POST /api/campaigns - Create new campaign (requires auth)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');
  const sort = searchParams.get('sort') || 'newest';

  // TODO: Replace with actual database query when Prisma is set up
  // For now, return mock data from campaignStore
  
  return NextResponse.json({
    message: 'Campaigns API - Database integration pending',
    params: { status, limit, offset, sort },
    note: 'Set up Prisma and PostgreSQL to enable this endpoint',
  });
}

export async function POST(req: NextRequest) {
  // Requires authentication
  const walletAddress = req.headers.get('x-wallet-address');
  
  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Unauthorized - Wallet connection required' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    
    // Validate request body
    const { title, description, goalAmount, endDate, reserveRatio } = body;
    
    if (!title || !description || !goalAmount || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, goalAmount, endDate' },
        { status: 400 }
      );
    }

    // TODO: Create campaign in database
    return NextResponse.json({
      message: 'Campaign creation - Database integration pending',
      receivedData: { title, description, goalAmount, endDate, reserveRatio },
      walletAddress,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
