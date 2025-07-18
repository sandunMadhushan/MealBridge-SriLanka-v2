import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

function useDocument<T = any>(collectionName: string, docId: string) {
  const [document, setDocument] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        setDocument(docSnap.exists() ? (docSnap.data() as T) : null);
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchData();
  }, [collectionName, docId]);

  return { document, loading, error };
}
export default useDocument;
