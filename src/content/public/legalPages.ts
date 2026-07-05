import type { PublicLocale } from './constants'

export interface LegalSectionContent {
  title: string
  paragraphs?: string[]
  list?: string[]
}

export interface LegalPageContent {
  metaTitle: string
  metaDescription: string
  pageTitle: string
  pageSubtitle: string
  sections: LegalSectionContent[]
}

export const privacyContent: Record<PublicLocale, LegalPageContent> = {
  ar: {
    metaTitle: 'سياسة الخصوصية',
    metaDescription: 'سياسة الخصوصية لتطبيق حاجز — كيف نجمع ونستخدم ونحمي بيانات المستخدمين.',
    pageTitle: 'سياسة الخصوصية',
    pageSubtitle: 'آخر تحديث: July 2026',
    sections: [
      { title: 'مقدمة', paragraphs: ['نحن في تطبيق حاجز نحترم خصوصية المستخدم ونلتزم بحماية بياناته.'] },
      {
        title: 'المعلومات التي نجمعها',
        list: ['الاسم', 'رقم الهاتف', 'الموقع الجغرافي (عند السماح)', 'صور الملف الشخصي', 'معلومات الحجوزات', 'معلومات الخدمات', 'بيانات النشاط داخل التطبيق'],
      },
      {
        title: 'كيفية استخدام البيانات',
        list: ['إنشاء الحساب', 'إدارة الحجوزات', 'إرسال الإشعارات', 'تحسين الخدمات', 'حماية الحسابات', 'منع الاحتيال'],
      },
      { title: 'الموقع الجغرافي', paragraphs: ['يستخدم التطبيق الموقع الجغرافي فقط لتحديد مواقع الخدمات وتحسين تجربة المستخدم.'] },
      {
        title: 'مشاركة البيانات',
        paragraphs: ['لا يتم بيع البيانات لأي جهة.', 'قد تتم مشاركة البيانات فقط عند الحاجة لتقديم الخدمة أو عند طلب الجهات القانونية.'],
      },
      { title: 'أمان البيانات', paragraphs: ['نستخدم إجراءات أمنية حديثة لحماية معلومات المستخدم.'] },
      { title: 'حذف الحساب', paragraphs: ['يمكن للمستخدم طلب حذف حسابه وجميع بياناته من خلال التطبيق أو التواصل مع الدعم.'] },
      { title: 'ملفات تعريف الارتباط', paragraphs: ['قد يستخدم الموقع ملفات تعريف الارتباط لتحسين الأداء.'] },
      { title: 'التعديلات', paragraphs: ['قد نقوم بتحديث سياسة الخصوصية في أي وقت.'] },
      { title: 'التواصل معنا', paragraphs: ['البريد الإلكتروني: atfsucy.com@gmail.com', 'رقم الهاتف: +964 7707752085'] },
    ],
  },
  en: {
    metaTitle: 'Privacy Policy',
    metaDescription: 'HAJIZ Privacy Policy — how we collect, use, and protect user data.',
    pageTitle: 'Privacy Policy',
    pageSubtitle: 'Last updated: July 2026',
    sections: [
      { title: 'Introduction', paragraphs: ['At HAJIZ, we respect user privacy and are committed to protecting personal data.'] },
      {
        title: 'Information We Collect',
        list: ['Name', 'Phone number', 'Geographic location (when permitted)', 'Profile photos', 'Booking information', 'Service information', 'In-app activity data'],
      },
      {
        title: 'How We Use Data',
        list: ['Account creation', 'Booking management', 'Sending notifications', 'Service improvement', 'Account security', 'Fraud prevention'],
      },
      { title: 'Geographic Location', paragraphs: ['The app uses location data only to identify service locations and improve user experience.'] },
      {
        title: 'Data Sharing',
        paragraphs: ['We do not sell data to any third party.', 'Data may be shared only when necessary to provide the service or when required by law.'],
      },
      { title: 'Data Security', paragraphs: ['We use modern security measures to protect user information.'] },
      { title: 'Account Deletion', paragraphs: ['Users may request deletion of their account and data through the app or by contacting support.'] },
      { title: 'Cookies', paragraphs: ['This website may use cookies to improve performance.'] },
      { title: 'Changes', paragraphs: ['We may update this Privacy Policy at any time.'] },
      { title: 'Contact Us', paragraphs: ['Email: atfsucy.com@gmail.com', 'Phone: +964 7707752085'] },
    ],
  },
}

