"use client";

import { IncidentResponse } from "../lib/api";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, Toolbox, ShieldCheck, Wrench, HelpCircle, ChevronRight } from "lucide-react";

interface AnalysisResultProps {
  result: IncidentResponse;
}

const SEVERITY_COLOR: Record<string, string> = {
  Low: "badge-low",
  Medium: "badge-medium",
  High: "badge-high",
  Critical: "badge-critical",
};

const SEVERITY_BG: Record<string, string> = {
  Low:      "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
  Medium:   "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
  High:     "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
  Critical: "linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)",
};

const SEVERITY_BORDER: Record<string, string> = {
  Low:      "1px solid #86efac",
  Medium:   "1px solid #fde68a",
  High:     "1px solid #fdba74",
  Critical: "1px solid #fca5a5",
};

function ResultSection({
  title,
  icon,
  children,
  delay = 0,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay }}
      className="result-section"
    >
      <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".5rem" }}>
        <span style={{ color: "var(--brand-600)", display: "flex" }}>{icon}</span>
        <span className="result-section-title">{title}</span>
      </div>
      {children}
    </motion.div>
  );
}

function ListItems({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {items.map((item, i) => (
        <li key={i} className="result-list-item">{item}</li>
      ))}
    </ul>
  );
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  const sev = result.severity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingTop: ".5rem" }}
    >
      {/* Severity Banner */}
      <div
        style={{
          background: SEVERITY_BG[sev] ?? SEVERITY_BG.Medium,
          border: SEVERITY_BORDER[sev] ?? SEVERITY_BORDER.Medium,
          borderRadius: 12,
          padding: "1.1rem 1.4rem",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: ".75rem",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".4rem" }}>
            <span className={`badge ${SEVERITY_COLOR[sev]}`}>
              <AlertTriangle size={11} />
              Severity: {sev}
            </span>
            <span
              style={{
                fontSize: ".72rem",
                fontWeight: 600,
                background: "rgba(255,255,255,.8)",
                border: "1px solid rgba(0,0,0,.08)",
                borderRadius: 100,
                padding: ".2rem .65rem",
                color: "var(--neutral-600)",
              }}
            >
              Confidence: {result.confidence}
            </span>
          </div>
          <p style={{ fontSize: ".875rem", color: "var(--neutral-700)", lineHeight: 1.6 }}>
            {result.incident_summary}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".4rem", fontSize: ".78rem", color: "var(--neutral-500)", fontWeight: 500, flexShrink: 0 }}>
          <Clock size={13} />
          Downtime: <strong style={{ color: "var(--neutral-700)" }}>{result.estimated_downtime}</strong>
        </div>
      </div>

      {/* Grid Sections */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Left Column */}
        <div>
          <ResultSection title="Root Cause" icon={<HelpCircle size={14} />} delay={0.05}>
            <p style={{ fontSize: ".875rem", color: "var(--neutral-700)", lineHeight: 1.6 }}>
              {result.possible_root_cause}
            </p>
          </ResultSection>

          <ResultSection title="Immediate Actions" icon={<AlertTriangle size={14} />} delay={0.1}>
            <ListItems items={result.immediate_actions} />
          </ResultSection>

          <ResultSection title="Safety Precautions" icon={<ShieldCheck size={14} />} delay={0.15}>
            <ListItems items={result.safety_precautions} />
          </ResultSection>
        </div>

        {/* Right Column */}
        <div>
          <ResultSection title="Recommended Maintenance" icon={<Wrench size={14} />} delay={0.2}>
            <ListItems items={result.recommended_maintenance} />
          </ResultSection>

          <ResultSection title="Required Tools" icon={<Toolbox size={14} />} delay={0.25}>
            <ListItems items={result.required_tools} />
          </ResultSection>

          <ResultSection title="Additional Data Needed" icon={<ChevronRight size={14} />} delay={0.3}>
            <ListItems items={result.additional_data_needed} />
          </ResultSection>
        </div>
      </div>
    </motion.div>
  );
}
