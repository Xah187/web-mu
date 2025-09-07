'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';
import ArrowIcon from '@/components/icons/ArrowIcon';
import Image from 'next/image';

export default function AboutPage() {
  const router = useRouter();
  const { size } = useAppSelector(state => state.user);
  const [expandedFeature, setExpandedFeature] = useState(0);

  const features = [
    {
      id: 1,
      name: "* إشراف ومتابعة إلكترونية",
      description: "تسهّل المنصة عملية التواصل بين جميع الأطراف المرتبطة بالمشروع، مما يضمن شفافية العمل وسرعة اتخاذ القرارات."
    },
    {
      id: 2,
      name: "* توثيق وتسجيل تلقائي",
      description: "تم تسجيل كافة العمليات والتحديثات إلكترونيًا، مما يسهم في أرشفة البيانات وسهولة الرجوع إليها عند الحاجة."
    },
    {
      id: 3,
      name: "* إدارة مالية دقيقة",
      description: "تساعد المنصة في مراقبة التكاليف والمصروفات، مما يعزز الرقابة المالية ويضمن تحقيق أعلى مستويات الكفاءة."
    },
    {
      id: 4,
      name: "* تقارير لحظية",
      description: "توفر المنصة إمكانية استدعاء التقارير الفنية والمالية في أي وقت، مما يسهل عملية التحليل واتخاذ القرارات المناسبة."
    },
    {
      id: 5,
      name: "* تكامل بين الأطراف",
      description: "تربط المنصة بين الملاك والمشرفين والمقاولين، مما يضمن سير العمل بانتظام وفق الجدول الزمني المخطط له."
    },
    {
      id: 6,
      name: "* تنبيهات وإشعارات ذكية",
      description: "تُمكّن المستخدمين من تلقي إشعارات فورية حول تقدم المشروع أو أي تحديثات ضرورية."
    },
    {
      id: 7,
      name: "* إدارة العقود والمستندات",
      description: "توفر المنصة نظامًا رقميًا لحفظ العقود والمستندات، مما يضمن سهولة الوصول إليها في أي وقت."
    },
    {
      id: 8,
      name: "* ️طلب المواد والكميات",
      description: "تتيح المنصة تسجيل التوريد وضمان توفر المواد في الوقت المناسب."
    },
    {
      id: 9,
      name: "* أمان وخصوصية",
      description: "تعتمد المنصة على تقنيات متقدمة لحماية بيانات المستخدمين وضمان سرية المعلومات."
    }
  ];

  const textStyle = {
    fontSize: verticalScale(14 + size),
    fontFamily: fonts.IBMPlexSansArabicSemiBold,
    color: '#212121',
  };

  const subHeaderStyle = {
    fontSize: verticalScale(17 + size),
    fontFamily: fonts.IBMPlexSansArabicSemiBold,
    color: colors.BLACK,
    marginBottom: 8,
  };

  return (
    <div className="min-h-screen bg-home">
      {/* Header */}
      <div className="bg-white rounded-b-3xl w-full justify-end p-4" style={{ height: '15%' }}>
        <div 
          className="h-3/5 justify-around items-center"
          style={{
            top: verticalScale(20),
            marginTop: verticalScale(30),
            marginBottom: verticalScale(30)
          }}
        >
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors self-start"
          >
            <ArrowIcon size={24} />
          </button>
          
          <p
            className="font-ibm-arabic-semibold text-black text-center"
            style={{ fontSize: verticalScale(16 + size) }}
          >
            حول منصة مشرف
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 bg-home">
        {/* Introduction Section */}
        <div className="bg-white p-5 rounded-3xl mb-5">
          <p className="text-right" style={textStyle}>
            منصة مشرف هي الحل الرقمي المتكامل لإدارة المشاريع والأنشطة المتعلقة
            بالمقاولات والإشراف الفني والمالي للمباني، حيث توفر تجربة ذكية
            ومتطورة تساهم في تحسين الأداء وتسريع تنفيذ المشاريع بجودة وكفاءة
            عالية.
          </p>
        </div>

        {/* Why Moshrif Section */}
        <p style={subHeaderStyle}>لماذا منصة مشرف؟</p>
        <div className="bg-white p-5 rounded-3xl mb-5">
          <p className="text-right" style={textStyle}>
            في ظل التطور التكنولوجي المتسارع، أصبح من الضروري الاعتماد على حلول
            رقمية تسهّل عمليات البناء والإشراف وتضمن تحقيق الأهداف بأعلى
            المعايير. تقدم منصة مشرف أدوات متقدمة تُمكّن المستخدمين من إدارة
            مشاريعهم بكفاءة، بدءًا من التخطيط وحتى التسليم النهائي.
          </p>
        </div>

        {/* Features Section */}
        <p style={subHeaderStyle}>مميزات منصة مشرف:</p>
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => setExpandedFeature(expandedFeature === feature.id ? 0 : feature.id)}
            className="w-full bg-white p-5 rounded-3xl mb-5 text-right hover:bg-gray-50 transition-colors"
          >
            <p style={textStyle}>{feature.name}</p>
            {expandedFeature === feature.id && (
              <p style={textStyle} className="mt-2">
                {feature.description}
              </p>
            )}
          </button>
        ))}

        {/* How it Works Section */}
        <p style={subHeaderStyle}>كيف تعمل منصة مشرف؟</p>
        <div className="bg-white p-5 rounded-3xl mb-5">
          <div className="space-y-3">
            <div>
              <p style={{ ...textStyle, color: colors.BLUE }}>- تسجيل المشروع</p>
              <p style={textStyle}>يقوم المالك أو المقاول بإدخال بيانات المشروع وتفاصيله عبر المنصة.</p>
            </div>
            
            <div>
              <p style={{ ...textStyle, color: colors.BLUE }}>- إضافة الفرق والأدوار</p>
              <p style={textStyle}>يتم تحديد المشرفين والمهندسين المسؤولين عن التنفيذ والمتابعة.</p>
            </div>
            
            <div>
              <p style={{ ...textStyle, color: colors.BLUE }}>- تحديث مستمر</p>
              <p style={textStyle}>يتم تسجيل مراحل المشروع خطوة بخطوة مع توثيق كافة العمليات إلكترونيًا.</p>
            </div>
            
            <div>
              <p style={{ ...textStyle, color: colors.BLUE }}>- إصدار التقارير</p>
              <p style={textStyle}>يمكن استخراج التقارير المالية والفنية بدقة عالية عند الحاجة.</p>
            </div>
            
            <div>
              <p style={{ ...textStyle, color: colors.BLUE }}>- التواصل الفعّال</p>
              <p style={textStyle}>تتيح المنصة قنوات اتصال مباشرة بين جميع الأطراف لضمان تحقيق الأهداف.</p>
            </div>
          </div>
        </div>

        {/* Footer with Logo and Version */}
        <div 
          className="items-center justify-center mb-20"
          style={{ 
            alignItems: 'center', 
            margin: verticalScale(10), 
            marginBottom: verticalScale(100) 
          }}
        >
          <div className="flex justify-center mb-4">
            <Image 
              src="/images/figma/moshrif.png" 
              alt="Moshrif Logo" 
              width={70} 
              height={70} 
              className="object-contain"
            />
          </div>

          <p 
            className="text-center"
            style={{
              color: colors.BLUE,
              fontFamily: fonts.IBMPlexSansArabicRegular,
              fontSize: verticalScale(14 + size),
            }}
          >
            رقم الاصدار (1.0.0)
          </p>
        </div>
      </div>
    </div>
  );
}
