"use client";
import { getAllReferralsTreeWeb2Api, getDownlineBusinessFund } from "@/api/apiFunctions";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import DynamicTeamAmount from "./DynamicAmount";

const ReferralEarnings = () => {
  const [expandedLevel, setExpandedLevel] = useState(null);
  const userStateData = useSelector((state) => state?.wallet);
  const [referralEarnings, setReferralEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downlineBussinessAmount, setDownlineBussinessAmount] = useState(0);

  useEffect(() => {
    if (userStateData?.isLogin) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true); // Start loading
    try {
      const userReferralTreeData = await getAllReferralsTreeWeb2Api(
        userStateData?.dataObject?.token
      );
      console.log({ userReferralTreeData });
    
      setReferralEarnings(userReferralTreeData);

      const downlineBusinessAmountData = await getDownlineBusinessFund(userStateData?.dataObject?.walletAddress);
      setDownlineBussinessAmount(downlineBusinessAmountData?.totalDownlineFunds);
      console.log("dfhdhfhhdhfhdhfhdhh", downlineBusinessAmountData?.totalDownlineFunds)
    } catch (error) {
      console.error("Error fetching referral data:", error);
      setReferralEarnings(null);
    } finally {
      setLoading(false); // End loading
    }
  };
  console.log({referralEarnings});
  console.log("referaldata......", referralEarnings?.data);

  const toggleLevel = (level) => {
    setExpandedLevel(expandedLevel === level ? null : level);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  return (
    <div className="min-h-screen bg-black px-2 md:px-6 py-8">
     <div className="bg-gradient-to-br from-gray-400/50 to-gray-400/30 px-4 py-6 md:px-8 rounded-2xl shadow-lg">
        {/* Total Balance */}
        <div className="flex flex-col md:flex-row md:items-center justify-between text-gray-200">
          <p className="text-sm md:text-lg font-bold mb-4">
            Wallet Address: {userStateData?.dataObject?.walletAddress || "N/A"}
          </p>
          <p className="text-sm md:text-lg font-bold mb-4">
          Total Team Business: {downlineBussinessAmount || 0}
          </p>
        </div>

        {/* Main Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center text-white font-bold py-4">
              Loading...
            </div>
          ) : referralEarnings?.data? (
            <table className="w-full text-white text-sm border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-gray-800 rounded-md text-xs md:text-base">
                  <th className="p-3 pl-8 text-left rounded-l-md">Level</th>
                  <th className="p-3 text-center">Total Wallets</th>
                  <th className="p-3 text-center">Total Investments</th>
                  <th className="p-3 text-center rounded-r-md">See More</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(referralEarnings?.data|| {})
                  .filter((key) => key.startsWith("level") && key.endsWith("Count"))
                  .map((key, index) => {
                    const level = index + 1;
                    const countKey = `level${level}Count`;
                    const depositKey = `level${level}TotalDeposit`;
                    const referralsKey = `level${level}Referrals`;
                    const referrals =
                      referralEarnings?.data?.[referralsKey] || [];

                    return (
                      <React.Fragment key={level}>
                        <tr
                          className={`${
                            index % 2 === 0
                              ? "bg-gray-800/50"
                              : "bg-gray-800/80"
                          } hover:bg-[#2B255A]/50 t ransition duration-300 rounded-lg`}
                        >
                          <td className="p-3 pl-8 text-xs md:text-sm rounded-l-md">
                            {level}
                          </td>
                          <td className="p-3 text-center text-xs md:text-sm">
                            {referralEarnings?.data?.[countKey] || 0}
                          </td>
                          <td className="p-3 text-center text-xs md:text-sm">
                            {referralEarnings?.data?.[depositKey] || 0}
                          </td>
                          <td className="p-3 text-center text-gray-400 cursor-pointer rounded-r-md flex justify-center items-center space-x-2">
                            <span onClick={() => toggleLevel(level)}>
                              {expandedLevel === level ? (
                                <FaChevronUp />
                              ) : (
                                <FaChevronDown />
                              )}
                            </span>
                          </td>
                        </tr>

                        {/* Expanded Referrals Table */}
                        {expandedLevel === level && (
                          <tr>
                            <td
                              colSpan={4}
                              className="p-4 bg-gray-800/90 rounded-md"
                            >
                              <div className="overflow-x-auto">
                                <table className="w-full text-gray-300 text-xs md:text-sm">
                                  <thead>
                                    <tr className="bg-gray-700 rounded-md text-base">
                                      <th className="p-2 pl-6 text-left rounded-l-md">
                                        Sr. No
                                      </th>
                                      <th className="p-2 text-center">
                                        Wallet Address
                                      </th>
                                      <th className="p-2 text-center">
                                        Amount
                                      </th>
                                      <th className="p-2 text-center">
                                        Joining Date
                                      </th>
                                      <th className="p-2 text-right pr-6 rounded-r-md">
                                       Team Amount
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {referrals.map((referral, index) => (
                                      <tr
                                        key={index}
                                        className="hover:bg-[#2B255A]/40 transition duration-300"
                                      >
                                        <td className="p-2 pl-6">
                                          {index + 1}
                                        </td>
                                        <td className="p-2 text-center truncate">
                                          {referral.walletAddress}
                                        </td>
                                        <td className="p-2 text-center">
                                          {referral.depositAmount}
                                        </td>
                                        <td className="p-2 text-center">
                                          {formatDate(referral.createdAt)}
                                        </td>
                                        <td className="p-2 text-right pr-6">
                                        <DynamicTeamAmount walletAddress={referral.walletAddress} />
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </table>
          ) : (
            <p className="text-white text-center font-bold text-xl py-4">
              No Data Found!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralEarnings;
