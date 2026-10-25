// Test plugin: Blender Foundation open movies via Internet Archive (Creative Commons).
var BASE = "https://archive.org";
function poster(id) { return BASE + "/services/img/" + id; }
function query(q, rows) {
  var u = BASE + "/advancedsearch.php?q=" + encodeURIComponent(q) +
    "&fl[]=identifier&fl[]=title&rows=" + rows + "&output=json&sort[]=downloads%20desc";
  var r = httpGet(u);
  if (!r) return [];
  try {
    return ((JSON.parse(r).response || {}).docs || []).map(function (d) {
      return { name: d.title || d.identifier, url: d.identifier, posterUrl: poster(d.identifier) };
    });
  } catch (e) { return []; }
}
function search(q) { return query("(" + q + ") AND mediatype:movies AND creator:(Blender Foundation)", 30); }
function getMainPage() {
  return [{ name: "Blender Open Movies", items: query("mediatype:movies AND creator:(Blender Foundation)", 20) }]
    .filter(function (s) { return s.items.length > 0; });
}
function load(id) {
  var m = JSON.parse(httpGet(BASE + "/metadata/" + id)).metadata || {};
  var desc = Array.isArray(m.description) ? m.description.join(" ") : (m.description || "");
  return { name: m.title || id, url: id, posterUrl: poster(id),
           plot: String(desc).replace(/<[^>]+>/g, ""), year: m.year ? parseInt(m.year) : null };
}
function loadLinks(id) {
  var files = JSON.parse(httpGet(BASE + "/metadata/" + id)).files || [];
  return files.filter(function (f) { return /\.(mp4|m4v)$/i.test(f.name); }).slice(0, 5)
    .map(function (f) { return { name: f.name, url: BASE + "/download/" + id + "/" + encodeURI(f.name) }; });
}
