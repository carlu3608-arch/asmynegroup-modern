# Asmyne Vault (club privado)

- Entrada oculta: `/vault` (o mantener pulsado el logo de la portada ~1,5 s). No hay enlaces, no está en sitemap/robots; `noindex` por meta y por header `X-Robots-Tag`.
- Solo por invitación: el admin crea códigos `AV-XXXX-XXXX-XXXX` en **Admin → 🔐 Vault**. Se guarda solo el SHA-256; el código se muestra una vez. Un solo uso (canje atómico). Opción "Aprobar automáticamente"; si no, el miembro queda *pendiente* hasta que el admin lo apruebe.
- Protección en servidor: `src/proxy.ts` redirige `/vault/*` a la puerta sin sesión activa; cada página y cada `/api/vault/*` vuelve a validar la sesión (404 sin sesión).
- Datos separados: colecciones `vault_members`, `vault_invites`, `vault_sessions` (token opaco, guardado con hash, TTL 7 días), `vault_posts`, `vault_messages`, `vault_activity`. El admin sigue en `users` con su cookie JWT `asmyne_admin`; la cookie de miembro `asmyne_vault` nunca abre el admin.
- Expulsar a un miembro borra todas sus sesiones al instante.
- No requiere variables de entorno nuevas (usa `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET` del admin).
