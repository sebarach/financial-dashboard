# DESIGN.md — Financial Dashboard Design System

## Filosofía
**"Deep Space"** — Interfaz oscura con profundidad, luminosidad y movimiento. La información financiera se presenta como datos de una nave espacial: precisa, clara y elegante.

## Paleta de Colores

### Base
| Token | Valor | Uso |
|-------|-------|-----|
| `--deep-space-bg` | `#0a0a1a` | Fondo principal |
| `--deep-space-surface` | `#111128` | Superficies elevadas |
| `--deep-space-card` | `rgba(17, 17, 40, 0.6)` | Tarjetas (con blur) |

### Acentos
| Token | Valor | Uso |
|-------|-------|-----|
| `--cyan-accent` | `#00f0ff` | Ingresos, acciones positivas, enlaces |
| `--magenta-accent` | `#ff00aa` | Gastos, alertas, acciones destructivas |
| `--cyan-glow` | `rgba(0, 240, 255, 0.15)` | Shadow/glow cian |
| `--magenta-glow` | `rgba(255, 0, 170, 0.15)` | Shadow/glow magenta |

### Texto
| Token | Valor | Uso |
|-------|-------|-----|
| `--text-primary` | `#e8e8ff` | Texto principal |
| `--text-secondary` | `#8888aa` | Texto secundario, labels |

### Colores Corporativos de Bancos
| Banco | Primario | Secundario |
|-------|----------|------------|
| Banco de Chile | `#0033A0` | `#E4002B` |
| BCI | `#00A650` | `#003D7C` |
| Santander | `#EC0000` | `#FFFFFF` |
| Mercado Pago | `#009EE3` | `#FFD100` |

## Tipografía
- **Font family**: Inter (system-ui fallback)
- **Headings**: Bold, tracking-tight
- **Body**: Regular 14-16px
- **Labels**: Uppercase, tracking-widest, text-secondary, 10-12px
- **Números/Montos**: font-mono

## Componentes

### Card Futurística (Animada)
```css
.card-futuristic {
  backdrop-blur-md;
  rounded-2xl;
  border: animated glow (cian ↔ magenta, 6s cycle);
  background: rgba(17, 17, 40, 0.6);
}
```
Uso: métricas principales, elementos destacados.

### Card Futurística (Estática)
```css
.card-futuristic-static {
  backdrop-blur-md;
  rounded-2xl;
  border: 1px solid rgba(0, 240, 255, 0.2);
  background: rgba(17, 17, 40, 0.6);
}
```
Uso: listas, formularios, contenido secundario.

### Sidebar
- Fondo: gradiente vertical (#0d0d24 → #0a0a1a)
- Ancho: 220px (desktop), drawer (mobile)
- Item activo: fondo cian 8%, glow
- Avatar: gradiente cian→magenta con iniciales

### Mobile Top Bar
- Fondo: rgba(10, 10, 26, 0.95) + blur(12px)
- Altura: 56px
- Botón ☰ (hamburguesa), logo centrado, avatar derecha

## Formularios (Design Pattern)

### Inputs
- Fondo: transparente con border-bottom rgba(cian, 0.2)
- Focus: border-bottom cian + glow
- Error: border-bottom magenta + texto error
- Label: uppercase, tracking-widest, text-secondary
- Altura mínima touch: 44px

### Selects
- Mismo estilo que inputs
- Opciones con icono de categoría/banco
- Preview del color del banco

### Botones
- **Primary**: gradiente cian→magenta, texto oscuro
- **Secondary**: border cian, texto cian
- **Destructive**: border magenta, texto magenta
- Hover: glow del color correspondiente
- Disabled: opacity 50%

### Validaciones
- Tiempo real (onChange)
- Error inline debajo del campo
- Icono ✓ verde cuando es válido
- Icono ✗ magenta cuando hay error
- Shake animation en error de submit

## Animaciones
- **Border glow**: 6s cycle cian ↔ magenta en cards principales
- **Loading**: spinner cian con border-t transparent
- **Transiciones**: 200-300ms ease
- **Entrada**: fade-in + slide-up (300ms)
- **Error shake**: 300ms horizontal

## Responsive Breakpoints
| Breakpoint | Layout |
|-----------|--------|
| < 768px | Mobile: drawer sidebar, stacked layout, top bar |
| 768px+ | Desktop: sidebar fijo, grid layout |

## PWA
- `display: standalone`
- Splash: fondo #0a0a1a, logo diamante con F
- Iconos: 192px y 512px, gradiente cian→magenta
- Theme: #0a0a1a
- Offline: service worker con network-first + cache fallback

## Accesibilidad
- Contraste mínimo 4.5:1 en texto
- Focus rings visibles
- Touch targets ≥ 44px
- Safe area para notch
- Semantic HTML
