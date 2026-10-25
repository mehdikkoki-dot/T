/**
 * Aflaam (CloudStream -> iOS JavaScriptCore Plugin)
 * Source: https://github.com/Abodabodd/re-3arabi/tree/main/Aflaam
 * Target: iOS JavaScriptCore (ES5, synchronous, httpGet only)
 */

var MAIN_URL = "https://aflaam.com";

/**
 * Normalizes relative URLs and percent-encodes '[' and ']' per environment spec.
 */
function cleanUrl(url) {
  if (!url) return "";
  var u = ("" + url).trim();
  if (u.indexOf("//") === 0) {
    u = "https:" + u;
  } else if (u.indexOf("/") === 0) {
    u = MAIN_URL + u;
  }
  return u.replace(/\[/g, "%5B").replace(/\]/g, "%5D");
}

/**
 * Parses item cards from AFLAAM directory and search pages.
 *
 * Example HTML matched:
 * <div class="col-lg-auto col-md-3 col-sm-4 col-6 item">
 *   <div class="entry-box" style="margin-bottom: 12px;">
 *     <a href="https://aflaam.com/movie/1835/the-tender-bar-4" class="box">
 *       <picture>
 *         <img src="https://images.aflaam.com/thumb/212x300/uploads/2hdlo.jpeg" class="img-fluid w-100" alt="">
 *       </picture>
 *       <div class="entry-body px-3 pb-3">
 *         <h3 class="entry-title text-center text-white font-size-16 m-0">The Tender Bar</h3>
 *       </div>
 *     </a>
 *   </div>
 * </div>
 */
function parseItemsFromHtml(html) {
  var items = [];
  if (!html) return items;

  // Split document into item blocks
  var blocks = html.split(/class="[^"]*\bitem\b[^"]*"/);
  for (var i = 1; i < blocks.length; i++) {
    var block = blocks[i];

    // Regex matching the link: <a href="https://aflaam.com/movie/..." class="box">
    var linkMatch = block.match(/<a\s+[^>]*class="[^"]*\bbox\b[^"]*"[^>]*href="([^"]+)"/i) ||
                    block.match(/<a\s+[^>]*href="([^"]+)"[^>]*class="[^"]*\bbox\b[^"]*"/i);
    if (!linkMatch) continue;
    var url = cleanUrl(linkMatch[1]);

    // Regex matching entry title: <h3 class="entry-title ...">Title</h3>
    var titleMatch = block.match(/<h3\s+class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h3>/i);
    if (!titleMatch) continue;
    var name = titleMatch[1].replace(/<[^>]+>/g, "").trim();

    // Regex matching poster thumbnail: <picture><img src="https://images.aflaam.com/thumb/..."
    var posterMatch = block.match(/<picture[^>]*>[\s\S]*?<img\s+[^>]*src="([^"]+)"/i) ||
                      block.match(/<img\s+[^>]*src="([^"]+)"/i);
    var posterUrl = posterMatch ? cleanUrl(posterMatch[1]) : undefined;

    items.push({
      name: name,
      url: url,
      posterUrl: posterUrl
    });
  }
  return items;
}

/**
 * 1. search(query) -> [ { name, url, posterUrl? } ]
 */
function search(query) {
  if (!query) return [];
  var searchUrl = MAIN_URL + "/search?q=" + encodeURIComponent(query);
  var html = httpGet(searchUrl);
  return parseItemsFromHtml(html);
}

/**
 * 2. getMainPage() -> [ { name: "Section title", items: [ { name, url, posterUrl? } ] } ]
 * Omit empty sections.
 */
function getMainPage() {
  var sections = [
    { name: "أفلام أجنبية", url: MAIN_URL + "/search?section=2" },
    { name: "أفلام عربية", url: MAIN_URL + "/search?section=1" },
    { name: "أفلام هندية", url: MAIN_URL + "/search?section=3" },
    { name: "مسلسلات", url: MAIN_URL + "/series" }
  ];

  var result = [];
  for (var i = 0; i < sections.length; i++) {
    var sec = sections[i];
    var html = httpGet(sec.url);
    var items = parseItemsFromHtml(html);
    if (items && items.length > 0) {
      result.push({
        name: sec.name,
        items: items
      });
    }
  }
  return result;
}

/**
 * 3. load(url) -> { name, url, posterUrl?, plot?, year? }
 */
