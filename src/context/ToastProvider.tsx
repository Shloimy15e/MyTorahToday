"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import Toast from "@/components/Toast";

type ToastType = "info" | "error" | "success" | "warning";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
  position: number;
};

type ToastContextType = {
  showToast: (message: string, type: ToastType, duration?: number) => void;
};

type ToastState = {
  toasts: Toast[];
};

type ToastAction =
  | { type: "ADD_TOAST"; payload: Toast }
  | { type: "REMOVE_TOAST"; payload: number };

const ToastContext = createContext<ToastContextType | null>(null);

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, action.payload] };
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.payload),
      };
    default:
      return state;
  }
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const showToast = (message: string, type: ToastType, duration = 3000) => {
    const id = Date.now();
    const position = state.toasts.length;
    dispatch({ type: "ADD_TOAST", payload: { id, message, type, duration, position } });
    setTimeout(() => dispatch({ type: "REMOVE_TOAST", payload: id }), duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {state.toasts.map((toast, index) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} position={index} />
      ))}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
