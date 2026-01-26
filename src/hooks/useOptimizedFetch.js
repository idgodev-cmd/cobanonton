"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for optimized data fetching with caching and debouncing
 */
export function useOptimizedFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());

  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes
    retryCount = 3,
    retryDelay = 1000,
    enabled = true,
  } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Check cache first
    const cached = cacheRef.current.get(url);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    let attempts = 0;
    
    while (attempts < retryCount) {
      try {
        const response = await fetch(url, {
          ...options.fetchOptions,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Cache the result
        cacheRef.current.set(url, {
          data: result,
          timestamp: Date.now(),
        });

        setData(result);
        setLoading(false);
        return;
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }

        attempts++;
        if (attempts >= retryCount) {
          setError(err.message);
          setLoading(false);
          return;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
      }
    }
  }, [url, enabled, cacheTime, retryCount, retryDelay, options.fetchOptions]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    cacheRef.current.delete(url);
    fetchData();
  }, [url, fetchData]);

  return { data, loading, error, refetch };
}

/**
 * Custom hook for infinite scroll with optimized loading
 */
export function useInfiniteScroll(callback, options = {}) {
  const {
    threshold = 0.8,
    enabled = true,
  } = options;

  const observerRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      { threshold }
    );

    observerRef.current = observer;

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [callback, threshold, enabled]);

  return targetRef;
}
