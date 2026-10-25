
function parseItemsFromHtml(html) {
  var items = [];
  var seen = {};

  try {
    if (!html) return items;

    // البحث عن روابط مشاهدة الأفلام أو المسلسلات
    var re = /<a\b([^>]*href\s*=\s*["']([^"']+)["'][^>]*)>([\s\S]*?)<\/a>/gi;
    var m;

    while ((m = re.exec(html)) !== null) {
      var attrs = m[1] || "";
      var url = cleanUrl(m[2]);
      var inner = m[3] || "";

      // لا نأخذ روابط التنقل العامة
      if (!url || url === MAIN_URL + "/" || seen[url]) continue;

      var titleMatch =
        inner.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i) ||
        attrs.match(/\btitle\s*=\s*["']([^"']+)["']/i) ||
        inner.match(/^\s*([^<]{2,120})\s*$/);

      if (!titleMatch) continue;

      var name = (titleMatch[1] || "")
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&nbsp;/g, " ")
        .trim();

      if (!name || name.length < 2) continue;

      // استبعاد روابط المشاهدة المنفصلة
      if (/^(مشاهدة|تحميل|التفاصيل|الرئيسية)$/i.test(name)) continue;

      var imgMatch = inner.match(
        /<img\b[^>]*(?:src|data-src)\s*=\s*["']([^"']+)["']/i
      );

      var posterUrl = imgMatch ? cleanUrl(imgMatch[1]) : undefined;

      // قبول صفحات المحتوى فقط
      if (!/\/(movie|movies|series|episode|anime|film)\//i.test(url)) {
        continue;
      }

      seen[url] = true;
      items.push({
        name: name,
        url: url,
        posterUrl: posterUrl
      });
    }
  } catch (e) {}

  return items;
}
