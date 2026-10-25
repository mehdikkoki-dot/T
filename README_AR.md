# إضافات re-3arabi إلى CloudiOS (JavaScript ES5)

هذه دفعة تحويل أولية مبنية على ملفات Kotlin في الأرشيف المرفق. لم يتم تعديل Akwam أو Aflaam.

## مهم قبل الاستخدام

- يجب أن توفر بيئة CloudiOS الدالة `httpGet(url)` كما في مرجع Akwam.
- المواقع تغيّر HTML ونطاقاتها باستمرار؛ محددات البطاقات واستخراج الفيديو عامة ومبدئية وتحتاج اختبارًا حيًا لكل موقع.
- تجاوز Cloudflare، تسجيل الدخول، POST، ومشفّرات الفيديو الخاصة لا يمكن ضمانها بهذا التحويل العام؛ بعض الإضافات الأصلية تعتمد عليها.
- `Egy.js` يعتمد المصدر الأصلي فيه على API وبيانات اعتماد/إعدادات تطبيق، لذلك ملفه الحالي ليس تحويلًا وظيفيًا كاملًا؛ يحتاج نقلًا خاصًا لمنطق API بدل محلل HTML العام.
- أسماء الملفات تقابل مجلدات المصدر قدر الإمكان. كل ملف يعرّف `MAIN_URL`, `search`, `getMainPage`, `load`, `loadLinks` وواجهات التحليل.

## ملفات التحويل

- `3isk.js` — مصدر `re-3arabi-main/3isk/src/main/kotlin/com/eshk/eishk.kt`
- `5TV.js` — مصدر `re-3arabi-main/5TV/src/main/kotlin/com/tv/5tv.kt`
- `Aia2tv_2.js` — مصدر `re-3arabi-main/Aia2tv 2/src/main/kotlin/com/asia2tv/Asia2tv.kt`
- `Alooytv.js` — مصدر `re-3arabi-main/Alooytv/src/main/kotlin/com/alooy/alooy.kt`
- `Anim3rb.js` — مصدر `re-3arabi-main/Anim3rb/src/main/kotlin/com/anim3rb/anim3rbProvider.kt`
- `Anime-Phoenix.js` — مصدر `re-3arabi-main/Anime-Phoenix/src/main/kotlin/com/phoenix/Phoenix.kt`
- `Anime4up.js` — مصدر `re-3arabi-main/Anime4up/src/main/kotlin/com/anime4up/anime4up.kt`
- `AnimeRift.js` — مصدر `re-3arabi-main/AnimeRift/src/main/kotlin/com/animerift/animerift.kt`
- `Animerco.js` — مصدر `re-3arabi-main/Animerco/src/main/kotlin/com/animerco/Animerco.kt`
- `Animewitcher.js` — مصدر `re-3arabi-main/Animewitcher/src/main/kotlin/com/animewitcher/animewitcher.kt`
- `Bristege.js` — مصدر `re-3arabi-main/Bristege/src/main/kotlin/com/bristeg/bristegProvider.kt`
- `Cee.js` — مصدر `re-3arabi-main/Cee/src/main/kotlin/com/cee/Cee.kt`
- `CimaClub.js` — مصدر `re-3arabi-main/CimaClub/src/main/kotlin/com/cimaclub/CimaClubProvider.kt`
- `Cimalight.js` — مصدر `re-3arabi-main/Cimalight/src/main/kotlin/com/cimalight/cimalight.kt`
- `Cimatn.js` — مصدر `re-3arabi-main/Cimatn/src/main/kotlin/com/cimatn/cimatn.kt`
- `Egy.js` — مصدر `re-3arabi-main/Egy/src/main/kotlin/com/egy/egy.kt`
- `Egydead.js` — مصدر `re-3arabi-main/Egydead/src/main/kotlin/com/egydead/egydeadProvider.kt`
- `Elif.js` — مصدر `re-3arabi-main/Elif/src/main/kotlin/com/elif/elif.kt`
- `Faselhd.js` — مصدر `re-3arabi-main/Faselhd/src/main/kotlin/com/faselhd/Faselhd.kt`
- `Krmzy.js` — مصدر `re-3arabi-main/Krmzy/src/main/kotlin/com/krmzy/krmzy.kt`
- `Lodynet.js` — مصدر `re-3arabi-main/Lodynet/src/main/kotlin/com/lody/lody.kt`
- `MyCimaProvider.js` — مصدر `re-3arabi-main/MyCimaProvider/src/main/kotlin/com/mycima/MyCimaProvider.kt`
- `OscarTv.js` — مصدر `re-3arabi-main/OscarTv/src/main/kotlin/com/oscartv/OscarTvProvider.kt`
- `Rate.js` — مصدر `re-3arabi-main/Rate/src/main/kotlin/com/rate/rate.kt`
- `Replaymatch.js` — مصدر `re-3arabi-main/Replaymatch/src/main/kotlin/com/replaymatch/Replaymatch.kt`
- `Shahid4u.js` — مصدر `re-3arabi-main/Shahid4u/src/main/kotlin/com/shahid4u/Shahid4u.kt`
- `Shahidwbas.js` — مصدر `re-3arabi-main/Shahidwbas/src/main/kotlin/com/shahidwbas/shahidwbas.kt`
- `Syria-live.js` — مصدر `re-3arabi-main/Syria-live/src/main/kotlin/com/syria/syria.kt`
- `TVgarden.js` — مصدر `re-3arabi-main/TVgarden/src/main/kotlin/com/tvgarden/tvgarden.kt`
- `Topcinema.js` — مصدر `re-3arabi-main/Topcinema/src/main/kotlin/com/topcinema/topcinemaProvider.kt`
- `TukTukcima.js` — مصدر `re-3arabi-main/TukTukcima/src/main/kotlin/com/tuk/tuk.kt`
- `TuniflexBlog.js` — مصدر `re-3arabi-main/TuniflexBlog/src/main/kotlin/com/tun/tu.kt`
- `Tuniflix.js` — مصدر `re-3arabi-main/Tuniflix/src/main/kotlin/com/tuniflix/tuniflix.kt`
- `Viu.js` — مصدر `re-3arabi-main/Viu/src/main/kotlin/com/viu/viu.kt`
- `Wecima.js` — مصدر `re-3arabi-main/Wecima/src/main/kotlin/com/wecima/wecimaProvider.kt`
- `Witanime.js` — مصدر `re-3arabi-main/Witanime/src/main/kotlin/com/witanime/WitanimeProvider.kt`
- `Yacintv.js` — مصدر `re-3arabi-main/Yacintv/src/main/kotlin/com/yacin/yacin.kt`
- `Youtube.js` — مصدر `re-3arabi-main/Youtube/src/main/kotlin/com/youtube/youtube.kt`
- `cinemana.js` — مصدر `re-3arabi-main/cinemana/src/main/kotlin/com/cinemana/CinemanaProvider.kt`
- `dima-toon.js` — مصدر `re-3arabi-main/dima-toon/src/main/kotlin/com/dt/dt.kt`
- `eseek.js` — مصدر `re-3arabi-main/eseek/src/main/kotlin/com/eseek/eseek.kt`

## حالة التحقق

تم فحص صياغة JavaScript بشكل ساكن مبدئيًا؛ لم تُجر اختبارات شبكة داخل CloudiOS، لذلك لا تعتبر الملفات معتمدة للإنتاج قبل التجربة.
