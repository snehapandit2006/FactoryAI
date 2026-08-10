"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IncidentRequest, IncidentResponse, analyzeIncident } from "@/lib/api";
import AnalysisResult from "./AnalysisResult";
import { AlertCircle, Cpu, Thermometer, Activity, FileText, Zap } from "lucide-react";

const MAX_DESC_LENGTH = 1000;

const CHAR_COUNTER_CLASS = (len: number, max: number): string => {
  const pct = len / max;
  if (pct >= 1)  return "char-counter danger";
  if (pct >= 0.85) return "char-counter warning";
  return "char-counter";
};

export default function IncidentAnalyzer() {
  const [form, setForm] = useState<IncidentRequest>({
    machine_id: "",
    temperature: 0,
    vibration: 0,
    description: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof IncidentRequest, string>>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IncidentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  function validate(): boolean {
    const errs: Partial<Record<keyof IncidentRequest, string>> = {};
    if (!form.machine_id.trim() || form.machine_id.trim().length < 2) {
      errs.machine_id = "Machine ID must be at least 2 characters.";
    }
    if (form.temperature < -50 || form.temperature > 500) {
      errs.temperature = "Temperature must be between -50 and 500 °C.";
    }
    if (form.vibration < 0 || form.vibration > 200) {
      errs.vibration = "Vibration must be between 0 and 200 mm/s.";
    }
    if (!form.description.trim() || form.description.trim().length < 5) {
      errs.description = "Incident description must be at least 5 characters.";
    }
    if (form.description.length > MAX_DESC_LENGTH) {
      errs.description = `Description must not exceed ${MAX_DESC_LENGTH} characters.`;
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeIncident(form);
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Form Card */}
      <div className="card" style={{ padding: "2rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--neutral-900)", display: "flex", alignItems: "center", gap: ".5rem" }}>
            <span style={{ color: "var(--brand-600)", display: "flex" }}><Zap size={18} /></span>
            Incident Analyzer
          </h2>
          <p style={{ fontSize: ".83rem", color: "var(--neutral-500)", marginTop: ".3rem" }}>
            Enter machine parameters and incident details for AI-powered root cause analysis.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Row 1 — Machine ID */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label className="form-label">
              <Cpu size={12} />
              Machine ID
            </label>
            <input
              id="machine_id"
              type="text"
              className={`input-field ${fieldErrors.machine_id ? "error" : ""}`}
              placeholder="e.g. CNC-MILL-04"
              maxLength={50}
              value={form.machine_id}
              onChange={(e) => setForm({ ...form, machine_id: e.target.value })}
            />
            {fieldErrors.machine_id && (
              <div style={{ fontSize: ".76rem", color: "var(--severity-critical)", marginTop: ".3rem" }}>
                {fieldErrors.machine_id}
              </div>
            )}
          </div>

          {/* Row 2 — Temperature & Vibration */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
            {/* Temperature */}
            <div>
              <label className="form-label">
                <Thermometer size={12} />
                Temperature (°C)
              </label>
              <input
                id="temperature"
                type="number"
                step="0.1"
                className={`input-field ${fieldErrors.temperature ? "error" : ""}`}
                placeholder="e.g. 88.5"
                value={form.temperature || ""}
                onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) || 0 })}
              />
              {fieldErrors.temperature && (
                <div style={{ fontSize: ".76rem", color: "var(--severity-critical)", marginTop: ".3rem" }}>
                  {fieldErrors.temperature}
                </div>
              )}
            </div>

            {/* Vibration */}
            <div>
              <label className="form-label">
                <Activity size={12} />
                Vibration (mm/s)
              </label>
              <input
                id="vibration"
                type="number"
                step="0.01"
                className={`input-field ${fieldErrors.vibration ? "error" : ""}`}
                placeholder="e.g. 14.2"
                value={form.vibration || ""}
                onChange={(e) => setForm({ ...form, vibration: parseFloat(e.target.value) || 0 })}
              />
              {fieldErrors.vibration && (
                <div style={{ fontSize: ".76rem", color: "var(--severity-critical)", marginTop: ".3rem" }}>
                  {fieldErrors.vibration}
                </div>
              )}
            </div>
          </div>

          {/* Row 3 — Description */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label className="form-label">
              <FileText size={12} />
              Incident Description
            </label>
            <textarea
              id="description"
              className={`input-field ${fieldErrors.description ? "error" : ""}`}
              placeholder="Describe the observed symptoms, anomalies, or failure events in detail…"
              maxLength={MAX_DESC_LENGTH}
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: ".3rem" }}>
              <span style={{ fontSize: ".76rem", color: "var(--severity-critical)" }}>
                {fieldErrors.description}
              </span>
              <span className={CHAR_COUNTER_CLASS(form.description.length, MAX_DESC_LENGTH)}>
                {form.description.length}/{MAX_DESC_LENGTH}
              </span>
            </div>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="error-banner"
                style={{ marginBottom: "1.25rem" }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", padding: ".85rem" }}>
            {loading ? (
              <>
                <span className="spinner" />
                Analyzing Incident…
              </>
            ) : (
              <>
                <Zap size={15} />
                Analyze Incident
              </>
            )}
          </button>
        </form>
      </div>

      {/* Loading Skeleton */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="card"
            style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div className="skeleton" style={{ height: 18, width: "45%", borderRadius: 6 }} />
            <div className="skeleton" style={{ height: 14, width: "80%", borderRadius: 6 }} />
            <div className="skeleton" style={{ height: 14, width: "65%", borderRadius: 6 }} />
            <div className="section-divider" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
                  <div className="skeleton" style={{ height: 12, width: "35%", borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 11, width: "90%", borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 11, width: "75%", borderRadius: 4 }} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && !loading && (
          <div ref={resultRef} className="card" style={{ padding: "2rem" }}>
            <div style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: ".5rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--neutral-900)" }}>
                Analysis Report
              </h3>
              <span style={{ fontSize: ".7rem", fontWeight: 600, background: "var(--brand-50)", color: "var(--brand-700)", border: "1px solid var(--brand-200)", padding: ".15rem .6rem", borderRadius: 100 }}>
                {form.machine_id}
              </span>
            </div>
            <AnalysisResult result={result} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
