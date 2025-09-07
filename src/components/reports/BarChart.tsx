'use client';

import React, { useEffect, useState } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { verticalScale } from '@/utils/responsiveSize';

interface BarData {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  className?: string;
  animated?: boolean;
}

export default function BarChart({
  data,
  height = 180,
  className = '',
  animated = true
}: BarChartProps) {
  const [animatedHeights, setAnimatedHeights] = useState<number[]>(
    animated ? new Array(data.length).fill(0) : data.map(item => item.value)
  );

  const maxValue = Math.max(...data.map(item => item.value), 1);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedHeights(data.map(item => item.value));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [data, animated]);

  const getBarHeight = (value: number, index: number) => {
    const currentValue = animated ? animatedHeights[index] : value;
    return (currentValue / maxValue) * height;
  };



  return (
    <div className={`w-full ${className}`}>
      <div 
        className="flex justify-around items-end px-4"
        style={{ height: height + 60 }}
      >
        {data.map((item, index) => {
          const barHeight = getBarHeight(item.value, index);
          
          return (
            <div 
              key={index}
              className="flex flex-col items-center"
              style={{ width: '70px' }}
            >

              
              {/* الشريط */}
              <div 
                className="w-10 rounded-t-lg transition-all duration-1000 ease-out"
                style={{
                  height: `${barHeight}px`,
                  backgroundColor: item.color,
                  minHeight: item.value > 0 ? '4px' : '0px'
                }}
              />
              
              {/* تسمية الشريط */}
              <div 
                className="mt-2 text-center"
                style={{
                  fontFamily: fonts.IBMPlexSansArabicRegular,
                  fontSize: verticalScale(14),
                  color: colors.BLACK
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// مكون مخصص للبيانات المالية
interface FinancialBarChartProps {
  revenue?: number;
  expense?: number;
  returns?: number;
  height?: number;
  className?: string;
}

export function FinancialBarChart({
  revenue = 0,
  expense = 0,
  returns = 0,
  height = 180,
  className = ''
}: FinancialBarChartProps) {
  const data: BarData[] = [
    {
      label: 'عهد',
      value: revenue,
      color: '#1abc9c'
    },
    {
      label: 'مصروفات',
      value: expense,
      color: '#FF0F0F'
    },
    {
      label: 'مرتجعات',
      value: returns,
      color: '#FFAA05'
    }
  ];

  return (
    <BarChart 
      data={data} 
      height={height} 
      className={className}
      animated={true}
    />
  );
}
