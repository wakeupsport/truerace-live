// api/auth.js
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ ok: false, error: 'Missing credentials' });
  const env = process.env.ADMIN_USERS || '';
  if (!env) {
    if (username === 'admin' && password === 'truerace2024') return res.status(200).json({ ok: true, username });
    return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  }
  const users = env.split(',').map(e => { const [u, ...r] = e.trim().split(':'); return { username: u, password: r.join(':') }; });
  if (users.find(u => u.username === username && u.password === password)) return res.status(200).json({ ok: true, username });
  await new Promise(r => setTimeout(r, 500));
  return res.status(401).json({ ok: false, error: 'Invalid credentials' });
};
