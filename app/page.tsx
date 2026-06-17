"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ---------- types ---------- */

type DraftResult = {
  reply: string;
  confidence: number;
  status: "ready" | "review";
  intent: string;
  faq_similarity: number;
  reasons: string[];
};

/* ---------- constants ---------- */

const DEFAULT_KB = {
  business_name: "Bloom Hair Studio",
  location: "Thamel, Kathmandu, Nepal",
  hours: {
    Mon: "9:00am–7:00pm",
    Tue: "9:00am–7:00pm",
    Wed: "9:00am–7:00pm",
    Thu: "9:00am–7:00pm",
    Fri: "9:00am–7:00pm",
    Sat: "9:00am–5:00pm",
    Sun: "Closed",
  },
  services: [
    { name: "Haircut", price: "$25" },
    { name: "Hair colour", price: "$60" },
    { name: "Blow dry", price: "$20" },
    { name: "Beard trim", price: "$10" },
  ],
  policies: [
    "Free rescheduling up to 24 hours before your appointment.",
    "Walk-ins welcome when a chair is free, but booking ahead is recommended.",
  ],
  faqs: [
    {
      q: "What payment methods do you accept?",
      a: "We accept cash, cards, and major mobile wallets like eSewa and Khalti.",
    },
    {
      q: "Do you have parking?",
      a: "There is paid street parking nearby; we recommend arriving a few minutes early.",
    },
  ],
};

const SAMPLES = [
  "Hi! Are you open this Saturday, and how late?",
  "How much is a haircut and a beard trim?",
  "Can I reschedule my appointment to next Tuesday?",
  "Where are you located, and is there parking?",
  "Do you do bridal hair packages for a group of six?",
];

const FEATURES = [
  {
    icon: "🧠",
    title: "AI-Powered Drafts",
    desc: "Our engine reads customer emails and drafts accurate, context-aware replies grounded in your actual business data.",
  },
  {
    icon: "🔒",
    title: "Human-in-the-Loop",
    desc: "Low-confidence replies are flagged for review. You always stay in control — nothing goes out without your approval.",
  },
  {
    icon: "⚡",
    title: "Instant Responses",
    desc: "Turn hours of inbox work into minutes. Draft replies in seconds, not hours. Your customers get faster answers.",
  },
  {
    icon: "📊",
    title: "Smart Confidence Scores",
    desc: "Every draft comes with a confidence score and intent detection, so you know exactly how reliable each reply is.",
  },
  {
    icon: "🔗",
    title: "Gmail Integration",
    desc: "Connect your Gmail and let Himova draft replies automatically. Review and send directly from your inbox.",
  },
  {
    icon: "💰",
    title: "Simple Pricing",
    desc: "No hidden fees, no enterprise lock-in. Just $15/month per location — or start free with our pilot program.",
  },
];

const STEPS = [
  {
    num: "1",
    title: "Customer Emails You",
    desc: "A customer sends an email to your salon asking about hours, pricing, or booking.",
  },
  {
    num: "2",
    title: "Himova Drafts a Reply",
    desc: "Our AI matches the query against your knowledge base and generates a grounded response.",
  },
  {
    num: "3",
    title: "You Review & Edit",
    desc: "Check the draft in your dashboard. Edit if needed, or approve with one click.",
  },
  {
    num: "4",
    title: "Send with Confidence",
    desc: "Hit send. Low-confidence drafts are flagged so nothing slips through.",
  },
];

/* ---------- hooks ---------- */

function useScrollReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);
}

function useMobileMenu() {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  return { open, toggle };
}

function useCountUp(end: number, duration: number = 1600, prefix: string = "", suffix: string = "", decimals: number = 0) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();

          function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutExpo for satisfying deceleration
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setValue(eased * end);
            if (progress < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  const display = decimals > 0 ? value.toFixed(decimals) : Math.round(value);
  const formatted = prefix + (prefix === "$" && Number(display) === 0 ? "$0" : display) + suffix;

  return { ref, value: formatted };
}

function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("himova-theme") as "dark" | "light" | null;
    const prefers = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    const initial = stored || prefers;
    setTheme(initial);
    document.documentElement.classList.toggle("light", initial === "light");
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("light", next === "light");
      localStorage.setItem("himova-theme", next);
      return next;
    });
  }, []);

  return { theme, toggle };
}

/* ---------- sub-components ---------- */

function BackgroundEffects() {
  return (
    <div className="bg-effects" aria-hidden>
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-grid" />
    </div>
  );
}

