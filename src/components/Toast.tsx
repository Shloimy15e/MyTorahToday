import { useState, useEffect } from "react";

export default function Toast({
  message,
  type = "info",
  duration = 3000,
  position,
}: {
  message: string;
  type: "info" | "error" | "success" | "warning";
  duration?: number;
  position: number;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed z-50 start-1/2 mx-auto p-4 rounded-lg -translate-x-1/2 shadow-xl text-gray-700 font-semibold text-lg transition-transform transform bg-white border border-gray-200 w-72
      "
      style={{ top: `${24 + position * 100}px` }}
    >
      <div className="flex items-center">
        <div className="mr-5">
          {type === "error" && (
            <svg
              className="w-6 h-6 bg-red-500 rounded-full p-1"
              fill="none"
              stroke="white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          )}
          {type === "success" && (
            <svg
              className="w-6 h-6 bg-green-500 rounded-full p-1"
              fill="none"
              stroke="white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          )}
          {type === "info" && (
            <span className="w-6 h-6 bg-blue-500 rounded-full p-1 text-white flex items-center justify-center font-semibold">
              i
            </span>
          )}
          {type === "warning" && (
            <span className="w-6 h-6 bg-yellow-500 rounded-full p-1 text-white flex items-center justify-center">
              !
            </span>
          )}
        </div>
        <div>
          {message}
        </div>
      </div>
    </div>
  );
}
