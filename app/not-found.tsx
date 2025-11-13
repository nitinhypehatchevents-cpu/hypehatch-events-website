import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-6xl md:text-8xl font-heading font-bold text-brand mb-6">
          404
        </h1>
        <h2 className="text-3xl md:text-4xl font-heading font-semibold text-ink mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-brandMuted font-body mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="btn-interactive bg-brand text-white px-8 py-4 rounded-full font-medium font-body text-base md:text-lg inline-block focus:ring-2 focus:ring-[#FA9616] focus:ring-offset-2"
          aria-label="Return to homepage"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}

