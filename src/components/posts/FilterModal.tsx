'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { FilterData } from '@/hooks/usePosts';
import Input from '@/components/design/Input';
import ButtonLong from '@/components/design/ButtonLong';
import Combobox from '@/components/design/Combobox';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filterData: Partial<FilterData>) => void;
  onClear: () => void;
  branches: any[];
  currentFilter: FilterData;
  loading?: boolean;
  onFetchBranches: () => void;
}

export default function FilterModal({
  isOpen,
  onClose,
  onApply,
  onClear,
  branches,
  currentFilter,
  loading = false,
  onFetchBranches
}: FilterModalProps) {
  const [filterData, setFilterData] = useState<Partial<FilterData>>({});
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // Filter types exactly like mobile app
  const filterTypes = [
    { id: '4', name: 'بحسب التاريخ' },
    { id: '1', name: 'بحسب المشروع والتاريخ' },
    { id: '2', name: 'بحسب المستخدم والتاريخ' },
    { id: '3', name: 'بحسب المشروع والمستخدم والتاريخ' },
    { id: '5', name: 'بحسب الفرع' }
  ];

  // Branch options
  const branchOptions = branches.filter(branch => branch && branch.NameSub).map(branch => ({
    id: branch.id.toString(),
    name: branch.NameSub
  }));



  useEffect(() => {
    if (isOpen) {
      // Initialize with current filter or default
      const currentType = currentFilter.type || 'بحسب التاريخ';
      setFilterData({
        type: currentType,
        nameProject: currentFilter.nameProject || '',
        userName: currentFilter.userName || '',
        branch: currentFilter.branch || ''
      });
      
      // Format dates with defaults
      const formatDate = (date: Date | string | undefined, defaultDate?: Date) => {
        if (!date && defaultDate) {
          return defaultDate.toISOString().split('T')[0];
        }
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
      };

      // Use wide date range to capture existing data (since posts might be from past dates)
      const today = new Date();
      const startDate = new Date('2024-01-01'); // Wide range to capture all existing posts

      setDateStart(formatDate(currentFilter.DateStart, startDate));
      setDateEnd(formatDate(currentFilter.DateEnd, today));
    }
  }, [isOpen, currentFilter]);

  const handleTypeChange = (typeName: string) => {
    setFilterData(prev => ({ ...prev, type: typeName }));
    
    // If "بحسب الفرع" is selected, fetch branches
    if (typeName === 'بحسب الفرع') {
      onFetchBranches();
    }
  };

  const handleApply = () => {
    const finalFilter: Partial<FilterData> = {
      ...filterData,
      DateStart: dateStart ? new Date(dateStart) : new Date(),
      DateEnd: dateEnd ? new Date(dateEnd) : new Date()
    };

    onApply(finalFilter);
    onClose();
  };

  const handleClear = () => {
    setFilterData({ type: 'بحسب التاريخ' });
    setDateStart('');
    setDateEnd('');
    onClear();
  };

  if (!isOpen) return null;

  const selectedType = filterData.type || 'بحسب التاريخ';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 
            className="text-lg font-cairo-bold text-gray-900"
            style={{ fontSize: verticalScale(18) }}
          >
            فلتر
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Filter Type Selection */}
          <div>
            <label 
              className="block text-sm font-cairo-medium text-gray-700 mb-3"
              style={{ fontSize: verticalScale(14) }}
            >
              نوع الفلتر
            </label>
            <div className="grid grid-cols-1 gap-2">
              {filterTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeChange(type.name)}
                  className={`
                    p-3 rounded-lg border text-right transition-colors
                    ${selectedType === type.name 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  style={{ 
                    fontSize: verticalScale(13),
                    fontFamily: fonts.IBMPlexSansArabicMedium
                  }}
                >
                  {type.name}
                  {loading && type.name === 'بحسب الفرع' && selectedType === type.name && (
                    <div className="inline-block ml-2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Project Name Input */}
          {selectedType.includes('المشروع') && (
            <div>
              <label 
                className="block text-sm font-cairo-medium text-gray-700 mb-2"
                style={{ fontSize: verticalScale(12) }}
              >
                اسم المشروع
              </label>
              <Input
                name="nameProject"
                placeholder="ادخل اسم المشروع"
                value={filterData.nameProject || ''}
                onChange={(text) => setFilterData(prev => ({ ...prev, nameProject: text }))}
              />
            </div>
          )}

          {/* User Name Input */}
          {selectedType.includes('المستخدم') && (
            <div>
              <label 
                className="block text-sm font-cairo-medium text-gray-700 mb-2"
                style={{ fontSize: verticalScale(12) }}
              >
                اسم المستخدم
              </label>
              <Input
                name="userName"
                placeholder="ادخل اسم المستخدم"
                value={filterData.userName || ''}
                onChange={(text) => setFilterData(prev => ({ ...prev, userName: text }))}
              />
            </div>
          )}

          {/* Branch Selection */}
          {selectedType === 'بحسب الفرع' && (
            <div>
              <label 
                className="block text-sm font-cairo-medium text-gray-700 mb-2"
                style={{ fontSize: verticalScale(12) }}
              >
                الفرع
              </label>
              {loading && branchOptions.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="mr-2 text-gray-500">جاري تحميل الفروع...</span>
                </div>
              ) : branchOptions.length > 0 ? (
                <Combobox
                  options={branchOptions}
                  value={filterData.branch || ''}
                  onChange={(value) => setFilterData(prev => ({ ...prev, branch: value }))}
                  placeholder="اختر فرع"
                />
              ) : (
                <div className="text-center py-4 text-gray-500">
                  لا توجد فروع متاحة
                </div>
              )}
            </div>
          )}

          {/* Date Range - Always visible */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-cairo-medium theme-text-secondary mb-2"
                style={{
                  fontSize: verticalScale(12),
                  color: 'var(--color-text-secondary)'
                }}
              >
                من تاريخ
              </label>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 theme-input"
                style={{
                  backgroundColor: 'var(--color-input-background)',
                  borderColor: 'var(--color-input-border)',
                  color: 'var(--color-input-text)',
                  fontSize: verticalScale(14)
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-cairo-medium theme-text-secondary mb-2"
                style={{
                  fontSize: verticalScale(12),
                  color: 'var(--color-text-secondary)'
                }}
              >
                إلى تاريخ
              </label>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 theme-input"
                style={{
                  backgroundColor: 'var(--color-input-background)',
                  borderColor: 'var(--color-input-border)',
                  color: 'var(--color-input-text)',
                  fontSize: verticalScale(14)
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 space-y-3">
          <ButtonLong
            text="بحث"
            onPress={handleApply}
            loading={loading}
            styleButton={{
              backgroundColor: colors.BLUE,
              borderRadius: scale(12)
            }}
          />
          
          <button
            onClick={handleClear}
            className="w-full py-3 text-center text-gray-600 hover:text-gray-800 transition-colors"
            style={{ fontSize: verticalScale(14) }}
          >
            مسح الفلتر
          </button>
        </div>
      </div>
    </div>
  );
}