'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FinanceItem, Totaltofixt } from '@/hooks/useFinance';
import { scale } from '@/utils/responsiveSize';
import { fonts } from '@/constants/fonts';
import { generateInvoicePDF } from '@/utils/invoiceGenerator';
import { useSelector } from 'react-redux';

interface ViewFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FinanceItem | null;
  onEdit: (item: FinanceItem) => void;
  onDelete: (item: FinanceItem) => void;
  loading?: boolean;
  projectData?: {
    name: string;
    branchName?: string;
    branchEmail?: string;
    branchPhone?: string;
  };
}

const ViewFinanceModal: React.FC<ViewFinanceModalProps> = ({
  isOpen,
  onClose,
  item,
  onEdit,
  onDelete,
  loading = false,
  projectData
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  // Get user data from Redux (web uses state.user not state.userReducer)
  const user = useSelector((state: any) => state.user?.user);

  if (!item) return null;

  const handleEdit = () => {
    onEdit(item);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف هذه العملية؟')) {
      onDelete(item);
      onClose();
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      setGeneratingInvoice(true);

      // Determine operation type
      const type = item.Expenseid ? 'BringExpense' : item.RevenueId ? 'BringRevenue' : 'BringReturns';

      // Get data from localStorage (matching mobile app's AsyncStorage approach)
      let dataHome: any = {};
      if (typeof window !== 'undefined') {
        const storedData = localStorage.getItem('DataHome');
        if (storedData) {
          try {
            dataHome = JSON.parse(storedData);
          } catch (e) {
            console.error('Error parsing DataHome:', e);
          }
        }
      }

      // Debug logs
      console.log('=== Invoice Generation Debug ===');
      console.log('DataHome from localStorage:', dataHome);
      console.log('User data:', user?.data);
      console.log('Project data:', projectData);
      console.log('Item data:', item);

      // Prepare company data - EXACTLY matching mobile app structure
      // Mobile app uses: dataHome?.nameCompany, dataHome?.nameBransh, dataHome?.nameProject, etc.
      const companyData = {
        nameCompany: dataHome?.nameCompany || user?.data?.CompanyName || 'اسم الشركة',
        nameBransh: dataHome?.nameBransh || projectData?.branchName || 'اسم الفرع',
        nameProject: dataHome?.nameProject || projectData?.name || 'اسم المشروع',
        Email: dataHome?.Email || projectData?.branchEmail || user?.data?.Email || '',
        PhoneNumber: dataHome?.PhoneNumber || projectData?.branchPhone || user?.data?.PhoneNumber || '',
        Country: dataHome?.Country || 'السعودية'
      };

      console.log('Final company data for invoice:', companyData);
      console.log('================================');

      await generateInvoicePDF(item, type, companyData);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('حدث خطأ أثناء إنشاء الفاتورة');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  // Process images - handle both string and array formats like mobile app
  const images = (() => {
    console.log('ViewFinanceModal - Raw item.Image:', item.Image, typeof item.Image);
    console.log('ViewFinanceModal - Full item data:', item);

    if (!item.Image) {
      console.log('ViewFinanceModal - No images found');
      return [];
    }

    try {
      // If it's a string, parse it as JSON
      if (typeof item.Image === 'string') {
        console.log('ViewFinanceModal - Parsing string image data:', item.Image);
        const parsed = JSON.parse(item.Image);
        console.log('ViewFinanceModal - Parsed images:', parsed);
        const result = Array.isArray(parsed) ? parsed : [];
        console.log('ViewFinanceModal - Final result:', result);
        return result;
      }

      // If it's already an array, use it directly
      if (Array.isArray(item.Image)) {
        console.log('ViewFinanceModal - Array images:', item.Image);
        return item.Image;
      }

      console.log('ViewFinanceModal - Unknown image format');
      return [];
    } catch (error) {
      console.error('ViewFinanceModal - Error parsing images:', error, 'Raw data:', item.Image);
      return [];
    }
  })();

  console.log('ViewFinanceModal - Final processed images:', images);

  // Determine operation type for styling
  const operationType = item.Expenseid ? 'مصروفات' : item.RevenueId ? 'عهد' : 'مرتجعات';
  const operationColor = operationType === 'مصروفات' ? 'red' : operationType === 'عهد' ? 'blue' : 'green';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"
            style={{
              backgroundColor: 'var(--color-card-background)',
              borderRadius: scale(20),
              border: '2px solid var(--color-border)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between"
              style={{
                borderBottom: '1px solid var(--color-border)',
                background: 'linear-gradient(135deg, var(--color-card-background) 0%, var(--color-surface-secondary) 100%)',
                padding: scale(20),
                borderTopLeftRadius: scale(20),
                borderTopRightRadius: scale(20)
              }}
            >
              <div className="flex items-center" style={{ gap: scale(12) }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: scale(40),
                    height: scale(40),
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-surface-secondary)',
                    border: `2px solid var(--color-border)`
                  }}
                >
                  {operationType === 'مصروفات' ? (
                    <svg width={scale(20)} height={scale(20)} fill="var(--color-error)" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : operationType === 'عهد' ? (
                    <svg width={scale(20)} height={scale(20)} fill="var(--color-primary)" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg width={scale(20)} height={scale(20)} fill="var(--color-success)" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: scale(18),
                      color: 'var(--color-text-primary)',
                      fontFamily: fonts.IBMPlexSansArabicBold,
                      margin: 0
                    }}
                  >
                    تفاصيل {operationType}
                  </h2>
                  <p
                    style={{
                      fontSize: scale(12),
                      color: 'var(--color-text-secondary)',
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      margin: 0,
                      marginTop: scale(4)
                    }}
                  >
                    {item.Date}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="transition-all duration-200 hover:scale-110"
                style={{
                  padding: scale(8),
                  borderRadius: scale(8),
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <svg width={scale(20)} height={scale(20)} fill="none" stroke="var(--color-text-secondary)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div
              className="flex-1 overflow-y-auto"
              style={{
                padding: scale(20),
                backgroundColor: 'var(--color-card-background)'
              }}
            >
              {/* Amount Card */}
              <div
                className="text-center"
                style={{
                  padding: scale(20),
                  borderRadius: scale(16),
                  border: '2px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-secondary)',
                  marginBottom: scale(20),
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }}
              >
                <p
                  style={{
                    fontSize: scale(12),
                    color: 'var(--color-text-secondary)',
                    fontFamily: fonts.IBMPlexSansArabicMedium,
                    margin: 0,
                    marginBottom: scale(8)
                  }}
                >
                  المبلغ
                </p>
                <p
                  style={{
                    fontSize: scale(24),
                    color: operationColor === 'red' ? 'var(--color-error)' :
                           operationColor === 'blue' ? 'var(--color-primary)' : 'var(--color-success)',
                    fontFamily: fonts.IBMPlexSansArabicBold,
                    margin: 0,
                    textAlign: 'center'
                  }}
                >
                  {Totaltofixt(item.Amount)}
                </p>
              </div>

              {/* Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: scale(16) }}>
                {/* Description */}
                <div
                  style={{
                    backgroundColor: 'var(--color-surface-secondary)',
                    padding: scale(16),
                    borderRadius: scale(12),
                    border: '2px solid var(--color-border)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <label
                    style={{
                      display: 'block',
                      fontSize: scale(12),
                      color: 'var(--color-text-secondary)',
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      marginBottom: scale(8)
                    }}
                  >
                    البيان
                  </label>
                  <p
                    style={{
                      fontSize: scale(14),
                      color: 'var(--color-text-primary)',
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      margin: 0,
                      lineHeight: 1.5
                    }}
                  >
                    {item.Data}
                  </p>
                </div>

                {/* Bank (for revenue) */}
                {item.Bank && (
                  <div
                    style={{
                      backgroundColor: 'var(--color-surface-secondary)',
                      padding: scale(16),
                      borderRadius: scale(12),
                      border: '2px solid var(--color-border)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <label
                      style={{
                        display: 'block',
                        fontSize: scale(12),
                        color: 'var(--color-text-secondary)',
                        fontFamily: fonts.IBMPlexSansArabicMedium,
                        marginBottom: scale(8)
                      }}
                    >
                      البنك
                    </label>
                    <p
                      style={{
                        fontSize: scale(14),
                        color: 'var(--color-text-primary)',
                        fontFamily: fonts.IBMPlexSansArabicMedium,
                        margin: 0
                      }}
                    >
                      {item.Bank}
                    </p>
                  </div>
                )}

                {/* Classification (for expenses) */}
                {item.ClassificationName && (
                  <div
                    style={{
                      backgroundColor: 'var(--color-surface-secondary)',
                      padding: scale(16),
                      borderRadius: scale(12),
                      border: '2px solid var(--color-border)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <label
                      style={{
                        display: 'block',
                        fontSize: scale(12),
                        color: 'var(--color-text-secondary)',
                        fontFamily: fonts.IBMPlexSansArabicMedium,
                        marginBottom: scale(8)
                      }}
                    >
                      التصنيف
                    </label>
                    <p
                      style={{
                        fontSize: scale(14),
                        color: 'var(--color-text-primary)',
                        fontFamily: fonts.IBMPlexSansArabicMedium,
                        margin: 0
                      }}
                    >
                      {item.ClassificationName}
                    </p>
                  </div>
                )}

                {/* Invoice Number (for expenses) */}
                {item.InvoiceNo && (
                  <div
                    style={{
                      backgroundColor: 'var(--color-surface-secondary)',
                      padding: scale(16),
                      borderRadius: scale(12),
                      border: '2px solid var(--color-border)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <label
                      style={{
                        display: 'block',
                        fontSize: scale(12),
                        color: 'var(--color-text-secondary)',
                        fontFamily: fonts.IBMPlexSansArabicMedium,
                        marginBottom: scale(8)
                      }}
                    >
                      رقم الفاتورة
                    </label>
                    <p
                      style={{
                        fontSize: scale(14),
                        color: 'var(--color-text-primary)',
                        fontFamily: fonts.IBMPlexSansArabicMedium,
                        margin: 0
                      }}
                    >
                      {item.InvoiceNo}
                    </p>
                  </div>
                )}
              </div>

              {/* Images */}
              {images.length > 0 && (
                <div style={{ marginTop: scale(20) }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: scale(12),
                      color: 'var(--color-text-secondary)',
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      marginBottom: scale(12),
                      textAlign: 'center'
                    }}
                  >
                    المرفقات ({images.length})
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: images.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: scale(12),
                      justifyItems: 'center'
                    }}
                  >
                    {images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(`${process.env.NEXT_PUBLIC_FILE_URL}/${image}`)}
                        className="group relative transition-all duration-200 hover:scale-105"
                        style={{
                          width: images.length === 1 ? scale(200) : scale(120),
                          height: images.length === 1 ? scale(200) : scale(120),
                          borderRadius: scale(12),
                          overflow: 'hidden',
                          border: '2px solid var(--color-border)',
                          backgroundColor: 'var(--color-surface-secondary)',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <img
                          src={`${process.env.NEXT_PUBLIC_FILE_URL}/${image}`}
                          alt={`مرفق ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <div
                          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center"
                        >
                          <svg
                            width={scale(24)}
                            height={scale(24)}
                            className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div
              className="flex gap-4 justify-center items-center relative"
              style={{
                borderTop: '1px solid var(--color-border)',
                background: 'linear-gradient(135deg, var(--color-card-background) 0%, var(--color-surface-secondary) 100%)',
                paddingLeft: scale(24),
                paddingRight: scale(24),
                paddingTop: scale(16),
                paddingBottom: scale(16),
                margin: `${scale(8)}px 0`,
                borderBottomLeftRadius: scale(20),
                borderBottomRightRadius: scale(20)
              }}
            >
              <button
                onClick={handleGenerateInvoice}
                disabled={generatingInvoice || loading}
                className="text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
                style={{
                  fontSize: scale(14),
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-surface-secondary)',
                  fontFamily: fonts.IBMPlexSansArabicBold,
                  border: '2px solid var(--color-border)',
                  padding: `${scale(12)}px ${scale(16)}px`,
                  flex: '1',
                  minHeight: scale(48),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  gap: scale(8)
                }}
              >
                {generatingInvoice ? (
                  <svg className="animate-spin" width={scale(16)} height={scale(16)} fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg width={scale(16)} height={scale(16)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                إصدار فاتورة
              </button>

              <button
                onClick={handleEdit}
                disabled={loading}
                className="text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
                style={{
                  fontSize: scale(14),
                  color: '#ffffff',
                  backgroundColor: '#10b981',
                  fontFamily: fonts.IBMPlexSansArabicBold,
                  border: '2px solid #10b981',
                  padding: `${scale(12)}px ${scale(16)}px`,
                  flex: '1',
                  minHeight: scale(48),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  gap: scale(8)
                }}
              >
                <svg width={scale(16)} height={scale(16)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                تعديل
              </button>

              <button
                onClick={handleDelete}
                disabled={loading}
                className="text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
                style={{
                  fontSize: scale(14),
                  color: '#ffffff',
                  backgroundColor: loading ? '#f87171' : '#ef4444',
                  fontFamily: fonts.IBMPlexSansArabicBold,
                  border: `2px solid ${loading ? '#f87171' : '#ef4444'}`,
                  padding: `${scale(12)}px ${scale(16)}px`,
                  flex: '1',
                  minHeight: scale(48),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  gap: scale(8),
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center" style={{ gap: scale(8) }}>
                    <div
                      className="border-2 border-white border-t-transparent rounded-full animate-spin"
                      style={{ width: scale(16), height: scale(16) }}
                    />
                    <span>جاري الحذف...</span>
                  </div>
                ) : (
                  <>
                    <svg width={scale(16)} height={scale(16)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    حذف
                  </>
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
                  style={{ backgroundColor: 'var(--color-border)' }}
                />
              </div>
            </div>
          </motion.div>

          {/* Image Viewer */}
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm"
              onClick={() => setSelectedImage(null)}
              style={{ padding: scale(20) }}
            >
              <div
                className="relative flex items-center justify-center"
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  width: '100%',
                  height: '100%'
                }}
              >
                <motion.img
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  src={selectedImage}
                  alt="عرض الصورة"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: scale(12),
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                    display: 'block',
                    margin: 'auto'
                  }}
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute transition-all duration-200 hover:scale-110"
                  style={{
                    top: scale(16),
                    right: scale(16),
                    padding: scale(12),
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <svg width={scale(24)} height={scale(24)} fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default ViewFinanceModal;
