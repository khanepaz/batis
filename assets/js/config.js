/* ==========================================================
   Batis | تنظیمات
   ----------------------------------------------------------
   mode: 'json'  → داده‌ها از پوشه‌ی data/ خوانده می‌شوند
                   (مناسب گیت‌هاب پیج‌ها، بدون سرور)
   mode: 'api'   → داده‌ها از یک سرور خوانده می‌شوند
   ========================================================== */
window.BATIS_CONFIG = {
  mode: 'json',
  dataPath: 'data/',
  apiBase: '/api',
  commentsStorageKey: 'batis_local_comments_v1',
  latestCount: 8,
  bestCount: 6,
  browsePageSize: 9
};
// سازگاری با کد قبلی
window.KHANEPAZ_CONFIG = window.BATIS_CONFIG;
