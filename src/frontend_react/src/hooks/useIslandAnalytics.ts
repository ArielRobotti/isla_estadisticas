/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';

export const useIslandAnalytics = () => {
  const [data, setData] = useState<any>(null); // Métricas
  const [islandMetadata, setIslandMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (islandCode: string, mode: string, fromStr: string, toStr: string) => {
  if (!islandCode) return;
  setLoading(true);
  setError(null);

  try {
    const base = 'https://api.fortnite.com/ecosystem/v1';
    
    // Definimos las dos URLs
    const metricsUrl = `${base}/islands/${islandCode}/metrics/${mode}?from=${encodeURIComponent(fromStr)}&to=${encodeURIComponent(toStr)}`;
    const metadataUrl = `${base}/islands/${islandCode}`;

    // Ejecutamos ambas peticiones en paralelo
    const [resMetrics, resMetadata] = await Promise.all([
      fetch(metricsUrl),
      fetch(metadataUrl)
    ]);

    // Validamos que ambas hayan sido exitosas
    if (!resMetrics.ok || !resMetadata.ok) {
      const errorSource = !resMetrics.ok ? 'Métricas' : 'Metadata';
      const status = !resMetrics.ok ? resMetrics.status : resMetadata.status;
      throw new Error(`Error en ${errorSource} (HTTP ${status})`);
    }

    // Parseamos los JSON también en paralelo
    const [jsonMetrics, jsonMetadata] = await Promise.all([
      resMetrics.json(),
      resMetadata.json()
    ]);

    // Actualizamos los estados
    setData(jsonMetrics);
    setIslandMetadata(jsonMetadata);

  } catch (err: any) {
    console.error("Error fetching data", err);
    setError(err.message || "Error al cargar los datos");
    setData(null);
    setIslandMetadata(null);
  } finally {
    setLoading(false);
  }
};

  return { data, islandMetadata, loading, error, fetchAnalytics };
};