"use client";

import { useState, useEffect } from "react";

export function useSessionStorageDate(key: string, calculateDefault: () => string) {
  const [value, setValue] = useState<string>(calculateDefault);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const cached = sessionStorage.getItem(key);
    if (cached) {
      setValue(cached);
    }
  }, [key]);

  useEffect(() => {
    if (isMounted) {
      sessionStorage.setItem(key, value);
    }
  }, [key, value, isMounted]);

  return [value, setValue] as const;
}
