# 🚀 Hướng dẫn Deploy TrueRace Live lên Vercel

## Cấu trúc thư mục

```
truerace-live/
├── api/
│   ├── proxy.js
│   └── auth.js
├── public/
│   ├── admin.html
│   └── view.html
├── package.json
├── vercel.json
└── .gitignore
```

---

## BướC 1 — đầy code lên GitHub

1. Tạo repository mới trên GitHub (dặt tên: `truerace-live`)
2. Upload toàn bộ thư mục `truerace-live/` lên repo đó
3. Commit & push

---

## BướC 2 — Deploy lên Vercel

1. Truy cập: **https://vercel.com** → Đăng nhập (dùng tài khoản GitHub)
2. Click **"Add New Project"** → Import repo `truerace-live`
3. Giữ nguyên cài đặt mặc định ? Click **"Deploy"**
4. Vercel tạo domain tạm: `truerace-live-xxx.vercel.app`

---

## BướC 3 — Set Environment Variables (BắT BUỔC)
