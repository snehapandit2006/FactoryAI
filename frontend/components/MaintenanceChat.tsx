"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatResponse, sendChatMessage } from "../lib/api";
import { MessageSquare, Send, AlertCircle, Info } from "lucide-react";

const MAX_MSG_LENGTH = 500;

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  is_refusal?: boolean;
  source?: string;
  timestamp: string;
}

const STARTER_QUESTIONS = [
  "What causes bearing failure in CNC machines?",
  "How do I interpret vibration FFT data?",
  "What is LOTO procedure in factory safety?",
  "Explain predictive maintenance vs preventive maintenance.",
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MaintenanceChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    const trimmed = inputValue.trim();
    if (!trimmed || loading) return;
    if (trimmed.length > MAX_MSG_LENGTH) {
      setError(`Message exceeds ${MAX_MSG_LENGTH} characters.`);
      return;
    }
    setError(null);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const res: ChatResponse = await sendChatMessage({ message: trimmed });
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "ai",
        content: res.response,
        is_refusal: res.is_refusal,
        source: res.source,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Connection error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleStarterClick(q: string) {
    setInputValue(q);
    inputRef.current?.focus();
  }

  const charPct = inputValue.length / MAX_MSG_LENGTH;
  const counterClass = charPct >= 1 ? "char-counter danger" : charPct >= 0.85 ? "char-counter warning" : "char-counter";

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)", minHeight: 520, overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          padding: "1.25rem 1.75rem",
          borderBottom: "1px solid var(--neutral-200)",
          display: "flex",
          alignItems: "center",
          gap: ".75rem",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, var(--brand-500) 0%, var(--brand-700) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <MessageSquare size={16} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: ".95rem", color: "var(--neutral-900)" }}>
            Maintenance Copilot
          </div>
          <div style={{ fontSize: ".73rem", color: "var(--neutral-400)" }}>
            Manufacturing engineering assistant · Powered by Gemini 3.6 Flash
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: ".35rem" }}>
          <span className="status-dot" />
          <span style={{ fontSize: ".73rem", color: "var(--neutral-500)" }}>
            {loading ? "Thinking…" : "Ready"}
          </span>
        </div>
      </div>

      {/* Messages Pane */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: ".85rem",
        }}
      >
        {/* Empty State */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: "center",
              padding: "2.5rem 1rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: "linear-gradient(135deg, var(--brand-50) 0%, var(--brand-100) 100%)",
                border: "1px solid var(--brand-200)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageSquare size={26} color="var(--brand-600)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--neutral-800)", marginBottom: ".4rem" }}>
                Ask the Maintenance Copilot
              </div>
              <div style={{ fontSize: ".83rem", color: "var(--neutral-400)", maxWidth: 320, lineHeight: 1.6 }}>
                Specialized in manufacturing, industrial maintenance, predictive diagnostics, and factory safety.
              </div>
            </div>

            {/* Starter Questions */}
            <div style={{ display: "flex", flexDirection: "column", gap: ".5rem", width: "100%", maxWidth: 460 }}>
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleStarterClick(q)}
                  style={{
                    background: "#fff",
                    border: "1px solid var(--neutral-200)",
                    borderRadius: 9,
                    padding: ".65rem 1rem",
                    fontSize: ".82rem",
                    color: "var(--neutral-700)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all .2s ease",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--brand-300)";
                    e.currentTarget.style.background = "var(--brand-50)";
                    e.currentTarget.style.color = "var(--brand-700)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--neutral-200)";
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.color = "var(--neutral-700)";
                  }}
                >
                  ↗ {q}
                </button>
              ))}
            </div>

            {/* Domain Notice */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: ".5rem",
                background: "var(--brand-50)",
                border: "1px solid var(--brand-100)",
                borderRadius: 9,
                padding: ".75rem 1rem",
                fontSize: ".75rem",
                color: "var(--brand-700)",
                maxWidth: 420,
                textAlign: "left",
                lineHeight: 1.5,
              }}
            >
              <Info size={13} style={{ flexShrink: 0, marginTop: 2 }} />
              Off-topic questions (jokes, trivia, etc.) will be politely declined. Prompt injection attempts are blocked by security guardrails.
            </div>
          </motion.div>
        )}

        {/* Message Bubbles */}
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                className={
                  msg.role === "user"
                    ? "bubble-user"
                    : msg.is_refusal
                    ? "bubble-refusal"
                    : "bubble-ai"
                }
              >
                {msg.content}
              </div>
              <span
                style={{
                  fontSize: ".7rem",
                  color: "var(--neutral-400)",
                  marginTop: ".3rem",
                  paddingLeft: msg.role === "user" ? 0 : ".5rem",
                  paddingRight: msg.role === "user" ? ".5rem" : 0,
                }}
              >
                {msg.role === "ai"
                  ? `Copilot · ${msg.source === "fallback" ? "Deterministic fallback" : "Gemini 3.6 Flash"}`
                  : "You"}{" "}
                · {formatTime(msg.timestamp)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="typing-indicator"
            >
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="error-banner"
            style={{ margin: "0 1.5rem .75rem", flexShrink: 0 }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Bar */}
      <div
        style={{
          padding: "1rem 1.5rem 1.25rem",
          borderTop: "1px solid var(--neutral-200)",
          flexShrink: 0,
          background: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: ".75rem",
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: 1, position: "relative" }}>
            <textarea
              ref={inputRef}
              id="chat_input"
              className="input-field"
              placeholder="Ask a manufacturing question… (Shift+Enter for new line)"
              maxLength={MAX_MSG_LENGTH}
              rows={2}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{ resize: "none", paddingRight: "4rem" }}
            />
            <span className={counterClass} style={{ position: "absolute", right: ".75rem", bottom: ".5rem" }}>
              {inputValue.length}/{MAX_MSG_LENGTH}
            </span>
          </div>
          <button
            className="btn-primary"
            onClick={handleSend}
            disabled={loading || !inputValue.trim()}
            style={{ padding: ".65rem 1.1rem", borderRadius: 10, flexShrink: 0, alignSelf: "flex-end" }}
            aria-label="Send message"
          >
            {loading ? <span className="spinner" /> : <Send size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}
