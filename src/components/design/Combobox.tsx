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
          className="block text-right"
          style={{
            fontSize: `${scale(14 + size)}px`,
            fontFamily: fonts.IBMPlexSansArabicMedium,
            marginBottom: `${scale(8)}px`,
            fontWeight: 500,
            color: 'var(--theme-text-primary)'
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
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
          relative
        `}
        style={{
          backgroundColor: disabled
            ? 'var(--theme-surface-secondary)'
            : 'var(--theme-input-background)',
          fontSize: fontSize || scale(15 + size),
          padding: `${scale(12)}px ${scale(16)}px`,
          borderColor: isOpen
            ? 'var(--theme-primary)'
            : 'var(--theme-border)',
          borderRadius: `${scale(12)}px`,
          fontFamily: fonts.IBMPlexSansArabicMedium,
          color: disabled
            ? 'var(--theme-text-tertiary)'
            : 'var(--theme-text-primary)',
          boxShadow: isOpen
            ? '0 0 0 3px var(--theme-primary-alpha, rgba(99, 102, 241, 0.1))'
            : 'none'
        }}
      >
        <span
          className="flex-1"
          style={{
            direction: 'ltr',
            unicodeBidi: 'embed',
            textAlign: 'center',
            color: 'inherit'
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
            transform: 'translateY(-50%)',
            color: 'var(--theme-text-secondary)'
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
          className={`absolute top-full border overflow-hidden z-50 sm:max-w-none max-w-[calc(100vw-40px)]`}
          style={{
            marginTop: `${scale(4)}px`,
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-border)',
            borderRadius: `${scale(12)}px`,
            width: `${scale(280)}px`, // عرض افتراضي
            minWidth: `${scale(200)}px`, // حد أدنى للعرض
            maxHeight: `${verticalScale(280)}px`,
            boxShadow: 'var(--theme-card-shadow, 0 10px 25px -5px rgba(0, 0, 0, 0.1))',
            // تطبيق التموضع المحسوب ديناميكياً
            ...dropdownStyle,
          }}
        >
          <div
            className="border-b"
            style={{
              padding: `${scale(12)}px`,
              borderBottomColor: 'var(--theme-border)'
            }}
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث..."
              className="w-full border rounded-md text-right transition-colors duration-200 focus:ring-2 focus:border-transparent focus:ring-blue-500"
              style={{
                fontSize: scale(12 + size),
                padding: `${scale(8)}px ${scale(12)}px`,
                backgroundColor: 'var(--theme-input-background)',
                borderColor: 'var(--theme-border)',
                borderRadius: `${scale(6)}px`,
                fontFamily: fonts.IBMPlexSansArabicMedium,
                color: 'var(--theme-text-primary)'
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
                  w-full text-right transition-colors duration-200 border-b last:border-b-0
                `}
                style={{
                  backgroundColor: (item.name === value || item.code === value)
                    ? 'var(--theme-primary-alpha, rgba(99, 102, 241, 0.1))'
                    : 'transparent',
                  borderBottomColor: 'var(--theme-border-light)',
                  color: 'var(--theme-text-primary)',
                  padding: `${scale(14)}px ${scale(16)}px`,
                  minHeight: `${scale(48)}px`
                }}
                onMouseEnter={(e) => {
                  if (!(item.name === value || item.code === value)) {
                    e.currentTarget.style.backgroundColor = 'var(--theme-surface-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(item.name === value || item.code === value)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
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
                      color: (item.name === value || item.code === value)
                        ? 'var(--theme-primary)'
                        : 'var(--theme-text-primary)',
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
                        color: 'var(--theme-primary)',
                        fontFamily: fonts.IBMPlexSansArabicBold,
                        lineHeight: 1.4,
                        backgroundColor: (item.name === value || item.code === value)
                          ? 'var(--theme-primary-alpha, rgba(99, 102, 241, 0.15))'
                          : 'var(--theme-primary-alpha, rgba(99, 102, 241, 0.05))',
                        padding: `${scale(4)}px ${scale(8)}px`,
                        borderRadius: `${scale(6)}px`,
                        border: `1px solid var(--theme-primary)`,
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
