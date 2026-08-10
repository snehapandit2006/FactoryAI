"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "../components/Header";
import IncidentAnalyzer from "../components/IncidentAnalyzer";
import MaintenanceChat from "../components/MaintenanceChat";

type Tab = "analyzer" | "chat";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("analyzer");

  return (
    <>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Hero Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--brand-900) 0%, var(--brand-700) 60%, var(--brand-500) 100%)",
          padding: "2.5rem 1.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Background Pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,.04) 0%, transparent 60%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,.06) 0%, transparent 50%)`,
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: ".5rem",
                  background: "rgba(255,255,255,.12)",
                  border: "1px solid rgba(255,255,255,.2)",
                  borderRadius: 100,
                  padding: ".3rem .9rem",
                  fontSize: ".72rem",
                  fontWeight: 600,
                  color: "rgba(255,255,255,.9)",
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  marginBottom: ".75rem",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#4ade80",
                    boxShadow: "0 0 0 2px rgba(74,222,128,.3)",
                  }}
                />
                Gemini 2.5 Flash · Live
              </div>

              <h1
                style={{
                  fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)",
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.2,
                  letterSpacing: "-.02em",
                  marginBottom: ".5rem",
                }}
              >
                FactoryAI Copilot
              </h1>
              <p style={{ fontSize: ".92rem", color: "rgba(255,255,255,.7)", maxWidth: 480, lineHeight: 1.6 }}>
                AI-powered manufacturing incident analysis &amp; predictive maintenance assistant.
                Root cause analysis, severity scoring, and safety guidance — instantly.
              </p>
            </div>

            {/* Quick Stats */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {[
                { label: "Security Layers", value: "4" },
                { label: "Avg Analysis Time", value: "< 5s" },
                { label: "Input Guardrails", value: "Active" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: "rgba(255,255,255,.1)",
                    border: "1px solid rgba(255,255,255,.15)",
                    borderRadius: 12,
                    padding: ".9rem 1.25rem",
                    textAlign: "center",
                    minWidth: 100,
                  }}
                >
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: ".68rem", color: "rgba(255,255,255,.6)", marginTop: ".35rem", fontWeight: 500, letterSpacing: ".04em" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, background: "var(--neutral-50)", padding: "2rem 1.5rem 3rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <AnimatePresence mode="wait">
            {activeTab === "analyzer" ? (
              <motion.div
                key="analyzer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <IncidentAnalyzer />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <MaintenanceChat />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          background: "#fff",
          borderTop: "1px solid var(--neutral-200)",
          padding: "1.1rem 1.5rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: ".5rem",
          }}
        >
          <span style={{ fontSize: ".76rem", color: "var(--neutral-400)" }}>
            FactoryAI Copilot — Production Demo
          </span>
          <span style={{ fontSize: ".76rem", color: "var(--neutral-400)", display: "flex", alignItems: "center", gap: ".6rem" }}>
            <span style={{ background: "var(--neutral-100)", padding: ".2rem .55rem", borderRadius: 6, fontWeight: 500, color: "var(--neutral-500)" }}>
              FastAPI
            </span>
            <span style={{ background: "var(--neutral-100)", padding: ".2rem .55rem", borderRadius: 6, fontWeight: 500, color: "var(--neutral-500)" }}>
              Next.js 15
            </span>
            <span style={{ background: "var(--neutral-100)", padding: ".2rem .55rem", borderRadius: 6, fontWeight: 500, color: "var(--neutral-500)" }}>
              Gemini 2.5 Flash
            </span>
          </span>
        </div>
      </footer>
    </>
  );
}
