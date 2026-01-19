/**
 * Script opcional para migrar dados do Firebase para Supabase
 * Execute com: npx tsx scripts/migrate-firebase-to-supabase.ts
 * 
 * NOTA: Este script requer acesso ao Firebase Admin SDK e Supabase
 * Configure as variáveis de ambiente antes de executar
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createClient } from '@supabase/supabase-js';
import { deflate } from 'pako';

// Configuração Firebase Admin (para ler dados)
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'fazteumamboapp',
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID || 'fazteumamboapp',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  }),
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

// Configuração Supabase (para escrever dados)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Migrar projetos de usuários
 */
async function migrateProjects() {
  console.log('Migrando projetos de usuários...');
  
  try {
    // Buscar todas as coleções de usuários
    const usersRef = db.collection('users');
    const usersSnapshot = await usersRef.get();
    
    let totalProjects = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const projectsRef = userDoc.ref.collection('projects');
      const projectsSnapshot = await projectsRef.get();
      
      console.log(`  Usuário ${userId}: ${projectsSnapshot.size} projetos`);
      
      for (const projectDoc of projectsSnapshot.docs) {
        const projectData = projectDoc.data();
        const projectId = projectDoc.id;
        
        // Comprimir dados se necessário
        let compressedData = projectData.data;
        if (typeof compressedData === 'object') {
          compressedData = deflate(JSON.stringify(compressedData), { to: 'string' });
        }
        
        // Inserir no Supabase
        const { error } = await supabase
          .from('projects')
          .upsert({
            id: projectId,
            user_id: userId,
            data: compressedData,
            title: projectData.title || null,
            artist: projectData.artist || null,
            producer: projectData.producer || null,
            featuring: projectData.featuring || null,
            last_synced: projectData.lastSynced?.toDate?.()?.toISOString() || new Date().toISOString(),
            created_at: projectData.createdAt || new Date().toISOString(),
            updated_at: projectData.updatedAt || new Date().toISOString(),
          }, {
            onConflict: 'id,user_id',
          });
        
        if (error) {
          console.error(`    Erro ao migrar projeto ${projectId}:`, error);
        } else {
          totalProjects++;
        }
      }
    }
    
    console.log(`✓ ${totalProjects} projetos migrados`);
  } catch (error) {
    console.error('Erro ao migrar projetos:', error);
  }
}

/**
 * Migrar singles públicos
 */
async function migratePublicSingles() {
  console.log('Migrando singles públicos...');
  
  try {
    const singlesRef = db.collection('publicSingles');
    const singlesSnapshot = await singlesRef.get();
    
    let total = 0;
    
    for (const singleDoc of singlesSnapshot.docs) {
      const data = singleDoc.data();
      
      const { error } = await supabase
        .from('public_singles')
        .upsert({
          id: singleDoc.id,
          title: data.title,
          artist: data.artist || null,
          featured: data.featured || null,
          producer: data.producer || null,
          cover_url: data.coverUrl || null,
          updated_at: data.updatedAt || new Date().toISOString(),
        }, {
          onConflict: 'id',
        });
      
      if (error) {
        console.error(`  Erro ao migrar single ${singleDoc.id}:`, error);
      } else {
        total++;
      }
    }
    
    console.log(`✓ ${total} singles públicos migrados`);
  } catch (error) {
    console.error('Erro ao migrar singles públicos:', error);
  }
}

/**
 * Migrar projetos públicos
 */
async function migratePublicProjects() {
  console.log('Migrando projetos públicos...');
  
  try {
    const projectsRef = db.collection('public_projects');
    const projectsSnapshot = await projectsRef.get();
    
    let total = 0;
    
    for (const projectDoc of projectsSnapshot.docs) {
      const data = projectDoc.data();
      
      const { error } = await supabase
        .from('public_projects')
        .upsert({
          id: projectDoc.id,
          data: data,
          is_public: data.isPublic !== false,
          updated_at: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        }, {
          onConflict: 'id',
        });
      
      if (error) {
        console.error(`  Erro ao migrar projeto público ${projectDoc.id}:`, error);
      } else {
        total++;
      }
    }
    
    console.log(`✓ ${total} projetos públicos migrados`);
  } catch (error) {
    console.error('Erro ao migrar projetos públicos:', error);
  }
}

/**
 * Migrar eventos públicos
 */
async function migratePublicEvents() {
  console.log('Migrando eventos públicos...');
  
  try {
    const eventsRef = db.collection('public_events');
    const eventsSnapshot = await eventsRef.get();
    
    let total = 0;
    
    for (const eventDoc of eventsSnapshot.docs) {
      const data = eventDoc.data();
      
      const { error } = await supabase
        .from('public_events')
        .upsert({
          id: eventDoc.id,
          data: data,
          is_public: data.isPublic !== false,
          updated_at: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        }, {
          onConflict: 'id',
        });
      
      if (error) {
        console.error(`  Erro ao migrar evento público ${eventDoc.id}:`, error);
      } else {
        total++;
      }
    }
    
    console.log(`✓ ${total} eventos públicos migrados`);
  } catch (error) {
    console.error('Erro ao migrar eventos públicos:', error);
  }
}

/**
 * Executar migração completa
 */
async function main() {
  console.log('Iniciando migração Firebase → Supabase...\n');
  
  await migrateProjects();
  await migratePublicSingles();
  await migratePublicProjects();
  await migratePublicEvents();
  
  console.log('\n✓ Migração concluída!');
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export { migrateProjects, migratePublicSingles, migratePublicProjects, migratePublicEvents };

