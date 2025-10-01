'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/store';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { Tostget } from '@/components/ui/Toast';
import axiosInstance from '@/lib/api/axios';
import useFinance, { FinanceItem } from '@/hooks/useFinance';

interface CreateFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  editingItem?: FinanceItem | null;
  onSuccess?: () => void;
}

interface FinanceData {
  projectID: number;
  typeOpreation: string;
  ClassificationName: string;
  Data: string;
  Amount: number;
  Bank: string;
  Image: Array<{ id: number; uri: any; type: string }>;
}

const operationTypes = [
  { id: 1, name: 'مصروفات' },
  { id: 2, name: 'عهد' },
  { id: 3, name: 'مرتجعات' }
];

const expenseClassifications = [
  { id: 1, name: 'مواد خام' },
  { id: 2, name: 'عمالة' },
  { id: 3, name: 'معدات' },
  { id: 4, name: 'نقل' },
  { id: 5, name: 'أخرى' }
];

const revenueClassifications = [
  { id: 1, name: 'دفعة مقدمة' },
  { id: 2, name: 'دفعة جزئية' },
  { id: 3, name: 'دفعة نهائية' },
  { id: 4, name: 'أخرى' }
];

const returnClassifications = [
  { id: 1, name: 'إرجاع مواد' },
  { id: 2, name: 'استرداد' },
  { id: 3, name: 'تعويض' },
  { id: 4, name: 'أخرى' }
];

/**
 * Create Finance Modal Component
 * Replicates mobile app's CreatOpreation component functionality
 * 
 * Features:
 * - Create/Edit financial operations (expenses, revenues, returns)
 * - Dynamic classification based on operation type
 * - File upload support
 * - Form validation
 * - Matches mobile app's UI and behavior exactly
 */
