'use client';

import React from 'react';

interface CircleProgressProps {
  max?: number;
  value: number;
  textFormat?: 'percent' | 'value';
  size?: number; // diameter in px
  strokeWidth?: number;
  color?: string; // main color (e.g. hsl value or Tailwind class)
  bgColor?: string;
}

const CircleProgress: React.FC<CircleProgressProps> = ({
  max = 100,
  value,
  textFormat = 'percent',
  size = 260,
  strokeWidth = 6,
  color = '#8A3AB0',
  bgColor = '#43479D',
}) => {
  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const strokeDashoffset = circumference * (1 - progress);
  const displayText = textFormat === 'percent'
    ? `${Math.round(progress * 100)}%`
    : `${value}`;

  return (
    <div style={{ width: size, height: size }} className="relative">
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
      >
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
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
       <text
  x="50"
  y="50"
  textAnchor="middle"
  dominantBaseline="central"
  fontSize="16"
  fill={color}
>
  {displayText}
</text>

      </svg>
    </div>
  );
};

export default CircleProgress;
