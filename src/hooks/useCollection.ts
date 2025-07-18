import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function useCollection<T = any>(collectionName: string) {
  const [documents, setDocuments] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const colRef = collection(db, collectionName);
        const snapshot = await getDocs(colRef);
        const docs = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as T)
        );
        setDocuments(docs);
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchData();
  }, [collectionName]);

  return { documents, loading, error };
}
export default useCollection;
