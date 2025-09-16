export const metadata = {
  title: "Community – SEO Audit Pro",
  description: "Share ideas, report issues, and collaborate with other makers.",
  openGraph: {
    title: "Community – SEO Audit Pro",
    description: "Share ideas, report issues, and collaborate with other makers.",
    type: "website",
    images: [
      {
        url: "https://og-playground.vercel.app/api/card?title=Community&subtitle=Discuss%20SEO%20Audit%20Pro",
        width: 1200,
        height: 630,
        alt: "Community – SEO Audit Pro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Community – SEO Audit Pro",
    description: "Share ideas, report issues, and collaborate with other makers.",
    images: ["https://og-playground.vercel.app/api/card?title=Community&subtitle=Discuss%20SEO%20Audit%20Pro"],
  },
};

export default function CommunityLayout({ children }) {
  return <>{children}</>;
}
