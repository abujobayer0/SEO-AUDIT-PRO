export const metadata = {
  title: "Verify email – SEO Audit Pro",
  description: "Confirm your email to activate your SEO Audit Pro account.",
  openGraph: {
    title: "Verify email – SEO Audit Pro",
    description: "Confirm your email to activate your account.",
    type: "website",
    images: [
      {
        url: "https://og-playground.vercel.app/api/card?title=Verify%20email&subtitle=Activate%20your%20account",
        width: 1200,
        height: 630,
        alt: "Verify email – SEO Audit Pro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verify email – SEO Audit Pro",
    description: "Confirm your email to activate your account.",
    images: ["https://og-playground.vercel.app/api/card?title=Verify%20email&subtitle=Activate%20your%20account"],
  },
};

export default function VerifyEmailLayout({ children }) {
  return <>{children}</>;
}
