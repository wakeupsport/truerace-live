// api/proxy.js — CORS proxy để fetch dữ liệu từ raceresult.com
// Deploy trên Vercel Serverless Functions (Node 18+)

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Thiếu url' });
  try {
    const parsed = new URL(decodeURIComponent(url));
    if (!parsed.hostname.endsWith('raceresult.com')) return res.status(403).json({ error: 'Only raceresult.com' });
  } catch { return res.status(400).json({ error: 'Bad URL' }); }
  try {
    const response = await fetch(decodeURIComponent(url), { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html,*/*', 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) return res.status(response.status).json({ error: 'Fetch failed' });
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) { const d = await response.json(); return res.status(200).json({ athletes: normalizeJsonData(d), timestamp: Date.now() }); }
    const html = await response.text();
    res.setHeader('Cache-Control', 's=maxage=8,stale-while-revalidate');
    return res.status(200).json({ athletes: parseHtmlTable(html), timestamp: Date.now() });
  } catch (e) { return res.status(500).json({ error: e.message }); }
};
function parseHtmlTable(html) {
  const athletes = [];
  const cleanHtml = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const trRegex = /<tr([^>]*)>([\s\S]*?)<\/tr>/gi; let headers = []; let hFound = false; let trM;
  while ((trM = trRegex.exec(cleanHtml)) !== null) {
    const cells = extractCells(trM[2] || ''); if (cells.length < 2) continue;
    const isHdr = /<th/i.test(trM[2]) || (!hFound && cells.some(c => /^(name|bib|cat|time)$/i.test(c.text)));
    if (isHdr) { headers = cells.map(c => c.text.toLowerCase()); hFound = true; continue; }
    const a = buildAthlete(cells, headers, detectGender(trM[0])); if (a.name) athletes.push(a);
  }
  return athletes;
}
function extractCells(h) { const c=[]; const re=/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi; let m; while((m=re.exec(h))!==null) c.push({text:m[1].replace(/<[^>]+>/g,'').replace(/&(lt|gt|amp|nbsp);/g,' ').trim()}); return c; }
function detectGender(h) { return /deeppink|hotpink|#ff69|#ff14|#c715|female/i.test(h) ? 'F' : 'M'; }
function buildAthlete(cells, headers, gender) { const a={gender}; headers.forEach((h,i)=>{ if(!cells[i])return; const v=cells[i].text; if(/name|họ|tên/.test(h))a.name=v; else if(/bib|số/.test(h))a.bib=v; else if(/cat|cỻ/.test(h))a.category=v; else if(/time|thánh/.test(h))a.time=v; }); if(!a.name&&cells[0])a.name=cells[0].text; if(!a.bib&&cells[1])a.bib=cells[1].text; if(!a.category&&cells[2])a.category=cells[2].text; if(!a.time&&cells[3])a.time=cells[3].text; return a; }
function normalizeJsonData(d) { if(Array.isArray(d))return d.map(i=>({name:i.Name||i.name||'',bib:String(i.Bib||i.bib||''),category:i.Category||i.category||'',time:i.Time||i.time||'',club:i.Club||i.club||'',gender:'i.Gender||'M').toUpperCase().startsWith('F')?'F':'M'})); return normalizeJsonData(d.data||d.results||[]); }
