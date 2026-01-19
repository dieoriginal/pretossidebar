#!/bin/bash
# Script rápido para executar o preenchimento de informações

echo "🚀 Preenchimento Rápido de Informações Faltantes"
echo "================================================"
echo ""

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 não encontrado. Por favor, instale Python3."
    exit 1
fi

# Verificar se pip está instalado
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 não encontrado. Por favor, instale pip3."
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
pip3 install -q -r scripts/requirements-fill-missing.txt

# Verificar se os arquivos de dados existem
if [ ! -f "data/venues_export.json" ] && [ ! -f "data/producers_export.json" ]; then
    echo ""
    echo "⚠️  Arquivos de dados não encontrados!"
    echo ""
    echo "Por favor, exporte os dados do browser primeiro:"
    echo "1. Abra o DevTools (F12)"
    echo "2. Execute no console:"
    echo "   await exportAll();"
    echo "3. Salve os arquivos em data/"
    echo ""
    read -p "Pressione Enter para continuar mesmo assim ou Ctrl+C para sair..."
fi

# Executar script
echo ""
echo "🔄 Executando preenchimento..."
echo ""

if [ "$1" == "venues" ]; then
    python3 scripts/fill-missing-info.py --type venues ${@:2}
elif [ "$1" == "producers" ]; then
    python3 scripts/fill-missing-info.py --type producers ${@:2}
else
    python3 scripts/fill-missing-info.py --type all ${@:1}
fi

echo ""
echo "✅ Concluído!"
echo ""
echo "📁 Dados atualizados salvos em:"
echo "   - data/venues_updated.json"
echo "   - data/producers_updated.json"
echo ""
echo "📥 Para importar de volta ao sistema:"
echo "   Execute no console do browser: await importAll();"







