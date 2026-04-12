"use client";

import { useEffect, useState } from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/solid';
const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      title='Scroll to top'
      onClick={scrollToTop}
      className={`fixed bottom-20 right-4 sm:right-8 p-3 rounded-full bg-primary-blue text-white shadow-lg hover:bg-blue-900 hover:scale-105 hover:shadow-xl active:scale-95 z-30 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Back to top"
    >
      <ArrowUpIcon className="w-8 h-8" />
    </button>
  );
};

export default BackToTopButton;