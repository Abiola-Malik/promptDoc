import { useState, useEffect, useRef, useCallback } from "react";
import { Client } from "appwrite";
import { appwriteConfig } from "@/db/appwrite/config";

export interface Project {
  $collectionId: string;
  $databaseId: string;
  $permissions: string[];
  $sequence: number;
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  status: "processing" | "ready" | "error";
  processingProgress?: number;
  fileCount: number;
  chunksCount?: number;
  framework?: string;
  projectSummary?: string;
  contentHash: string;
  userId: string;
  namespace: string;
  [key: string]: any;
}

const client = new Client()
  .setEndpoint(appwriteConfig.EndpointUrl)
  .setProject(appwriteConfig.ProjectId);

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const initialFetchCompleteRef = useRef(false);

  // Wrap fetchProject in useCallback to stabilize its reference
  const fetchProject = useCallback(async () => {
    if (!projectId) {
      setError("Invalid project ID");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load project");
      }

      const { project: data } = await res.json();
      if (!mountedRef.current) return;

      setProject(data);
      setError(null);
      initialFetchCompleteRef.current = true;
    } catch (err: any) {
      if (!mountedRef.current) return;
      console.error("Failed to fetch project:", err);
      setError(err.message || "Failed to load project");
      initialFetchCompleteRef.current = true;
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    mountedRef.current = true;
    initialFetchCompleteRef.current = false;
    setIsLoading(true);
    setError(null);
    setProject(null);

    fetchProject();

    // Realtime subscription - set up immediately but handle updates carefully
    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.DatabaseId}.collections.projects.documents.${projectId}`,
      (response) => {
        if (!mountedRef.current) return;
        const payload = response.payload as any;

        if (payload.$id === projectId) {
          setProject(payload);

          // Only set loading to false if initial fetch is complete
          if (initialFetchCompleteRef.current) {
            setIsLoading(false);
          }
        }
      }
    );

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [projectId, fetchProject]);

  return {
    project,
    isLoading,
    error,
    refresh: fetchProject,
  };
}
