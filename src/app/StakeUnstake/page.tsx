"use client";
import { TransactionInterface } from "@/interface";
import Loader from "../components/Loader";
import { useEffect, useState } from "react";
import { mainnetUserMainnetResourceApi, stakeUnstakeByIdWeb2Api, unstakeApi, userAllUnStakesApi } from "@/api/apiFunctions";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import Link from "next/link";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import ShimmerEffect from "../components/ShimmerEffect";
import { SignBroadcastTransactionStatus } from "@/lib/signBroadcastTransactionStatus";
import Pagination from "../components/Pagination";

const StakeUnstakePage: React.FC = () => {
  const router = useRouter();
  const [isComponentLoading, setComponentLoading] = useState <boolean>(false);
  const userStateData = useSelector((state: RootState)=>state?.wallet);
  const [allStakedArray, setAllStakedArray] = useState<TransactionInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchData = async()=>{
    setComponentLoading(true);
    const stakesDataArray = await userAllUnStakesApi(userStateData?.dataObject?.token as string, currentPage);
    console.log({stakesDataArray});
    setTotalCount(stakesDataArray?.data?.transactionCount);
    const updatedStakes = stakesDataArray.data.transactions.map((item: TransactionInterface) => ({
      ...item,
      isLoading: false, // Once data is fetched, set isLoading to false
    }));
    console.log("page stakeUnstake",updatedStakes);
    setAllStakedArray(updatedStakes);
    setComponentLoading(false);
  }

  useEffect(()=>{
    if(userStateData?.isLogin){
     fetchData();
    }
  },[currentPage])

  if(!userStateData?.isLogin){
    router.push("/");
   }
 
   if (isComponentLoading) {
     return <ShimmerEffect />;
   }

  const handleUnstakeFunc = async (e: React.MouseEvent<HTMLButtonElement>, index:number, id:string, mintCount:number): Promise<void> => {
    e.preventDefault();
    
    if(isLoading){
      toast.warning("Unstaking in progress");
      return;
    }

    try {
      // CHECK MINT COUNT IS GREATER THAN OR EQUAL TO 10
      if(mintCount!==1000){
        toast.error("Mint count should be greater than or equal to 1000.");
        return;
      }

      setIsLoading(true);
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
      setAllStakedArray((prevState) => {
        const updatedState = [...prevState];
        updatedState[index] = { ...updatedState[index], isLoading: true };
        return updatedState;
      });
      console.log("index",index, "id", id, "mintCount", mintCount)
     const unstakeApiData =  await unstakeApi(userStateData?.dataObject?.walletAddress as string, index);

     if (!unstakeApiData?.data?.transaction) {
      toast.error("Mint Failed!");
      throw new Error("Mint Failed!");
    }

    // SIGN TRANSACTION
    const signBroadcastTransactionStatusFuncRes = await SignBroadcastTransactionStatus(unstakeApiData?.data?.transaction, userStateData?.isUserSR);

    if (!signBroadcastTransactionStatusFuncRes?.txid || !signBroadcastTransactionStatusFuncRes?.transactionStatus) {
      toast.error("Transaction failed . Please try again.");
      return;
    }

      if (signBroadcastTransactionStatusFuncRes.transactionStatus === "REVERT") {
        toast.error("Transaction failed!");
        throw new Error("Transaction failed!");
      }

      // STAKEUNSTAKE TRANSACTION WEB2 API CALLING
      const stakeUnstakeByIdApiData = await stakeUnstakeByIdWeb2Api(id);
      console.log({ stakeUnstakeByIdApiData });

      if(stakeUnstakeByIdApiData?.statusCode!==200){
        toast.error("Web2 create unstake api failed!");
        throw new Error("Web2 create unstake api failed!");
      }
      
      toast.success("Unstake successful!");
     await fetchData(); 
    } catch (error) {
      toast.error("Failed to unstake!");
      console.error(error);
    } finally{
      setAllStakedArray((prevState) => {
        const updatedState = [...prevState];
        updatedState[index] = { ...updatedState[index], isLoading: false };
        return updatedState;
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black px-2 md:px-4 py-7">
      <div className="bg-gradient-to-b from-[rgba(43,37,90,0.34)] to-[rgba(200,200,200,0.09)] rounded-xl border-gray-400 border-[1px] border-opacity-30 p-4 my-4 w-full overflow-x-auto">
        {/* Header Section */}
        <div className="bg-[#212D49] rounded-xl text-white flex flex-row items-center justify-between py-2 min-w-[850px] md:min-w-0">
          <p className="font-bold px-8 py-2 w-[25%] text-left">Invest Date</p>
          <p className="font-bold px-8 py-2 w-[25%] text-center">Amount</p>
          <p className="font-bold px-4 py-2 w-[25%] text-center">
            Mint Count
          </p>
          <p className="font-bold px-8 py-2 w-[25%] text-right">Action</p>
        </div>

        {/* Data Row Section */}
        {
        allStakedArray.length > 0 ? allStakedArray.map((item, index) => {
          return (
            <>
              { (
                <Link href={`https://poxscan.io/transactions-detail/${item?.trxId}`}
                  className={`${item.isUnstaked ? "text-gray-500" : "text-white"} flex flex-row items-center justify-between pt-4 min-w-[850px] md:min-w-0 pb-2 border-b border-gray-400 border-opacity-30 last:border-0`}
                  key={index}
                >
                  <p className="px-8 py-2 w-[25%] text-left">{new Date(item?.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
                  <p className="px-4 py-2 w-[25%] text-center">
                    {item?.amount}
                  </p>
                  <p className="px-4 py-2 w-[25%] text-left lg:text-center">
                    {item?.mintCount} / 1000
                  </p>
                  <div className="lg:w-[25%] px-4 flex justify-end">
                    {item.isLoading ? (
                      <div className="w-full lg:w-[40%] rounded-xl flex justify-center bg-gradient-to-r from-[rgba(137,34,179,0.7)] via-[rgba(90,100,214,0.7)] to-[rgba(185,77,228,0.7)] ">
                        <Loader />
                      </div>
                    ) : (
                      <button
                      disabled={item.isUnstaked }
                        onClick={(e) => handleUnstakeFunc(e, index, item?._id, item?.mintCount)}
                        className={`w-full lg:w-[40%] ${item.isUnstaked ? "bg-gradient-to-r from-[rgba(137,34,179,0.3)] via-[rgba(90,100,214,0.3)] to-[rgba(185,77,228,0.3)]" : "bg-gradient-to-r from-[rgba(137,34,179,0.7)] via-[rgba(90,100,214,0.7)] to-[rgba(185,77,228,0.7)]"} 
         text-white text-lg font-semibold px-4 py-2 rounded-xl transform hover:scale-105 transition delay-300`}
                      >
                        Unstake
                      </button>
                    )}
                  </div>
                </Link>
              )}
            </>
          );
        })
      :
      <p className="text-white font-bold text-xl pl-4 pt-4">Not staked Data Found !
        </p>}
      </div>

      <Pagination totalRecords={totalCount || 0} setPageNo={setCurrentPage} currentMintTrxPage={currentPage}/>
    </div>
  );
};

export default StakeUnstakePage;