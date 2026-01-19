/**
 * Script para importar dados atualizados de volta para o IndexedDB
 * Execute este código no console do browser (F12)
 * 
 * IMPORTANTE: Primeiro execute o script Python para gerar os arquivos atualizados
 */

// Função para importar Venues atualizados
async function importVenues() {
  try {
    // Ler arquivo JSON (você precisa fazer upload ou colar o conteúdo)
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    
    return new Promise((resolve, reject) => {
      fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          reject(new Error('Nenhum arquivo selecionado'));
          return;
        }
        
        const text = await file.text();
        const venues = JSON.parse(text);
        
        // Importar função
        const { updateVenue } = await import('/src/lib/venuesDb.ts');
        
        let updated = 0;
        let errors = 0;
        
        for (const venue of venues) {
          try {
            await updateVenue(venue.id, venue);
            updated++;
            console.log(`✅ Atualizado: ${venue.name}`);
          } catch (error) {
            console.error(`❌ Erro ao atualizar ${venue.name}:`, error);
            errors++;
          }
        }
        
        console.log(`\n📊 Importação completa:`);
        console.log(`   - Atualizados: ${updated}`);
        console.log(`   - Erros: ${errors}`);
        
        resolve({ updated, errors });
      };
      
      fileInput.click();
    });
  } catch (error) {
    console.error('❌ Erro ao importar venues:', error);
    throw error;
  }
}

// Função para importar Producers atualizados
async function importProducers() {
  try {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    
    return new Promise((resolve, reject) => {
      fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          reject(new Error('Nenhum arquivo selecionado'));
          return;
        }
        
        const text = await file.text();
        const producers = JSON.parse(text);
        
        // Importar função
        const { updateProducer } = await import('/src/lib/producersDb.ts');
        
        let updated = 0;
        let errors = 0;
        
        for (const producer of producers) {
          try {
            await updateProducer(producer.id, producer);
            updated++;
            console.log(`✅ Atualizado: ${producer.name}`);
          } catch (error) {
            console.error(`❌ Erro ao atualizar ${producer.name}:`, error);
            errors++;
          }
        }
        
        console.log(`\n📊 Importação completa:`);
        console.log(`   - Atualizados: ${updated}`);
        console.log(`   - Erros: ${errors}`);
        
        resolve({ updated, errors });
      };
      
      fileInput.click();
    });
  } catch (error) {
    console.error('❌ Erro ao importar producers:', error);
    throw error;
  }
}

// Função para importar ambos
async function importAll() {
  console.log('📥 Importando dados atualizados...');
  console.log('Selecione o arquivo venues_updated.json primeiro...');
  const venuesResult = await importVenues();
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('\nAgora selecione o arquivo producers_updated.json...');
  const producersResult = await importProducers();
  console.log(`\n✅ Importação completa!`);
  return { venues: venuesResult, producers: producersResult };
}

// Exportar funções globalmente
window.importVenues = importVenues;
window.importProducers = importProducers;
window.importAll = importAll;

console.log(`
📋 Funções de importação disponíveis:

  importVenues()    - Importa venues atualizados
  importProducers() - Importa producers atualizados
  importAll()       - Importa ambos

Exemplo de uso:
  await importAll();
`);







