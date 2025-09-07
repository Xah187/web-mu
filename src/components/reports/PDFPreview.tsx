'use client';

import React, { useState } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { verticalScale } from '@/utils/responsiveSize';
import { ReportData, generateReportHTML, generatePDF } from '@/utils/pdfGenerator';
import { Tostget } from '@/components/ui/Toast';

interface PDFPreviewProps {
  reportData: ReportData;
  isOpen: boolean;
  onClose: () => void;
}

export default function PDFPreview({ reportData, isOpen, onClose }: PDFPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewHTML, setPreviewHTML] = useState<string>('');

  React.useEffect(() => {
    if (isOpen && reportData) {
      const html = generateReportHTML(reportData);
      setPreviewHTML(html);
    }
  }, [isOpen, reportData]);

  const handleGeneratePDF = async () => {
    if (!reportData) return;
    
    setIsGenerating(true);
    try {
      await generatePDF(reportData);
      Tostget('تم تصدير التقرير بنجاح');
      onClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
      Tostget('حدث خطأ أثناء تصدير التقرير');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        style={{ backgroundColor: colors.WHITE }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 
            className="text-xl font-bold"
            style={{
              fontFamily: fonts.IBMPlexSansArabicSemiBold,
              fontSize: verticalScale(20),
              color: colors.BLACK
            }}
            dir="rtl"
          >
            معاينة التقرير
          </h2>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: colors.BLUE,
                fontFamily: fonts.IBMPlexSansArabicMedium,
                fontSize: verticalScale(14)
              }}
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري التصدير...
                </div>
              ) : (
                'تصدير PDF'
              )}
            </button>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: colors.BLACK }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-gray-100 rounded-lg p-4">
            <div 
              className="bg-white rounded-lg shadow-sm mx-auto"
              style={{ 
                maxWidth: '600px',
                transform: 'scale(0.8)',
                transformOrigin: 'top center'
              }}
            >
              {previewHTML && (
                <div 
                  dangerouslySetInnerHTML={{ __html: previewHTML }}
                  className="report-preview"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div 
              className="text-sm text-gray-600"
              style={{
                fontFamily: fonts.IBMPlexSansArabicRegular,
                fontSize: verticalScale(12)
              }}
              dir="rtl"
            >
              سيتم تصدير التقرير بصيغة PDF
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                style={{
                  fontFamily: fonts.IBMPlexSansArabicMedium,
                  fontSize: verticalScale(14),
                  color: colors.BLACK
                }}
              >
                إلغاء
              </button>
              
              <button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50"
                style={{
                  backgroundColor: colors.BLUE,
                  fontFamily: fonts.IBMPlexSansArabicMedium,
                  fontSize: verticalScale(14)
                }}
              >
                {isGenerating ? 'جاري التصدير...' : 'تصدير'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .report-preview {
          font-family: 'Cairo', 'Tajawal', Arial, sans-serif;
        }
        .report-preview * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
