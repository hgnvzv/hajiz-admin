<template>
  <PublicPageShell title="سياسة الخصوصية" subtitle="آخر تحديث: July 2026">
    <LegalSection :number="1" title="مقدمة" :delay="0">
      <p>نحن في تطبيق حاجز نحترم خصوصية المستخدم ونلتزم بحماية بياناته.</p>
    </LegalSection>

    <LegalSection :number="2" title="المعلومات التي نجمعها" :delay="60">
      <ul>
        <li>الاسم</li>
        <li>رقم الهاتف</li>
        <li>الموقع الجغرافي (عند السماح)</li>
        <li>صور الملف الشخصي</li>
        <li>معلومات الحجوزات</li>
        <li>معلومات الخدمات</li>
        <li>بيانات النشاط داخل التطبيق</li>
      </ul>
    </LegalSection>

    <LegalSection :number="3" title="كيفية استخدام البيانات" :delay="120">
      <ul>
        <li>إنشاء الحساب</li>
        <li>إدارة الحجوزات</li>
        <li>إرسال الإشعارات</li>
        <li>تحسين الخدمات</li>
        <li>حماية الحسابات</li>
        <li>منع الاحتيال</li>
      </ul>
    </LegalSection>

    <LegalSection :number="4" title="الموقع الجغرافي" :delay="180">
      <p>يستخدم التطبيق الموقع الجغرافي فقط لتحديد مواقع الخدمات وتحسين تجربة المستخدم.</p>
    </LegalSection>

    <LegalSection :number="5" title="مشاركة البيانات" :delay="240">
      <p>لا يتم بيع البيانات لأي جهة.</p>
      <p>قد تتم مشاركة البيانات فقط عند الحاجة لتقديم الخدمة أو عند طلب الجهات القانونية.</p>
    </LegalSection>

    <LegalSection :number="6" title="أمان البيانات" :delay="300">
      <p>نستخدم إجراءات أمنية حديثة لحماية معلومات المستخدم.</p>
    </LegalSection>

    <LegalSection :number="7" title="حذف الحساب" :delay="360">
      <p>يمكن للمستخدم طلب حذف حسابه وجميع بياناته من خلال التطبيق أو التواصل مع الدعم.</p>
    </LegalSection>

    <LegalSection :number="8" title="ملفات تعريف الارتباط" :delay="420">
      <p>قد يستخدم الموقع ملفات تعريف الارتباط لتحسين الأداء.</p>
    </LegalSection>

    <LegalSection :number="9" title="التعديلات" :delay="480">
      <p>قد نقوم بتحديث سياسة الخصوصية في أي وقت.</p>
    </LegalSection>

    <LegalSection :number="10" title="التواصل معنا" :delay="540">
      <p>
        البريد الإلكتروني:
        <a href="mailto:support@hajiz.app">support@hajiz.app</a>
      </p>
      <p>
        الموقع:
        <a href="https://hajiz.app" target="_blank" rel="noopener noreferrer">https://hajiz.app</a>
      </p>
    </LegalSection>
  </PublicPageShell>
</template>

<script setup lang="ts">
import PublicPageShell from '@/components/public/PublicPageShell.vue'
import LegalSection from '@/components/public/LegalSection.vue'
import { usePageMeta } from '@/composables/usePageMeta'

usePageMeta(
  'سياسة الخصوصية',
  'سياسة الخصوصية لتطبيق حاجز — كيف نجمع ونستخدم ونحمي بيانات المستخدمين.',
)
</script>
