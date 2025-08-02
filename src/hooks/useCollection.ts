import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

function useCollection<T = any>(collectionName: string) {
  const [documents, setDocuments] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data function (stable with useCallback for refresh)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(collectionName)
        .select('*');
      
      if (error) throw error;
      setDocuments(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setDocuments([]);
    }
    setLoading(false);
  }, [collectionName]);

  // Initial fetch and whenever collectionName changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Expose refresh method to manually re-fetch
  return { documents, loading, error, refresh: fetchData };
}

export default useCollection;
