/**
 * Aflaam Plugin for CloudiOS (JavaScriptCore ES5)
 * Source: https://aflaam.com
 */

var MAIN_URL = "https://aflaam.com";

/**
 * Normalizes relative URLs and percent-encodes brackets and spaces safely.
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
 */
function parseItemsFromHtml(html) {
  var items = [];
  if (!html) return items;

  var blocks = html.split(/class="[^"]*\bitem\b[^"]*"/);
  for (var i = 1; i < blocks.length; i++) {
    var block = blocks[i];

    var linkMatch = block.match(/<a\s+[^>]*class="[^"]*\bbox\b[^"]*"[^>]*href="([^"]+)"/i) ||
                    block.match(/<a\s+[^>]*href="([^"]+)"[^>]*class="[^"]*\bbox\b[^"]*"/i);
    if (!linkMatch) continue;
    var url = cleanUrl(linkMatch[1]);

    var titleMatch = block.match(/<h3\s+class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h3>/i);
    if (!titleMatch) continue;
    var name = titleMatch[1].replace(/<[^>]+>/g, "").trim();

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
 * Extracts episodes list from a TV Series page HTML
 */
function parseEpisodesFromSeriesHtml(html) {
  var episodes = [];
  if (!html) return episodes;

  var epRegex = /<a\s+[^>]*href="([^"]*\/episode\/[^"]*)"[^>]*class="[^"]*box[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
  var epRegexAlt = /<a\s+[^>]*class="[^"]*box[^"]*"[^>]*href="([^"]*\/episode\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  var m;

  while ((m = epRegex.exec(html)) !== null || (m = epRegexAlt.exec(html)) !== null) {
    var epUrl = cleanUrl(m[1]);
    var inner = m[2];

    var numMatch = inner.match(/<span[^>]*class="[^"]*font-size-50[^"]*"[^>]*>(\d+)<\/span>/i);
    var num = numMatch ? parseInt(numMatch[1], 10) : (episodes.length + 1);

    var titleMatch = inner.match(/<h3[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h3>/i);
    var epTitle = "";
    if (titleMatch) {
      epTitle = titleMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    } else {
      epTitle = "الحلقة " + num;
    }

    var imgMatch = inner.match(/<img[^>]*src="([^"]+)"/i);
    var epPoster = imgMatch ? cleanUrl(imgMatch[1]) : undefined;

    episodes.push({
      name: epTitle,
      url: epUrl,
      episode: num,
      posterUrl: epPoster
    });
  }

  return episodes;
}

/**
 * 3. load(url) -> { name, url, posterUrl?, plot?, year?, type?, episodes? }
 */
function load(url) {
  var html = httpGet(url);
  if (!html) {
    return { name: "", url: url, year: null };
  }

  var titleMatch = html.match(/<h1[^>]*class="[^"]*font-size-44[^"]*"[^>]*>([\s\S]*?)<\/h1>/i) ||
                   html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  var name = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";

  var posterMatch = html.match(/<a[^>]*class="[^"]*movie-poster[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"/i) ||
                    html.match(/<img[^>]*src="([^"]+)"[^>]*alt="[^"]*"[^>]*style="[^"]*border-radius:\s*6px/i) ||
                    html.match(/<img[^>]*class="[^"]*img-fluid[^"]*"[^>]*src="([^"]+)"/i);
  var posterUrl = posterMatch ? cleanUrl(posterMatch[1]) : undefined;

  var plotMatch = html.match(/id="movie-tab-2"[\s\S]*?<div[^>]*class="[^"]*widget-body[^"]*"[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>/i) ||
                  html.match(/<div[^>]*class="[^"]*widget-body[^"]*"[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>/i);
  var plot = plotMatch ? plotMatch[1].replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').trim() : undefined;

  var yearMatch = html.match(/سنة\s+الإنتاج\s*:\s*(\d{4})/i) ||
                  html.match(/:<\/span>\s*(\d{4})/i) ||
                  html.match(/\b(19\d\d|20\d\d)\b/);
  var year = yearMatch ? parseInt(yearMatch[1], 10) : null;

  var isSeries = (url.indexOf("/series/") !== -1);
  var episodes = isSeries ? parseEpisodesFromSeriesHtml(html) : undefined;

  return {
    name: name,
    url: url,
    posterUrl: posterUrl,
    plot: plot,
    year: year,
    type: isSeries ? "tvSeries" : "movie",
    episodes: episodes
  };
}

/**
 * Extracts streaming links from a watch, movie, or episode page HTML.
 */
function extractStreams(html, prefix) {
  var links = [];
  var seen = {};

  var watchUrls = [];
  var watchRegex = /<a\s+[^>]*href="([^"]*\/watch\/[^"]*)"/gi;
  var m;

  while ((m = watchRegex.exec(html)) !== null) {
    var u = cleanUrl(m[1]);
    if (watchUrls.indexOf(u) === -1) {
      watchUrls.push(u);
    }
  }

  // Check up to 3 watch server sources to keep response instant
  var maxServers = Math.min(watchUrls.length, 3);
  for (var i = 0; i < maxServers; i++) {
    var watchHtml = httpGet(watchUrls[i]);
    if (!watchHtml) continue;

    var sourceRegex = /<source\s+[^>]*src="([^"]+)"[^>]*>/gi;
    var sm;
    var foundInServer = 0;

    while ((sm = sourceRegex.exec(watchHtml)) !== null) {
      var sourceTag = sm[0];
      var rawSrc = sm[1];

      var isMp4 = /\.(mp4)(\?.*)?$/i.test(rawSrc) || sourceTag.indexOf("video/mp4") !== -1;
      var isHls = /\.(m3u8)(\?.*)?$/i.test(rawSrc) || sourceTag.indexOf("mpegurl") !== -1;
      if (!isMp4 && !isHls) continue;

      var videoUrl = cleanUrl(rawSrc);
      if (seen[videoUrl]) continue;
      seen[videoUrl] = true;

      var sizeMatch = sourceTag.match(/size="([^"]+)"/i);
      var quality = sizeMatch ? sizeMatch[1] + "p" : "HD";

      links.push({
        name: (prefix || "Aflaam") + " - " + quality,
        url: videoUrl,
        headers: {
          "Referer": MAIN_URL + "/"
        }
      });
      foundInServer++;
    }

    // If streams are found, we don't need to block on remaining backup servers
    if (foundInServer > 0 && links.length >= 2) {
      break;
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

  // If passed a series URL by mistake, load the first episode
  if (url.indexOf("/series/") !== -1) {
    var eps = parseEpisodesFromSeriesHtml(html);
    if (eps.length > 0) {
      var epHtml = httpGet(eps[0].url);
      return extractStreams(epHtml, eps[0].name || "S1E1");
    }
    return [];
  }

  // Movie or episode URL
  return extractStreams(html, "Aflaam");
}
