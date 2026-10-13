import { useEffect, useState, useCallback } from "react";
export function usePublicResource(loader) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState({
    loader,
    version,
    data: null,
    loading: true,
    error: null,
  });
  const retry = useCallback(() => setVersion((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setState({ loader, version, data: null, loading: true, error: null });
    loader(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted)
          setState({ loader, version, data, loading: false, error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ loader, version, data: null, loading: false, error });
      });
    return () => controller.abort();
  }, [loader, version]);
  return state.loader === loader && state.version === version
    ? { data: state.data, loading: state.loading, error: state.error, retry }
    : { data: null, loading: true, error: null, retry };
}
