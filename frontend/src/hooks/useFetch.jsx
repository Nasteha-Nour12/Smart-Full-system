// src/hooks/useFetch.js
import { useEffect, useState } from "react";

const useFetch = (fetcher) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetcher();
        if (mounted) setData(res);
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || "Error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, [fetcher]);

  return { data, loading, error };
};

export default useFetch;
