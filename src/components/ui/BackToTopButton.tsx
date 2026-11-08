"use client";

import { useEffect, useRef, useState } from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/solid';
const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const returningToTop = useRef(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY === 0) returningToTop.current = false;
      // Disabling the focused button mid-animation interrupts Chrome's smooth scroll.
      setIsVisible(window.scrollY > 300 || returningToTop.current);
    };

    toggleVisibility();
    window.addEventListener('scroll', toggleVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    returningToTop.current = true;
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  return (
    <button
      type="button"
      title='Scroll to top'
      onClick={scrollToTop}
      disabled={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      aria-hidden={!isVisible}
      className={`fixed bottom-6 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-primary-blue text-white shadow-md transition-[opacity,transform,background-color,box-shadow] duration-300 hover:-translate-y-1 hover:bg-blue-950 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-blue motion-reduce:transform-none sm:right-8 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Back to top"
    >
      <ArrowUpIcon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
};

export default BackToTopButton;
