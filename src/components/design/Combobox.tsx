'use client';

import React, { useState, useRef, useEffect } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useAppSelector } from '@/store';
import { scale, verticalScale } from '@/utils/responsiveSize';
import ArrowDownIcon from '@/components/icons/ArrowDownIcon';

interface ComboboxItem {
  id?: number | string;
  name: string;
  code?: string;
}

interface ComboboxProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options?: ComboboxItem[];
  items?: ComboboxItem[];
  placeholder?: string;
  backgroundColor?: string;
  width?: string;
  height?: string;
  fontSize?: number;
  className?: string;
  disabled?: boolean;
}

export default function Combobox({
  label,
  value,
  onChange,
  options,
  items,
  placeholder = 'اختر من القائمة',
  backgroundColor = colors.WHITE,
  width = '100%',
  height = '100%',
  fontSize,
  className = '',
  disabled = false,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState('right');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { size } = useAppSelector(state => state.user);

  // Use options or items, with fallback to empty array
  const dataItems = options || items || [];
  
  const filteredItems = dataItems.filter(item => 
    item && item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedItem = dataItems.find(item => 
    item && item.name && (item.name === value || (item.code && item.code === value))
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // حساب موضع القائمة المنسدلة بشكل ذكي
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const dropdownWidth = scale(280); // عرض أكبر للقائمة

      // حساب المساحة المتاحة في كل اتجاه
      const spaceRight = screenWidth - containerRect.left;
      const spaceLeft = containerRect.right;

      // تحديد الاتجاه الأفضل أفقياً
      let horizontalPosition = 'left'; // افتراضي: فتح لليسار (في RTL)
      let dynamicStyle: React.CSSProperties = {};

      if (spaceRight >= dropdownWidth) {
        // مساحة كافية لفتح القائمة لليسار (الاتجاه الطبيعي في RTL)
        horizontalPosition = 'left';
        dynamicStyle = { left: 0 };
      } else if (spaceLeft >= dropdownWidth) {
        // فتح لليمين إذا لم تكن هناك مساحة لليسار
        horizontalPosition = 'right';
        dynamicStyle = { right: 0 };
      } else {
        // إذا لم تكن هناك مساحة كافية، استخدم كامل العرض المتاح
        if (spaceRight > spaceLeft) {
          horizontalPosition = 'left';
          dynamicStyle = {
            left: 0,
            width: `${Math.min(spaceRight - 20, scale(280))}px` // 20px margin
          };
        } else {
          horizontalPosition = 'right';
          dynamicStyle = {
            right: 0,
            width: `${Math.min(spaceLeft - 20, scale(280))}px` // 20px margin
          };
        }
      }

      setDropdownPosition(horizontalPosition);
      setDropdownStyle(dynamicStyle);
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label
          className="block text-gray-700 text-right"
          style={{
            fontSize: `${scale(14 + size)}px`,
            fontFamily: fonts.IBMPlexSansArabicMedium,
            marginBottom: `${scale(8)}px`,
            fontWeight: 500
          }}
        >
          {label}
        </label>
      )}
      <div
        ref={dropdownRef}
        className="relative"
        style={{ width, height }}
      >
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full h-full text-center
          border rounded-xl
          flex items-center justify-center
          hover:border-blue transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
          relative
        `}
        style={{
          backgroundColor,
          fontSize: fontSize || scale(15 + size),
          padding: `${scale(12)}px ${scale(16)}px`,
          borderColor: colors.BORDERCOLOR,
          borderRadius: `${scale(12)}px`,
          fontFamily: fonts.IBMPlexSansArabicMedium
        }}
      >
        <span
          className="text-black flex-1"
          style={{
            direction: 'ltr',
            unicodeBidi: 'embed',
            textAlign: 'center'
          }}
        >
          {selectedItem ? (selectedItem.code || selectedItem.name) : (value || placeholder)}
        </span>
        <span
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          style={{
            position: 'absolute',
            left: `${scale(12)}px`,
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          <ArrowDownIcon
            stroke="currentColor"
            width={scale(16)}
            height={scale(16)}
          />
        </span>
      </button>

      {isOpen && (
        <div
          className={`absolute top-full bg-white border overflow-hidden z-50 sm:max-w-none max-w-[calc(100vw-40px)]`}
          style={{
            marginTop: `${scale(4)}px`,
            borderColor: colors.BORDERCOLOR,
            borderRadius: `${scale(12)}px`,
            width: `${scale(280)}px`, // عرض افتراضي
            minWidth: `${scale(200)}px`, // حد أدنى للعرض
            maxHeight: `${verticalScale(280)}px`,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            // تطبيق التموضع المحسوب ديناميكياً
            ...dropdownStyle,
          }}
        >
          <div
            className="border-b"
            style={{
              padding: `${scale(12)}px`,
              borderBottomColor: colors.BORDERCOLOR
            }}
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث..."
              className="w-full border rounded-md text-right transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                fontSize: scale(12 + size),
                padding: `${scale(8)}px ${scale(12)}px`,
                borderColor: colors.BORDERCOLOR,
                borderRadius: `${scale(6)}px`,
                fontFamily: fonts.IBMPlexSansArabicMedium
              }}
            />
          </div>

          <div
            className="overflow-y-auto"
            style={{ maxHeight: `${verticalScale(220)}px` }}
          >
            {filteredItems.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  onChange(item.code || item.name);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className={`
                  w-full text-right hover:bg-gray-50 active:bg-gray-100
                  transition-colors duration-200 border-b border-gray-100 last:border-b-0
                  ${(item.name === value || item.code === value) ? 'bg-blue-50 hover:bg-blue-100' : 'text-gray-700'}
                `}
                style={{
                  padding: `${scale(14)}px ${scale(16)}px`, // padding أكبر قليلاً
                  minHeight: `${scale(48)}px`, // حد أدنى للارتفاع لسهولة النقر
                }}
              >
                <div
                  className="flex items-center justify-between w-full"
                  style={{ gap: `${scale(12)}px` }} // مسافة أكبر بين العناصر
                >
                  <span
                    className="font-ibm-arabic-medium flex-1 text-right"
                    style={{
                      fontSize: scale(14 + size), // خط أكبر قليلاً
                      color: (item.name === value || item.code === value) ? colors.BLUE : '#374151',
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      lineHeight: 1.5, // line height أفضل للقراءة
                      wordBreak: 'break-word', // كسر الكلمات الطويلة
                    }}
                  >
                    {item.name}
                  </span>
                  {item.code && (
                    <span
                      className="font-ibm-arabic-bold flex-shrink-0"
                      style={{
                        fontSize: scale(13 + size), // خط أكبر قليلاً
                        direction: 'ltr',
                        unicodeBidi: 'embed',
                        color: (item.name === value || item.code === value) ? colors.BLUE : colors.BLUE,
                        fontFamily: fonts.IBMPlexSansArabicBold,
                        lineHeight: 1.4,
                        backgroundColor: (item.name === value || item.code === value) ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                        padding: `${scale(4)}px ${scale(8)}px`,
                        borderRadius: `${scale(6)}px`,
                        border: `1px solid ${(item.name === value || item.code === value) ? colors.BLUE : 'rgba(59, 130, 246, 0.2)'}`,
                      }}
                    >
                      {item.code}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
