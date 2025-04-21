'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  artist: string;
  producer: string;
  featuring: string[];
  createdAt: string;
}

export default function Projetos() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(collection(db, "users", user.uid, "projects"));
        const querySnapshot = await getDocs(q);
        
        const projectsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];

        setProjects(projectsData);
      } catch (error) {
        console.error("Erro ao carregar projetos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <div>Carregando projetos...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Meus Projetos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <Link 
            key={project.id} 
            href={`/projetos/${project.id}`}
            className="border p-6 rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
            <p className="text-gray-600 mb-1">Artista: {project.artist}</p>
            <p className="text-gray-600 mb-1">Produtor: {project.producer}</p>
            {project.featuring.length > 0 && (
              <p className="text-gray-600">
                Feats: {project.featuring.join(', ')}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Criado em: {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
} 