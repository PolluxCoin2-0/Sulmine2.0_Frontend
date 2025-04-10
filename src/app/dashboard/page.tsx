"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Bonus from "@/assests/Bonus.svg";
import SilverPool from "@/assests/silver.png";
import GoldPool from "@/assests/gold.png";
import EmeraldPool from "@/assests/emerald.png";
import PlatinumPool from "@/assests/platinum.png";
import DiamondPool from "@/assests/diamond.png";
import CrownDiamondPool from "@/assests/crownDiamond.png";
import titaniumPool from "@/assests/titanium.png";
import palladiumPool from "@/assests/palladium.png";
import SUL from "@/assests/SUL.svg";
import StakeImg from "@/assests/Stake.svg";
import Mint from "@/assests/Mint.svg";
import MintedTransactions from "./MintedTransactions";
import ShimmerEffect from "@/app/components/ShimmerEffect";
import {approvalApi, claimRewardAmountApi, claimRewardApi, 
createClaimRewardWeb2Api, createMintWeb2Api, createStakeTransactionWeb2Api, getAllUserCountWeb2Api, 
getBalanceApi, getCappingAmountApi, getDirectBonusApi, getInitialReturn, getLastMintTimeFromWeb3, getTotalStakeLengthFromWeb3, getUserDetailsApi, mainnetUserMainnetResourceApi, mintUserApi, referralRewardApi, stakeSulBalanceApi, 
// updateStakeByIdWeb2Api,
 userAllStakesApi } from "@/api/apiFunctions";
import { useSelector } from "react-redux";
import { TransactionInterface, UserDetailsData } from "@/interface";
import { RootState } from "@/redux/store";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import ProgressBar from "../components/ProgressBar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SignBroadcastTransactionStatus } from "@/lib/signBroadcastTransactionStatus";
import FetchTime from "./FetchTime";

