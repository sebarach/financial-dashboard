# AGENTS.md — Financial Dashboard

## Proyecto
**FinDash** — Dashboard financiero personal con estética futurista "Deep Space".

## Stack
- **Frontend**: Next.js 14 (App Router, Static Export), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, REST API, RLS)
- **Deploy**: GitHub Actions → GitHub Pages (auto on push to `main`)
- **PWA**: manifest.json, service worker, instalable en Android/iOS

## Repositorio
- **GitHub**: `sebarach/financial-dashboard` (privado)
- **URL**: https://sebarach.github.io/financial-dashboard/
- **Local**: `/home/node/.openclaw/workspace/projects/financial-dashboard/`

## Branches
- `main` → producción (deploy automático)
- `develop` → integración
- `feature/*` → features individuales

## Supabase
- **Project**: `financial-sebarach` (ref: `fqhiyizidaphnudefdzu`)
- **Region**: East US (North Virginia)
- **URL**: `https://fqhiyizidaphnudefdzu.supabase.co`
- **Client**: `src/lib/supabase.ts`

### Tablas
| Tabla | Descripción |
|-------|-------------|
| `banks` | Bancos con colores corporativos |
| `categories` | Categorías de transacciones (income/expense/transfer) |
| `accounts` | Cuentas bancarias vinculadas a bancos |
| `transactions` | Transacciones con joins a cuentas y categorías |
| `budgets` | Presupuestos mensuales por categoría |
| `transfer_pairs` | Relación entre transferencias origen/destino |

### SQL Files
- `supabase/schema.sql` — DDL completo (tablas, índices, views, RLS)
- `supabase/seed.sql` — Datos de ejemplo

## Estructura de Carpetas
```
src/
├── app/           # Pages (App Router)
├── components/    # Componentes React
├── hooks/         # Custom hooks (useTransactions)
├── services/      # Lógica de negocio / API calls
├── types/         # Interfaces TypeScript compartidas
├── constants/     # Datos estáticos y mock (legacy)
└── lib/           # Utilidades (supabase client)
```

## Convenciones
- **Patrón Repository**: Los hooks abstraen la fuente de datos. Cambiar de mock a Supabase fue transparente para la UI.
- **Mobile-first**: Todo se diseña mobile primero, luego desktop.
- **Colores**: Deep Space (#0a0a1a) con acentos cian (#00f0ff) y magenta (#ff00aa).
- **Componentes**: `.card-futuristic` para bordes animados, `.card-futuristic-static` para bordes fijos.
- **Formularios**: Validación con feedback visual inmediato, errores inline.
- **Commits**: Emoji prefix (🎉 📱 🔥 ✨ 🐛 📝)

## Comandos
```bash
npm run dev        # Desarrollo local
npm run build      # Build estático (output: out/)
npx next build     # Build explícito
```

## Deploy
Push a `main` → GitHub Actions build + deploy a GitHub Pages automáticamente.

## Notas Importantes
- `npm install` sin `--include=dev` borra TypeScript. Siempre usar `npm install --include=dev`.
- Static export: los hooks con `useEffect` cargan datos en runtime, no en build.
- `basePath` en `next.config.js` debe coincidir con el nombre del repo.
- PAT fine-grained necesita permisos: Contents, Administration, Pages (read+write).
