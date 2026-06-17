"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--ink-primary)" }}>
      {/* Header */}
      <header className="nav">
        <div className="nav-inner">
          <Link href="/" className="brand" style={{ color: "inherit", textDecoration: "none" }}>
            <span className="brand-icon">📥</span>
            <span>Himova</span>
          </Link>
          <nav className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/policy">Policy</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="main-content" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 className="section-title" style={{ marginBottom: "40px" }}>Privacy Policy</h1>

          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>1. Information We Collect</h2>
            <p style={{ lineHeight: "1.6", color: "var(--ink-secondary)" }}>
              Himova collects information necessary to provide our email drafting service:
            </p>
            <ul style={{ marginTop: "12px", marginLeft: "20px", lineHeight: "1.8" }}>
              <li>Email content from your salon customers (temporary, for drafting only)</li>
              <li>Your salon's knowledge base (hours, prices, policies)</li>
              <li>Account information (email, salon name, location)</li>
              <li>Usage analytics to improve our service</li>
            </ul>
          </section>

          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>2. How We Use Your Data</h2>
            <p style={{ lineHeight: "1.6", color: "var(--ink-secondary)" }}>
              We use your information solely to:
            </p>
            <ul style={{ marginTop: "12px", marginLeft: "20px", lineHeight: "1.8" }}>
              <li>Generate accurate email replies based on your business data</li>
              <li>Improve our AI engine's accuracy and performance</li>
              <li>Provide customer support</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>3. Data Security</h2>
            <p style={{ lineHeight: "1.6", color: "var(--ink-secondary)" }}>
              Himova employs industry-standard encryption and security measures to protect your data. All emails and knowledge bases are transmitted over HTTPS and stored securely.
            </p>
          </section>

          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>4. Data Retention</h2>
            <p style={{ lineHeight: "1.6", color: "var(--ink-secondary)" }}>
              Customer emails are processed and deleted within 24 hours. Your salon's knowledge base is retained while your account is active. You can request data deletion anytime.
            </p>
          </section>

          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>5. Third Parties</h2>
            <p style={{ lineHeight: "1.6", color: "var(--ink-secondary)" }}>
              We do not sell or share your data with third parties. We may share data with trusted service providers (e.g., hosting providers) under strict confidentiality agreements.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>6. Contact Us</h2>
            <p style={{ lineHeight: "1.6", color: "var(--ink-secondary)" }}>
              Questions about our privacy practices? Email us at{" "}
              <a href="mailto:privacy@himova.work.gd" style={{ color: "var(--brand-primary)", textDecoration: "none" }}>
                privacy@himova.work.gd
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
