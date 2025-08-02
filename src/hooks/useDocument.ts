import { useState, useEffect } from "react";
import { supabase } from "../supabase";

function useDocument<T = any>(collectionName: string, docId: string) {
  const [document, setDocument] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from(collectionName)
          .select('*')
          .eq('id', docId)
          .single();
        
        if (error) throw error;
        setDocument(data);
      } catch (err: any) {
        setError(err.message);
        setDocument(null);
      }
      setLoading(false);
    };
    fetchData();
  }, [collectionName, docId]);

  return { document, loading, error };
}
export default useDocument;