function Navbar({ mobile, theme, toggleTheme }: { mobile: ReturnType<typeof useMobileMenu>; theme: "dark" | "light"; toggleTheme: () => void }) {
  return (
    <header className="nav">
      <div className="nav-inner">
        <a href="#" className="brand" style={{ color: "inherit", textDecoration: "none" }}>
          <span className="brand-icon">📥</span>
          <span>Himova</span>
        </a>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#demo">Live Demo</a>
          <a href="#how">How It Works</a>
          <a href="#pricing">Pricing</a>
          <a href="/privacy" style={{ fontSize: "12px" }}>Privacy</a>
          <a href="/terms" style={{ fontSize: "12px" }}>Terms</a>
          <a href="/policy" style={{ fontSize: "12px" }}>Policy</a>
        </nav>
        <div className="nav-cta">
          <a className="btn-sm" href="mailto:contact@himova.work.gd">
            Get Started
          </a>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <span className="icon-sun">☀️</span>
            ) : (
              <span className="icon-moon">🌙</span>
            )}
          </button>
          <button
            className="mobile-menu-btn"
            onClick={mobile.toggle}
            aria-label="Toggle menu"
          >
            {mobile.open ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {mobile.open && (
        <nav className="mobile-dropdown">
          <a href="#features" onClick={mobile.toggle}>Features</a>
          <a href="#demo" onClick={mobile.toggle}>Live Demo</a>
          <a href="#how" onClick={mobile.toggle}>How It Works</a>
          <a href="#pricing" onClick={mobile.toggle}>Pricing</a>
          <a href="mailto:contact@himova.work.gd" onClick={mobile.toggle}>Contact</a>
        </nav>
      )}
    </header>
  );
}

