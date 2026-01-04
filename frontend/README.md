# Kementan - Layanan Pelacakan Hasil Lab (Next.js)

- Next.js 14 + Tailwind, layout glass + toggle tema.
- Dev port `3001` to avoid clashing with Nest backend (`3000`).

## Scripts

- `npm run dev` – start dev server (port 3001)
- `npm run build` – production build
- `npm run start` – start production server after build
- `npm run lint` – lint

## Pages

- `/` – landing with hero + theme toggle
- `/login` – login admin → calls `POST /auth/login`, stores JWT in `localStorage`
- `/tracking` – form to query `GET /tracking?kode=...` + shows historis + optional profile fetch if token exists
- `/[slug]` – public tracking by instansi slug, load trackingTitle via `/institutions/:slug`
- `/admin/login` – alias of login for admin area
- `/admin/profile` – calls `/auth/profile`
- `/admin/documents` – list/filter and create documents (requires JWT)
- `/admin/documents/[id]` – detail + add historis
