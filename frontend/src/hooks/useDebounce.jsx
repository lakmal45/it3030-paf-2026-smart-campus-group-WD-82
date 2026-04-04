import { useState, useEffect } from 'react';

/**
 * A custom hook to debounce a fast-changing value.
 * Perfect for search input fields.
 * 
 * @param value The value to debounce
 * @param delay Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
