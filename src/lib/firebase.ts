import { compress, decompress } from 'pako';
import { doc, setDoc, getDoc, serverTimestamp, getDocs, collection } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
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
export const analytics = getAnalytics(app);

export const syncProjectToCloud = async (userId: string, project: any) => {
  const compressed = compress(JSON.stringify(project.data));
  
  await setDoc(doc(db, `users/${userId}/projects/${project.id}`), {
    ...project,
    data: compressed,
    lastSynced: serverTimestamp(),
  });
};

export const loadProjectsFromCloud = async (userId: string) => {
  const snapshot = await getDocs(collection(db, `users/${userId}/projects`));
  return snapshot.docs.map(doc => {
    const data = decompress(doc.data().data);
    return {
      id: doc.id,
      ...doc.data(),
      data: JSON.parse(data),
    };
  });
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