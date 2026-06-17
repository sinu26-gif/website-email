"use client";

import Link from "next/link";

export default function PolicyPage() {
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
          <h1 className="section-title" style={{ marginBottom: "40px" }}>Business Policies</h1>

          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>Refund Policy</h2>
            <p style={{ lineHeight: "1.6", color: "var(--ink-secondary)" }}>
              During our free pilot program, there are no charges and no refunds needed. For future paid plans, we offer a 14-day money-back guarantee if you're not satisfied with the service.
            </p>
          </section>

          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>Service Uptime</h2>
            <p style={{ lineHeight: "1.6", color: "var(--ink-secondary)" }}>
              We aim for 99.5% uptime. While we strive for reliability, internet-based services may occasionally experience downtime. We notify users of scheduled maintenance in advance.
            </p>
          </section>

          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>Account Termination</h2>
            <p style={{ lineHeight: "1.6", color: "var(--ink-secondary)" }}>
              You can cancel your account anytime. Upon cancellation, your data is deleted within 30 days unless you request immediate deletion. We may retain anonymized usage data for service improvement.
            </p>
          </section>

          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>Support Policy</h2>
            <p style={{ lineHeight: "1.6", color: "var(--ink-secondary)" }}>
              Pilot users receive email support within 24 hours. We prioritize urgent issues (e.g., API failures) and respond to feature requests within 48 hours.
            </p>
          </section>

          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>Acceptable Use</h2>
            <p style={{ lineHeight: "1.6", color: "var(--ink-secondary)" }}>
              You agree not to:
            </p>
            <ul style={{ marginTop: "12px", marginLeft: "20px", lineHeight: "1.8" }}>
              <li>Use Himova for illegal activities or spam</li>
              <li>Attempt to reverse-engineer or hack the service</li>
              <li>Share credentials or sell access to other users</li>
              <li>Use the service for purposes other than salon business email support</li>
            </ul>
          </section>

          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>Changes to Terms</h2>
            <p style={{ lineHeight: "1.6", color: "var(--ink-secondary)" }}>
              We may update these policies at any time. Continued use of Himova constitutes acceptance of changes. We'll notify you of significant changes via email.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>Questions?</h2>
            <p style={{ lineHeight: "1.6", color: "var(--ink-secondary)" }}>
              Email us at{" "}
              <a href="mailto:support@himova.work.gd" style={{ color: "var(--brand-primary)", textDecoration: "none" }}>
                support@himova.work.gd
              </a>
              {" "}for any policy questions.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
