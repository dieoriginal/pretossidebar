#!/bin/bash

# Script de Release para Faz Teu Mambo Desktop App
# Uso: ./scripts/release.sh [patch|minor|major]

set -e  # Exit on error

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Faz Teu Mambo - Release Script${NC}"
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Erro: package.json não encontrado. Executa este script da raiz do projeto.${NC}"
  exit 1
fi

# Incrementar versão se especificado
if [ "$1" = "patch" ] || [ "$1" = "minor" ] || [ "$1" = "major" ]; then
  echo -e "${YELLOW}📦 Incrementando versão ($1)...${NC}"
  npm version $1 --no-git-tag-version
  echo -e "${GREEN}✅ Versão atualizada${NC}"
  echo ""
fi

# Obter versão atual
VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}📌 Versão atual: $VERSION${NC}"
echo ""

# 1. Build Next.js
echo -e "${YELLOW}🔨 Building Next.js...${NC}"
npm run build
echo -e "${GREEN}✅ Next.js build completo${NC}"
echo ""

# 2. Compilar Electron
echo -e "${YELLOW}⚙️  Compilando Electron TypeScript...${NC}"
npm run electron:compile
echo -e "${GREEN}✅ Electron compilado${NC}"
echo ""

# 3. Criar DMG
echo -e "${YELLOW}💿 Criando DMG...${NC}"
if [ -z "$GH_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  GH_TOKEN não configurado. Criando apenas DMG local.${NC}"
  echo -e "${YELLOW}   Para upload automático, configure: export GH_TOKEN=ghp_xxx${NC}"
  npm run electron:dist
else
  echo -e "${GREEN}✅ GH_TOKEN configurado. Fazendo upload automático para GitHub.${NC}"
  GH_TOKEN=$GH_TOKEN npm run electron:dist
fi
echo ""

# 4. Verificar ficheiros criados
echo -e "${GREEN}📦 Ficheiros criados:${NC}"
ls -lh release/*.dmg 2>/dev/null || echo "Nenhum DMG encontrado"
echo ""

# 5. Instruções
echo -e "${GREEN}✅ Release criado com sucesso!${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo "1. Testar DMG:"
echo "   ${GREEN}open release/Faz\\ Teu\\ Mambo-${VERSION}.dmg${NC}"
echo ""
echo "2. Se GH_TOKEN não estava configurado:"
echo "   - Vai para: https://github.com/dieoriginal/pretossidebar/releases"
echo "   - Cria nova release com tag: ${GREEN}v${VERSION}${NC}"
echo "   - Faz upload dos DMGs de: ${GREEN}release/${NC}"
echo ""
echo "3. Para criar tag Git:"
echo "   ${GREEN}git tag v${VERSION} && git push origin v${VERSION}${NC}"
echo ""

