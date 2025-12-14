/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ChainCash Crowdfunding - Contract Service
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Service for interacting with the crowdfunding smart contract.
 * Handles campaign creation, pledging, withdrawals, and refunds.
 */

import { 
  TransactionBuilder, 
  OutputBuilder, 
  SAFE_MIN_BOX_VALUE,
  RECOMMENDED_MIN_FEE,
  NANOERG_PER_ERG,
  getWalletUtxos,
  getChangeAddress,
  getBlockHeight,
  executeWithNautilus
} from './transactionService';

// ═══════════════════════════════════════════════════════════════════════════
// Contract Constants
// ═══════════════════════════════════════════════════════════════════════════

// Crowdfunding contract ErgoTree (compiled from crowdfunding.es)
// This is a placeholder - in production, compile the actual ErgoScript
const CROWDFUNDING_CONTRACT_ERGOTREE = '100604000e20{campaignId}0580c2d72f05{deadline}0400050005000500d803d601b2a5730000d602e4c6a70405d603e4c6a70505d1ec93720273017302';

// Minimum funding amount (0.01 ERG)
export const MIN_PLEDGE_AMOUNT = BigInt(0.01 * Number(NANOERG_PER_ERG));

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface CampaignParams {
  id: string;
  title: string;
  description: string;
  goalErg: number;
  deadlineBlocks: number; // blocks from now
  milestones: number;
  creatorAddress: string;
}

export interface Campaign {
  boxId: string;
  campaignId: string;
  creatorPK: string;
  fundingGoal: bigint;
  currentFunding: bigint;
  deadline: number;
  currentMilestone: number;
  totalMilestones: number;
  isGoalReached: boolean;
  isExpired: boolean;
}

export interface PledgeParams {
  campaignBoxId: string;
  amountErg: number;
}

