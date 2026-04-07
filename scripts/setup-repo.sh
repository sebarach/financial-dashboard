#!/usr/bin/env bash
set -euo pipefail

# ============================================
# setup-repo.sh — Automatización con gh CLI
# Crea repo, branches y primer commit
# ============================================

REPO_NAME="financial-dashboard"
REPO_DESC="Dashboard Financiero con estética futurista — Next.js + TypeScript"
OWNER="$(gh api user --jq '.login')"

echo "🚀 Iniciando setup de ${REPO_NAME}..."

# 1. Inicializar git local (si no existe)
if [ ! -d .git ]; then
  git init
  echo "✅ Git inicializado"
else
  echo "⏩ Git ya inicializado"
fi

# 2. Crear repo en GitHub (privado)
if ! gh repo view "${OWNER}/${REPO_NAME}" &>/dev/null; then
  gh repo create "${REPO_NAME}" --private --description "${REPO_DESC}"
  echo "✅ Repo privado creado: ${OWNER}/${REPO_NAME}"
else
  echo "⏩ Repo ya existe: ${OWNER}/${REPO_NAME}"
fi

# 3. Crear package.json inicial si no existe
if [ ! -f package.json ]; then
  cat > package.json << 'PKGJSON'
{
  "name": "financial-dashboard",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
PKGJSON
  echo "✅ package.json creado"
fi

# 4. Crear .gitignore
if [ ! -f .gitignore ]; then
  cat > .gitignore << 'GI'
node_modules/
.next/
out/
*.tsbuildinfo
next-env.d.ts
.DS_Store
.env
.env.local
GI
  echo "✅ .gitignore creado"
fi

# 5. Commit inicial en main
git add -A
if git diff --cached --quiet; then
  echo "⏩ Nada nuevo para commitear"
else
  git commit -m "🎉 Initial commit: Financial Dashboard scaffold"
  echo "✅ Primer commit hecho"
fi

# 6. Agregar remote y push a main
REMOTE_URL="https://github.com/${OWNER}/${REPO_NAME}.git"
if ! git remote | grep -q origin; then
  git remote add origin "${REMOTE_URL}"
fi

git branch -M main
git push -u origin main
echo "✅ Push a main"

# 7. Crear branch develop
if ! git show-ref --verify --quiet refs/heads/develop; then
  git checkout -b develop
  git push -u origin develop
  echo "✅ Branch develop creada"
else
  echo "⏩ develop ya existe"
fi

# 8. Crear branch feature/ui-dashboard
if ! git show-ref --verify --quiet refs/heads/feature/ui-dashboard; then
  git checkout -b feature/ui-dashboard
  git push -u origin feature/ui-dashboard
  echo "✅ Branch feature/ui-dashboard creada"
else
  echo "⏩ feature/ui-dashboard ya existe"
fi

# 9. Volver a develop
git checkout develop

echo ""
echo "🏁 Setup completo!"
echo "   Repo:    https://github.com/${OWNER}/${REPO_NAME}"
echo "   Branches: main, develop, feature/ui-dashboard"
echo "   Activas:  develop (current)"
