import { useCallback, useState } from "react";
import { api } from "../api.js";

export function useRequest() {
  const [error, setError] = useState("");

  const run = useCallback(async (method, path, body) => {
    setError("");
    try {
      const result = await api(method, path, body);
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
      return null;
    }
  }, []);

  return { error, setError, run };
}
