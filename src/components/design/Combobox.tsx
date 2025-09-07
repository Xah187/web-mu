'use client';

import React, { useState, useRef, useEffect } from 'react';
import { colors } from '@/constants/colors';
import { useAppSelector } from '@/store';
import { verticalScale } from '@/utils/responsiveSize';
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
  const [dropdownPosition, setDropdownPosition] = useState('right-0');
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

  // حساب موضع القائمة المنسدلة
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;

      // إذا كان العنصر في النصف الأيسر من الشاشة، افتح القائمة لليمين
      // إذا كان في النصف الأيمن، افتح القائمة لليسار
      if (rect.left < screenWidth / 2) {
        setDropdownPosition('left-0');
      } else {
        setDropdownPosition('right-0');
      }
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
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
          w-full h-full px-3 py-2 text-center
          border border-bordercolor rounded-xl
          flex items-center justify-center
          hover:border-blue transition-colors duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          relative
        `}
        style={{ 
          backgroundColor,
          fontSize: fontSize || verticalScale(15 + size) 
        }}
      >
        <span className="font-cairo-medium text-black" style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
          {selectedItem ? (selectedItem.code || selectedItem.name) : (value || placeholder)}
        </span>
        <span className={`absolute left-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ArrowDownIcon stroke="currentColor" />
        </span>
      </button>

      {isOpen && (
        <div className={`absolute top-full mt-1 ${dropdownPosition} w-48 bg-white border border-bordercolor rounded-xl shadow-lg z-50 max-h-64 overflow-hidden`}>
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث..."
              className="w-full px-2 py-1 border border-bordercolor rounded-md text-right text-sm"
              style={{ fontSize: verticalScale(12 + size) }}
            />
          </div>

          <div className="max-h-52 overflow-y-auto">
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
                  w-full px-3 py-2 text-right hover:bg-gray-50
                  transition-colors duration-200
                  ${(item.name === value || item.code === value) ? 'bg-blue-50' : 'text-gray-700'}
                `}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className="font-cairo-medium"
                    style={{
                      fontSize: verticalScale(12 + size),
                      color: (item.name === value || item.code === value) ? '#2117fb' : '#374151'
                    }}
                  >
                    {item.name}
                  </span>
                  <span
                    className="font-cairo-bold"
                    style={{
                      fontSize: verticalScale(12 + size),
                      direction: 'ltr',
                      unicodeBidi: 'embed',
                      color: (item.name === value || item.code === value) ? '#2117fb' : '#2117fb'
                    }}
                  >
                    {item.code}
                  </span>
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
