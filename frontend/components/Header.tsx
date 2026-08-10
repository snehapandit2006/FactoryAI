"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Wifi, WifiOff, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { checkBackendHealth } from "../lib/api";

interface HeaderProps {
  activeTab: "analyzer" | "chat";
  onTabChange: (tab: "analyzer" | "chat") => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    checkBackendHealth().then((h) => setBackendOnline(h !== null && h.status === "online"));
  }, []);

  return (
    <header
      style={{
        background: "#ffffff",
        borderBottom: "1px solid var(--neutral-200)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 8px rgba(0,0,0,.06)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 1.5rem",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {/* Logo + Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flexShrink: 0 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, var(--brand-600) 0%, var(--brand-800) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.02rem", color: "var(--neutral-900)", letterSpacing: "-.01em" }}>
              FactoryAI
            </div>
            <div style={{ fontSize: ".7rem", color: "var(--neutral-400)", fontWeight: 500, letterSpacing: ".05em", textTransform: "uppercase" }}>
              Copilot
            </div>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav style={{ display: "flex", alignItems: "center", gap: ".25rem", background: "var(--neutral-100)", borderRadius: 11, padding: ".25rem" }}>
          <button
            className={`nav-tab ${activeTab === "analyzer" ? "active" : ""}`}
            onClick={() => onTabChange("analyzer")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Incident Analyzer
          </button>
          <button
            className={`nav-tab ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => onTabChange("chat")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Maintenance Chat
          </button>
        </nav>

        {/* Backend Status */}
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexShrink: 0 }}>
          <AnimatePresence mode="wait">
            {backendOnline === null ? (
              <motion.span
                key="checking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ fontSize: ".75rem", color: "var(--neutral-400)" }}
              >
                Checking API…
              </motion.span>
            ) : backendOnline ? (
              <motion.div
                key="online"
                initial={{ opacity: 0, scale: .9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: "flex", alignItems: "center", gap: ".4rem", fontSize: ".76rem", color: "#16a34a", fontWeight: 600 }}
              >
                <span className="status-dot" />
                API Online
              </motion.div>
            ) : (
              <motion.div
                key="offline"
                initial={{ opacity: 0, scale: .9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: "flex", alignItems: "center", gap: ".4rem", fontSize: ".76rem", color: "var(--severity-critical)", fontWeight: 600 }}
              >
                <span className="status-dot offline" />
                API Offline
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
