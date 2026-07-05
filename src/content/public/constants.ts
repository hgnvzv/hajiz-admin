export type PublicLocale = 'ar' | 'en'

export const SUPPORT_EMAIL = 'atfsucy.com@gmail.com'
export const SUPPORT_PHONE = '+964 7707752085'
export const SUPPORT_WHATSAPP_URL = 'https://wa.me/9647707752085'
export const WEBSITE_URL = 'https://hajiz.app'
export const LAST_UPDATED = 'July 2026'

export const publicFooter = {
  ar: {
    privacy: 'سياسة الخصوصية',
    terms: 'الشروط والأحكام',
    deleteAccount: 'حذف الحساب',
    rights: 'جميع الحقوق محفوظة.',
  },
  en: {
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    deleteAccount: 'Delete Account',
    rights: 'All Rights Reserved.',
  },
} satisfies Record<PublicLocale, Record<string, string>>

export const publicLangLabels = {
  ar: 'العربية',
  en: 'English',
}