export default function CreateFinanceModal({
  isOpen,
  onClose,
  projectId,
  editingItem = null,
  onSuccess
}: CreateFinanceModalProps) {
  const { user, size } = useAppSelector(state => state.user);
  const { addExpense, addRevenue, addReturn, updateExpense, updateRevenue, updateReturn } = useFinance();
  
  const [financeData, setFinanceData] = useState<FinanceData>({
    projectID: projectId,
    typeOpreation: 'نوع العملية',
    ClassificationName: 'تصنيف الإضافة',
    Data: '',
    Amount: 0,
    Bank: '',
    Image: [{ id: 1, uri: null, type: 'icon' }]
  });

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showClassificationDropdown, setShowClassificationDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [imageOldDelete, setImageOldDelete] = useState<string[]>([]);

  // Initialize data when editing
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        // Determine operation type based on available properties (matching mobile app logic)
        let operationType = 'مصروفات'; // default
        if (editingItem.RevenueId) {
          operationType = 'عهد';
        } else if (editingItem.ReturnsId) {
          operationType = 'مرتجعات';
        } else if (editingItem.Expenseid) {
          operationType = 'مصروفات';
        }

        // Process existing images like mobile app
        let existingImages = [{ id: 1, uri: null, type: 'icon' }];
        if (editingItem.Image) {
          try {
            const imageArray = typeof editingItem.Image === 'string'
              ? JSON.parse(editingItem.Image)
              : editingItem.Image;

            if (Array.isArray(imageArray) && imageArray.length > 0) {
              imageArray.forEach((imageName: string, index: number) => {
                existingImages.push({
                  id: existingImages.length + 1,
                  uri: `${process.env.NEXT_PUBLIC_FILE_URL}/${imageName}` as any,
                  type: 'image'
                });
              });
            }
          } catch (error) {
            console.error('Error parsing existing images:', error);
          }
        }

        // Map editing item to finance data format
        setFinanceData({
          projectID: projectId,
          typeOpreation: operationType,
          ClassificationName: editingItem.ClassificationName || 'تصنيف الإضافة',
          Data: editingItem.Data || '',
          Amount: editingItem.Amount || 0,
          Bank: editingItem.Bank || '',
          Image: existingImages
        });
      } else {
        // Reset for new item
        setFinanceData({
          projectID: projectId,
          typeOpreation: 'نوع العملية',
          ClassificationName: 'تصنيف الإضافة',
          Data: '',
          Amount: 0,
          Bank: '',
          Image: [{ id: 1, uri: null, type: 'icon' }]
        });
      }
      setFiles([]);
      setImageOldDelete([]);
    }
  }, [isOpen, editingItem, projectId]);



  // Get classifications based on operation type
  const getClassifications = () => {
    switch (financeData.typeOpreation) {
      case 'مصروفات':
        return expenseClassifications;
      case 'عهد':
        return revenueClassifications;
      case 'مرتجعات':
        return returnClassifications;
      default:
        return [];
    }
  };

  // Handle operation type selection
  const handleTypeSelect = (type: string) => {
    setFinanceData(prev => ({
      ...prev,
      typeOpreation: type,
      ClassificationName: 'تصنيف الإضافة' // Reset classification when type changes
    }));
    setShowTypeDropdown(false);
  };

  // Handle classification selection
  const handleClassificationSelect = (classification: string) => {
    setFinanceData(prev => ({
      ...prev,
      ClassificationName: classification
    }));
    setShowClassificationDropdown(false);
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  // Remove file
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validateForm = () => {
    if (financeData.typeOpreation === 'نوع العملية') {
      Tostget('يجب اختيار نوع العملية');
      return false;
    }
    if (financeData.typeOpreation !== 'عهد' && financeData.ClassificationName === 'تصنيف الإضافة') {
      Tostget('يجب اختيار تصنيف العملية');
      return false;
    }
    if (!financeData.Data.trim()) {
      Tostget('يجب إدخال وصف العملية');
      return false;
    }
    if (financeData.Amount <= 0) {
      Tostget('يجب إدخال مبلغ صحيح');
      return false;
    }
    if (financeData.typeOpreation === 'عهد' && !financeData.Bank.trim()) {
      Tostget('يجب إدخال اسم البنك للعهد');
      return false;
    }
    return true;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Prepare form data
      const formData = new FormData();
      formData.append('projectID', projectId.toString());
      formData.append('Data', financeData.Data);
      formData.append('Amount', financeData.Amount.toString());

      // Add operation-specific fields
      if (financeData.typeOpreation === 'مصروفات') {
        formData.append('ClassificationName', financeData.ClassificationName);
      } else if (financeData.typeOpreation === 'عهد') {
        formData.append('Bank', financeData.Bank);
      }

      // Add files (using 'image' key like mobile app)
      // In edit mode, only send new files (not existing ones from server)
      if (editingItem) {
        // Filter out existing images (like mobile app finlyImageEnd logic)
        // Only send newly added files, not existing ones from server
        files.forEach((file, index) => {
          formData.append('image', file);
        });
        console.log('Edit mode - sending only new files:', files.length);
      } else {
        // Create mode - send all files
        files.forEach((file, index) => {
          formData.append('image', file);
        });
        console.log('Create mode - sending all files:', files.length);
      }

      // Debug: Log form data
      console.log('Finance operation data:', {
        typeOpreation: financeData.typeOpreation,
        projectID: projectId,
        Data: financeData.Data,
        Amount: financeData.Amount,
        Bank: financeData.Bank,
        ClassificationName: financeData.ClassificationName,
        filesCount: files.length,
        editingItem,
        imageOldDeleteCount: imageOldDelete.length,
        isEditMode: !!editingItem
      });

      // Determine API endpoint based on operation type and edit mode
      let endpoint = '';
      if (editingItem) {
        // Update operations using useFinance hooks
        console.log('Edit mode - using useFinance update functions');

        // Prepare data for update
        const updateData: any = {
          Amount: financeData.Amount,
          Data: financeData.Data,
          Imageolddelete: imageOldDelete.length > 0 ? imageOldDelete.join(',') : '',
          image: files.length > 0 ? files[0] : null // Send first file if any
        };

        // Add specific fields based on operation type
        if (financeData.typeOpreation === 'مصروفات') {
          updateData.ClassificationName = financeData.ClassificationName;
          await updateExpense(editingItem.Expenseid || 0, updateData);
        } else if (financeData.typeOpreation === 'عهد') {
          updateData.Bank = financeData.Bank;
          await updateRevenue(editingItem.RevenueId || 0, updateData);
        } else if (financeData.typeOpreation === 'مرتجعات') {
          await updateReturn(editingItem.ReturnsId || 0, updateData);
        }

        Tostget('تم تحديث العملية بنجاح');
        onSuccess?.();
        onClose();
        return; // Exit early for update operations
      } else {
        // Create operations using useFinance hooks
        console.log('Create mode - using useFinance add functions');

        // Prepare data for creation
        const createData: any = {
          projectID: projectId,
          Amount: financeData.Amount,
          Data: financeData.Data,
          image: files.length > 0 ? files[0] : null // Send first file if any
        };

        // Add specific fields and call appropriate function based on operation type
        if (financeData.typeOpreation === 'مصروفات') {
          createData.ClassificationName = financeData.ClassificationName;
          await addExpense(createData);
        } else if (financeData.typeOpreation === 'عهد') {
          createData.Bank = financeData.Bank;
          await addRevenue(createData);
        } else if (financeData.typeOpreation === 'مرتجعات') {
          await addReturn(createData);
        }

        Tostget('تم إنشاء العملية بنجاح');
        onSuccess?.();
        onClose();
      }

    } catch (error: any) {
      console.error('Error submitting finance operation:', error);
      Tostget(error.response?.data?.message || 'حدث خطأ أثناء العملية');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full mx-auto relative"
          style={{
            backgroundColor: 'var(--theme-card-background)',
            border: '1px solid var(--theme-border)',
            borderRadius: `${scale(20)}px`,
            maxWidth: `${scale(500)}px`,
            maxHeight: '90vh',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="text-center"
            style={{
              borderBottom: '1px solid var(--theme-border)',
              background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
              paddingLeft: scale(24),
              paddingRight: scale(24),
              paddingTop: scale(20),
              paddingBottom: scale(20),
              marginBottom: scale(16),
              borderTopLeftRadius: `${scale(20)}px`,
              borderTopRightRadius: `${scale(20)}px`
            }}
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--theme-primary-alpha, rgba(99, 102, 241, 0.1))' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2V22" stroke="var(--theme-primary, #6366f1)" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="var(--theme-primary, #6366f1)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h2
                  className="font-bold"
                  style={{
                    fontSize: `${scale(18)}px`,
                    fontFamily: fonts.IBMPlexSansArabicBold,
                    color: 'var(--theme-text-primary)',
                    lineHeight: 1.4
                  }}
                >
                  {editingItem ? 'تعديل العملية المالية' : 'إنشاء عملية مالية جديدة'}
                </h2>
                <p
                  style={{
                    fontSize: `${scale(14)}px`,
                    fontFamily: fonts.IBMPlexSansArabicMedium,
                    color: 'var(--theme-text-secondary)',
                    marginTop: scale(4)
                  }}
                >
                  {financeData.typeOpreation !== 'نوع العملية' ? financeData.typeOpreation : 'اختر نوع العملية'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 left-4 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg"
              style={{
                padding: '10px',
                backgroundColor: 'var(--theme-surface-secondary)',
                border: '1px solid var(--theme-border)',
                color: 'var(--theme-text-secondary)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Content - Scrollable */}
          <div 
            className="overflow-y-auto"
            style={{ 
              paddingLeft: scale(24), 
              paddingRight: scale(24), 
              paddingBottom: scale(16),
              maxHeight: 'calc(90vh - 200px)'
            }}
          >
            {/* Operation Type Dropdown */}
            <div style={{ marginBottom: scale(20), position: 'relative' }}>
              <label 
                className="block"
                style={{
                  fontSize: scale(14),
                  fontFamily: fonts.IBMPlexSansArabicMedium,
                  color: 'var(--theme-text-primary)',
                  marginBottom: scale(8)
                }}
              >
                نوع العملية *
              </label>
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="w-full text-right rounded-xl transition-all duration-200 hover:scale-[1.02] flex items-center justify-between"
                style={{
                  padding: scale(12),
                  backgroundColor: 'var(--theme-input-background)',
                  border: '1px solid var(--theme-border)',
                  color: financeData.typeOpreation === 'نوع العملية' ? 'var(--theme-text-secondary)' : 'var(--theme-text-primary)',
                  fontSize: scale(14),
                  fontFamily: fonts.IBMPlexSansArabicRegular
                }}
              >
                <span>{financeData.typeOpreation}</span>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor"
                  style={{ transform: showTypeDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showTypeDropdown && (
                <div 
                  className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg z-10"
                  style={{
                    backgroundColor: 'var(--theme-card-background)',
                    border: '1px solid var(--theme-border)',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}
                >
                  {operationTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeSelect(type.name)}
                      className="w-full text-right transition-all duration-200 hover:bg-opacity-50"
                      style={{
                        padding: scale(12),
                        backgroundColor: financeData.typeOpreation === type.name ? 'var(--theme-primary-alpha, rgba(99, 102, 241, 0.1))' : 'transparent',
                        color: 'var(--theme-text-primary)',
                        fontSize: scale(14),
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        borderBottom: '1px solid var(--theme-border)'
                      }}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Classification Dropdown - Not shown for Revenue */}
            {financeData.typeOpreation !== 'نوع العملية' && financeData.typeOpreation !== 'عهد' && (
              <div style={{ marginBottom: scale(20), position: 'relative' }}>
                <label
                  className="block"
                  style={{
                    fontSize: scale(14),
                    fontFamily: fonts.IBMPlexSansArabicMedium,
                    color: 'var(--theme-text-primary)',
                    marginBottom: scale(8)
                  }}
                >
                  تصنيف العملية *
                </label>
                <button
                  onClick={() => setShowClassificationDropdown(!showClassificationDropdown)}
                  className="w-full text-right rounded-xl transition-all duration-200 hover:scale-[1.02] flex items-center justify-between"
                  style={{
                    padding: scale(12),
                    backgroundColor: 'var(--theme-input-background)',
                    border: '1px solid var(--theme-border)',
                    color: financeData.ClassificationName === 'تصنيف الإضافة' ? 'var(--theme-text-secondary)' : 'var(--theme-text-primary)',
                    fontSize: scale(14),
                    fontFamily: fonts.IBMPlexSansArabicRegular
                  }}
                >
                  <span>{financeData.ClassificationName}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    style={{ transform: showClassificationDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showClassificationDropdown && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg z-10"
                    style={{
                      backgroundColor: 'var(--theme-card-background)',
                      border: '1px solid var(--theme-border)',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}
                  >
                    {getClassifications().map((classification) => (
                      <button
                        key={classification.id}
                        onClick={() => handleClassificationSelect(classification.name)}
                        className="w-full text-right transition-all duration-200 hover:bg-opacity-50"
                        style={{
                          padding: scale(12),
                          backgroundColor: financeData.ClassificationName === classification.name ? 'var(--theme-primary-alpha, rgba(99, 102, 241, 0.1))' : 'transparent',
                          color: 'var(--theme-text-primary)',
                          fontSize: scale(14),
                          fontFamily: fonts.IBMPlexSansArabicRegular,
                          borderBottom: '1px solid var(--theme-border)'
                        }}
                      >
                        {classification.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Description Input */}
            <div style={{ marginBottom: scale(20) }}>
              <label
                className="block"
                style={{
                  fontSize: scale(14),
                  fontFamily: fonts.IBMPlexSansArabicMedium,
                  color: 'var(--theme-text-primary)',
                  marginBottom: scale(8)
                }}
              >
                وصف العملية *
              </label>
              <textarea
                value={financeData.Data}
                onChange={(e) => setFinanceData(prev => ({ ...prev, Data: e.target.value }))}
                placeholder="اكتب وصف العملية المالية..."
                className="w-full rounded-xl transition-all duration-200 focus:scale-[1.02] resize-none theme-input"
                rows={3}
                style={{
                  padding: scale(12),
                  fontSize: scale(14),
                  fontFamily: fonts.IBMPlexSansArabicRegular,
                  textAlign: 'right'
                }}
              />
            </div>

            {/* Amount and Bank Row */}
            <div className="flex gap-4" style={{ marginBottom: scale(20) }}>
              {/* Amount Input */}
              <div className="flex-1">
                <label
                  className="block"
                  style={{
                    fontSize: scale(14),
                    fontFamily: fonts.IBMPlexSansArabicMedium,
                    color: 'var(--theme-text-primary)',
                    marginBottom: scale(8)
                  }}
                >
                  المبلغ *
                </label>
                <input
                  type="number"
                  value={financeData.Amount || ''}
                  onChange={(e) => setFinanceData(prev => ({ ...prev, Amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full rounded-xl transition-all duration-200 focus:scale-[1.02] theme-input"
                  style={{
                    padding: scale(12),
                    fontSize: scale(14),
                    fontFamily: fonts.IBMPlexSansArabicRegular,
                    textAlign: 'right'
                  }}
                />
              </div>

              {/* Bank Input - Only for Revenue */}
              {financeData.typeOpreation === 'عهد' && (
                <div className="flex-1">
                  <label
                    className="block"
                    style={{
                      fontSize: scale(14),
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      color: 'var(--theme-text-primary)',
                      marginBottom: scale(8)
                    }}
                  >
                    البنك *
                  </label>
                  <input
                    type="text"
                    value={financeData.Bank}
                    onChange={(e) => setFinanceData(prev => ({ ...prev, Bank: e.target.value }))}
                    placeholder="اسم البنك"
                    className="w-full rounded-xl transition-all duration-200 focus:scale-[1.02] theme-input"
                    style={{
                      padding: scale(12),
                      fontSize: scale(14),
                      fontFamily: fonts.IBMPlexSansArabicRegular,
                      textAlign: 'right'
                    }}
                  />
                </div>
              )}
            </div>

            {/* File Upload */}
            <div style={{ marginBottom: scale(24) }}>
              <label
                className="block"
                style={{
                  fontSize: scale(14),
                  fontFamily: fonts.IBMPlexSansArabicMedium,
                  color: 'var(--theme-text-primary)',
                  marginBottom: scale(8)
                }}
              >
                المرفقات (اختياري)
              </label>
              <div
                className="rounded-xl text-center transition-all duration-200 hover:scale-[1.02]"
                style={{
                  border: '2px dashed var(--theme-border)',
                  padding: scale(16),
                  backgroundColor: 'var(--theme-surface-secondary)'
                }}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="finance-files"
                />
                <label
                  htmlFor="finance-files"
                  className="cursor-pointer flex flex-col items-center"
                  style={{ gap: scale(8) }}
                >
                  <svg
                    width={scale(32)}
                    height={scale(32)}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--theme-text-secondary)"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span
                    style={{
                      fontSize: scale(14),
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      color: 'var(--theme-text-secondary)'
                    }}
                  >
                    اضغط لإضافة ملفات
                  </span>
                </label>
              </div>

              {/* Selected Files */}
              {files.length > 0 && (
                <div style={{ marginTop: scale(12), gap: scale(8), display: 'flex', flexDirection: 'column' }}>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl transition-all duration-200"
                      style={{
                        padding: scale(12),
                        backgroundColor: 'var(--theme-surface-secondary)',
                        border: '1px solid var(--theme-border)'
                      }}
                    >
                      <span
                        className="truncate"
                        style={{
                          fontSize: scale(12),
                          fontFamily: fonts.IBMPlexSansArabicRegular,
                          color: 'var(--theme-text-primary)'
                        }}
                      >
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeFile(index)}
                        className="rounded-lg transition-all duration-200 hover:scale-110"
                        style={{
                          padding: scale(4),
                          color: 'var(--theme-error)',
                          backgroundColor: 'var(--theme-error-alpha, rgba(239, 68, 68, 0.1))'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex gap-4 justify-center items-center relative"
            style={{
              borderTop: '1px solid var(--theme-border)',
              background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
              paddingLeft: scale(24),
              paddingRight: scale(24),
              paddingTop: scale(16),
              paddingBottom: scale(16),
              margin: `${scale(8)}px 0`,
              borderBottomLeftRadius: `${scale(20)}px`,
              borderBottomRightRadius: `${scale(20)}px`
            }}
          >
            <button
              onClick={onClose}
              disabled={loading}
              className="text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
              style={{
                fontSize: scale(14),
                color: 'var(--theme-text-primary)',
                backgroundColor: 'var(--theme-surface-secondary)',
                fontFamily: fonts.IBMPlexSansArabicBold,
                border: '2px solid var(--theme-border)',
                padding: `${scale(12)}px ${scale(16)}px`,
                flex: '1',
                minHeight: scale(48),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
            >
              إلغاء
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
              style={{
                fontSize: scale(14),
                color: '#ffffff',
                backgroundColor: 'var(--theme-primary)',
                fontFamily: fonts.IBMPlexSansArabicBold,
                border: '2px solid var(--theme-primary)',
                padding: `${scale(12)}px ${scale(16)}px`,
                flex: '1',
                minHeight: scale(48),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center" style={{ gap: scale(8) }}>
                  <div
                    className="border-2 border-white border-t-transparent rounded-full animate-spin"
                    style={{ width: scale(16), height: scale(16) }}
                  />
                  <span>جاري الحفظ...</span>
                </div>
              ) : (
                editingItem ? 'حفظ التعديل' : 'إنشاء العملية'
              )}
            </button>

            {/* Decorative bottom element */}
            <div
              className="flex justify-center"
              style={{
                position: 'absolute',
                bottom: scale(8),
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%'
              }}
            >
              <div
                className="w-12 h-1 rounded-full"
                style={{ backgroundColor: 'var(--theme-border)' }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
