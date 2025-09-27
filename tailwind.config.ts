import type { Config } from 'tailwindcss'
import { colors } from './src/constants/colors'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        // نقل جميع الألوان من الثوابت
        white: colors.WHITE,
        black: colors.BLACK,
        dark: colors.DARK,
        darkm: colors.DARKM,
        red: colors.RED,
        yalo: colors.YALO,
        ashen: colors.ASHEN,
        grey: colors.GREY,
        greyd: colors.GREYD,
        lightGrey: colors.LIGHT_GREY,
        blue: colors.BLUE,
        bluebrith: colors.BLUEBRITH,
        home: colors.HOME,
        backgroundPage: colors.BACKGRUONDPAG,
        current: colors.CURRENT,
        bluedark: colors.BLUEDARK,
        border: colors.BORDER,
        premrey: colors.PREMREY,
        premreyon: colors.PREMREYON,
        banaf: colors.BANAF,
        pink: colors.PINK,
        greay: colors.GREAY,
        green: colors.GREEN,
        green2: colors.GREEN2,
        softmintgreen: colors.SOFTMINTGREEN,
        lightmist: colors.LIGHTMIST,
        peach: colors.PEACH,
        mistyrose: colors.MISTYROSE,
        darkslategray: colors.DARKSLATEGRAY,
        orange: colors.ORANGE,
        longpress: colors.LONGPRESS,
        goldennectar: colors.GOLDENNECTAR,
        bordercolor: colors.BORDERCOLOR,
      },
      fontFamily: {
        // الخطوط العربية
        'tajawal': ['Tajawal-Regular', 'sans-serif'],
        'tajawal-bold': ['Tajawal-ExtraBold', 'sans-serif'],
        'cairo': ['Cairo-Regular', 'sans-serif'],
        'cairo-bold': ['Cairo-Bold', 'sans-serif'],
        'cairo-medium': ['Cairo-Medium', 'sans-serif'],
        'cairo-semibold': ['Cairo-SemiBold', 'sans-serif'],
        'changa': ['Changa-Regular', 'sans-serif'],
        'changa-bold': ['Changa-Bold', 'sans-serif'],
        'ibm-arabic': ['IBMPlexSansArabic-Regular', 'sans-serif'],
        'ibm-arabic-bold': ['IBMPlexSansArabic-Bold', 'sans-serif'],
        'ibm-arabic-medium': ['IBMPlexSansArabic-Medium', 'sans-serif'],
        'ibm-arabic-semibold': ['IBMPlexSansArabic-SemiBold', 'sans-serif'],
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
