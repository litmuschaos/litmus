import { MutableRefObject, useState, useRef, useEffect } from 'react';

export const useIntersectionObserver = (
  ref: MutableRefObject<Element | null> | null,
  options: IntersectionObserverInit = {},
  compareFn?: (data: IntersectionObserverEntry) => boolean
): boolean => {
  const [element, setElement] = useState<Element | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observer = useRef<null | IntersectionObserver>(null);

  const cleanOb = (): void => {
    if (observer.current) {
      observer.current.disconnect();
    }
  };
  useEffect(() => {
    ref?.current && setElement(ref.current);
  }, [ref]);

  useEffect(() => {
    if (!element) {
      return;
    }
    cleanOb();
    observer.current = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = typeof compareFn === 'function' ? compareFn(entry) : entry.isIntersecting;

        setIsIntersecting(isElementIntersecting);
      },
      { ...options }
    );
    const ob = observer.current;
    ob.observe(element);
    return () => {
      cleanOb();
    };
  }, [element, options]);

  return isIntersecting;
};