export const termsContent: Record<PublicLocale, LegalPageContent> = {
  ar: {
    metaTitle: 'الشروط والأحكام',
    metaDescription: 'الشروط والأحكام لتطبيق حاجز — قواعد استخدام المنصة والحجوزات والمدفوعات.',
    pageTitle: 'الشروط والأحكام',
    pageSubtitle: 'آخر تحديث: July 2026',
    sections: [
      { title: 'قبول الشروط', paragraphs: ['باستخدام تطبيق حاجز فإنك توافق على جميع الشروط.'] },
      { title: 'استخدام التطبيق', paragraphs: ['يجب استخدام التطبيق بشكل قانوني وعدم إساءة استخدام الخدمات.'] },
      { title: 'الحسابات', paragraphs: ['المستخدم مسؤول عن بيانات تسجيل الدخول الخاصة به.'] },
      { title: 'الحجوزات', paragraphs: ['التطبيق يعمل كوسيط بين المستخدم ومقدم الخدمة.'] },
      { title: 'المدفوعات', paragraphs: ['الدفع يتم مباشرة بين العميل ومقدم الخدمة.', 'التطبيق لا يحتفظ بأموال العملاء.'] },
      {
        title: 'رصيد مزودي الخدمة (Credits)',
        paragraphs: ['أصحاب المحلات والحرفيون يمتلكون رصيد Credits يستخدم لتغطية رسوم استخدام التطبيق.', 'عند انتهاء الرصيد يتم إيقاف استقبال الطلبات حتى إعادة الشحن.'],
      },
      { title: 'المحتوى', paragraphs: ['يمنع نشر أي محتوى مخالف أو مضلل.'] },
      { title: 'المسؤولية', paragraphs: ['تطبيق حاجز غير مسؤول عن جودة تنفيذ الخدمة وإنما يوفر منصة لربط العملاء بمقدمي الخدمات.'] },
      { title: 'إيقاف الحساب', paragraphs: ['يحق للإدارة إيقاف أي حساب يخالف السياسات.'] },
      { title: 'التعديلات', paragraphs: ['يجوز تعديل الشروط في أي وقت.'] },
      { title: 'التواصل', paragraphs: ['atfsucy.com@gmail.com'] },
    ],
  },
  en: {
    metaTitle: 'Terms of Service',
    metaDescription: 'HAJIZ Terms of Service — platform usage, bookings, and payments.',
    pageTitle: 'Terms of Service',
    pageSubtitle: 'Last updated: July 2026',
    sections: [
      { title: 'Acceptance of Terms', paragraphs: ['By using the HAJIZ app, you agree to all terms and conditions.'] },
      { title: 'Use of the App', paragraphs: ['The app must be used lawfully. Misuse of services is prohibited.'] },
      { title: 'Accounts', paragraphs: ['Users are responsible for their login credentials.'] },
      { title: 'Bookings', paragraphs: ['The app acts as an intermediary between users and service providers.'] },
      { title: 'Payments', paragraphs: ['Payment is made directly between the customer and the service provider.', 'The app does not hold customer funds.'] },
      {
        title: 'Provider Credits',
        paragraphs: ['Business owners and craftsmen have a Credits balance used to cover platform usage fees.', 'When the balance runs out, order acceptance is paused until the account is topped up.'],
      },
      { title: 'Content', paragraphs: ['Publishing illegal or misleading content is prohibited.'] },
      { title: 'Liability', paragraphs: ['HAJIZ is not responsible for service quality; it provides a platform connecting customers and providers.'] },
      { title: 'Account Suspension', paragraphs: ['Management may suspend any account that violates policies.'] },
      { title: 'Changes', paragraphs: ['These terms may be updated at any time.'] },
      { title: 'Contact', paragraphs: ['atfsucy.com@gmail.com'] },
    ],
  },
}

