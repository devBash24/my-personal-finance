import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – My Personal Finance",
  description: "Privacy Policy for My Personal Finance",
};

const LAST_UPDATED = "February 7, 2025";

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Privacy Policy
      </h1>
      <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
      <p className="text-sm italic text-muted-foreground">
        This document is a template and should be reviewed by a legal
        professional before use in production.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">1. Data We Collect</h2>
        <p className="text-muted-foreground">
          We collect information you provide when you create an account (such as
          name and email), data you enter into the Service (e.g. income,
          expenses, savings, goals), and technical data such as IP address and
          browser type when you use the Service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">2. How We Use Your Data</h2>
        <p className="text-muted-foreground">
          We use your data to provide, maintain, and improve the Service; to
          authenticate you and manage your account; to communicate with you about
          the Service; and to comply with legal obligations.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">3. Storage and Retention</h2>
        <p className="text-muted-foreground">
          Your data is stored on secure servers. We retain your data for as long
          as your account is active or as needed to provide the Service. After
          account deletion, we may retain certain data as required by law or for
          legitimate business purposes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">4. Sharing of Data</h2>
        <p className="text-muted-foreground">
          We do not sell your personal data. We may share data with service
          providers who assist in operating the Service (e.g. hosting,
          authentication), subject to confidentiality obligations. We may also
          disclose data when required by law or to protect our rights and safety.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">5. Cookies and Similar Technologies</h2>
        <p className="text-muted-foreground">
          We may use cookies and similar technologies to keep you signed in, to
          remember your preferences (e.g. theme), and to understand how the
          Service is used. You can control cookie settings in your browser.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">6. Security</h2>
        <p className="text-muted-foreground">
          We implement appropriate technical and organizational measures to
          protect your data against unauthorized access, alteration, disclosure,
          or destruction. No method of transmission over the internet is 100%
          secure; we cannot guarantee absolute security.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">7. Your Rights</h2>
        <p className="text-muted-foreground">
          Depending on your location, you may have the right to access, correct,
          delete, or export your personal data. You can update account
          information and delete your account through the Service settings.
          Contact us for other requests.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">8. Children&apos;s Privacy</h2>
        <p className="text-muted-foreground">
          The Service is not intended for users under the age of 13 (or the
          applicable age in your jurisdiction). We do not knowingly collect
          personal data from children. If you believe we have collected such
          data, please contact us so we can delete it.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">9. Changes to This Policy</h2>
        <p className="text-muted-foreground">
          We may update this Privacy Policy from time to time. We will notify you
          of material changes by posting the updated policy on this page and
          updating the &quot;Last updated&quot; date. We encourage you to review this
          policy periodically.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">10. Contact</h2>
        <p className="text-muted-foreground">
          For questions about this Privacy Policy or your personal data, please
          contact us at the email or address provided in the app or on our
          website.
        </p>
      </section>
    </>
  );
}
