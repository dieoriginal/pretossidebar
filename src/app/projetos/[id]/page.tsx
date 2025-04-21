'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';

interface Project {
  id: string;
  title: string;
  artist: string;
  producer: string;
  featuring: string[];
  strophes: any[];
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const projectRef = doc(db, "users", user.uid, "projects", id as string);
        const docSnap = await getDoc(projectRef);

        if (docSnap.exists()) {
          setProject({
            id: docSnap.id,
            ...docSnap.data()
          } as Project);
        } else {
          console.log("Projeto não encontrado");
        }
      } catch (error) {
        console.error("Erro ao carregar projeto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return <div>Carregando projeto...</div>;
  }

  if (!project) {
    return <div>Projeto não encontrado</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Informações do Projeto</h2>
          <p className="text-gray-600">Artista: {project.artist}</p>
          <p className="text-gray-600">Produtor: {project.producer}</p>
          {project.featuring.length > 0 && (
            <p className="text-gray-600">
              Feats: {project.featuring.join(', ')}
            </p>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Datas</h2>
          <p className="text-gray-600">
            Criado em: {new Date(project.createdAt).toLocaleDateString()}
          </p>
          <p className="text-gray-600">
            Última atualização: {new Date(project.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Letra</h2>
      <div className="space-y-4">
        {project.strophes.map((strophe, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">
              Estrofe {index + 1} ({strophe.architecture})
            </h3>
            {strophe.verses.map((verse, vIndex) => (
              <p key={vIndex} className="uppercase">
                {verse.words.map(word => word.text).join(' ')}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
} 