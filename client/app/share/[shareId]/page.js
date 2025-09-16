"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DarkVeil from "@/components/DarkVeil";
import ScoreOverview from "@/components/audit/ScoreOverview";
import PerformanceMetrics from "@/components/audit/PerformanceMetrics";
import MetaTags from "@/components/audit/MetaTags";
import ContentAnalysis from "@/components/audit/ContentAnalysis";
import ImagesAnalysis from "@/components/audit/ImagesAnalysis";
import LinksAnalysis from "@/components/audit/LinksAnalysis";
import IssuesRecommendations from "@/components/audit/IssuesRecommendations";
import SpotlightCard from "@/components/SpotlightCard";
import { BarChart3, Globe, Clock } from "lucide-react";
import { reportsApi } from "@/lib/api";

export default function SharedAuditPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params?.shareId;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await reportsApi.getSharedSummary(shareId);
        setData(res);
      } catch (e) {
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };
    if (shareId) load();
  }, [shareId, router]);

  if (loading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400'></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center text-white'>Shared report not available.</div>
      </div>
    );
  }

  const { audit, keywords, meta } = data;

  return (
    <div className='min-h-screen bg-black'>
      <div className='w-full h-full absolute inset-0'>
        <div style={{ width: "100%", height: "360px", position: "relative" }}>
          <DarkVeil hueShift={22} />
        </div>
      </div>

      {/* Minimal read-only header */}
      <header className='bg-black/40 backdrop-blur-2xl w-[90%] rounded-full absolute shadow-2xl border border-white/10 top-4 left-1/2 transform -translate-x-1/2 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-3'>
            <div className='flex items-center'>
              <BarChart3 className='h-7 w-7 text-white' />
              <span className='ml-2 text-lg font-bold text-white'>Seo Inspect Pro – Shared</span>
            </div>
          </div>
        </div>
      </header>

      {/* Website summary header (read-only) */}
      <div className='pt-24 max-w-7xl mx-auto  relative '>
        <SpotlightCard
          className='bg-black/40 backdrop-blur-2xl border-white/10 mx-4 sm:mx-6 lg:mx-8 mt-16 shadow-2xl'
          spotlightColor='rgba(59, 130, 246, 0.3)'
        >
          <div className='flex items-center justify-between p-4 relative z-10'>
            <div className='flex items-center space-x-6'>
              <div className='flex-shrink-0'>
                <div className='w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center ring-2 ring-blue-400/30'>
                  <Globe className='w-8 h-8 text-white' />
                </div>
              </div>
              <div>
                <h1 className='text-3xl font-bold text-white mb-2'>{audit.websiteUrl}</h1>
                <p className='text-gray-300 flex items-center text-lg'>
                  <Clock className='w-5 h-5 mr-2' />
                  Analyzed on {new Date(audit.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-24 h-24 rounded-full text-white text-3xl font-bold bg-gradient-to-br from-green-400 to-green-600 shadow-lg ring-4 ring-white/20'>
                {audit.overallScore}
              </div>
              <p className='text-sm text-gray-300 mt-3 font-medium'>Overall Score</p>
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* Read-only sections */}
      <div className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10'>
        <ScoreOverview auditData={audit} />
        <PerformanceMetrics performanceData={audit.performance} websiteUrl={audit.websiteUrl} hideAiActions={true} />

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          <MetaTags meta={meta} auditData={audit} keywords={keywords} hideAiActions={true} />
          <ContentAnalysis contentData={audit.content} />
        </div>

        <ImagesAnalysis imagesData={audit.images} />
        <LinksAnalysis linksData={audit.links} />
        <IssuesRecommendations auditData={audit} hideAiActions={true} />
      </div>
    </div>
  );
}
