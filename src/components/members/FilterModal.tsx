'use client';

import { useState } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';
import ButtonLong from '@/components/design/ButtonLong';

interface FilterModalProps {
  currentFilter: string;
  onApply: (filter: string) => void;
  onClose: () => void;
}

const filterOptions = [
  { id: 'all', name: 'الكل' },
  { id: 'Admin', name: 'مدير' },
  { id: 'مالية', name: 'مالية' },
  { id: 'مدير عام', name: 'مدير عام' },
  { id: 'موظف', name: 'موظف' },
  { id: 'مهندس موقع', name: 'مهندس موقع' },
  { id: 'مستشار جودة', name: 'مستشار جودة' },
  { id: 'مدير عقود', name: 'مدير عقود' },
  { id: 'مقاول', name: 'مقاول' },
  { id: 'مراقب جودة', name: 'مراقب جودة' },
  { id: 'مدخل بيانات', name: 'مدخل بيانات' },
];

export default function FilterModal({ currentFilter, onApply, onClose }: FilterModalProps) {
  const { size } = useAppSelector((state: any) => state.user);
  const [selectedFilter, setSelectedFilter] = useState(currentFilter);

  const handleApply = () => {
    onApply(selectedFilter);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-100 p-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          
          <h2 
            className="font-bold text-lg"
            style={{
              fontFamily: fonts.IBMPlexSansArabicSemiBold,
              fontSize: verticalScale(16 + size),
              color: colors.BLACK
            }}
          >
            فلترة الأعضاء
          </h2>
          
          <div className="w-10" />
        </div>

        {/* Filter Options */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedFilter(option.id)}
                className={`
                  w-full p-3 rounded-lg text-right transition-all
                  ${selectedFilter === option.id 
                    ? 'bg-blue text-white' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span 
                    style={{
                      fontFamily: fonts.CAIROBOLD,
                      fontSize: verticalScale(14 + size)
                    }}
                  >
                    {option.name}
                  </span>
                  
                  {selectedFilter === option.id && (
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            style={{
              fontFamily: fonts.CAIROBOLD,
              fontSize: 14 + size
            }}
          >
            إلغاء
          </button>
          
          <ButtonLong
            text="تطبيق"
            Press={handleApply}
            styleButton={{ flex: 1 }}
          />
        </div>
      </div>
    </div>
  );
}
