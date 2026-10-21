import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
export const UploadContext = createContext({
  pending: 0,
  start: () => () => {},
});
export const useUploads = () => useContext(UploadContext);
export function useUploadState() {
  const tickets = useRef(new Set());
  const [pending, setPending] = useState(0);
  const start = useCallback(() => {
    const ticket = Symbol();
    tickets.current.add(ticket);
    setPending(tickets.current.size);
    return () => {
      if (tickets.current.delete(ticket)) setPending(tickets.current.size);
    };
  }, []);
  return useMemo(() => ({ pending, start }), [pending, start]);
}
