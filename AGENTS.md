# AGENTS.md — Financial Dashboard

## Proyecto
**FinDash** — Dashboard financiero personal con estética futurista "Deep Space".
**Dueño**: Sebastian Sepulveda (@sebassep en Telegram, sebarach en GitHub)

## Stack
- **Frontend**: Next.js 14 (App Router, Static Export), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, REST API, RLS)
- **Deploy**: GitHub Actions → GitHub Pages (auto on push to `main`)
- **PWA**: manifest.json, service worker, instalable en Android/iOS

## Repositorio
- **GitHub**: `sebarach/financial-dashboard` (privado)
- **URL producción**: https://sebarach.github.io/financial-dashboard/
- **Local**: `/home/node/.openclaw/workspace/projects/financial-dashboard/`
- **Branch actual**: `develop` (trabajar features aquí, merge a main para deploy)

## Branches
- `main` → producción (deploy automático via GitHub Actions)
- `develop` → integración (actual)
- `feature/*` → features individuales

## Credenciales

**⚠️ Las credenciales están en `.env.local` (no se sube a git).**

Archivo `.env.local` en la raíz del proyecto:
```
# GitHub PAT (fine-grained, repo: financial-dashboard)
# Scopes: Contents R/W, Administration R/W, Pages R/W
GH_PAT=github_pat_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://fqhiyizidaphnudefdzu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ACCESS_TOKEN=sbp_...
```

**Para push**: `git remote set-url origin "https://x-access-token:${GH_PAT}@github.com/sebarach/financial-dashboard.git"`

### Quick Reference
- **Supabase URL**: `https://fqhiyizidaphnudefdzu.supabase.co`
- **Project ref**: `fqhiyizidaphnudefdzu`
- **Client config**: `src/lib/supabase.ts` (lee de `.env.local`)
- **Management API**: `curl -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" https://api.supabase.com/v1/projects/fqhiyizidaphnudefdzu/...`
- **Query DB**: `curl -X POST "https://api.supabase.com/v1/projects/fqhiyizidaphnudefdzu/database/query" -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" -H "Content-Type: application/json" -d '{"query": "..."}'`

### Tablas
| Tabla | Columnas clave | Datos actuales |
|-------|---------------|----------------|
| `banks` | id, slug, name, color, color_alt, logo_url | 4 bancos (Banco de Chile, BCI, Santander, Mercado Pago) |
| `categories` | id, slug, name, icon, color, type | 9 categorías (salary, freelance, food, transport, entertainment, bills, investment, transfer, other) |
| `accounts` | id, bank_id, name, account_type, balance, currency, is_active | 4 cuentas |
| `transactions` | id, account_id, category_id, amount, type, description, status, transaction_date | 12 transacciones |
| `budgets` | id, category_id, amount, period_month, period_year | 5 presupuestos (abril 2026) |
| `transfer_pairs` | id, from_transaction_id, to_transaction_id | vacío (se llena al crear transferencias) |

### Views
- `vw_monthly_summary` — resumen mensual (ingresos, gastos, neto, count)
- `vw_category_breakdown` — desglose por categoría (mes actual)

### RLS
- Todas las tablas tienen RLS habilitado
- Políticas: anon + authenticated pueden READ todo
- No hay políticas de WRITE (solo via service_role o API conanon key inserta directo)