export interface WithdrawParams {
  campaignBoxId: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Campaign Creation
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a new crowdfunding campaign
 */
export async function createCampaign(params: CampaignParams): Promise<string> {
  const utxos = await getWalletUtxos();
  const changeAddress = await getChangeAddress();
  const currentHeight = await getBlockHeight();
  
  if (!utxos.length) throw new Error('No UTXOs available');
  
  const fundingGoalNano = BigInt(Math.floor(params.goalErg * Number(NANOERG_PER_ERG)));
  const deadlineHeight = currentHeight + params.deadlineBlocks;
  
  // Encode campaign ID as bytes
  const campaignIdBytes = Buffer.from(params.id).toString('hex');
  
  // Create campaign box with contract
  const campaignOutput = new OutputBuilder(
    SAFE_MIN_BOX_VALUE,
    CROWDFUNDING_CONTRACT_ERGOTREE.replace('{campaignId}', campaignIdBytes)
      .replace('{deadline}', deadlineHeight.toString(16).padStart(8, '0')),
    currentHeight
  )
    .setAdditionalRegisters({
      R4: campaignIdBytes,                    // Campaign ID
      R5: params.creatorAddress,              // Creator PK
      R6: fundingGoalNano.toString(),         // Funding Goal
      R7: deadlineHeight.toString(),          // Deadline Height
      R8: '0',                                // Current Milestone
      R9: params.milestones.toString()        // Total Milestones
    });
  
  const tx = new TransactionBuilder(currentHeight)
    .from(utxos)
    .to(campaignOutput)
    .sendChangeTo(changeAddress)
    .payMinFee()
    .build();
  
  return executeWithNautilus(tx);
}

// ═══════════════════════════════════════════════════════════════════════════
// Pledging
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pledge ERG to a campaign
 */
export async function pledgeToCampaign(params: PledgeParams): Promise<string> {
  const utxos = await getWalletUtxos();
  const changeAddress = await getChangeAddress();
  const currentHeight = await getBlockHeight();
  
  if (!utxos.length) throw new Error('No UTXOs available');
  
  const pledgeAmount = BigInt(Math.floor(params.amountErg * Number(NANOERG_PER_ERG)));
  
  if (pledgeAmount < MIN_PLEDGE_AMOUNT) {
    throw new Error(`Minimum pledge is ${Number(MIN_PLEDGE_AMOUNT) / Number(NANOERG_PER_ERG)} ERG`);
  }
  
  // Fetch campaign box to get current state
  const campaignBox = await fetchCampaignBox(params.campaignBoxId);
  if (!campaignBox) throw new Error('Campaign not found');
  
  const newFunding = campaignBox.currentFunding + pledgeAmount;
  
  // Create updated campaign box with increased funding
  const updatedCampaignOutput = new OutputBuilder(
    newFunding,
    campaignBox.boxId, // Same contract address
    currentHeight
  )
    .setAdditionalRegisters({
      R4: campaignBox.campaignId,
      R5: campaignBox.creatorPK,
      R6: campaignBox.fundingGoal.toString(),
      R7: campaignBox.deadline.toString(),
      R8: campaignBox.currentMilestone.toString(),
      R9: campaignBox.totalMilestones.toString()
    });
  
  const tx = new TransactionBuilder(currentHeight)
    .from([...utxos, campaignBox as any])
    .to(updatedCampaignOutput)
    .sendChangeTo(changeAddress)
    .payMinFee()
    .build();
  
  return executeWithNautilus(tx);
}

// ═══════════════════════════════════════════════════════════════════════════
// Withdrawals
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Creator withdraws milestone funds
 */
export async function withdrawMilestone(params: WithdrawParams): Promise<string> {
  const utxos = await getWalletUtxos();
  const changeAddress = await getChangeAddress();
  const currentHeight = await getBlockHeight();
  
  const campaignBox = await fetchCampaignBox(params.campaignBoxId);
  if (!campaignBox) throw new Error('Campaign not found');
  
  if (!campaignBox.isGoalReached) {
    throw new Error('Cannot withdraw: funding goal not reached');
  }
  
  const milestoneAmount = campaignBox.fundingGoal / BigInt(campaignBox.totalMilestones);
  const isLastMilestone = campaignBox.currentMilestone >= campaignBox.totalMilestones - 1;
  
  if (isLastMilestone) {
    // Final withdrawal - get all remaining funds
    const tx = new TransactionBuilder(currentHeight)
      .from([campaignBox as any])
      .to(new OutputBuilder(campaignBox.currentFunding - RECOMMENDED_MIN_FEE, changeAddress, currentHeight))
      .sendChangeTo(changeAddress)
      .payMinFee()
      .build();
    
    return executeWithNautilus(tx);
  } else {
    // Partial withdrawal - update milestone
    const remainingFunds = campaignBox.currentFunding - milestoneAmount;
    
    const updatedCampaignOutput = new OutputBuilder(
      remainingFunds,
      campaignBox.boxId,
      currentHeight
    )
      .setAdditionalRegisters({
        R4: campaignBox.campaignId,
        R5: campaignBox.creatorPK,
        R6: campaignBox.fundingGoal.toString(),
        R7: campaignBox.deadline.toString(),
        R8: (campaignBox.currentMilestone + 1).toString(),
        R9: campaignBox.totalMilestones.toString()
      });
    
    const creatorOutput = new OutputBuilder(milestoneAmount - RECOMMENDED_MIN_FEE, changeAddress, currentHeight);
    
    const tx = new TransactionBuilder(currentHeight)
      .from([campaignBox as any])
      .to(updatedCampaignOutput)
      .to(creatorOutput)
      .sendChangeTo(changeAddress)
      .payMinFee()
      .build();
    
    return executeWithNautilus(tx);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Refunds
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Trigger refund for a failed campaign
 */
export async function triggerRefund(campaignBoxId: string, backerAddress: string): Promise<string> {
  const currentHeight = await getBlockHeight();
  
  const campaignBox = await fetchCampaignBox(campaignBoxId);
  if (!campaignBox) throw new Error('Campaign not found');
  
  if (!campaignBox.isExpired) {
    throw new Error('Cannot refund: campaign deadline not passed');
  }
  
  if (campaignBox.isGoalReached) {
    throw new Error('Cannot refund: funding goal was reached');
  }
  
  // Refund all funds to backer
  const refundOutput = new OutputBuilder(
    campaignBox.currentFunding - RECOMMENDED_MIN_FEE,
    backerAddress,
    currentHeight
  );
  
  const tx = new TransactionBuilder(currentHeight)
    .from([campaignBox as any])
    .to(refundOutput)
    .payMinFee()
    .build();
  
  return executeWithNautilus(tx);
}

// ═══════════════════════════════════════════════════════════════════════════
// Campaign Queries
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch campaign box from blockchain
 */
async function fetchCampaignBox(boxId: string): Promise<Campaign | null> {
  try {
    const response = await fetch(`https://api.ergoplatform.com/api/v1/boxes/${boxId}`);
    if (!response.ok) return null;
    
    const box = await response.json();
    const currentHeight = await getBlockHeight();
    
    return {
      boxId: box.boxId,
      campaignId: box.additionalRegisters?.R4 || '',
      creatorPK: box.additionalRegisters?.R5 || '',
      fundingGoal: BigInt(box.additionalRegisters?.R6 || '0'),
      currentFunding: BigInt(box.value),
      deadline: parseInt(box.additionalRegisters?.R7 || '0'),
      currentMilestone: parseInt(box.additionalRegisters?.R8 || '0'),
      totalMilestones: parseInt(box.additionalRegisters?.R9 || '1'),
      isGoalReached: BigInt(box.value) >= BigInt(box.additionalRegisters?.R6 || '0'),
      isExpired: currentHeight > parseInt(box.additionalRegisters?.R7 || '0')
    };
  } catch (error) {
    console.error('Error fetching campaign box:', error);
    return null;
  }
}

/**
 * Get all active campaigns
 */
export async function getActiveCampaigns(): Promise<Campaign[]> {
  try {
    // In production, query explorer API for boxes with crowdfunding contract
    const response = await fetch(
      `https://api.ergoplatform.com/api/v1/boxes/unspent/byErgoTree/${CROWDFUNDING_CONTRACT_ERGOTREE}?limit=100`
    );
    
    if (!response.ok) return [];
    
    const boxes = await response.json();
    const currentHeight = await getBlockHeight();
    
    return boxes.items?.map((box: any) => ({
      boxId: box.boxId,
      campaignId: box.additionalRegisters?.R4 || '',
      creatorPK: box.additionalRegisters?.R5 || '',
      fundingGoal: BigInt(box.additionalRegisters?.R6 || '0'),
      currentFunding: BigInt(box.value),
      deadline: parseInt(box.additionalRegisters?.R7 || '0'),
      currentMilestone: parseInt(box.additionalRegisters?.R8 || '0'),
      totalMilestones: parseInt(box.additionalRegisters?.R9 || '1'),
      isGoalReached: BigInt(box.value) >= BigInt(box.additionalRegisters?.R6 || '0'),
      isExpired: currentHeight > parseInt(box.additionalRegisters?.R7 || '0')
    })) || [];
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
}

/**
 * Calculate campaign progress percentage
 */
export function getCampaignProgress(campaign: Campaign): number {
  if (campaign.fundingGoal === BigInt(0)) return 0;
  return Number((campaign.currentFunding * BigInt(100)) / campaign.fundingGoal);
}

/**
 * Get time remaining for campaign
 */
export async function getTimeRemaining(campaign: Campaign): Promise<{
  blocks: number;
  estimatedMinutes: number;
}> {
  const currentHeight = await getBlockHeight();
  const blocksRemaining = Math.max(0, campaign.deadline - currentHeight);
  
  // Ergo averages ~2 minutes per block
  return {
    blocks: blocksRemaining,
    estimatedMinutes: blocksRemaining * 2
  };
}