function load(url) {
  var html = httpGet(url);
  if (!html) {
    return { name: "", url: url, year: null };
  }

  // Regex matching title:
  // Example: <h1 class="font-size-44 font-weight-bold"> The Tender Bar </h1>
  var titleMatch = html.match(/<h1[^>]*class="[^"]*font-size-44[^"]*"[^>]*>([\s\S]*?)<\/h1>/i);
  var name = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";

  // Regex matching poster:
  // Example: <a ... class="movie-poster"><img src="https://images.aflaam.com/thumb/w370/uploads/2hdlo.jpeg"
  var posterMatch = html.match(/<a[^>]*class="[^"]*movie-poster[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"/i) ||
                    html.match(/<img[^>]*src="([^"]+)"[^>]*alt="[^"]*"[^>]*style="[^"]*border-radius:\s*6px/i);
  var posterUrl = posterMatch ? cleanUrl(posterMatch[1]) : undefined;

  // Regex matching synopsis/plot:
  // Example: <div id="movie-tab-2"><div class="widget-body"><p>يبحث صبي عن بديل لوالده...</p></div></div>
  var plotMatch = html.match(/id="movie-tab-2"[\s\S]*?<div[^>]*class="[^"]*widget-body[^"]*"[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>/i);
  var plot = plotMatch ? plotMatch[1].replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').trim() : undefined;

  // Regex matching year:
  // Example: <div>سنة الإنتاج : 2021</div>
  var yearMatch = html.match(/سنة\s+الإنتاج\s*:\s*(\d{4})/i) ||
                  html.match(/:<\/span>\s*(\d{4})/i) ||
                  html.match(/\b(19\d\d|20\d\d)\b/);
  var year = yearMatch ? parseInt(yearMatch[1], 10) : null;

  return {
    name: name,
    url: url,
    posterUrl: posterUrl,
    plot: plot,
    year: year
  };
}

/**
 * Extracts streaming links from a watch or episode page.
 *
 * Example HTML matched:
 * <a href="https://aflaam.com/watch/13087/1835/the-tender-bar-4" class="link-show d-flex align-items-center mx-2 ml-2">
 * and inside the watch page:
 * <video id="player"><source src="https://af1.downet.net/...mp4" type="video/mp4" size="720" /></video>
 */
function extractStreams(html, prefix) {
  var links = [];
  var seen = {};

  // Extract watch links from qualities box
  var watchRegex = /<a\s+[^>]*href="([^"]+)"[^>]*class="[^"]*link-show[^"]*"/gi;
  var watchRegexAlt = /<a\s+[^>]*class="[^"]*link-show[^"]*"[^>]*href="([^"]+)"/gi;
  var watchUrls = [];
  var m;

  while ((m = watchRegex.exec(html)) !== null) {
    watchUrls.push(cleanUrl(m[1]));
  }
  while ((m = watchRegexAlt.exec(html)) !== null) {
    var u = cleanUrl(m[1]);
    if (watchUrls.indexOf(u) === -1) watchUrls.push(u);
  }

  for (var i = 0; i < watchUrls.length; i++) {
    var watchHtml = httpGet(watchUrls[i]);
    if (!watchHtml) continue;

    // Matches <source src="..." size="..." type="..." />
    var sourceRegex = /<source\s+[^>]*src="([^"]+)"[^>]*>/gi;
    var sm;
    while ((sm = sourceRegex.exec(watchHtml)) !== null) {
      var sourceTag = sm[0];
      var rawSrc = sm[1];

      // Strict format limit: The player only plays direct MP4 and HLS (.m3u8) links
      var isMp4 = /\.(mp4)(\?.*)?$/i.test(rawSrc) || sourceTag.indexOf("video/mp4") !== -1;
      var isHls = /\.(m3u8)(\?.*)?$/i.test(rawSrc) || sourceTag.indexOf("mpegurl") !== -1;
      if (!isMp4 && !isHls) {
        continue;
      }

      var videoUrl = cleanUrl(rawSrc);
      if (seen[videoUrl]) continue;
      seen[videoUrl] = true;

      // Extract resolution label: size="720" or size="1080"
      var sizeMatch = sourceTag.match(/size="([^"]+)"/i);
      var quality = sizeMatch ? sizeMatch[1] + "p" : "720p";

      links.push({
        name: (prefix || "Aflaam") + " - " + quality,
        url: videoUrl,
        headers: {
          "Referer": MAIN_URL + "/"
        }
      });
    }
  }

  return links;
}

/**
 * 4. loadLinks(url) -> [ { name, url, headers? } ]
 */
function loadLinks(url) {
  var html = httpGet(url);
  if (!html) return [];

  // If this is a TV series, retrieve episodes and format as S1E{num}
  // Example HTML matched for series episodes:
  // <div class="entry-box-3 mb-4">
  //   <a href="https://aflaam.com/episode/3140/teen-wolf-6/..." class="d-block box">
  //     <span class="font-size-50">1</span>
  //   </a>
  // </div>
  if (url.indexOf("/series/") !== -1) {
    var epRegex = /<div\s+class="[^"]*entry-box-3[^"]*"[\s\S]*?<a\s+[^>]*href="([^"]+)"[\s\S]*?<span\s+class="font-size-50">(\d+)<\/span>/gi;
    var epMatch;
    var episodeLinks = [];

    while ((epMatch = epRegex.exec(html)) !== null) {
      episodeLinks.push({
        url: cleanUrl(epMatch[1]),
        num: epMatch[2]
      });
    }

    var allSeriesLinks = [];
    for (var e = 0; e < episodeLinks.length; e++) {
      var epHtml = httpGet(episodeLinks[e].url);
      var epStreams = extractStreams(epHtml, "S1E" + episodeLinks[e].num);
      for (var s = 0; s < epStreams.length; s++) {
        allSeriesLinks.push(epStreams[s]);
      }
    }
    return allSeriesLinks;
  }

  // Movie or standalone episode
  return extractStreams(html, "Aflaam");
}