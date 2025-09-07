'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import ButtonLong from '@/components/design/ButtonLong';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { useAppDispatch } from '@/store';
import { setUser } from '@/store/slices/userSlice';
import IconMoshrif from '@/components/icons/IconMoshrif';

export default function WelcomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [systemCheck, setSystemCheck] = useState<any>({});

  useEffect(() => {
    // Initialize app
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if user is already logged in
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          const userData = JSON.parse(storedUser);
          // Validate that user data has required fields
          if (userData.accessToken && userData.data?.userName) {
            dispatch(setUser(userData));
            router.replace('/home');
            return;
          } else {
            // Invalid user data, clear it
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        } catch (parseError) {
          // Corrupted data, clear it
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }

      // Show welcome screen after loading
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Initialization error:', error);
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8 flex items-center justify-center"
          >
            <IconMoshrif size={120} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex justify-center space-x-1 space-x-reverse"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-blue rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Section - exactly like mobile: blue background with white circle */}
      <div className="flex-[0.5] bg-home relative overflow-hidden flex items-center justify-center w-full">
        {/* White Circle Background - exact mobile positioning */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute bg-white rounded-full"
          style={{
            width: `${verticalScale(370)}px`,
            height: `${verticalScale(370)}px`,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Logo Container - improved alignment */}
        <div className="absolute w-full h-full flex items-center justify-center z-10" style={{ top: '5%' }}>
          <div className="flex items-center justify-center w-full" style={{ flexDirection: 'row', gap: '0px' }}>
            {/* Vector Image - improved dimensions for better balance */}
            <motion.div
              initial={{ x: 390, rotate: 10 }}
              animate={{ x: 0, rotate: 0 }}
              transition={{ duration: 1.05, ease: "linear", delay: 0.7 }}
              className="overflow-hidden flex items-center"
              style={{
                width: '115px',
                height: `${verticalScale(120)}px`,
                marginTop: '0px',
                margin: '0px'
              }}
            >
              <Image
                src="/images/figma/Vector.png"
                alt="Vector"
                width={200}
                height={200}
                className="object-contain"
                style={{
                  width: "100%",
                  height: "auto",
                  maxWidth: "100px",
                  imageRendering: "crisp-edges"
                }}
                priority
                quality={100}
              />
            </motion.div>
            
            {/* مشرف Text - wider and aligned with logo */}
            <motion.span
              initial={{ x: -390, rotate: -10 }}
              animate={{ x: 0, rotate: 0 }}
              transition={{ duration: 1.05, ease: "linear", delay: 0.7 }}
              className="font-ibm-arabic-bold text-blue self-center"
              style={{
                fontSize: `${scale(50)}px`,
                fontWeight: 'bolder',
                letterSpacing: '1px',
                marginLeft: '-5px',
                marginRight: '0px',
                color: colors.BLUE,
                lineHeight: '1',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              مشرف
            </motion.span>
          </div>
        </div>
      </div>

      {/* Bottom Section - exactly like mobile: white background */}
      <div 
        className="flex-[0.5] bg-white flex flex-col justify-start items-center"
        style={{ 
          marginTop: `${verticalScale(10)}px`,
          marginBottom: `${verticalScale(10)}px`
        }}
      >
        <div style={{ 
          marginTop: `${verticalScale(50)}px`,
          marginBottom: `${verticalScale(50)}px`
        }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-center mb-8"
          >
            <h2 
              className="font-ibm-arabic-semibold text-black mb-4 text-center"
              style={{ 
                fontSize: `${verticalScale(21)}px`,
                width: `${scale(312)}px`,
                fontWeight: '600',
                color: colors.BLACK,
                fontFamily: fonts.IBMPlexSansArabicSemiBold
              }}
            >
              وداعاً للطرق التقليدية في إدارة المشاريع مرحباً بالإدارة الذكية !
            </h2>
            
            <p 
              className="font-ibm-arabic-medium text-border text-center"
              style={{ 
                fontSize: `${verticalScale(14)}px`,
                width: `${scale(312)}px`,
                fontWeight: '500',
                color: colors.BORDER,
                fontFamily: fonts.IBMPlexSansArabicMedium
              }}
            >
              وفر وقتك وجهدك مع حلولنا الالكترونية المصممة خصيصاً لمشاريع البناء
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            style={{ marginTop: `${verticalScale(20)}px` }}
          >
            <ButtonLong
              text="تسجيل دخول"
              onPress={handleLogin}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}