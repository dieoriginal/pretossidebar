import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { PublicProject } from "@/types/public";

export function usePublicProjects() {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const response = await apiClient.getPublicProjects();
        setProjects(response.projects);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar projetos");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  return { projects, loading, error, refetch: () => {
    setLoading(true);
    apiClient.getPublicProjects()
      .then((response) => {
        setProjects(response.projects);
        setError(null);
      })
      .catch((err: any) => {
        setError(err.message || "Erro ao carregar projetos");
      })
      .finally(() => setLoading(false));
  } };
}

export function usePublicProject(id: string | null) {
  const [project, setProject] = useState<PublicProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchProject() {
      try {
        setLoading(true);
        const response = await apiClient.getPublicProject(id);
        setProject(response.project);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar projeto");
        setProject(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [id]);

  return { project, loading, error };
}



