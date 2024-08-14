import { useState, useEffect } from 'react';

export default function Toast({ message, type = 'info', duration = 3000 }: { message: string; type?: 'info' | 'error'; duration?: number }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed z-50 top-6 right-6 p-6 rounded-lg text-white text-lg ${type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
      {message}
    </div>
  );
}