## Estructura de Carpetas (completa)
```
financial-dashboard/
├── .github/workflows/
│   └── deploy.yml              # CI/CD: build + deploy GitHub Pages on push main
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker (network-first + cache)
│   └── icons/
│       ├── icon.svg            # Logo vectorial (diamante + F)
│       ├── icon-192.png        # PWA icon 192px
│       └── icon-512.png        # PWA icon 512px
├── scripts/
│   └── setup-repo.sh           # Automatización gh CLI (init, branches, push)
├── src/
│   ├── app/
│   │   ├── globals.css         # Estilos globales Deep Space
│   │   ├── layout.tsx          # Root layout (metadata + ClientLayout)
│   │   ├── page.tsx            # Dashboard principal (usa useTransactions)
│   │   ├── transactions/
│   │   │   └── page.tsx        # CRUD transacciones completo
│   │   ├── accounts/page.tsx   # Placeholder 🚧
│   │   ├── budget/page.tsx     # Placeholder 🚧
│   │   ├── investments/page.tsx # Placeholder 🚧
│   │   ├── reports/page.tsx    # Placeholder 🚧
│   │   └── settings/page.tsx   # Placeholder 🚧
│   ├── components/
│   │   ├── ClientLayout.tsx    # Layout cliente (sidebar + mobile drawer + SW register)
│   │   ├── Sidebar.tsx         # Sidebar fijo (desktop) / drawer (mobile)
│   │   ├── SummaryCards.tsx    # 4 cards resumen (balance, ingresos, gastos, tasa ahorro)
│   │   ├── AccountsList.tsx    # Lista de cuentas con colores de banco
│   │   ├── TransactionList.tsx # Lista de transacciones (dashboard)
│   │   ├── ChartSection.tsx    # Barras ingresos/gastos por día
│   │   └── CategoryBreakdown.tsx # Barras de progreso por categoría
│   ├── hooks/
│   │   └── useTransactions.ts  # Hook principal: fetch de Supabase, computa summary/chart/breakdown
│   ├── services/
│   │   └── transactions.ts     # Lógica de negocio: create, transfer, delete, validaciones
│   ├── types/
│   │   └── index.ts            # Interfaces compartidas (Transaction, Account, Bank, etc.)
│   ├── constants/
│   │   └── mockData.ts         # Datos mock (LEGACY — ya no se usa, pero queda como referencia)
│   └── lib/
│       └── supabase.ts         # Supabase client (url + anon key)
├── supabase/
│   ├── schema.sql              # DDL completo
│   └── seed.sql                # Datos de ejemplo
├── AGENTS.md                   # ESTE ARCHIVO
├── DESIGN.md                   # Design system completo
├── next.config.js              # Static export, basePath: /financial-dashboard
├── tailwind.config.js          # Tailwind config
├── postcss.config.js           # PostCSS config
├── tsconfig.json               # TypeScript config (paths: @/* → ./src/*)
├── package.json
└── package-lock.json
```

## Estado del Proyecto (2026-04-07)

### ✅ Completado
- [x] Setup repo + branches + GitHub Pages + CI/CD
- [x] Dashboard principal con datos reales de Supabase
- [x] Estética futurista Deep Space (cyan/magenta, blur, glow animado)
- [x] Sidebar con navegación (drawer en mobile)
- [x] PWA completa (manifest, SW, iconos, instalable)
- [x] Mobile-first responsive
- [x] Base de datos Supabase (6 tablas + views + RLS)
- [x] Seed data (bancos chilenos, categorías, cuentas, transacciones)
- [x] Feature de transacciones completo (crear, transferir, eliminar, buscar, filtrar)
- [x] Validaciones robustas (tiempo real, inline, bounds checking)
- [x] Documentación (AGENTS.md, DESIGN.md)

### 🚧 Próximos Features (por hacer)
- [ ] **Página Accounts**: CRUD de cuentas, sincronización de balances
- [ ] **Página Budgets**: setup de presupuestos mensuales, barra de progreso vs gasto real
- [ ] **Página Investments**: tracking de inversiones, gráficos de rendimiento
- [ ] **Página Reports**: reportes mensuales, exportar PDF/CSV
- [ ] **Página Settings**: configuración de usuario, moneda, notificaciones
- [ ] **Auth**: Login con Supabase Auth (Google/Email), RLS por usuario
- [ ] **Notificaciones push**: alertas de presupuesto, gastos grandes
- [ ] **Charts reales**: reemplazar barras CSS por Recharts o Chart.js
- [ ] **Framer Motion**: animaciones de entrada/transiciones
- [ ] **Dark/Light mode**: toggle (aunque el dark es core del diseño)
- [ ] **Actualizar balances al crear transacción**: trigger DB o lógica en service
- [ ] **Editar transacción existente**: modal de edición
- [ ] **Paginación**: la lista de transacciones crecerá