export const deleteAccountContent: Record<PublicLocale, LegalPageContent> = {
  ar: {
    metaTitle: 'حذف الحساب',
    metaDescription: 'كيفية حذف حسابك في تطبيق حاجز — خطوات الحذف وماذا يحدث بعد ذلك.',
    pageTitle: 'حذف الحساب',
    pageSubtitle: 'آخر تحديث: July 2026',
    sections: [
      {
        title: 'حذف حسابك',
        paragraphs: [
          'يمكنك حذف حسابك في تطبيق حاجز مباشرةً من داخل التطبيق. لا حاجة لإرسال طلب منفصل عبر هذه الصفحة.',
          'هذه الصفحة للتوضيح فقط ولا تحتوي على نموذج أو زر لحذف الحساب.',
        ],
      },
      {
        title: 'خطوات الحذف',
        list: [
          'افتح تطبيق حاجز.',
          'اذهب إلى الملف الشخصي أو الإعدادات.',
          'اختر «حذف الحساب».',
          'أكّد عملية الحذف.',
        ],
      },
      {
        title: 'ماذا يحدث بعد الحذف؟',
        paragraphs: [
          'يتم حذف حسابك وبياناتك الشخصية المرتبطة به من أنظمتنا، بما في ذلك معلومات الملف الشخصي وسجل النشاط داخل التطبيق.',
          'قد نحتفظ ببعض البيانات لفترة محدودة إذا كان القانون يفرض ذلك — مثل سجلات المعاملات أو البيانات المطلوبة للامتثال القانوني أو منع الاحتيال.',
          'بعد اكتمال الحذف، لن تتمكن من تسجيل الدخول بنفس الحساب.',
        ],
      },
      {
        title: 'هل تحتاج مساعدة؟',
        paragraphs: [
          'إذا واجهت مشكلة في حذف حسابك أو لم تجد خيار الحذف في التطبيق، تواصل مع فريق الدعم:',
          'atfsucy.com@gmail.com',
          'رقم الهاتف: +964 7707752085',
        ],
      },
    ],
  },
  en: {
    metaTitle: 'Delete Account',
    metaDescription: 'How to delete your HAJIZ account — steps and what happens after deletion.',
    pageTitle: 'Delete Account',
    pageSubtitle: 'Last updated: July 2026',
    sections: [
      {
        title: 'Delete Your Account',
        paragraphs: [
          'You can delete your HAJIZ account directly from within the mobile app. You do not need to submit a separate request through this page.',
          'This page is for information only. It does not include a form or button to delete your account.',
        ],
      },
      {
        title: 'Deletion Steps',
        list: [
          'Open the HAJIZ app.',
          'Go to Profile or Settings.',
          'Select "Delete Account".',
          'Confirm the deletion.',
        ],
      },
      {
        title: 'What Happens After Deletion?',
        paragraphs: [
          'Your account and associated personal data will be removed from our systems, including profile information and in-app activity history.',
          'We may retain certain data for a limited period if required by law — such as transaction records or data needed for legal compliance or fraud prevention.',
          'After deletion is complete, you will no longer be able to sign in with the same account.',
        ],
      },
      {
        title: 'Need Help?',
        paragraphs: [
          'If you have trouble deleting your account or cannot find the delete option in the app, contact our support team:',
          'atfsucy.com@gmail.com',
          'Phone: +964 7707752085',
        ],
      },
    ],
  },
}
