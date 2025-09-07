'use client';

import React from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { verticalScale } from '@/utils/responsiveSize';

interface ProgressChartProps {
  total: number;
  completed: number;
  pending?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function ProgressChart({
  total = 1,
  completed = 0,
  pending = 0,
  size = 220,
  strokeWidth = 20,
  className = ''
}: ProgressChartProps) {
  const radius = 90;
  const center = size / 2;
  const circumference = Math.PI * radius;
  
  const percentCompleted = total > 0 ? (completed / total) * 100 : 0;
  const percentPending = total > 0 ? (pending / total) * 100 : 0;
  
  // تصحيح النسب
  const percentCompletedFixed = Math.max(0, Math.min(100, percentCompleted));
  const percentPendingFixed = Math.max(0, Math.min(100, percentPending));
  
  // حساب أطوال الأقواس
  const arcLengthCompleted = circumference * (percentCompletedFixed / 100);
  const arcLengthPending = circumference * (percentPendingFixed / 100);
  
  // إحداثيات المسار
  const startX = center - radius;
  const startY = center;
  const endX = center + radius;
  const endY = center;
  
  const pathData = `M ${startX},${startY} A ${radius},${radius} 0 0,1 ${endX},${endY}`;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
          {/* المسار الخلفي */}
          <path
            d={pathData}
            fill="none"
            stroke="#eee"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* مسار المهام المكتملة */}
          <path
            d={pathData}
            fill="none"
            stroke={colors.BLUE}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLengthCompleted},${circumference}`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          

          
          {/* النص المركزي */}
          <text
            x={center}
            y={center - 10}
            textAnchor="middle"
            className="text-3xl font-bold"
            style={{
              fontFamily: fonts.IBMPlexSansArabicBold,
              fontSize: verticalScale(32),
              fill: colors.BLUE
            }}
          >
            {percentCompletedFixed.toFixed(1)}%
          </text>
        </svg>
      </div>
      
      <div className="mt-4 text-center">
        <div 
          className="text-xl font-bold mb-1"
          style={{
            fontFamily: fonts.IBMPlexSansArabicSemiBold,
            fontSize: verticalScale(22),
            color: colors.BLUE
          }}
        >
          منجز
        </div>
        <div 
          style={{
            fontFamily: fonts.IBMPlexSansArabicRegular,
            fontSize: verticalScale(16),
            color: '#1abc9c'
          }}
        >
          {completed} / {total} مهمة
        </div>
        
        {pending > 0 && (
          <div 
            className="mt-2"
            style={{
              fontFamily: fonts.IBMPlexSansArabicRegular,
              fontSize: verticalScale(14),
              color: '#FFAA05'
            }}
          >
            {pending} مهمة معلقة
          </div>
        )}
      </div>
    </div>
  );
}
