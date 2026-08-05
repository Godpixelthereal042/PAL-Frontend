"use client";

import React, { createContext, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface Toast {
    id: string;
    message: string;
    type?: "success" | "error" | "info";
}

interface ToastContextType {
    showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType>({
    showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
        const id = String(Date.now());
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="pointer-events-auto p-4 rounded-2xl bg-[#121620]/95 backdrop-blur-xl border border-white/15 shadow-2xl text-white flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-200"
                    >
                        <div className="flex items-center gap-3">
                            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />}
                            {toast.type === "error" && <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0" />}
                            {toast.type === "info" && <Info className="w-5 h-5 text-[#2D7FE0] shrink-0" />}
                            <span className="text-xs font-semibold text-white">{toast.message}</span>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-[#999CA5] hover:text-white p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
