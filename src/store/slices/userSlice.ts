import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PermissionType, BossType } from '@/types/permissions';

interface User {
  accessToken: string;
  data: {
    ID: string;
    UserID: string;
    userName: string;
    IDCompany: string;
    CompanyName: string;
    Email: string;
    PhoneNumber: string;
    job: string;
    jobdiscrption: string;
    DateOFlogin: string;
    token: string;
    CommercialRegistrationNumber?: string;
    Covenantnumber?: number;
    DisabledFinance?: string; // Finance operations status
  };
  size: number; // Font size preference
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  size: number;
  language: 'ar' | 'en';
  theme: 'light' | 'dark';
  Validity: PermissionType[];
  boss: BossType;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  size: 0,
  language: 'ar',
  theme: 'light',
  Validity: [],
  boss: '' as BossType,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    updateCompanyInfo: (state, action: PayloadAction<{ NameCompany?: string; CommercialRegistrationNumber?: string }>) => {
      if (state.user?.data) {
        if (action.payload.NameCompany) {
          state.user.data.CompanyName = action.payload.NameCompany;
        }
        if (action.payload.CommercialRegistrationNumber) {
          state.user.data.CommercialRegistrationNumber = action.payload.CommercialRegistrationNumber;
        }
      }
    },
    setFontSize: (state, action: PayloadAction<number>) => {
      state.size = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'ar' | 'en'>) => {
      state.language = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setValidity: (state, action: PayloadAction<PermissionType[]>) => {
      // ✅ التأكد من أن Validity هو array وليس string - مطابق للتطبيق المحمول
      let validity = action.payload;

      // إذا كان string، حوّله إلى array
      if (typeof validity === 'string') {
        try {
          validity = JSON.parse(validity);
          console.log('✅ [setValidity] تم تحويل Validity من string إلى array:', validity);
        } catch (e) {
          console.error('❌ [setValidity] فشل تحويل Validity من string:', e);
          validity = [];
        }
      }

      // تأكد من أنه array
      state.Validity = Array.isArray(validity) ? validity : [];

      console.log('✅ [setValidity] تم تحديث Validity في Redux:', {
        'type': typeof state.Validity,
        'isArray': Array.isArray(state.Validity),
        'length': state.Validity.length,
        'sample': state.Validity.slice(0, 3)
      });
    },
    setBoss: (state, action: PayloadAction<BossType>) => {
      state.boss = action.payload;
    },
  },
});

export const { setUser, clearUser, updateCompanyInfo, setFontSize, setLanguage, setTheme, setValidity, setBoss } = userSlice.actions;
export default userSlice.reducer;
