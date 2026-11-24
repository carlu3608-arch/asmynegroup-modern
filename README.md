# Asmyne Group — sitio moderno

Rediseño visual de Asmyne Group: hero 3D con globo dorado (React Three Fiber + bloom), campo de partículas, paleta navy/oro, animaciones al scroll y menú móvil.

## Novedades

- **Admin** en `/admin` (login en `/admin/login`): editar textos e imágenes de la portada por idioma, gestionar solicitudes de servicios y configurar el sitio.
- **i18n**: Español (por defecto), English y Français. Selector de idioma en el header; detecta el idioma del navegador en la primera visita y guarda la preferencia.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- `motion` (animaciones de UI) y GSAP + Lenis (scroll)
- MongoDB para contenido editable, solicitudes y auth (secretos solo por variables de entorno)

## Variables de entorno (Railway / `.env.local`)

Ver `.env.example`. Obligatorias para el admin:

- `MONGODB_URI`, `MONGODB_DB`
- `JWT_SECRET`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (crean/sincronizan la cuenta admin en el primer login)

## Desarrollo

```bash
cd frontend
npm install
npm run dev
```

## Deploy

El build corre desde la raíz del repo (`npm ci --prefix frontend && npm run build --prefix frontend`). Ver `railway.toml`.