function HeroStat({ end, prefix, suffix, decimals, label }: { end: number; prefix?: string; suffix?: string; decimals?: number; label: string }) {
  const { ref, value } = useCountUp(end, 1600, prefix || "", suffix || "", decimals || 0);
  return (
    <div className="hero-stat">
      <div className="hero-stat-value" ref={ref}>{value}</div>
      <div className="hero-stat-label">{label}</div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="hero">
      <div className="main-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Built in Kathmandu, Nepal
        </div>
        <h1 className="hero-title">
          Stop drowning in your
          <br />
          <span className="hero-title-gradient">salon&apos;s inbox.</span>
        </h1>
        <p className="hero-subtitle">
          Himova reads your customer emails and drafts accurate replies from
          your own hours, prices, and policies — then flags anything tricky for
          you. You review, you send.
        </p>
        <div className="hero-cta-group">
          <a className="btn btn-primary" href="#demo">
            Try the Live Demo →
          </a>
          <a className="btn btn-secondary" href="mailto:contact@himova.work.gd?subject=Himova%20pilot">
            Join the Pilot — Free
          </a>
        </div>
        <div className="hero-proof">
          <HeroStat end={95} suffix="%" label="Reply accuracy" />
          <div className="hero-stat-divider" />
          <HeroStat end={5} prefix="<" suffix="s" label="Draft time" />
          <div className="hero-stat-divider" />
          <HeroStat end={0} prefix="$" label="Pilot cost" />
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="features">
      <div className="main-content">
        <div className="features-header reveal">
          <div className="section-label">✦ Features</div>
          <h2 className="section-title">
            Everything you need to
            <br />
            automate salon support
          </h2>
          <p className="section-subtitle">
            Purpose-built for local businesses. No enterprise complexity, no
            months-long setup. Just plug in your info and go.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`feature-card reveal reveal-delay-${(i % 3) + 1}`}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  const [email, setEmail] = useState(SAMPLES[0]);
  const [kbText, setKbText] = useState(JSON.stringify(DEFAULT_KB, null, 2));
  const [showKb, setShowKb] = useState(false);
  const [result, setResult] = useState<DraftResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    let knowledgeBase: unknown = DEFAULT_KB;
    try {
      knowledgeBase = JSON.parse(kbText);
    } catch {
      setError("Knowledge base is not valid JSON — fix it and try again.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, knowledgeBase }),
      });
      if (!res.ok) throw new Error("Request failed (" + res.status + ")");
      setResult((await res.json()) as DraftResult);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="demo" className="demo">
      <div className="main-content">
        <div className="reveal">
          <div className="section-label">🧪 Live Demo</div>
          <h2 className="section-title">Try the real drafting engine</h2>
          <p className="section-subtitle">
            This calls a live Python backend that matches the message against a
            salon&apos;s knowledge base, drafts a grounded reply, and decides
            whether it&apos;s confident enough to send or needs human review.
          </p>
        </div>

        <div className="demo-grid">
          {/* Input panel */}
          <div className="demo-card reveal reveal-delay-1">
            <div className="demo-card-label">
              <span className="demo-card-label-dot" />
              Customer Email
            </div>
            <textarea
              className="demo-textarea"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              rows={5}
              placeholder="Type or paste a customer email..."
            />
            <div className="sample-chips">
              {SAMPLES.map((s) => (
                <button
                  key={s}
                  className="sample-chip"
                  onClick={() => setEmail(s)}
                >
                  {s.length > 40 ? s.slice(0, 40) + "…" : s}
                </button>
              ))}
            </div>

            <button
              className="kb-toggle-btn"
              onClick={() => setShowKb((v) => !v)}
            >
              {showKb ? "▾ Hide" : "▸ Edit"} salon knowledge base
            </button>
            {showKb && (
              <textarea
                className="demo-textarea kb-textarea"
                value={kbText}
                onChange={(e) => setKbText(e.target.value)}
                rows={14}
              />
            )}

            <button
              className="btn btn-primary btn-full"
              onClick={generate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Drafting…
                </>
              ) : (
                "Generate Draft Reply"
              )}
            </button>
            {error && (
              <div className="error-msg">
                <span>⚠</span> {error}
              </div>
            )}
          </div>

          {/* Output panel */}
          <div className="demo-card reveal reveal-delay-2">
            <div className="demo-card-label">
              <span className="demo-card-label-dot" style={{ background: "var(--brand-secondary)" }} />
              Himova&apos;s Drafted Reply
            </div>
            {!result && (
              <div className="result-placeholder">
                <div className="result-placeholder-icon">✉️</div>
                <div className="result-placeholder-text">
                  Your AI-drafted reply will appear here.
                  <br />
                  <span style={{ color: "var(--ink-dim)", fontSize: 13 }}>
                    Click &quot;Generate Draft Reply&quot; to start.
                  </span>
                </div>
              </div>
            )}
            {result && (
              <div className="result-content">
                <div className={`result-badge ${result.status}`}>
                  {result.status === "ready"
                    ? "✅ High confidence — ready to send"
                    : "🚩 Low confidence — flagged for human review"}
                </div>
                <div className="confidence-meter">
                  <div
                    className={`confidence-fill ${result.status}`}
                    style={{ width: Math.round(result.confidence * 100) + "%" }}
                  />
                </div>
                <div className="result-meta">
                  <span className="result-meta-tag">
                    🎯 {Math.round(result.confidence * 100)}% confidence
                  </span>
                  <span className="result-meta-tag">
                    📋 intent: <strong style={{ marginLeft: 4 }}>{result.intent}</strong>
                  </span>
                </div>
                <pre className="result-reply">{result.reply}</pre>
                <details className="result-why">
                  <summary>Why this decision?</summary>
                  <ul>
                    {result.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how" className="how-it-works">
      <div className="main-content">
        <div className="features-header reveal">
          <div className="section-label">🔄 How It Works</div>
          <h2 className="section-title">
            From inbox to reply
            <br />
            in four steps
          </h2>
          <p className="section-subtitle">
            No complex setup. No training period. Himova works with your
            existing email workflow from day one.
          </p>
        </div>
        <div className="steps-container">
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className={`step-card reveal reveal-delay-${i + 1}`}
            >
              <div className="step-number">{s.num}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
              {i < STEPS.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    about: "",
    contactNumber: "",
    phoneNumber: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setShowForm(false);
      setSubmitted(false);
      setFormData({ name: "", address: "", about: "", contactNumber: "", phoneNumber: "" });
    }, 2000);
  };

  return (
    <section id="pricing" className="pricing">
      <div className="main-content">
        <div className="features-header reveal">
          <div className="section-label">💰 Pricing</div>
          <h2 className="section-title">
            Simple, transparent pricing
          </h2>
          <p className="section-subtitle">
            No hidden fees. No enterprise lock-in. Start free and upgrade when
            you&apos;re ready.
          </p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card reveal reveal-delay-1">
            <div className="pricing-name">Per Location</div>
            <div className="pricing-price">
              $15<span className="pricing-price-suffix">/mo</span>
            </div>
            <ul className="pricing-features">
              <li>Unlimited AI-drafted replies</li>
              <li>Your custom knowledge base</li>
              <li>Human review dashboard</li>
              <li>Low-confidence escalation</li>
              <li>Gmail integration</li>
            </ul>
            <button
              className="btn btn-secondary"
              onClick={() => setShowForm(true)}
              style={{ cursor: "pointer", border: "none", background: "inherit" }}
            >
              Get Started
            </button>
          </div>
          <div className="pricing-card featured reveal reveal-delay-2">
            <div className="pricing-name">Pilot Program</div>
            <div className="pricing-price">
              $0
            </div>
            <ul className="pricing-features">
              <li>Everything in the paid plan</li>
              <li>Hands-on onboarding</li>
              <li>Direct line to the founder</li>
              <li>No card required</li>
              <li>Cancel anytime</li>
            </ul>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
              style={{ cursor: "pointer", border: "none", background: "inherit" }}
            >
              Join the Pilot
            </button>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => !submitted && setShowForm(false)}
        >
          <div
            style={{
              background: "var(--bg-primary)",
              color: "var(--ink-primary)",
              borderRadius: "12px",
              padding: "40px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "24px" }}>Contact Information</h2>
              <button
                onClick={() => !submitted && setShowForm(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "var(--ink-secondary)",
                }}
              >
                ✕
              </button>
            </div>

            {submitted ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
                <h3 style={{ color: "var(--brand-primary)", marginBottom: "10px" }}>Thank You!</h3>
                <p style={{ color: "var(--ink-secondary)" }}>
                  We&apos;ve received your information. Our team will contact you soon!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Name */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>
                    👤 Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Your full name"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--ink-dim)",
                      borderRadius: "8px",
                      background: "var(--bg-secondary)",
                      color: "var(--ink-primary)",
                      fontFamily: "inherit",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Address */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>
                    📍 Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Your salon address"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--ink-dim)",
                      borderRadius: "8px",
                      background: "var(--bg-secondary)",
                      color: "var(--ink-primary)",
                      fontFamily: "inherit",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* About */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>
                    📝 About Your Salon
                  </label>
                  <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    placeholder="Tell us about your salon..."
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--ink-dim)",
                      borderRadius: "8px",
                      background: "var(--bg-secondary)",
                      color: "var(--ink-primary)",
                      fontFamily: "inherit",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* Contact Number */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>
                    ☎️ Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="+977-..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--ink-dim)",
                      borderRadius: "8px",
                      background: "var(--bg-secondary)",
                      color: "var(--ink-primary)",
                      fontFamily: "inherit",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Phone Number */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>
                    📱 Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Your phone number"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--ink-dim)",
                      borderRadius: "8px",
                      background: "var(--bg-secondary)",
                      color: "var(--ink-primary)",
                      fontFamily: "inherit",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Submit & Get Started
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "8px",
                    background: "transparent",
                    border: "1px solid var(--ink-dim)",
                    color: "var(--ink-primary)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function CTABanner() {
  return (
    <section className="cta-banner">
      <div className="main-content">
        <div className="cta-box reveal">
          <h2 className="cta-title">
            Ready to reclaim your inbox?
          </h2>
          <p className="cta-subtitle">
            Join the pilot program and see how Himova can transform your
            salon&apos;s customer communication — for free.
          </p>
          <div className="cta-buttons">
            <a className="btn btn-primary" href="mailto:contact@himova.work.gd?subject=Himova%20pilot">
              Start Your Free Pilot
            </a>
            <a className="btn btn-secondary" href="#demo">
              Try the Demo First
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="main-content">
        <div className="footer-inner">
          <div className="footer-brand">
            <span>📥</span> Himova
          </div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#demo">Demo</a>
            <a href="#pricing">Pricing</a>
            <a href="mailto:contact@himova.work.gd">Contact</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/policy">Policy</a>
          </div>
        </div>
        <p className="footer-fine" style={{ marginTop: 20, textAlign: "center" }}>
          Thamel, Kathmandu, Nepal 🇳🇵 ·{" "}
          <a href="mailto:contact@himova.work.gd">contact@himova.work.gd</a>
          <br />
          Himova drafts suggested replies and can make mistakes. Always review
          before sending. © 2026 Himova.
        </p>
      </div>
    </footer>
  );
}

/* ---------- main page ---------- */

export default function Home() {
  useScrollReveal();
  const mobile = useMobileMenu();
  const { theme, toggle: toggleTheme } = useTheme();

  return (
    <>
      <BackgroundEffects />
      <div className="main-wrapper">
        <Navbar mobile={mobile} theme={theme} toggleTheme={toggleTheme} />
        <HeroSection />
        <FeaturesSection />
        <DemoSection />
        <HowItWorksSection />
        <PricingSection />
        <CTABanner />
        <Footer />
      </div>
    </>
  );
}
