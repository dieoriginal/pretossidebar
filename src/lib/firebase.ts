import { deflate, inflate } from 'pako';
import { doc, setDoc, getDoc, serverTimestamp, getDocs, collection } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { saveProjectToIndexedDB, loadProjectFromIndexedDB } from './db';

const firebaseConfig = {
  apiKey: "AIzaSyDgRlMnT4NtpOwWP3cp1m_pQcq_ndKcyOg",
  authDomain: "fazteumamboapp.firebaseapp.com",
  projectId: "fazteumamboapp",
  storageBucket: "fazteumamboapp.firebasestorage.app",
  messagingSenderId: "754575844407",
  appId: "1:754575844407:web:302bc38075cf93579b8bb2",
  measurementId: "G-SY61RCMJEC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
// Avoid importing analytics on the server to prevent window reference errors
export const analytics = null as unknown as undefined;

export const syncProjectToCloud = async (userId: string, project: any) => {
  const payload = (project && project.data) ? project.data : project;
  const id = (project && project.id) ? project.id : 'current-project';
  const compressed = deflate(JSON.stringify(payload), { to: 'string' });

  await setDoc(doc(db, `users/${userId}/projects/${id}`), {
    id,
    data: compressed,
    lastSynced: serverTimestamp(),
  });
};

export const loadProjectsFromCloud = async (userId: string) => {
  const snapshot = await getDocs(collection(db, `users/${userId}/projects`));
  return snapshot.docs.map(doc => {
    const dataStr = inflate(doc.data().data as string, { to: 'string' });
    return {
      id: doc.id,
      ...doc.data(),
      data: JSON.parse(dataStr as string),
    } as any;
  });
};

// Public publishing of singles (readable across devices)
export const publishPublicSingle = async (payload: {
  id: string; title: string; artist?: string; featured?: string[]; producer?: string; coverUrl?: string;
}) => {
  const ref = doc(db, `publicSingles/${payload.id}`);
  await setDoc(ref, { ...payload, updatedAt: new Date().toISOString() });
};

export const fetchPublicSingles = async (): Promise<Array<{
  id: string; title: string; artist?: string; featured?: string[]; producer?: string; coverUrl?: string;
}>> => {
  const snap = await getDocs(collection(db, 'publicSingles'));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
};

export const saveProjectLocally = async (state: any) => {
  try {
    return await saveProjectToIndexedDB(state);
  } catch (error) {
    console.error('Erro ao salvar projeto localmente:', error);
    throw error;
  }
};

export const loadLocalProject = async (projectId: string) => {
  try {
    return await loadProjectFromIndexedDB(projectId);
  } catch (error) {
    console.error('Erro ao carregar projeto local:', error);
    return null;
  }
};

export const saveProjectToFirebase = async (projectId: string, projectData: any) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");
    if (!projectData || !projectData.songInfo) {
      throw new Error("Dados do projeto incompletos");
    }

    const projectRef = doc(db, "users", user.uid, "projects", projectId);
    await setDoc(projectRef, {
      ...projectData,
      title: projectData.songInfo.title,
      artist: projectData.songInfo.artist,
      producer: projectData.songInfo.producer,
      featuring: projectData.songInfo.featuring,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('Projeto salvo no Firebase com sucesso');
    return true;
  } catch (error) {
    console.error("Erro ao salvar projeto no Firebase:", error);
    throw error;
  }
};

const validateProject = (project: any) => {
  if (!project) throw new Error('Projeto não definido');
  if (!project.id) throw new Error('ID do projeto não definido');
  if (!project.songInfo) throw new Error('Informações da música não definidas');
  if (!project.data) throw new Error('Dados do projeto não definidos');
};

export const autoSaveProject = async (projectId: string, projectData: any) => {
  try {
    validateProject(projectData);
    await saveProjectLocally(projectData);
    const user = auth.currentUser;
    if (user) {
      await saveProjectToFirebase(projectId, projectData);
    }
  } catch (error) {
    console.error('Erro no salvamento automático:', error);
    throw error;
  }
};