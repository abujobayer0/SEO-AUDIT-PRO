import api from "@/lib/api";

export async function generateMetadata({ params }) {
  const id = params?.id;
  try {
    const { data } = await api.get(`/reports/summary/${id}`);
    const websiteUrl = data?.audit?.audit?.websiteUrl || data?.audit?.websiteUrl || "Website";
    const score = data?.audit?.audit?.overallScore || data?.audit?.overallScore;
    const title = `SEO Report – ${websiteUrl}`;
    const description = `Full SEO audit${score ? ` (Score ${score})` : ""} for ${websiteUrl}. View performance, content, links and issues.`;
    const ogImage = `https://og-playground.vercel.app/api/card?title=${encodeURIComponent(websiteUrl)}&subtitle=${encodeURIComponent(
      "SEO Report & Findings"
    )}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
    };
  } catch (_) {
    const fallbackTitle = "SEO Report";
    const fallbackDesc = "Detailed SEO report including performance, content, and technical insights.";
    const ogImage = `https://og-playground.vercel.app/api/card?title=${encodeURIComponent(fallbackTitle)}&subtitle=${encodeURIComponent(
      "Audit Details"
    )}`;
    return {
      title: fallbackTitle,
      description: fallbackDesc,
      openGraph: { title: fallbackTitle, description: fallbackDesc, type: "article", images: [ogImage] },
      twitter: { card: "summary_large_image", title: fallbackTitle, description: fallbackDesc, images: [ogImage] },
    };
  }
}

export default function AuditLayout({ children }) {
  return <>{children}</>;
}
