const API_ENDPOINTS = {
    auth: {
      login: "/signIn",
      register: "/signUp",
    },
    user: {
      getBalance: "/getBalanceOf",
      stakeBalance: "/stakeSulaana",
      getUserDetails : "/getUser",
      claimReward : "/claimReward",
      getReferralRewards : "/getUserReferralRewards",
      mintUser :"/mintForUser",
      checkUserExistOrNot: "/checkUserExistOrNot",
      getClaimRewardAmount : "/getUserTotalRewards",
      unstake: "/unstake",
      getDirectBonus :"/getDirectBonus",
      getClaimedRewards : "/getClaimedRewards",
      getCappingRewards : "/getCappingRewards",
      checkTrxStatus : "/checkTrxStatus",
      getUserStakes : "/getUserStakes",
      getStakeLength :"/getStakeLength",
      getInitialReturn : "/getInitialReturn",
    },
    web2:{
      createStake:"/createStake",
      createMint :"/createMint",
      createClaim : "/createReward",
      updateStakeById:"/updateStakeById",
      updateUnStakeById : "/updateUnStakeById",
      getAllUserMintTrx:"/getAllUserMintTrx",
      getAllUserRewardTrx :"/getAllUserRewardTrx",
      getAllStakes:"/getAllStakes",
      getAllUserCount:"/getAllUserCount",
      getAllReferrals : "/getAllReferrals",
      calculateTotalStakedAmount : "/calculateTotalStakedAmount",
      getDownlineBusiness: "/getAllDownlineBusiness",
    },
    transaction:{
      approval:"/approval",
    }
  };
  
  export default API_ENDPOINTS;