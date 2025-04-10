"use client";

import { getStakeAmountApi } from "@/api/apiFunctions";
import React, { useState, useEffect } from "react";

interface CircleProgressProps {
  size?: number; // diameter in px
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  apiEndpoint?: string; // API endpoint to fetch stake amount
}

const CircleProgress: React.FC<CircleProgressProps> = ({
  size = 300,
  strokeWidth = 6,
  color = "#8A3AB0",
  bgColor = "#ffffff",
  apiEndpoint = "/api/getStakeAmount", // Default API endpoint
}) => {
  const [stakeAmount, setStakeAmount] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [phaseGoal, setPhaseGoal] = useState(300000); // Default to Phase 1 goal

  // Phase configurations
  const phaseGoals = {
    1: 300000, // 3 Lakh
    2: 500000, // 5 Lakh
    3: 700000, // 7 Lakh
    4: 900000  , // 9 Lakh
    5: 1100000, // 11 Lakh
    6: 1300000 , // 13 Lakh
  };

  useEffect(() => {
    const fetchStakeAmount = async () => {
      try {
        const amount = await getStakeAmountApi();
        setStakeAmount(amount?.data);
        // Determine phase based on amount
        determinePhase(amount?.data);
      } catch (error) {
        console.error("Error fetching stake amount:", error);
      }
    };
    console.log({stakeAmount})

    fetchStakeAmount();
  }, [apiEndpoint]);

  // Determine which phase the amount falls into
  const determinePhase = (amount: number) => {
    let phase: number;
    let goal: number;

    switch (true) {
      case amount < phaseGoals[1]:
        phase = 1;
        goal = phaseGoals[1];
        break;
      case amount < phaseGoals[2]:
        phase = 2;
        goal = phaseGoals[2];
        break;
      case amount < phaseGoals[3]:
        phase = 3;
        goal = phaseGoals[3];
        break;
      case amount < phaseGoals[4]:
        phase = 4;
        goal = phaseGoals[4];
        break;
      case amount < phaseGoals[5]:
        phase = 5;
        goal = phaseGoals[5];
        break;
      case amount < phaseGoals[6]:
        phase = 6;
        goal = phaseGoals[6];
        break;
      default:
        // If amount exceeds all phases, use the highest phase
        phase = 6;
        goal = phaseGoals[6];
    }
    setCurrentPhase(phase);
    setPhaseGoal(goal);
  };

  // Calculate progress based on the current phase goal
  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(stakeAmount / phaseGoal, 1);
  const strokeDashoffset = circumference * (1 - progress);

  // Improved format function to handle small values showing like 3.0L, 5.0L and so on
  // const formatAmount = (amount: number) => {
  //   if (amount >= 100000) {
  //     // For values >= 1 Lakh, show in Lakh format
  //     return `${(amount / 100000).toFixed(1)}L`;
  //   } else if (amount >= 1000) {
  //     // For values >= 1,000, show in K format
  //     return `${(amount / 1000).toFixed(1)}K`;
  //   } else {
  //     // For smaller values, show the actual number
  //     return amount.toString();
  //   }
  // };
  
   // Improved format function to handle small values showing like 300k SUL, 500K SUL and so on
  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1).replace(/\.0$/, "")}M SUL`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K SUL`;
    } else {
      return `${amount} SUL`;
    }
  };
  

  return (
    <div style={{ width: size, height: size }} className="relative">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="circle-progress-circle"
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        <circle
          className="circle-progress-value"
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />

        {/* Center text showing amount */}
        <text
          x="50"
          y="40"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="10"
          fill={color}
          fontWeight="bold"
        >
          {stakeAmount ? stakeAmount.toLocaleString() : "0"} SUL
        </text>

        {/* Phase information */}
        <text
          x="50"
          y="52"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="8"
          fill={color}
        >
          Phase {currentPhase} : {formatAmount(phaseGoal)}
        </text>

        {/* Progress percentage */}
        <text
          x="50"
          y="68"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="7"
          fill={bgColor}
        >
          {/* {Math.round(progress * 100)}% Complete */}
          {(progress * 100).toFixed(2)}% Complete

        </text>
      </svg>
    </div>
  );
};

export default CircleProgress;
