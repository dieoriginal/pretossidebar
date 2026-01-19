/**
 * Script para exportar dados do IndexedDB para JSON
 * Execute este código no console do browser (F12)
 */

// Função para exportar Venues
async function exportVenues() {
  try {
    // Importar função do módulo
    const { getAllVenues } = await import('/src/lib/venuesDb.ts');
    const venues = await getAllVenues();
    
    // Converter para JSON
    const dataStr = JSON.stringify(venues, null, 2);
    
    // Criar blob e download
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'venues_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`✅ Exportados ${venues.length} venues`);
    return venues;
  } catch (error) {
    console.error('❌ Erro ao exportar venues:', error);
    throw error;
  }
}

// Função para exportar Producers
async function exportProducers() {
  try {
    // Importar função do módulo
    const { getAllProducers } = await import('/src/lib/producersDb.ts');
    const producers = await getAllProducers();
    
    // Converter para JSON
    const dataStr = JSON.stringify(producers, null, 2);
    
    // Criar blob e download
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'producers_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`✅ Exportados ${producers.length} producers`);
    return producers;
  } catch (error) {
    console.error('❌ Erro ao exportar producers:', error);
    throw error;
  }
}

// Função para exportar ambos
async function exportAll() {
  console.log('📤 Exportando todos os dados...');
  const venues = await exportVenues();
  await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1s
  const producers = await exportProducers();
  console.log(`\n✅ Exportação completa!`);
  console.log(`   - ${venues.length} venues`);
  console.log(`   - ${producers.length} producers`);
  console.log(`\n📁 Salve os arquivos em: scripts/../data/`);
  return { venues, producers };
}

// Exportar funções globalmente
window.exportVenues = exportVenues;
window.exportProducers = exportProducers;
window.exportAll = exportAll;

console.log(`
📋 Funções de exportação disponíveis:

  exportVenues()    - Exporta apenas venues
  exportProducers() - Exporta apenas producers
  exportAll()       - Exporta ambos

Exemplo de uso:
  await exportAll();
`);







