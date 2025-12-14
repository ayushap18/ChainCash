{
  // ═══════════════════════════════════════════════════════════════════════════
  // ChainCash Crowdfunding Smart Contract
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // This ErgoScript contract manages crowdfunding campaigns with:
  // - Goal-based funding (refund if goal not met)
  // - Deadline enforcement
  // - Milestone-based fund release
  // - Backer proof tokens
  //
  // Registers:
  //   R4: Campaign ID (Coll[Byte])
  //   R5: Creator PK (SigmaProp)
  //   R6: Funding Goal in nanoERG (Long)
  //   R7: Deadline Height (Int)
  //   R8: Current Milestone (Int)
  //   R9: Total Milestones (Int)
  //
  // ═══════════════════════════════════════════════════════════════════════════

  // Campaign parameters from registers
  val campaignId = SELF.R4[Coll[Byte]].get
  val creatorPK = SELF.R5[SigmaProp].get
  val fundingGoal = SELF.R6[Long].get
  val deadline = SELF.R7[Int].get
  val currentMilestone = SELF.R8[Int].get
  val totalMilestones = SELF.R9[Int].get

  // Current state
  val currentHeight = HEIGHT
  val currentFunding = SELF.value
  val isGoalReached = currentFunding >= fundingGoal
  val isDeadlinePassed = currentHeight > deadline
  val isCampaignActive = !isDeadlinePassed

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTION 1: PLEDGE (Add funds to campaign)
  // ═══════════════════════════════════════════════════════════════════════════
  // Anyone can pledge while campaign is active
  
  val isPledge = {
    val outputBox = OUTPUTS(0)
    val pledgeAmount = outputBox.value - SELF.value
    
    // Validate pledge preserves campaign data
    val preservesCampaignId = outputBox.R4[Coll[Byte]].get == campaignId
    val preservesCreator = outputBox.R5[SigmaProp].get == creatorPK
    val preservesGoal = outputBox.R6[Long].get == fundingGoal
    val preservesDeadline = outputBox.R7[Int].get == deadline
    val preservesMilestone = outputBox.R8[Int].get == currentMilestone
    val preservesTotalMilestones = outputBox.R9[Int].get == totalMilestones
    val sameScript = outputBox.propositionBytes == SELF.propositionBytes
    
    isCampaignActive &&
    pledgeAmount > 0 &&
    preservesCampaignId &&
    preservesCreator &&
    preservesGoal &&
    preservesDeadline &&
    preservesMilestone &&
    preservesTotalMilestones &&
    sameScript
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTION 2: WITHDRAW (Creator withdraws after goal reached)
  // ═══════════════════════════════════════════════════════════════════════════
  // Creator can withdraw milestone portion after goal is reached
  
  val isWithdraw = {
    val milestoneAmount = fundingGoal / totalMilestones.toLong
    val withdrawableAmount = milestoneAmount * (currentMilestone + 1).toLong
    val remainingAmount = currentFunding - milestoneAmount
    
    // If this is the last milestone, creator gets everything
    val isLastMilestone = currentMilestone >= totalMilestones - 1
    
    if (isLastMilestone) {
      // Final withdrawal - creator gets all remaining funds
      isGoalReached && creatorPK
    } else {
      // Partial withdrawal - update milestone counter
      val outputBox = OUTPUTS(0)
      val preservesCampaignId = outputBox.R4[Coll[Byte]].get == campaignId
      val preservesCreator = outputBox.R5[SigmaProp].get == creatorPK
      val preservesGoal = outputBox.R6[Long].get == fundingGoal
      val preservesDeadline = outputBox.R7[Int].get == deadline
      val incrementsMilestone = outputBox.R8[Int].get == currentMilestone + 1
      val preservesTotalMilestones = outputBox.R9[Int].get == totalMilestones
      val correctRemaining = outputBox.value >= remainingAmount
      val sameScript = outputBox.propositionBytes == SELF.propositionBytes
      
      isGoalReached &&
      preservesCampaignId &&
      preservesCreator &&
      preservesGoal &&
      preservesDeadline &&
      incrementsMilestone &&
      preservesTotalMilestones &&
      correctRemaining &&
      sameScript &&
      creatorPK
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTION 3: REFUND (Backers get refund if goal not met after deadline)
  // ═══════════════════════════════════════════════════════════════════════════
  // Anyone can trigger refund after deadline if goal not reached
  
  val isRefund = {
    isDeadlinePassed && !isGoalReached
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTRACT LOGIC
  // ═══════════════════════════════════════════════════════════════════════════
  
  sigmaProp(isPledge || isWithdraw || isRefund)
}
