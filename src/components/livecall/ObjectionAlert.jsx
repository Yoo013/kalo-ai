import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ObjectionAlert({ objection }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timer);
  }, [objection?.timestamp]);

  if (!visible || !objection) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="fixed top-4 right-4 z-50 bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 rounded-xl shadow-lg p-4 max-w-sm"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {objection.category?.replace("_", " ")} Objection
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">&ldquo;{objection.text}&rdquo;</p>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setVisible(false)}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}