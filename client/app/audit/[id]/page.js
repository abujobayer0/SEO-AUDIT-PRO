"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { downloadAuditPdf } from "../../../lib/download";

// Import modular components
import AuditHeader from "../../../components/audit/AuditHeader";
import ScoreOverview from "../../../components/audit/ScoreOverview";
import PerformanceMetrics from "../../../components/audit/PerformanceMetrics";
import MetaTags from "../../../components/audit/MetaTags";
import ContentAnalysis from "../../../components/audit/ContentAnalysis";
import ImagesAnalysis from "../../../components/audit/ImagesAnalysis";
import LinksAnalysis from "../../../components/audit/LinksAnalysis";
import CompetitorAnalysis from "../../../components/audit/CompetitorAnalysis";
import IssuesRecommendations from "../../../components/audit/IssuesRecommendations";
import api, { reportsApi } from "@/lib/api";
import DarkVeil from "@/components/DarkVeil";

export default function AuditDetailPage() {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [competitors, setCompetitors] = useState([]);
  const [isSharedView, setIsSharedView] = useState(false);
  const router = useRouter();
  const params = useParams();
  const auditId = params?.id;

  useEffect(() => {
    if (!auditId) return;
    const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const shareId = search?.get("share");
    if (shareId) {
      setIsSharedView(true);
      fetchSharedDetails(shareId);
    } else {
      fetchAuditDetails();
      fetchCompetitors();
    }
  }, [auditId]);

  const fetchAuditDetails = async () => {
    try {
      setLoading(true);
      console.log("Fetching audit details for ID:", auditId);
      const response = await api.get(`/reports/summary/${auditId}`);
      console.log("Audit details response:", response.data);
      setAudit(response.data);
    } catch (error) {
      console.error("Failed to fetch audit details:", error);
      toast.error("Failed to load audit details");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchSharedDetails = async (shareId) => {
    try {
      setLoading(true);
      const data = await reportsApi.getSharedSummary(shareId);
      setAudit(data);
    } catch (error) {
      toast.error("This shared report is unavailable.");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompetitors = async () => {
    try {
      const response = await api.get(`/audit/${auditId}/competitors`);
      setCompetitors(response.data.competitors || []);
    } catch (error) {
      console.error("Failed to fetch competitors:", error);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      await downloadAuditPdf(auditId, audit.audit.websiteUrl);
    } catch (error) {
      console.error("PDF download failed:", error);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400'></div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-white mb-4'>Audit Not Found</h2>
          <Link href='/dashboard' className='text-blue-400 hover:text-blue-300'>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { audit: auditData, keywords, meta } = audit;

  return (
    <div className='min-h-screen bg-black'>
      <div className='w-full h-full absolute inset-0'>
        <div style={{ width: "100%", height: "600px", position: "relative" }}>
          <DarkVeil hueShift={22} />
        </div>
      </div>
      <AuditHeader audit={auditData} onDownloadPdf={handleDownloadPdf} />

      <div className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10'>
        <ScoreOverview auditData={auditData} />

        <PerformanceMetrics performanceData={auditData.performance} websiteUrl={auditData.websiteUrl} hideAiActions={isSharedView} />

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          <MetaTags meta={meta} auditData={auditData} keywords={keywords} hideAiActions={isSharedView} />
          <ContentAnalysis contentData={auditData.content} />
        </div>

        <ImagesAnalysis imagesData={auditData.images} />

        <LinksAnalysis linksData={auditData.links} />

        {!isSharedView && <CompetitorAnalysis auditId={auditId} competitors={competitors} setCompetitors={setCompetitors} />}

        <IssuesRecommendations auditData={auditData} hideAiActions={isSharedView} />
      </div>
    </div>
  );
}
