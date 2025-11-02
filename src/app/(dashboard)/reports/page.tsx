'use client';

import React, { useState } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale as _scale, verticalScale } from '@/utils/responsiveSize';
import useReports, { Branch, Project } from '@/hooks/useReports';
import SelectionModal from '@/components/reports/SelectionModal';
import ProgressChart from '@/components/reports/ProgressChart';
import { FinancialBarChart } from '@/components/reports/BarChart';
import PDFPreview from '@/components/reports/PDFPreview';
import { Tostget } from '@/components/ui/Toast';
import Image from 'next/image';
import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';
import { useAppSelector } from '@/store';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * Reports Page - Matching Mobile App
 * Permissions: ALL USERS can access (matching mobile app behavior)
 * Backend filters results based on user job/permissions
 * Mobile App Reference: Src/Screens/Reports.tsx
 */
export default function ReportsPage() {
  const { t, isRTL } = useTranslation();
  const userState = useAppSelector((state) => state.user);
  const _user = userState?.user; // Extract the actual user object

  const {
    branches,
    projects,
    selectedBranch,
    selectedProject,
    reportData,
    loading,
    branchesLoading,
    projectsLoading,
    reportLoading,
    selectBranch,
    selectProject,
    fetchBranches,
    generateFinancialStatement,
    generateRequestsReport,
    generateTimelineReport
  } = useReports();

  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);





  const handleBranchSelect = async (branch: Branch) => {
    await selectBranch(branch);
    Tostget(`تم اختيار الفرع: ${branch.NameSub}`);
  };

  const handleProjectSelect = async (project: Project) => {
    await selectProject(project);
    Tostget(`تم اختيار المشروع: ${project.Nameproject}`);
  };

  // Handle report generation - Matching mobile app switchReport function
  const handleGenerateReport = async (type: number) => {
    if (!selectedProject?.id) {
      Tostget('الرجاء اختيار مشروع أولاً');
      return;
    }

    let fileUrl: string | null = null;

    switch (type) {
      case 5: // Statistical Report - Display in page (like mobile app case 5)
        // This is already handled by selectProject, just show success message
        Tostget(t('reports.statisticalReportLoaded'));
        break;
      case 1: // Requests Report - Part
        fileUrl = await generateRequestsReport(selectedProject.id, 'part');
        break;
      case 2: // Financial Statement - All
        fileUrl = await generateFinancialStatement(selectedProject.id, 'all');
        break;
      case 3: // Financial Statement - Party (Expenses)
        fileUrl = await generateFinancialStatement(selectedProject.id, 'party');
        break;
      case 4: // Timeline Report
        fileUrl = await generateTimelineReport(selectedProject.id);
        break;
      default:
        Tostget(t('reports.unknownReportType'));
        return;
    }

    if (fileUrl) {
      // Open the file in a new tab
      const baseUrl = process.env.NEXT_PUBLIC_FILE_URL || 'https://mushrf.net';
      window.open(`${baseUrl}/${fileUrl}`, '_blank');
      Tostget(t('reports.reportGenerated'));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    return num.toLocaleString('en-US');
  };

  const _calculateProgress = () => {
    if (!reportData?.countStageall || !reportData?.countSTageTrue) return 0;
    return ((reportData.countSTageTrue / reportData.countStageall) * 100);
  };

  // No permission check - All users can access reports page (matching mobile app)
  // Backend will filter results based on user permissions
  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title={t('reports.title')}
          actions={
            reportData ? (
              <button
                onClick={() => setShowPDFPreview(true)}
                className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: colors.BLUE }}
              >
                تصدير PDF
              </button>
            ) : null
          }
        />
      }
    >
      <ContentSection>
        {/* Selection Buttons */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Branch Selection */}
            <div className="flex-1 flex gap-2">
              <button
                onClick={() => setShowBranchModal(true)}
                disabled={branchesLoading}
                className="flex-1 p-4 border-2 border-dashed rounded-xl text-center hover:bg-gray-50 transition-colors"
                style={{
                  borderColor: 'rgba(27, 78, 209, 0.2)',
                  backgroundColor: colors.WHITE
                }}
              >
                <span
                  style={{
                    fontFamily: fonts.IBMPlexSansArabicMedium,
                    fontSize: verticalScale(16),
                    color: colors.BLACK
                  }}
                  dir="rtl"
                >
                  {branchesLoading ? 'جاري التحميل...' : (selectedBranch?.NameSub || 'اختر الفرع')}
                </span>
              </button>

              {/* Refresh Branches Button */}
              <button
                onClick={() => fetchBranches()}
                disabled={branchesLoading}
                className="px-4 py-2 rounded-xl border-2 hover:bg-gray-50 transition-colors"
                style={{
                  borderColor: 'rgba(27, 78, 209, 0.2)',
                  backgroundColor: colors.WHITE
                }}
                title={t('reports.updateBranches')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </button>
            </div>

            {/* Project Selection */}
            <div className="flex-1">
              {!selectedBranch ? (
                <div className="p-4 border-2 border-dashed rounded-xl text-center opacity-50"
                  style={{
                    borderColor: 'rgba(27, 78, 209, 0.2)',
                    backgroundColor: colors.WHITE
                  }}
                >
                  <span
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      fontSize: verticalScale(16),
                      color: colors.BLACK
                    }}
                    dir="rtl"
                  >
                    اختر الفرع أولاً
                  </span>
                </div>
              ) : projectsLoading ? (
                <div className="p-4 border-2 border-dashed rounded-xl text-center"
                  style={{
                    borderColor: 'rgba(27, 78, 209, 0.2)',
                    backgroundColor: colors.WHITE
                  }}
                >
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-2"></div>
                    <span
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicMedium,
                        fontSize: verticalScale(16),
                        color: colors.BLACK
                      }}
                      dir="rtl"
                    >
                      {t('reports.loadingProjects')}
                    </span>
                  </div>
                </div>
              ) : projects.length > 0 ? (
                <div className="border-2 rounded-xl"
                  style={{
                    borderColor: 'rgba(27, 78, 209, 0.2)',
                    backgroundColor: colors.WHITE
                  }}
                >
                  <div className="p-3 border-b border-gray-200">
                    <span
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        fontSize: verticalScale(14),
                        color: colors.BLUE
                      }}
                      dir="rtl"
                    >
                      {t('reports.projects')} ({projects.length})
                    </span>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => handleProjectSelect(project)}
                        className={`w-full text-right px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          selectedProject?.id === project.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <span
                          style={{
                            fontFamily: fonts.IBMPlexSansArabicRegular,
                            fontSize: verticalScale(14),
                            color: selectedProject?.id === project.id ? colors.BLUE : colors.BLACK
                          }}
                          dir="rtl"
                        >
                          {project.Nameproject}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed rounded-xl text-center"
                  style={{
                    borderColor: 'rgba(27, 78, 209, 0.2)',
                    backgroundColor: colors.WHITE
                  }}
                >
                  <span
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      fontSize: verticalScale(16),
                      color: colors.BLACK
                    }}
                    dir="rtl"
                  >
                    لا توجد مشاريع متاحة
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Report Type Buttons - Matching Mobile App */}
          {selectedProject && (
            <div className="mt-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ backgroundColor: colors.WHITE }}>
                <h3
                  className="mb-4 text-center"
                  style={{
                    fontFamily: fonts.IBMPlexSansArabicSemiBold,
                    fontSize: verticalScale(16),
                    color: colors.BLACK
                  }}
                  dir="rtl"
                >
                  {t('reports.reportType')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Report 1: Requests Report (تقرير طلبيات) */}
                  <button
                    onClick={() => handleGenerateReport(1)}
                    disabled={reportLoading}
                    className="p-4 border-2 rounded-xl text-center hover:bg-blue-50 hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      borderColor: 'rgba(27, 78, 209, 0.2)',
                      backgroundColor: colors.WHITE
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {/* Shopping cart icon for requests/orders */}
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                      </svg>
                      <span
                        style={{
                          fontFamily: fonts.IBMPlexSansArabicMedium,
                          fontSize: verticalScale(14),
                          color: colors.BLACK
                        }}
                        dir="rtl"
                      >
                        {t('reports.requestsReport')}
                      </span>
                    </div>
                  </button>

                  {/* Report 2: Financial Statement - All (تقرير ماليه شامل) */}
                  <button
                    onClick={() => handleGenerateReport(2)}
                    disabled={reportLoading}
                    className="p-4 border-2 rounded-xl text-center hover:bg-blue-50 hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      borderColor: 'rgba(27, 78, 209, 0.2)',
                      backgroundColor: colors.WHITE
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {/* Covenant/Financial custody icon - matching projects page */}
                      <svg width="28" height="28" viewBox="0 0 1124.14 1256.39" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z" fill={colors.BLUE}/>
                        <path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z" fill={colors.BLUE}/>
                      </svg>
                      <span
                        style={{
                          fontFamily: fonts.IBMPlexSansArabicMedium,
                          fontSize: verticalScale(14),
                          color: colors.BLACK
                        }}
                        dir="rtl"
                      >
                        {t('reports.financialReport')}
                      </span>
                    </div>
                  </button>

                  {/* Report 3: Expenses Report (تقرير مصروفات) */}
                  <button
                    onClick={() => handleGenerateReport(3)}
                    disabled={reportLoading}
                    className="p-4 border-2 rounded-xl text-center hover:bg-blue-50 hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      borderColor: 'rgba(27, 78, 209, 0.2)',
                      backgroundColor: colors.WHITE
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {/* Credit card icon for expenses */}
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                      <span
                        style={{
                          fontFamily: fonts.IBMPlexSansArabicMedium,
                          fontSize: verticalScale(14),
                          color: colors.BLACK
                        }}
                        dir="rtl"
                      >
                        {t('reports.expensesReport')}
                      </span>
                    </div>
                  </button>

                  {/* Report 4: Timeline Report (الجدول الزمني) */}
                  <button
                    onClick={() => handleGenerateReport(4)}
                    disabled={reportLoading}
                    className="p-4 border-2 rounded-xl text-center hover:bg-blue-50 hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      borderColor: 'rgba(27, 78, 209, 0.2)',
                      backgroundColor: colors.WHITE
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {/* Calendar icon for timeline/schedule */}
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span
                        style={{
                          fontFamily: fonts.IBMPlexSansArabicMedium,
                          fontSize: verticalScale(14),
                          color: colors.BLACK
                        }}
                        dir="rtl"
                      >
                        الجدول الزمني
                      </span>
                    </div>
                  </button>

                  {/* Report 5: Statistical Report (تقرير احصائي للمشروع) */}
                  <button
                    onClick={() => handleGenerateReport(5)}
                    disabled={reportLoading}
                    className="p-4 border-2 rounded-xl text-center hover:bg-blue-50 hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      borderColor: 'rgba(27, 78, 209, 0.2)',
                      backgroundColor: colors.WHITE
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {/* Pie chart icon for statistical report */}
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
                        <path d="M22 12A10 10 0 0 0 12 2v10z"/>
                      </svg>
                      <span
                        style={{
                          fontFamily: fonts.IBMPlexSansArabicMedium,
                          fontSize: verticalScale(14),
                          color: colors.BLACK
                        }}
                        dir="rtl"
                      >
                        {t('reports.statisticalReport')}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Loading Indicator for Report Generation */}
                {reportLoading && (
                  <div className="flex items-center justify-center mt-4 pt-4 border-t border-gray-200">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-2"></div>
                    <span
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: verticalScale(14),
                        color: colors.BLACK
                      }}
                      dir="rtl"
                    >
                      {t('reports.generatingReport')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center mt-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span
                className="mr-3 text-gray-600"
                style={{
                  fontFamily: fonts.IBMPlexSansArabicRegular,
                  fontSize: verticalScale(14)
                }}
              >
                {t('reports.loadingReport')}
              </span>
            </div>
          )}

        
        {!reportData ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-gray-400 mb-4">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <p 
              className="text-gray-500 text-center max-w-md"
              style={{
                fontFamily: fonts.IBMPlexSansArabicRegular,
                fontSize: verticalScale(16)
              }}
              dir="rtl"
            >
              {t('reports.selectProject')}
            </p>
            <div 
              className="w-32 h-px bg-gray-200 mt-4"
              style={{ backgroundColor: colors.BORDER }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Report Header with Logo */}
            <div
              className="bg-white rounded-2xl p-6 shadow-sm text-center"
              style={{ backgroundColor: colors.WHITE }}
            >
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-2xl p-5 shadow-md mb-4">
                  <Image
                    src="/logo-new.png"
                    alt="شعار مُشرِف"
                    width={160}
                    height={80}
                    className="h-20 w-auto"
                    priority
                    style={{ imageRendering: 'crisp-edges' as any }}
                  />
                </div>
                <h1
                  className="text-lg font-bold"
                  style={{
                    fontFamily: fonts.IBMPlexSansArabicBold,
                    fontSize: verticalScale(18),
                    color: colors.BLUE
                  }}
                  dir="rtl"
                >
                  {t('reports.projectReport')}
                </h1>
              </div>
            </div>

            {/* Project Info */}
            <div
              className="bg-white rounded-2xl p-6 shadow-sm"
              style={{ backgroundColor: colors.WHITE }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <span 
                      className="text-gray-600 block"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: verticalScale(14)
                      }}
                    >
                      المشترك:
                    </span>
                    <span 
                      className="font-semibold"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        fontSize: verticalScale(16),
                        color: colors.BLACK
                      }}
                    >
                      {reportData.NameCompany}
                    </span>
                  </div>
                  <div>
                    <span 
                      className="text-gray-600 block"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: verticalScale(14)
                      }}
                    >
                      اسم المشروع:
                    </span>
                    <span 
                      className="font-semibold"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        fontSize: verticalScale(16),
                        color: colors.BLACK
                      }}
                    >
                      {reportData.Nameproject}
                    </span>
                  </div>
                  <div>
                    <span 
                      className="text-gray-600 block"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: verticalScale(14)
                      }}
                    >
                      النوع:
                    </span>
                    <span
                      className="font-semibold theme-text-primary"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        fontSize: verticalScale(16)
                      }}
                    >
                      {reportData.TypeOFContract}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span 
                      className="text-gray-600 block"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: verticalScale(14)
                      }}
                    >
                      تاريخ البداية:
                    </span>
                    <span 
                      className="font-semibold"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        fontSize: verticalScale(16),
                        color: colors.BLACK
                      }}
                    >
                      {formatDate(reportData.startDateProject)}
                    </span>
                  </div>
                  <div>
                    <span 
                      className="text-gray-600 block"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: verticalScale(14)
                      }}
                    >
                      تاريخ النهاية:
                    </span>
                    <span 
                      className="font-semibold"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        fontSize: verticalScale(16),
                        color: colors.BLACK
                      }}
                    >
                      {formatDate(reportData.EndDateProject)}
                    </span>
                  </div>
                  <div>
                    <span 
                      className="text-gray-600 block"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: verticalScale(14)
                      }}
                    >
                      الزمن المتبقي:
                    </span>
                    <span 
                      className="font-semibold"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        fontSize: verticalScale(16),
                        color: (reportData.Daysremaining || 0) < 0 ? colors.RED : colors.BLACK
                      }}
                    >
                      {reportData.Daysremaining} يوم
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Chart */}
              <div className="mt-6 flex justify-center">
                <ProgressChart
                  total={reportData.countStageall || 0}
                  completed={reportData.countSTageTrue || 0}
                  pending={reportData.StagesPending || 0}
                  size={280}
                  strokeWidth={24}
                />
              </div>
            </div>

            {/* Financial Summary */}
            <div 
              className="bg-white rounded-2xl p-6 shadow-sm"
              style={{ backgroundColor: colors.WHITE }}
            >
              <h3 
                className="text-lg font-semibold mb-4"
                style={{
                  fontFamily: fonts.IBMPlexSansArabicSemiBold,
                  fontSize: verticalScale(18),
                  color: colors.BLACK
                }}
                dir="rtl"
              >
                الملخص المالي
              </h3>
              
              {/* Financial Bar Chart */}
              <div className="mb-6">
                <FinancialBarChart
                  revenue={reportData.TotalRevenue || 0}
                  expense={reportData.TotalExpense || 0}
                  returns={reportData.TotalReturns || 0}
                  height={200}
                  className="bg-gray-50 rounded-xl p-4"
                />
              </div>

              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div
                    className="text-2xl font-bold text-green-600"
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicBold,
                      fontSize: verticalScale(20)
                    }}
                  >
                    {formatNumber(reportData.TotalRevenue)}
                  </div>
                  <div
                    className="text-sm text-green-700 mt-1"
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicRegular,
                      fontSize: verticalScale(12)
                    }}
                  >
                    العهد
                  </div>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <div
                    className="text-2xl font-bold text-red-600"
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicBold,
                      fontSize: verticalScale(20)
                    }}
                  >
                    {formatNumber(reportData.TotalExpense)}
                  </div>
                  <div
                    className="text-sm text-red-700 mt-1"
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicRegular,
                      fontSize: verticalScale(12)
                    }}
                  >
                    المصروفات
                  </div>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-xl">
                  <div
                    className="text-2xl font-bold text-yellow-600"
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicBold,
                      fontSize: verticalScale(20)
                    }}
                  >
                    {formatNumber(reportData.TotalReturns)}
                  </div>
                  <div
                    className="text-sm text-yellow-700 mt-1"
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicRegular,
                      fontSize: verticalScale(12)
                    }}
                  >
                    المرتجعات
                  </div>
                </div>
              </div>

              {/* Total Cost */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl flex justify-between items-center">
                <span 
                  style={{
                    fontFamily: fonts.IBMPlexSansArabicMedium,
                    fontSize: verticalScale(16),
                    color: colors.BLACK
                  }}
                  dir="rtl"
                >
                  إجمالي تكاليف المشروع
                </span>
                <span 
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: fonts.IBMPlexSansArabicBold,
                    fontSize: verticalScale(20),
                    color: colors.BLUE
                  }}
                >
                  {formatNumber(reportData.TotalcosttothCompany)} ر.س
                </span>
              </div>
            </div>

            {/* Delays Table */}
            {reportData.DelayProject && reportData.DelayProject.length > 0 && (
              <div
                className="bg-white rounded-2xl p-6 shadow-sm"
                style={{ backgroundColor: colors.WHITE }}
              >
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{
                    fontFamily: fonts.IBMPlexSansArabicSemiBold,
                    fontSize: verticalScale(18),
                    color: colors.BLACK
                  }}
                  dir="rtl"
                >
                  تأخيرات المشروع
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th
                          className="border border-gray-200 p-3 text-center"
                          style={{
                            fontFamily: fonts.IBMPlexSansArabicMedium,
                            fontSize: verticalScale(14),
                            color: colors.BLUE
                          }}
                        >
                          التاريخ
                        </th>
                        <th
                          className="border border-gray-200 p-3 text-center"
                          style={{
                            fontFamily: fonts.IBMPlexSansArabicMedium,
                            fontSize: verticalScale(14),
                            color: colors.BLUE
                          }}
                        >
                          ملاحظة
                        </th>
                        <th
                          className="border border-gray-200 p-3 text-center"
                          style={{
                            fontFamily: fonts.IBMPlexSansArabicMedium,
                            fontSize: verticalScale(14),
                            color: colors.BLUE
                          }}
                        >
                          المتسبب
                        </th>
                        <th
                          className="border border-gray-200 p-3 text-center"
                          style={{
                            fontFamily: fonts.IBMPlexSansArabicMedium,
                            fontSize: verticalScale(14),
                            color: colors.BLUE
                          }}
                        >
                          عدد التأخيرات
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.DelayProject.map((delay, index) => (
                        <tr key={index}>
                          <td
                            className="border border-gray-200 p-3 text-center"
                            style={{
                              fontFamily: fonts.IBMPlexSansArabicRegular,
                              fontSize: verticalScale(13),
                              color: colors.BLACK
                            }}
                          >
                            {formatDate(delay.DateNote)}
                          </td>
                          <td
                            className="border border-gray-200 p-3"
                            style={{
                              fontFamily: fonts.IBMPlexSansArabicRegular,
                              fontSize: verticalScale(13),
                              color: colors.BLACK
                            }}
                          >
                            {delay.Note}
                          </td>
                          <td
                            className="border border-gray-200 p-3 text-center"
                            style={{
                              fontFamily: fonts.IBMPlexSansArabicRegular,
                              fontSize: verticalScale(13),
                              color: colors.BLACK
                            }}
                          >
                            {delay.Type}
                          </td>
                          <td
                            className="border border-gray-200 p-3 text-center"
                            style={{
                              fontFamily: fonts.IBMPlexSansArabicRegular,
                              fontSize: verticalScale(13),
                              color: colors.RED
                            }}
                          >
                            {delay.countdayDelay}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Team Info */}
            {(reportData.boss || reportData.MostAccomplished?.length) && (
              <div 
                className="bg-white rounded-2xl p-6 shadow-sm"
                style={{ backgroundColor: colors.WHITE }}
              >
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{
                    fontFamily: fonts.IBMPlexSansArabicSemiBold,
                    fontSize: verticalScale(18),
                    color: colors.BLACK
                  }}
                  dir="rtl"
                >
                  فريق العمل
                </h3>
                
                {reportData.boss && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span 
                        style={{
                          fontFamily: fonts.IBMPlexSansArabicMedium,
                          fontSize: verticalScale(14),
                          color: colors.BLACK
                        }}
                      >
                        مدير الفرع:
                      </span>
                      <span 
                        style={{
                          fontFamily: fonts.IBMPlexSansArabicSemiBold,
                          fontSize: verticalScale(16),
                          color: colors.BLACK
                        }}
                      >
                        {reportData.boss}
                      </span>
                    </div>
                  </div>
                )}

                {reportData.MostAccomplished?.map((member, index) => (
                  <div key={index} className="mb-2 p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <span 
                          style={{
                            fontFamily: fonts.IBMPlexSansArabicMedium,
                            fontSize: verticalScale(14),
                            color: colors.BLACK
                          }}
                        >
                          مهندس الموقع:
                        </span>
                        <span 
                          className="mr-2"
                          style={{
                            fontFamily: fonts.IBMPlexSansArabicSemiBold,
                            fontSize: verticalScale(16),
                            color: colors.BLACK
                          }}
                        >
                          {member.userName}
                        </span>
                      </div>
                      <div className="text-left">
                        <div 
                          style={{
                            fontFamily: fonts.IBMPlexSansArabicSemiBold,
                            fontSize: verticalScale(14),
                            color: colors.BLUE
                          }}
                        >
                          {member.Count} مهمة
                        </div>
                        <div 
                          style={{
                            fontFamily: fonts.IBMPlexSansArabicRegular,
                            fontSize: verticalScale(12),
                            color: colors.BLACK
                          }}
                        >
                          {member.rate?.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </ContentSection>

      {/* Selection Modals */}
      <SelectionModal
        isOpen={showBranchModal}
        onClose={() => setShowBranchModal(false)}
        title="اختر الفرع"
        items={branches}
        onSelect={handleBranchSelect}
        loading={branchesLoading}
      />



      {/* PDF Preview Modal */}
      {reportData && (
        <PDFPreview
          reportData={reportData}
          isOpen={showPDFPreview}
          onClose={() => setShowPDFPreview(false)}
        />
      )}
    </ResponsiveLayout>
  );
}