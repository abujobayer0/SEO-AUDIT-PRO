export const metadata = {
  title: "Dashboard – SEO Audit Pro",
  description: "Run audits, view reports, and manage your SEO intelligence.",
  openGraph: {
    title: "Dashboard – SEO Audit Pro",
    description: "Run audits, view reports, and manage your SEO intelligence.",
    type: "website",
    images: [
      {
        url: "https://og-playground.vercel.app/api/card?title=Dashboard&subtitle=Run%20audits%20and%20reports",
        width: 1200,
        height: 630,
        alt: "Dashboard – SEO Audit Pro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard – SEO Audit Pro",
    description: "Run audits, view reports, and manage your SEO intelligence.",
    images: ["https://og-playground.vercel.app/api/card?title=Dashboard&subtitle=Run%20audits%20and%20reports"],
  },
};

export default function DashboardLayout({ children }) {
  return <>{children}</>;
}
