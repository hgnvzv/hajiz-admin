<template>
  <PublicPageShell title="الشروط والأحكام" subtitle="آخر تحديث: July 2026">
    <LegalSection :number="1" title="قبول الشروط" :delay="0">
      <p>باستخدام تطبيق حاجز فإنك توافق على جميع الشروط.</p>
    </LegalSection>

    <LegalSection :number="2" title="استخدام التطبيق" :delay="60">
      <p>يجب استخدام التطبيق بشكل قانوني وعدم إساءة استخدام الخدمات.</p>
    </LegalSection>

    <LegalSection :number="3" title="الحسابات" :delay="120">
      <p>المستخدم مسؤول عن بيانات تسجيل الدخول الخاصة به.</p>
    </LegalSection>

    <LegalSection :number="4" title="الحجوزات" :delay="180">
      <p>التطبيق يعمل كوسيط بين المستخدم ومقدم الخدمة.</p>
    </LegalSection>

    <LegalSection :number="5" title="المدفوعات" :delay="240">
      <p>الدفع يتم مباشرة بين العميل ومقدم الخدمة.</p>
      <p>التطبيق لا يحتفظ بأموال العملاء.</p>
    </LegalSection>

    <LegalSection :number="6" title="رصيد مزودي الخدمة (Credits)" :delay="300">
      <p>أصحاب المحلات والحرفيون يمتلكون رصيد Credits يستخدم لتغطية رسوم استخدام التطبيق.</p>
      <p>عند انتهاء الرصيد يتم إيقاف استقبال الطلبات حتى إعادة الشحن.</p>
    </LegalSection>

    <LegalSection :number="7" title="المحتوى" :delay="360">
      <p>يمنع نشر أي محتوى مخالف أو مضلل.</p>
    </LegalSection>

    <LegalSection :number="8" title="المسؤولية" :delay="420">
      <p>تطبيق حاجز غير مسؤول عن جودة تنفيذ الخدمة وإنما يوفر منصة لربط العملاء بمقدمي الخدمات.</p>
    </LegalSection>

    <LegalSection :number="9" title="إيقاف الحساب" :delay="480">
      <p>يحق للإدارة إيقاف أي حساب يخالف السياسات.</p>
    </LegalSection>

    <LegalSection :number="10" title="التعديلات" :delay="540">
      <p>يجوز تعديل الشروط في أي وقت.</p>
    </LegalSection>

    <LegalSection :number="11" title="التواصل" :delay="600">
      <p>
        <a href="mailto:support@hajiz.app">support@hajiz.app</a>
      </p>
    </LegalSection>
  </PublicPageShell>
</template>

<script setup lang="ts">
import PublicPageShell from '@/components/public/PublicPageShell.vue'
import LegalSection from '@/components/public/LegalSection.vue'
import { usePageMeta } from '@/composables/usePageMeta'

usePageMeta(
  'الشروط والأحكام',
  'الشروط والأحكام لتطبيق حاجز — قواعد استخدام المنصة والحجوزات والمدفوعات.',
)
</script>
