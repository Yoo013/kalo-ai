import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertTriangle } from "lucide-react";

export default function FloatingAssistant({ latestSuggestion, latestObjection }) {
  const display = latestObjection || latestSuggestion;

  if (!display) return null;

  const isObjection = !!latestObjection;

  return (
    <AnimatePresence>
      <motion.div
        key={display.timestamp}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-8 z-50 max-w-md w-[90vw] lg:w-96 ${
          isObjection
            ? "bg-amber-50 border-amber-300 dark:bg-amber-950 dark:border-amber-700"
            : "bg-card border-primary/20"
        } border rounded-2xl shadow-2xl p-4`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            isObjection ? "bg-amber-100 dark:bg-amber-900" : "bg-primary/10"
          }`}>
            {isObjection ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            ) : (
              <Zap className="w-4 h-4 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              {isObjection ? `Objection Detected: ${latestObjection.category}` : "AI Suggestion"}
            </p>
            <p className="text-sm leading-relaxed">
              {isObjection ? latestObjection.suggested_response : latestSuggestion?.text}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}