const DashBoard: React.FC = () => {
  const router = useRouter();
  const userStateData = useSelector((state: RootState)=>state?.wallet);

  const [isComponentLoading, setComponentLoading] = useState <boolean>(false);
  const [isStakeLoading, setIsStakeLoading] = useState <boolean>(false);
  const [isClaimLoading, setIsClaimLoading] = useState <boolean>(false);
  const [isMintLoading, setIsMintLoading] = useState <boolean>(false);
  const [userDetails, setUserDetails] = useState<UserDetailsData | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [referralAmount, setReferralAmount] = useState<number>(0);
  const [stakedArray, setStakedArray] = useState<TransactionInterface[]>([]);
  const [claimRewardAmount, setClaimRewardAmount] = useState<number>(0);
  const [allUserCount ,  setAllUserCount] = useState<number>(0);
  const [directBonus, setDirectBonus] = useState<number>(0);
  const [cappingAmount, setCappingAmount] = useState<number>(0);
  const [contractAmount, setContractAmount] = useState<number>(0);
  const [totalStakeLengthFromWeb3, setTotalStakeLengthFromWeb3] = useState<number>(0);
  const [initialReturnAmount, setInitialReturnAmount] = useState<number>(0);
  
  console.log({stakedArray});
  useEffect(()=>{
    if(userStateData?.isLogin){
     fetchData();
    }
  },[])

  const fetchData = async()=>{
    setComponentLoading(true);

    const walletAddress = userStateData?.dataObject?.walletAddress as string;
    const token = userStateData?.dataObject?.token as string;

    try {
      const [
        userDetailsApiData,
        referralRewardAPiData,
        stakesDataArray,
        claimRewardApiData,
        userCountDataApi,
        bonusData,
        cappingAmountData,
        sulAmountData,
        totalStakeLengthFromWeb3Data,
        initialReturnData,
      ] = await Promise.all([
        getUserDetailsApi(walletAddress),
        referralRewardApi(walletAddress),
        userAllStakesApi(token),
        claimRewardAmountApi(walletAddress),
        getAllUserCountWeb2Api(),
        getDirectBonusApi(walletAddress),
        getCappingAmountApi(walletAddress),
        getBalanceApi("PUneMiLWZztahJp1LSnyPGTf6McBgfgUNQ"),
        getTotalStakeLengthFromWeb3(walletAddress),
        getInitialReturn(walletAddress)
      ]);

      // Update states as data is received
      setUserDetails(userDetailsApiData?.data);
      setReferralAmount(referralRewardAPiData?.data);

      const updatedStakes = stakesDataArray?.transactions.map(
        (item: TransactionInterface) => ({
          ...item,
          isLoading: false,
        })
      );
      setStakedArray(updatedStakes);

      setClaimRewardAmount(claimRewardApiData?.data);
      setAllUserCount(userCountDataApi?.data);
      setDirectBonus(bonusData?.data);
      setCappingAmount(cappingAmountData?.data);
      setContractAmount(sulAmountData?.data);
      setTotalStakeLengthFromWeb3(totalStakeLengthFromWeb3Data?.data)
      setInitialReturnAmount(initialReturnData?.data)
      console.log("sulamonu", sulAmountData)
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally{
      setComponentLoading(false);
    }
  }
  
  if(!userStateData?.isLogin){
   router.push("/");
  }

  if (isComponentLoading) {
    return <ShimmerEffect />;
  }

  function is24HoursCompleted(lastTime: string): boolean {
    // Split the input into date and time components
    const [datePart, timePart] = lastTime.split(', ');
    if (!datePart || !timePart) {
      console.error("Invalid date format");
      return false;
    }
  
    // Parse date and time into components
    const [day, month, year] = datePart.split('/').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
  
    // Construct the Date object
    const lastTimeDate = new Date(year, month - 1, day, hours, minutes, seconds);
  
    if (isNaN(lastTimeDate.getTime())) {
      console.error("Invalid date object constructed");
      return false;
    }
  
    const currentTime = new Date(); // Get the current date and time
    const timeDifference = currentTime.getTime() - lastTimeDate.getTime(); // Difference in milliseconds
    const hoursDifference = timeDifference / (1000 * 60 * 60); // Convert to hours
  
    return hoursDifference >= 24;
  }

  // STAKE FUNC
  const handleStakeFunc =async (e: React.MouseEvent<HTMLButtonElement> ): Promise<void> => {
    e.preventDefault();
    if(isStakeLoading){
      toast.warning("Staking in progress");
      return;
    }

    setIsStakeLoading(true);
    try {
      if (!stakeAmount || isNaN(parseInt(stakeAmount)) || parseInt(stakeAmount) <= 0) {
        toast.error("Invalid Stake Amount.");
        setIsStakeLoading(false);
        return;
      }

      if(parseInt(stakeAmount)<10){
        toast.error("Sul amount should be greater than or equal to 10.");
        setIsStakeLoading(false);
        return;
      }

      const userResourceDetails = await mainnetUserMainnetResourceApi(userStateData?.dataObject?.walletAddress as string);
      const availableBandwidth =
        ((userResourceDetails?.freeNetLimit ?? 0) + (userResourceDetails?.NetLimit ?? 0)) -
        ((userResourceDetails?.freeNetUsed ?? 0) + (userResourceDetails?.NetUsed ?? 0));
      const availableEnergy =
        (userResourceDetails?.EnergyLimit ?? 0) - (userResourceDetails?.EnergyUsed ?? 0);
  
      if (availableEnergy < 150000) {
        toast.error("Insufficient energy for this transaction. Minimum 150,000 required.");
        return;
      }
  
      if (availableBandwidth < 5000) {
        toast.error("Insufficient bandwidth for this transaction. Minimum 5,000 required.");
        return;
      }

       // USER MUST HAVE A MINIMUM SUL AMOUNT IN THEIR WALLET EQUAL TO OR GREATER THAN THE ENTERED AMOUNT
       const sulAmountOfUser = await getBalanceApi(userStateData?.dataObject?.walletAddress as string);
       console.log("sulAmountOfUser", sulAmountOfUser);
       if (sulAmountOfUser?.data === 0) {
         toast.error(" Insufficient Sul.");
         throw new Error("Insufficient Sul.");
       }
 
       if (sulAmountOfUser?.data < parseInt(stakeAmount)) {
         toast.error("Insufficient Sul.");
         throw new Error("Insufficient Sul.");
       }
       
      // APPROVAL
      const approvalRawData = await approvalApi(userStateData?.dataObject?.walletAddress as string, stakeAmount);
      console.log("approvalRawData", approvalRawData);
      if (!approvalRawData?.data?.transaction) {
        toast.error("Approval Failed!");
        throw new Error("Approval Failed!");
      }

      const signBroadcastTransactionStatusFuncRes = await SignBroadcastTransactionStatus(approvalRawData?.data?.transaction, userStateData?.isUserSR);

      if (!signBroadcastTransactionStatusFuncRes?.txid || !signBroadcastTransactionStatusFuncRes?.transactionStatus) {
        toast.error("Transaction failed . Please try again.");
        return;
      }
      if (signBroadcastTransactionStatusFuncRes.transactionStatus === "REVERT") {
        toast.error("Transaction failed!");
        throw new Error("Transaction failed!");
      }

      const stakedData = await stakeSulBalanceApi(userStateData?.dataObject?.walletAddress as string, stakeAmount, userStateData?.dataObject?.referredBy as string);
      console.log({stakedData});
      if (!stakedData?.data?.transaction) {
        toast.error("Staked Failed!");
        throw new Error("Saked Failed!");
      }

      const stakeSignBroadcastTransactionStatusFuncRes = await SignBroadcastTransactionStatus(stakedData?.data?.transaction, userStateData?.isUserSR);

      if (!stakeSignBroadcastTransactionStatusFuncRes?.txid || !stakeSignBroadcastTransactionStatusFuncRes?.transactionStatus) {
        toast.error("Transaction failed . Please try again.");
        return;
      }

      if (stakeSignBroadcastTransactionStatusFuncRes.transactionStatus === "REVERT") {
        toast.error("Transaction failed!");
        throw new Error("Transaction failed!");
      }

       // CREATE STAKE TRANSACTION WEB2 API
       const web2CreateStakeApiData = await createStakeTransactionWeb2Api(
        userStateData?.dataObject?.walletAddress as string,
        stakeSignBroadcastTransactionStatusFuncRes?.txid,
        parseInt(stakeAmount),
        stakeSignBroadcastTransactionStatusFuncRes?.transactionStatus,
        userStateData?.dataObject?._id as string);

        if(!web2CreateStakeApiData?.data){
                  toast.error("Web2 create stake api failed!")
                  throw new Error("Web2 create stake api failed!");
                }
        
        console.log({web2CreateStakeApiData})

      setStakeAmount("");
      await fetchData();
      toast.success("Staked successfully");
    } catch (error) {
      toast.error("Failed to stake amount!");
      console.error(error);
    } finally{
      setIsStakeLoading(false);
    }
  }

  // CLAIM REWARD FUNC
  const handleClaimRewardFunc = async (e: React.MouseEvent<HTMLButtonElement> ): Promise<void> => {
    e.preventDefault();
    if(isClaimLoading){
      toast.warning("Claiming reward in progress");
      return;
    }

    setIsClaimLoading(true);
    try {

      if(claimRewardAmount<=0){
        toast.error("Insufficient Amount!");
        throw new Error("Insufficient Amount!");
      }

      const userResourceDetails = await mainnetUserMainnetResourceApi(userStateData?.dataObject?.walletAddress as string);
      const availableBandwidth =
        ((userResourceDetails?.freeNetLimit ?? 0) + (userResourceDetails?.NetLimit ?? 0)) -
        ((userResourceDetails?.freeNetUsed ?? 0) + (userResourceDetails?.NetUsed ?? 0));
      const availableEnergy =
        (userResourceDetails?.EnergyLimit ?? 0) - (userResourceDetails?.EnergyUsed ?? 0);
  
      if (availableEnergy < 150000) {
        toast.error("Insufficient energy for this transaction. Minimum 150,000 required.");
        return;
      }
  
      if (availableBandwidth < 5000) {
        toast.error("Insufficient bandwidth for this transaction. Minimum 5,000 required.");
        return;
      }

      // CHECK USER HAVE MORE THAN ZERO AMOUNT TO CLAIM THEIR REWARD
      const claimRewardData = await claimRewardApi(userStateData?.dataObject?.walletAddress as string);
      console.log({claimRewardData});
      if (!claimRewardData?.data?.transaction) {
        toast.error("Claim Reward Failed!");
        throw new Error("Claim Reward Failed!");
      }

      // SIGN TRANSACTION
      const signBroadcastTransactionStatusFuncRes = await SignBroadcastTransactionStatus(claimRewardData?.data?.transaction, userStateData?.isUserSR);

      if (!signBroadcastTransactionStatusFuncRes?.txid || !signBroadcastTransactionStatusFuncRes?.transactionStatus) {
        toast.error("Transaction failed . Please try again.");
        return;
      }

      if (signBroadcastTransactionStatusFuncRes.transactionStatus === "REVERT") {
        toast.error("Transaction failed!");
        throw new Error("Transaction failed!");
      }

        // CREATE WEB2 CLAIM API
        const claimRewardWeb2ApiData = await createClaimRewardWeb2Api(
          userStateData?.dataObject?.walletAddress as string,
          signBroadcastTransactionStatusFuncRes?.txid, 
          claimRewardAmount, 
          signBroadcastTransactionStatusFuncRes?.transactionStatus,
          userStateData?.dataObject?.token as string
        )
        if(!claimRewardWeb2ApiData?.data){
          throw new Error("Create claim reward web2 api failed!");
        }
      console.log({ claimRewardWeb2ApiData });
      await fetchData();
      toast.success("Reward claimed successfully");
    } catch (error) {
      toast.error("Failed to claim reward!");
      console.error(error);
    } finally{
      setIsClaimLoading(false);
    }
  }

  // MINT FUNC
  const handleMintFunc = async (e: React.MouseEvent<HTMLButtonElement>, index:number, amount:number): Promise<void> => {
    e.preventDefault();
    if(isMintLoading){
      toast.warning("Minting in progress");
      return;
    }

    setIsMintLoading(true);
    try {
      const userResourceDetails = await mainnetUserMainnetResourceApi(userStateData?.dataObject?.walletAddress as string);
      const availableBandwidth =
        ((userResourceDetails?.freeNetLimit ?? 0) + (userResourceDetails?.NetLimit ?? 0)) -
        ((userResourceDetails?.freeNetUsed ?? 0) + (userResourceDetails?.NetUsed ?? 0));
      const availableEnergy =
        (userResourceDetails?.EnergyLimit ?? 0) - (userResourceDetails?.EnergyUsed ?? 0);
  
      if (availableEnergy < 150000) {
        toast.error("Insufficient energy for this transaction. Minimum 150,000 required.");
        return;
      }
  
      if (availableBandwidth < 5000) {
        toast.error("Insufficient bandwidth for this transaction. Minimum 5,000 required.");
        return;
      }
      const lastMintedTimeFromWeb3 = await getLastMintTimeFromWeb3(userStateData?.dataObject?.walletAddress as string, index);
      // 24 Hours completed or not
      const isLastMintedTime = is24HoursCompleted(lastMintedTimeFromWeb3?.data?.lastMintedAt);
      if(!isLastMintedTime){
        toast.error("24 hours must pass before minting again.");
        throw new Error("24 hours must pass before minting again.");
      }

       // Update the loading state for the specific item
    setStakedArray((prevState) => {
      const updatedState = [...prevState];
      updatedState[index] = { ...updatedState[index], isLoading: true };
      return updatedState;
    });

      // CHECK USER HAVE MORE THAN ZERO AMOUNT TO CLAIM THEIR REWARD
      const mintData = await mintUserApi(userStateData?.dataObject?.walletAddress as string, index);
      console.log({mintData});
      if (!mintData?.data?.transaction) {
        toast.error("Mint Failed!");
        throw new Error("Mint Failed!");
      }
      
      // SIGN TRANSACTION
      const signBroadcastTransactionStatusFuncRes = await SignBroadcastTransactionStatus(mintData?.data?.transaction, userStateData?.isUserSR);

      if (!signBroadcastTransactionStatusFuncRes?.txid || !signBroadcastTransactionStatusFuncRes?.transactionStatus) {
        toast.error("Transaction failed . Please try again.");
        return;
      }

      if (signBroadcastTransactionStatusFuncRes.transactionStatus === "REVERT") {
        toast.error("Transaction failed!");
        throw new Error("Transaction failed!");
      }

       // WEB2 CREATE MINT API CALLING FUNCTIONS
       const web2MintApiData = await createMintWeb2Api(
        userStateData?.dataObject?.walletAddress as string,
        signBroadcastTransactionStatusFuncRes?.txid, 
        amount, 
        signBroadcastTransactionStatusFuncRes?.transactionStatus,
        userStateData?.dataObject?.token as string)
        console.log({web2MintApiData})

        if(!web2MintApiData){
          throw new Error("Save to DB Web2 Api Failed transaction");
        }

    // UPDATE WEB2 MINT DATA
    //  const web2updateStakeDataApi = await updateStakeByIdWeb2Api(userID);
    //  console.log({web2updateStakeDataApi});
   
    //  if(web2updateStakeDataApi?.statusCode!==200){
    //   throw new Error("Web2 Update Stake APi Failed transaction");
    // }

      await fetchData();
      toast.success("Mint successfully");
    } catch (error) {
      toast.error("Failed to mint!");
      console.error(error);
    } finally{
       // Update the loading flag for the specific item
       setStakedArray((prevState) => {
        const updatedState = [...prevState];
        updatedState[index] = { ...updatedState[index], isLoading: false };
        return updatedState;
      });
    
      setIsMintLoading(false);
    }
  }


  const handleReferralLinkCopy = () => {
    if (userStateData?.dataObject?.walletAddress) {
      navigator.clipboard.writeText(`https://sulmine.sulaana.com/referral/${userStateData?.dataObject?.walletAddress}`)
        .then(() => {
          toast.success("Referral link copied to clipboard");
        })
        .catch((error) => {
          toast.error("Failed to copy referral link");
          console.error(error);
        });
    } else {
      toast.error("Wallet address is not available");
    }
  };

  return (
    <div className="min-h-screen bg-black px-2 md:px-4 py-7">

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Referral Link Section */}
      <div
        className="bg-[linear-gradient(90.11deg,rgba(137,34,179,0.264)_0.11%,rgba(43,37,90,0.1782)_47.67%,rgba(105,26,139,0.264)_99.92%)]
         py-[18px] px-4 rounded-xl flex justify-between items-center"
      >
        <p className="hidden xl:block text-white font-bold text-base truncate">
          Referral link: <span className="font-normal">
          {userStateData?.dataObject?.walletAddress
    ? `${userStateData.dataObject.walletAddress.slice(0, 8)}...${userStateData.dataObject.walletAddress.slice(-8)}`
    : ""}</span>
        </p>
        <p className="block xl:hidden text-white font-bold text-base truncate">
          Referral link: <span className="font-normal">
            {`${userStateData?.dataObject?.walletAddress && userStateData.dataObject.walletAddress.slice(0, 8)}...${userStateData?.dataObject?.walletAddress && userStateData.dataObject.walletAddress.slice(-8)}`}</span>
        </p>
        <svg
        onClick={handleReferralLinkCopy}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="white"
          className="size-6 cursor-pointer"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z"
          />
        </svg>
      </div>

      {/* CAPPING */}
      <div
        className="bg-[linear-gradient(90.11deg,rgba(137,34,179,0.264)_0.11%,rgba(43,37,90,0.1782)_47.67%,rgba(105,26,139,0.264)_99.92%)]
         py-[18px] px-4 rounded-xl flex justify-between items-center"
      >
        <p className="text-white font-bold text-base truncate">
        Capping :
        </p>
        <p className="text-white font-bold text-base">{cappingAmount} / {userDetails && userDetails?.depositAmount*3}</p>
      </div>

      {/* TOTAL USER */}
      <div
        className="bg-[linear-gradient(90.11deg,rgba(137,34,179,0.264)_0.11%,rgba(43,37,90,0.1782)_47.67%,rgba(105,26,139,0.264)_99.92%)]
         py-[18px] px-4 rounded-xl flex justify-between items-center"
      >
        <p className="text-white font-bold text-base truncate">
        Total Users / Total Staked :
        </p>
        <p className="text-white font-bold text-base">{allUserCount} / {contractAmount}</p>
      </div>

      {/* Initial Return */}
      <div
        className="bg-[linear-gradient(90.11deg,rgba(137,34,179,0.264)_0.11%,rgba(43,37,90,0.1782)_47.67%,rgba(105,26,139,0.264)_99.92%)]
         py-[18px] px-4 rounded-xl flex justify-between items-center"
      >
        <p className="text-white font-bold text-base truncate">
        Initial Return :
        </p>
        <p className="text-white font-bold text-base">{initialReturnAmount}</p>
      </div>
      </div>

      {/* Main Content Section */}
      <div className="py-8 rounded-lg grid gap-6 lg:grid-cols-[78%,20%] md:grid-cols-1">
  {/* First Subdiv */}
  <div className="space-y-5 flex flex-col">
    {/* Stats Section */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Individual Stats */}
      {[{ value: userDetails?.depositAmount, text: "Stake Balance", icon: StakeImg },
        { value: userDetails?.totalROI, text: "Mint Balance", icon: Mint },
        { value: directBonus, text: "Direct Bonus", icon: Bonus},
        { value: referralAmount, text: "Referral Earnings", button: "View" }]
        .map(({ value, text, icon, button }, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-b from-[rgba(43,37,90,0.67)] to-[rgba(200,200,200,0.67)] px-6 py-3 rounded-xl flex flex-row justify-between items-center"
          >
            <div className="flex flex-col space-y-0 justify-start">
              <span className="text-2xl md:text-3xl font-bold text-white">
                {value}
              </span>
              <span className="text-xs md:text-base font-medium text-gray-300">{text}</span>
            </div>
            {!button && (
              <Image
                src={icon}
                height={0}
                width={0}
                alt={text}
                className="w-[20%] md:w-[15%]"
              />
            )}
            {button && (
              <Link href="/ReferralEarningTrx" className="text-xs md:text-sm bg-[#D2D2D2] rounded-2xl py-[6px] px-3 md:px-4 font-bold text-black cursor-pointer">
                {button}
              </Link>
            )}
          </div>
        ))}
    </div>

    {/* Action Buttons */}
    <div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Stake Token Section */}
      <div className="border border-black bg-gradient-to-r from-[rgba(138,34,179,0.34)] via-[rgba(43,37,90,0.25)] to-[rgba(105,26,139,0.44)] rounded-xl px-6 md:px-8 py-8 md:py-10 flex flex-col justify-between">
        <p className="text-white font-bold text-2xl md:text-3xl">STAKE TOKEN</p>
        <div className="grid grid-cols-[70%,26%] gap-4 my-8 pb-10 border-b border-gray-400 border-opacity-30">
          <div className="rounded-xl border border-gray-400 border-opacity-30 bg-sul-background px-5 md:px-5 py-5">
          <input
          value={stakeAmount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setStakeAmount(e.target.value)
          }
          className="w-full h-full rounded-xl bg-transparent outline-none placeholder:text-gray-300 text-white"
          type="number"
           placeholder="Enter Amount"
           />
          </div>
          <div className="flex flex-col items-center justify-center bg-sul-background rounded-xl border border-gray-400 border-opacity-30">
            <Image src={SUL} alt="sul-image" height={0} width={0} className="w-[20%] md:w-[25%] pt-1" priority />
            <p className="text-white font-medium text-sm md:text-base pt-1">SUL</p>
          </div>
        </div>
        {
          isStakeLoading?   <div className="w-full rounded-xl flex justify-center bg-gradient-to-r from-[rgba(137,34,179,0.7)] via-[rgba(90,100,214,0.7)] to-[rgba(185,77,228,0.7)] ">
          <Loader />
        </div> : 
        <button
        onClick={handleStakeFunc}
        className="mt-1 w-full bg-gradient-to-r from-[rgba(137,34,179,0.7)] via-[rgba(90,100,214,0.7)] to-[rgba(185,77,228,0.7)] text-white text-lg md:text-2xl font-semibold px-6 py-3 md:py-4 rounded-2xl transform hover:scale-105 transition-transform delay-200">
          STAKE
        </button>
        }
      </div>

      {/* Claim Token Section */}
      <div className="border border-black bg-gradient-to-r from-[rgba(138,34,179,0.34)] via-[rgba(43,37,90,0.25)] to-[rgba(105,26,139,0.44)] rounded-xl px-6 md:px-8 py-8 md:py-10 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <p className="text-white font-bold text-2xl md:text-3xl">CLAIM TOKEN</p>
          <div className="flex items-center space-x-1 cursor-pointer">
            <Link href="/ClaimReward" className="text-white text-xs md:text-sm font-thin">View Rewards</Link>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 4.5l7.5 7.5-7.5 7.5m6-15l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>
        <div className="grid grid-cols-[70%,26%] gap-4 my-8 pb-10 border-b border-gray-400 border-opacity-30">
          <div className="rounded-xl border border-gray-400 border-opacity-30 bg-sul-background px-5 md:px-7 py-3">
            <p className="text-white font-semibold text-xl md:text-2xl">{claimRewardAmount}</p>
            <p className="text-[#DFDFDF] text-sm opacity-70">Reward</p>
          </div>
          <div className="flex flex-col items-center justify-center bg-sul-background rounded-xl border border-gray-400 border-opacity-30">
            <Image src={SUL} alt="sul-image" height={0} width={0} className="w-[20%] md:w-[25%] pt-1" priority />
            <p className="text-white font-medium text-sm md:text-base pt-1">SUL</p>
          </div>
        </div>
        {
          isClaimLoading ?   <div className="w-full rounded-xl flex justify-center bg-gradient-to-r from-[rgba(137,34,179,0.7)] via-[rgba(90,100,214,0.7)] to-[rgba(185,77,228,0.7)] ">
          <Loader />
        </div> :
        <button
        onClick={handleClaimRewardFunc}
        className="mt-1 w-full bg-gradient-to-r from-[rgba(137,34,179,0.7)] via-[rgba(90,100,214,0.7)] to-[rgba(185,77,228,0.7)] text-white text-lg md:text-2xl font-semibold px-6 py-3 md:py-4 rounded-2xl transform hover:scale-105 transition-transform delay-200">
          CLAIM REWARD
        </button>
        }
      </div>
    </div>

    {/* circular timeline */}
    <div className="flex justify-center items-center mt-6 bg-[linear-gradient(90.11deg,rgba(137,34,179,0.264)_0.11%,rgba(43,37,90,0.1782)_47.67%,rgba(105,26,139,0.264)_99.92%)]
         py-[18px] px-4 lg:px-8 rounded-xl ">
      <ProgressBar/>
    </div>
    </div>
  </div>

 {/* Second Subdiv */}
  <div className="space-y-4 md:space-y-[12px] flex flex-col justify-between">
    {[{ value: userDetails?.pool1Reward, text: "Silver Pool", gradient: "bg-silver-pool", imagePath: SilverPool, isEligible: userDetails?.eligiblePool1 },
      { value: userDetails?.pool2Reward, text: "Gold Pool", gradient: "bg-gold-pool", imagePath: GoldPool, isEligible: userDetails?.eligiblePool2 },
      { value: userDetails?.pool3Reward, text: "Emerald Pool", gradient: "bg-platinum-pool", imagePath: EmeraldPool, isEligible: userDetails?.eligiblePool3},
      { value: userDetails?.pool4Reward, text: "Platinum  Pool", gradient: "bg-diamond-pool", imagePath: PlatinumPool, isEligible: userDetails?.eligiblePool4},
      { value: userDetails?.pool5Reward, text: "Diamond Pool", gradient: "bg-crown-diamond-pool", imagePath: DiamondPool, isEligible: userDetails?.eligiblePool5},
      { value: userDetails?.pool6Reward, text: "Crown Diamond Pool", gradient: "bg-gold-pool", imagePath: CrownDiamondPool, isEligible: userDetails?.eligiblePool6 },
      { value: userDetails?.pool7Reward, text: "Titanium Pool", gradient: "bg-platinum-pool", imagePath: titaniumPool, isEligible: userDetails?.eligiblePool7},
      { value: userDetails?.pool8Reward, text: "Palladium Pool", gradient: "bg-diamond-pool", imagePath: palladiumPool, isEligible: userDetails?.eligiblePool8},
    ]
      .map(({ value, text, gradient, imagePath, isEligible }, idx) => (
        <div
          key={idx}
          className={`bg-opacity-30 px-4 py-3 lg:py-4 xl:py-[10px] rounded-xl flex items-center justify-between text-white
             ${isEligible? gradient : "bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500"} `}
        >
          <div className="flex flex-col justify-center">
            <span className="text-lg md:text-2xl font-bold">{value}</span>
            <span className="text-xs md:text-sm font-normal">{text}</span>
          </div>
          <Image
            src={imagePath}
            alt={text}
            height={0}
            width={0}
            className="w-[20%] md:w-[15%]"
          />
        </div>
      ))}
  </div>
      </div>
       
      {/* Mint Table */}
      <div className="bg-gradient-to-b from-[rgba(43,37,90,0.34)] to-[rgba(200,200,200,0.09)] rounded-xl border-gray-400 border-[1px] border-opacity-30 p-4 my-4 w-full overflow-x-auto">
  {/* Header Section */}
  <div className="bg-[#212D49] rounded-xl text-white flex flex-row items-center justify-between py-2 min-w-[850px] md:min-w-0">
    <p className="font-bold px-8 py-2 w-[20%] text-left">Amount / InitialReturn</p>
    <p className="font-bold px-4 py-2 w-[20%] text-center">Maturity Days</p>
    <p className="font-bold px-8 py-2 w-[20%] text-center">Deposit Phase</p>
    <p className="font-bold px-4 py-2 w-[20%] text-center">Invest Date</p>
    <p className="font-bold px-4 py-2 w-[20%] text-center">Last Mint</p>
    <p className="font-bold px-8 py-2 w-[20%] text-right">Mint Reward</p>
  </div>

  {/* Data Rows */}
  {
    Array.from({ length: totalStakeLengthFromWeb3 }, (_, index) => {
      return (
     <>
          <FetchTime
            userStateData={userStateData}
            index={index}
            buttonClick={handleMintFunc}
          />
          </>
      );
    })
  }
</div>
      {/* Transaction Table */}
      <p className="font-bold text-white text-3xl mt-8 mb-4 pl-2 ">Transactions</p>
     <MintedTransactions  />
    </div>
  );
};

export default DashBoard;
