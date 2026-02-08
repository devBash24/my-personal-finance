import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service – My Personal Finance",
  description: "Terms of Service for My Personal Finance",
};

const LAST_UPDATED = "February 7, 2025";

export default function TermsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Terms of Service
      </h1>
      <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
      <p className="text-sm italic text-muted-foreground">
        This document is a template and should be reviewed by a legal professional
        before use in production.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground">
          By accessing or using My Personal Finance (&quot;the Service&quot;), you agree to be
          bound by these Terms of Service. If you do not agree, do not use the
          Service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">2. Description of Service</h2>
        <p className="text-muted-foreground">
          My Personal Finance provides tools to manage personal finances, including
          tracking income, expenses, savings, debts, and goals. We reserve the
          right to modify, suspend, or discontinue the Service at any time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">3. User Accounts and Responsibilities</h2>
        <p className="text-muted-foreground">
          You are responsible for maintaining the confidentiality of your account
          credentials and for all activity under your account. You must provide
          accurate information and notify us of any unauthorized use.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">4. Acceptable Use</h2>
        <p className="text-muted-foreground">
          You agree to use the Service only for lawful purposes. You may not use
          the Service to violate any laws, infringe on others&apos; rights, transmit
          harmful content, or attempt to gain unauthorized access to our systems
          or other accounts.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">5. Intellectual Property</h2>
        <p className="text-muted-foreground">
          The Service and its original content, features, and functionality are
          owned by us and are protected by intellectual property laws. You may
          not copy, modify, or create derivative works without our permission.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">6. Disclaimers</h2>
        <p className="text-muted-foreground">
          The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of
          any kind, either express or implied. We do not guarantee that the
          Service will be uninterrupted, error-free, or suitable for your
          particular financial decisions. The Service is for personal tracking
          only and does not constitute financial, tax, or legal advice.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">7. Limitation of Liability</h2>
        <p className="text-muted-foreground">
          To the fullest extent permitted by law, we shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages, or
          any loss of profits or data, arising from your use of the Service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">8. Termination</h2>
        <p className="text-muted-foreground">
          We may suspend or terminate your access to the Service at any time for
          any reason. You may close your account at any time through the
          applicable settings. Upon termination, your right to use the Service
          ceases immediately.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">9. Governing Law and Disputes</h2>
        <p className="text-muted-foreground">
          These terms shall be governed by the laws of the jurisdiction in which
          we operate, without regard to conflict of law principles. Any disputes
          shall be resolved in the courts of that jurisdiction.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">10. Changes to Terms</h2>
        <p className="text-muted-foreground">
          We may update these Terms from time to time. We will notify you of
          material changes by posting the new Terms on this page and updating
          the &quot;Last updated&quot; date. Continued use of the Service after changes
          constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">11. Contact</h2>
        <p className="text-muted-foreground">
          For questions about these Terms, please contact us at the email or
          address provided in the app or on our website.
        </p>
      </section>
    </>
  );
}
