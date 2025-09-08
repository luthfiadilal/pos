import { useRef, useCallback, useEffect } from "react";

/**
 * @param {function} callback - Fungsi yang akan dipanggil berulang kali.
 * @param {number} ms - Interval pengulangan dalam milidetik (default: 100ms).
 * @param {number} initialDelay - Jeda awal sebelum pengulangan dimulai (default: 400ms).
 */
export const usePressAndHold = (callback, ms = 100, initialDelay = 400) => {
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const elementRef = useRef(null);

  const stopHolding = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const startHolding = useCallback(() => {
    callback();
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(callback, ms);
    }, initialDelay);
  }, [callback, ms, initialDelay]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleStart = (event) => {
      if (event.cancelable) {
        event.preventDefault();
      }
      startHolding();
    };

    element.addEventListener("mousedown", handleStart);
    element.addEventListener("touchstart", handleStart, { passive: false });

    element.addEventListener("mouseup", stopHolding);
    element.addEventListener("mouseleave", stopHolding);
    element.addEventListener("touchend", stopHolding);

    return () => {
      element.removeEventListener("mousedown", handleStart);
      element.removeEventListener("touchstart", handleStart);
      element.removeEventListener("mouseup", stopHolding);
      element.removeEventListener("mouseleave", stopHolding);
      element.removeEventListener("touchend", stopHolding);
    };
  }, [startHolding, stopHolding]);

  return elementRef;
};