## Convenciones
- **Patrón Repository**: Hooks abstraen la fuente de datos. Services tienen la lógica de negocio.
- **Mobile-first**: Todo se diseña mobile primero, desktop después.
- **Colores**: Deep Space (#0a0a1a) con acentos cian (#00f0ff) y magenta (#ff00aa).
- **CSS Classes**: `.card-futuristic` bordes animados, `.card-futuristic-static` bordes fijos.
- **Formularios**: Validación onBlur + onSubmit, errores inline en rojo, checkmark ✓ verde.
- **Commits**: Emoji prefix (🎉 📱 🔥 ✨ 🐛 📝)
- **Moneda**: CLP por defecto, formato `Intl.NumberFormat('es-CL')`.
- **Fechas**: ISO 8601 en DB, `es-CL` locale para display.

## Comandos Esenciales
```bash
# Desarrollo
cd /home/node/.openclaw/workspace/projects/financial-dashboard
npm run dev                              # Dev server

# Build
npm install --include=dev && npx next build   # ⚠️ siempre --include=dev

# Git
git checkout develop                     # Trabajar en develop
git add -A && git commit -m "✨ feature"
git push origin develop
# Para deploy: merge develop → main
git checkout main && git merge develop --squash && git push origin main

# Supabase queries (Management API)
curl -s -X POST "https://api.supabase.com/v1/projects/fqhiyizidaphnudefdzu/database/query" \
  -H "Authorization: Bearer sbp_cab48f46df688949f064a0846309f76dfec71062" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM transactions LIMIT 5;"}'

# Supabase REST API
curl "https://fqhiyizidaphnudefdzu.supabase.co/rest/v1/transactions?select=*&limit=5" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxaGl5aXppZGFwaG51ZGVmZHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTg0MDMsImV4cCI6MjA5MTE3NDQwM30.oL7bouyfzWJ-Y54V2B_jexK6iIYM5s8DeHP06KNSxRU"

# GitHub CLI
gh run list --repo sebarach/financial-dashboard --limit 3    # Ver deploys
gh run view <id> --repo sebarach/financial-dashboard          # Ver detalle
```

## ⚠️ Lecciones Aprendidas / Gotchas
1. **`npm install` sin `--include=dev`** borra TypeScript y Tailwind del node_modules. SIEMPRE usar `npm install --include=dev`.
2. **Static export + Supabase**: Los hooks con `useEffect` cargan datos en runtime (browser), no en build time. El build muestra el loading spinner, la data se fetcha después.
3. **`basePath`** en `next.config.js` debe ser `/financial-dashboard` en producción (nombre del repo).
4. **PAT fine-grained** necesita permisos explícitos: Contents R/W, Administration R/W, Pages R/W sobre el repo específico.
5. **`next build` falla con "Module not found"** si TypeScript no está instalado. Síntoma: checkea `ls node_modules/typescript`.
6. **RLS policies**: Actualmente solo hay SELECT público. Para INSERT/UPDATE desde el browser se usa el anon key (que funciona porque no hay policies restrictivas de INSERT). Si se agrega auth, hay que ajustar las policies.
7. **Supabase `select` con joins**: `supabase.from('transactions').select('*, category:categories(*), account:accounts(bank:banks(*))')` — encadenar con `(` `)` para nested joins.
8. **Monto en DB**: Los expenses se guardan como negativo, income como positivo. El service layer hace el signo automáticamente.
9. **Git config**: Si el container se recrea, hay que hacer `git config user.email` y `git config user.name` de nuevo.
10. **Remote URL**: Después de container recreation, puede que el remote no tenga el token. Reconfigurar con `git remote set-url origin https://x-access-token:<PAT>@github.com/sebarach/financial-dashboard.git`.
