import React, { useEffect, useRef } from "react";

interface PageEndObserverProps {
  onIntersect: () => void;
}

const PageEndObserver: React.FC<PageEndObserverProps> = ({ onIntersect }) => {
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersect();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [onIntersect]);

  return <div ref={observerRef} style={{ height: "10px" }} />;
};

export default PageEndObserver;
