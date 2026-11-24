# Asmyne Group — sitio moderno

Rediseño visual de Asmyne Group: hero 3D con globo dorado (React Three Fiber + bloom), campo de partículas al estilo del teclado IAX, paleta navy/oro, animaciones al scroll y menú móvil.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- `motion` (animaciones de UI) y GSAP + Lenis (scroll)
- API y marketplace heredados del proyecto original, con secretos solo por variables de entorno

## Desarrollo

```bash
cd frontend
npm install
npm run dev
```

Copia `.env.example` a `frontend/.env.local` y rellena las claves que necesites (MongoDB, JWT, Stripe, OpenAI). El sitio de marketing se construye sin ellas.

## Deploy

El directorio de la aplicación es `frontend/`. En Vercel, usa ese root directory.
