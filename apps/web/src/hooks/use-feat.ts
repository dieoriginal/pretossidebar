import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { FeatRequest } from "@/types/public";

export function useFeat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFeatRequest = async (data: {
    serviceType: "featuring" | "production" | "audiovisual";
    details: string;
    amount: number;
    currency?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createFeatRequest(data);
      return response;
    } catch (err: any) {
      setError(err.message || "Erro ao criar pedido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getFeatRequest = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getFeatRequest(id);
      return response.feat;
    } catch (err: any) {
      setError(err.message || "Erro ao buscar pedido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const payFeatRequest = async (id: string, paymentMethod?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.payFeatRequest(id, paymentMethod);
      return response;
    } catch (err: any) {
      setError(err.message || "Erro ao processar pagamento");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createFeatRequest,
    getFeatRequest,
    payFeatRequest,
    loading,
    error,
  };
}



