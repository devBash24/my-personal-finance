import Link from "next/link";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to home
          </Link>
          <span className="text-lg font-semibold tracking-tight">
            My Personal Finance
          </span>
        </header>
        <article className="space-y-6 text-foreground">{children}</article>
        <footer className="mt-10 border-t border-border pt-6">
          <Link
            href="/"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to home
          </Link>
        </footer>
      </div>
    </div>
  );
}
