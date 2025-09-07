import React from 'react';

export function EditIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.8124 6.73459L16.0388 5.50805C16.7163 4.83065 17.8146 4.83065 18.492 5.50805C19.1693 6.18545 19.1693 7.28373 18.492 7.96113L17.2654 9.18767M14.8124 6.73459L7.60771 13.9393C6.69307 14.8539 6.23573 15.3112 5.92433 15.8685C5.61291 16.4258 5.2996 17.7417 5 19C6.25833 18.7004 7.57425 18.3871 8.13153 18.0756C8.68882 17.7642 9.14614 17.307 10.0608 16.3923L17.2654 9.18767M14.8124 6.73459L17.2654 9.18767" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 19H16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function EditSquareIcon({ size = 18, color = '#9BA2B1' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.1606 3.73679L13.2119 2.68547C13.7925 2.10484 14.7339 2.10484 15.3145 2.68547C15.8951 3.2661 15.8951 4.20748 15.3145 4.78811L14.2632 5.83943M12.1606 3.73679L8.23515 7.66222C7.4512 8.4462 7.05919 8.83815 6.79228 9.31582C6.52535 9.7935 6.2568 10.9214 6 12C7.07857 11.7432 8.2065 11.4746 8.68418 11.2077C9.16185 10.9408 9.5538 10.5488 10.3378 9.76485L14.2632 5.83943M12.1606 3.73679L14.2632 5.83943" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.75 9C15.75 12.1819 15.75 13.773 14.7615 14.7615C13.773 15.75 12.1819 15.75 9 15.75C5.81802 15.75 4.22703 15.75 3.23851 14.7615C2.25 13.773 2.25 12.1819 2.25 9C2.25 5.81802 2.25 4.22703 3.23851 3.23851C4.22703 2.25 5.81802 2.25 9 2.25" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function EditNoteIcon({ size = 20, color = '#2117FB' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.57425 18.3011H7.82584C5.11876 18.3011 3.76522 18.3011 2.92424 17.4469C2.08325 16.5925 2.08325 15.2176 2.08325 12.4678V8.3011C2.08325 5.55124 2.08325 4.17632 2.92424 3.32205C3.76522 2.46777 5.11876 2.46777 7.82584 2.46777H10.2869C12.994 2.46777 14.5755 2.51376 15.4166 3.36803C16.2576 4.2223 16.2499 5.55124 16.2499 8.3011V9.28977" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.2877 1.66675V3.33341M9.121 1.66675V3.33341M4.95435 1.66675V3.33341" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.83325 12.4999H9.16659M5.83325 8.33325H12.4999" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path opacity="0.93" d="M17.2999 12.3988C16.5454 11.5535 16.0927 11.6038 15.5897 11.7547C15.2376 11.8051 14.0304 13.2141 13.5274 13.6627C12.7016 14.4786 11.872 15.3186 11.8173 15.4282C11.6609 15.6824 11.5155 16.1327 11.4451 16.6359C11.3143 17.3907 11.1256 18.2405 11.3646 18.3133C11.6035 18.3861 12.2699 18.2462 13.0244 18.1355C13.5274 18.0449 13.8795 17.9442 14.131 17.7933C14.4831 17.582 15.137 16.8372 16.2637 15.7301C16.9704 14.9861 17.6519 14.4721 17.8532 13.9689C18.0544 13.2141 17.7526 12.8115 17.2999 12.3988Z" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function EditPenIcon({ size = 24, color = 'black' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.0737 3.88545C14.8189 3.07808 15.1915 2.6744 15.5874 2.43893C16.5427 1.87076 17.7191 1.85309 18.6904 2.39232C19.0929 2.6158 19.4769 3.00812 20.245 3.79276C21.0131 4.5774 21.3972 4.96972 21.6159 5.38093C22.1438 6.37312 22.1265 7.57479 21.5703 8.5507C21.3398 8.95516 20.9446 9.33578 20.1543 10.097L10.7506 19.1543C9.25288 20.5969 8.504 21.3182 7.56806 21.6837C6.63212 22.0493 5.6032 22.0224 3.54536 21.9686L3.26538 21.9613C2.63891 21.9449 2.32567 21.9367 2.14359 21.73C1.9615 21.5234 1.98636 21.2043 2.03608 20.5662L2.06308 20.2197C2.20301 18.4235 2.27297 17.5255 2.62371 16.7182C2.97444 15.9109 3.57944 15.2555 4.78943 13.9445L14.0737 3.88545Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M13 4L20 11" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 22H22" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default EditIcon;
