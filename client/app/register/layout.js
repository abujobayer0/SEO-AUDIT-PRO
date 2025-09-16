export const metadata = {
  title: "Create account – SEO Audit Pro",
  description: "Create your SEO Audit Pro account to start running audits in minutes.",
  openGraph: {
    title: "Create account – SEO Audit Pro",
    description: "Start auditing in minutes. No credit card required.",
    type: "website",
    images: [
      {
        url: "https://og-playground.vercel.app/api/card?title=Create%20account&subtitle=Start%20auditing%20in%20minutes",
        width: 1200,
        height: 630,
        alt: "Create account – SEO Audit Pro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Create account – SEO Audit Pro",
    description: "Start auditing in minutes. No credit card required.",
    images: ["https://og-playground.vercel.app/api/card?title=Create%20account&subtitle=Start%20auditing%20in%20minutes"],
  },
};

export default function RegisterLayout({ children }) {
  return <>{children}</>;
}
