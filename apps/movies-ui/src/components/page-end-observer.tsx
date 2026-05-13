import React, { RefObject, useEffect, useRef } from "react";

interface PageEndObserverProps {
  onIntersect: () => void;
  rootRef?: RefObject<Element | null>;
}

const PageEndObserver: React.FC<PageEndObserverProps> = ({ onIntersect, rootRef }) => {
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersect();
        }
      },
      {
        root: rootRef?.current ?? null,
        threshold: 1.0,
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [onIntersect, rootRef]);

  return <div ref={observerRef} style={{ height: "10px" }} />;
};

export default PageEndObserver;
