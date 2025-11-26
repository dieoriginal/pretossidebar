#!/bin/bash

# Script interativo para configurar GitHub Release

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  GitHub Release Setup - Faz Teu Mambo        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar versão
VERSION=$(node -p "require('./package.json').version")
TAG="v${VERSION}"

echo -e "${GREEN}📌 Versão: ${VERSION}${NC}"
echo -e "${GREEN}📌 Tag: ${TAG}${NC}"
echo ""

# Verificar DMGs
echo -e "${YELLOW}🔍 Verificando DMGs...${NC}"
DMG_X64="release/Faz Teu Mambo-${VERSION}.dmg"
DMG_ARM64="release/Faz Teu Mambo-${VERSION}-arm64.dmg"

if [ ! -f "$DMG_X64" ] && [ ! -f "$DMG_ARM64" ]; then
  echo -e "${RED}❌ Nenhum DMG encontrado!${NC}"
  echo -e "${YELLOW}Execute primeiro: npm run build && npm run electron:compile && npm run electron:dist${NC}"
  exit 1
fi

[ -f "$DMG_X64" ] && echo -e "   ✅ ${DMG_X64}"
[ -f "$DMG_ARM64" ] && echo -e "   ✅ ${DMG_ARM64}"
echo ""

# Verificar GitHub CLI
if command -v gh &> /dev/null; then
  echo -e "${GREEN}✅ GitHub CLI encontrado!${NC}"
  echo ""
  echo -e "${YELLOW}Opção 1: Usar GitHub CLI (mais fácil)${NC}"
  echo ""
  read -p "Desejas usar GitHub CLI para criar a release? (s/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}Verificando autenticação GitHub CLI...${NC}"
    if gh auth status &> /dev/null; then
      echo -e "${GREEN}✅ Autenticado no GitHub CLI${NC}"
      echo ""
      echo -e "${YELLOW}Criando release ${TAG}...${NC}"
      
      # Criar release
      gh release create "$TAG" \
        --title "${TAG} - Faz Teu Mambo Desktop App" \
        --notes "## Faz Teu Mambo Desktop App ${VERSION}

### 📦 Downloads

- **Intel (x64)**: Faz Teu Mambo-${VERSION}.dmg
- **Apple Silicon (ARM64)**: Faz Teu Mambo-${VERSION}-arm64.dmg

### 🚀 Auto-Updates

Esta release suporta atualizações automáticas. A aplicação verificará automaticamente por novas versões.

### 📝 Notas

- Primeira versão desktop da aplicação
- Suporta macOS Intel e Apple Silicon
- Auto-updates via GitHub Releases

### 🔧 Instalação

1. Abre o DMG
2. Arrasta \"Faz Teu Mambo.app\" para Applications
3. Abre a aplicação a partir de Applications" \
        "$DMG_X64" "$DMG_ARM64" 2>/dev/null || {
          echo -e "${RED}❌ Erro ao criar release${NC}"
          echo -e "${YELLOW}Tentando método alternativo...${NC}"
        }
      
      echo ""
      echo -e "${GREEN}✅ Release criada!${NC}"
      echo -e "${BLUE}🔗 https://github.com/dieoriginal/pretossidebar/releases/tag/${TAG}${NC}"
      exit 0
    else
      echo -e "${YELLOW}⚠️  Não autenticado. Fazendo login...${NC}"
      gh auth login
    fi
  fi
fi

# Método 2: Token manual
echo ""
echo -e "${YELLOW}Opção 2: Usar Personal Access Token${NC}"
echo ""
echo -e "${BLUE}Para criar um token:${NC}"
echo "1. Vai para: https://github.com/settings/tokens"
echo "2. Clica em 'Generate new token (classic)'"
echo "3. Dá um nome: electron-auto-updater"
echo "4. Marca permissão: repo (Full control)"
echo "5. Gera e copia o token (começa com ghp_)"
echo ""

if [ -z "$GH_TOKEN" ]; then
  read -p "Colar o token aqui (ou Enter para pular): " TOKEN
  if [ ! -z "$TOKEN" ]; then
    export GH_TOKEN="$TOKEN"
    echo -e "${GREEN}✅ Token configurado${NC}"
    echo ""
    echo -e "${YELLOW}Criando release...${NC}"
    node scripts/create-github-release.js
  else
    echo -e "${YELLOW}⚠️  Token não fornecido. Criando release manualmente...${NC}"
    echo ""
    echo -e "${BLUE}Para criar manualmente:${NC}"
    echo "1. Vai para: https://github.com/dieoriginal/pretossidebar/releases"
    echo "2. Clica em 'Draft a new release'"
    echo "3. Tag: ${TAG}"
    echo "4. Title: ${TAG} - Faz Teu Mambo Desktop App"
    echo "5. Upload dos DMGs de: release/"
    echo "6. Publica"
  fi
else
  echo -e "${GREEN}✅ GH_TOKEN já configurado${NC}"
  echo ""
  echo -e "${YELLOW}Criando release...${NC}"
  node scripts/create-github-release.js
fi

