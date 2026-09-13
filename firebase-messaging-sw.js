/* eslint-disable no-undef */
/**
 * عامل خدمة إشعارات الويب — يستقبل الدفع ولوحة الأدمن مغلقة أو في تبويب آخر.
 *
 * ⚠️ **يحتاج إعدادات مشروع Firebase أدناه.** انسخها من:
 *   Firebase Console ← Project settings ← Your apps ← Web app ← SDK setup
 * وضعها مكان القيم النائبة. ما دامت نائبة يفشل تسجيل هذا العامل بصمت
 * (داخل سياق العامل لا التطبيق) — فالمنصّة تعمل بلا دفعٍ على الويب.
 *
 * ولا يُقرأ من `firebase_options.dart`: عامل الخدمة يعمل خارج تطبيق
 * فلاتر ولا وصول له إلى شيفرة دارت.
 */

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// قيم تطبيق ويب اللوحة في مشروع `looti-cf357`. **علنية بطبيعتها**: تُشحن
// داخل حزمة الويب ويقرؤها أي زائر، فوجودها هنا مقصود لا سهو. السرّ الوحيد
// في المنظومة حساب خدمة الخادم، وهو خارج git.
//
// ولا تُقرأ من `lib/firebase_options.dart`: عامل الخدمة يعمل خارج تطبيق
// فلاتر ولا وصول له إلى شيفرة دارت — فإن تغيّر المشروع وجب تحديث الملفين
// معاً، وإلا فشل تسجيل العامل **بصمت** وعملت اللوحة بلا دفع.
firebase.initializeApp({
  apiKey: 'AIzaSyBnJiEJnvCYQtuF_BZ-c-4KUZOG72ZJLJ4',
  authDomain: 'looti-cf357.firebaseapp.com',
  projectId: 'looti-cf357',
  storageBucket: 'looti-cf357.firebasestorage.app',
  messagingSenderId: '1066501359918',
  appId: '1:1066501359918:web:53ed81b8f6d2fd56a512bf',
});

const messaging = firebase.messaging();

// الخادم يرسل كتلة `notification` كاملة، فالمتصفّح يعرضها بنفسه. هذا
// المعالج للحالات التي يصل فيها الدفع بيانات فقط.
messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {};
  if (!notification.title) return;
  self.registration.showNotification(notification.title, {
    body: notification.body || '',
    icon: '/icons/Icon-192.png',
    data: payload.data || {},
  });
});

// نقرة الإشعار تفتح التغذية — أو السطر نفسه حين يصل معرّفه.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const id = (event.notification.data || {}).target_id;
  const path = id ? `/notifications/${id}` : '/notifications';
  event.waitUntil(clients.openWindow(path));
});
