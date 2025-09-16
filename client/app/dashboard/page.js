"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, BarChart3, FileText, Download, Settings, LogOut, TrendingUp, AlertCircle, CheckCircle, Clock, Globe } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { downloadAuditPdf } from "../../lib/download";
import SpotlightCard from "../../components/SpotlightCard";
import StarBorder from "../../components/StarBorder";
import ShinyText from "../../components/ShinyText";
import ScrollReveal from "../../components/ScrollReveal";
import LaserFlow from "../../components/LaserFlow";

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("audit");
  const router = useRouter();
  const revealRef = useRef(null);

  const [audits, setAudits] = useState([]);
  const [stats, setStats] = useState({
    totalAudits: 0,
    averageScore: 0,
    websitesTracked: 0,
    reportsGenerated: 0,
  });
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const handleAudit = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      toast.error("Please enter a website URL");
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await api.post("/audit", { websiteUrl: url });

      // DEBUG: Log all received data to console
      console.log("=== CLIENT AUDIT RESPONSE DEBUG ===");
      console.log("Full response data:", data);

      if (data.debug) {
        console.log("=== DEBUG INFO FROM SERVER ===");
        console.log("Links data type:", data.debug.linksDataType);
        console.log("Links is array:", data.debug.linksIsArray);
        console.log("Images data type:", data.debug.imagesDataType);
        console.log("Images is array:", data.debug.imagesIsArray);
        console.log("Raw audit data links:", data.debug.rawAuditData?.links);
        console.log("Raw audit data images:", data.debug.rawAuditData?.images);
        console.log("Clean audit data links:", data.debug.cleanAuditData?.links);
        console.log("Clean audit data images:", data.debug.cleanAuditData?.images);
      }

      console.log("Audit data images:", data.audit?.images);
      console.log("Audit data links:", data.audit?.links);
      console.log("=== END CLIENT DEBUG ===");

      toast.success("Audit completed successfully!");
      setUrl("");
      // Prepend latest audit to list
      setAudits((prev) => [
        {
          id: data.audit.id,
          websiteUrl: data.audit.websiteUrl,
          overallScore: data.audit.overallScore,
          createdAt: new Date(data.audit.createdAt).toISOString().slice(0, 10),
          performance: { score: data.audit.performance.score },
          seo: { score: data.audit.seo.score },
          mobileFriendly: { score: data.audit.mobileFriendly.score },
          technical: { score: data.audit.technical.score },
          content: { score: data.audit.content.score },
        },
        ...prev,
      ]);
      // Refresh stats
      fetchStats();
    } catch (error) {
      toast.error(error.message || "Failed to perform audit");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400 bg-green-400/20 border-green-400/30";
    if (score >= 60) return "text-yellow-400 bg-yellow-400/20 border-yellow-400/30";
    return "text-red-400 bg-red-400/20 border-red-400/30";
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return "from-green-400 to-green-600";
    if (score >= 60) return "from-yellow-400 to-yellow-600";
    return "from-red-400 to-red-600";
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <CheckCircle className='h-5 w-5' />;
    if (score >= 60) return <AlertCircle className='h-5 w-5' />;
    return <AlertCircle className='h-5 w-5' />;
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/audit/stats/overview");

      setStats({
        totalAudits: data.totalAudits || 0,
        averageScore: data.averageScore || 0,
        websitesTracked: data.websitesTracked || 0,
        reportsGenerated: data.reportsGenerated || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Set default values if there's an error
      setStats({
        totalAudits: 0,
        averageScore: 0,
        websitesTracked: 0,
        reportsGenerated: 0,
      });
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await api.get("/audit/history?limit=10");
      const normalized = data.audits.map((a) => ({
        id: a._id || a.id,
        websiteUrl: a.websiteUrl,
        overallScore: a.overallScore,
        createdAt: new Date(a.createdAt).toISOString().slice(0, 10),
        performance: { score: a.performance?.score ?? 0 },
        seo: { score: a.seo?.score ?? 0 },
        mobileFriendly: { score: a.mobileFriendly?.score ?? 0 },
        technical: { score: a.technical?.score ?? 0 },
        content: { score: a.content?.score ?? 0 },
      }));
      setAudits(normalized);
    } catch (error) {
      // ignore for now
    }
  };

  const openSummary = async (audit) => {
    setSelectedAudit(audit);
    setIsSummaryLoading(true);
    setSummary(null);
    try {
      const { data } = await api.get(`/reports/summary/${audit.id}`);
      setSummary(data);
    } catch (e) {
      toast.error(e.message || "Failed to load summary");
    } finally {
      setIsSummaryLoading(false);
    }
  };

  useEffect(() => {
    // Require auth
    const token = typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    fetchStats();
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='min-h-screen bg-black relative '>
      {/* Header - Absolute positioned like landing page */}
      <header className='bg-black/30 backdrop-blur-md w-[90%] rounded-full absolute shadow-xl border border-white/10 top-4 left-1/2 transform -translate-x-1/2 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div className='flex items-center'>
              <BarChart3 className='h-8 w-8 text-white' />
              <span className='ml-2 text-xl font-bold text-white'>SEO Audit Pro</span>
            </div>
            <div className='flex items-center space-x-4'>
              <StarBorder
                as='button'
                onClick={() => router.push("/settings")}
                color='rgba(255, 255, 255, 0.4)'
                thickness={1}
                className='px-4 py-2'
              >
                <Settings className='h-4 w-4 mr-2' />
                Settings
              </StarBorder>
              <StarBorder
                as='button'
                onClick={() => router.push("/")}
                color='rgba(255, 255, 255, 0.6)'
                thickness={1}
                className='px-4  py-2'
              >
                <LogOut className='h-4 w-4 mr-2' />
                Logout
              </StarBorder>
            </div>
          </div>
        </div>
      </header>

      <div className='relative z-10'>
        {/* LaserFlow Full Width Background with Welcome Section and Audit Card */}
        <div
          className='relative  w-full mb-12'
          style={{ height: "70vh" }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const el = revealRef.current;
            if (el) {
              el.style.setProperty("--mx", `${x}px`);
              el.style.setProperty("--my", `${y + rect.height * 0.3}px`);
            }
          }}
          onMouseLeave={() => {
            const el = revealRef.current;
            if (el) {
              el.style.setProperty("--mx", "-9999px");
              el.style.setProperty("--my", "-9999px");
            }
          }}
        >
          {/* LaserFlow Background - Full Width */}
          <LaserFlow
            horizontalBeamOffset={0.05}
            verticalBeamOffset={-0.2}
            color='#0077ff'
            flowSpeed={0.4}
            wispIntensity={4.0}
            fogIntensity={0.4}
            verticalSizing={3.0}
            horizontalSizing={0.5}
            decay={1}
          />

          {/* Content Container */}
          <div className='absolute inset-0 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 z-10'>
            {/* Welcome Section - Positioned Absolutely */}
            <div className='absolute top-66 left-1/2 transform -translate-x-1/2 text-center z-10'>
              <ScrollReveal
                baseOpacity={0}
                enableBlur={true}
                baseRotation={2}
                blurStrength={6}
                containerClassName='mb-4'
                textClassName='text-white text-5xl font-bold'
              >
                Welcome back!
              </ScrollReveal>
              <p className='text-gray-300 text-xl'>
                Run a new <ShinyText text='SEO audit' className='font-semibold' speed={6} /> or review your previous reports
              </p>
            </div>

            {/* Audit Form Container - Centered */}
            <div className='w-full max-w-5xl bg-black/40 backdrop-blur-lg border-2 border-blue-400/30 rounded-3xl p-8 mt-[45vh]'>
              <h2 className='text-3xl font-semibold mb-8 text-white text-center'>
                <ShinyText text='Run New Audit' className='font-semibold' speed={7} />
              </h2>
              <form onSubmit={handleAudit} className='flex gap-6'>
                <div className='flex-1'>
                  <input
                    type='url'
                    placeholder='Enter website URL (e.g., example.com)'
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className='w-full bg-black/50 border border-white/30 focus:border-blue-400 text-white rounded-2xl py-5 px-8 text-xl outline-none focus:ring-2 focus:ring-blue-400/50 transition-all shadow-lg backdrop-blur-sm placeholder-gray-400'
                    disabled={isLoading}
                  />
                </div>
                <StarBorder
                  as='button'
                  type='submit'
                  disabled={isLoading}
                  color='rgba(0, 119, 255, 0.8)'
                  thickness={2}
                  className='px-10 py-5 text-xl font-medium'
                >
                  {isLoading ? (
                    <div className='flex items-center'>
                      <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3'></div>
                      Analyzing...
                    </div>
                  ) : (
                    <div className='flex items-center'>
                      <Search className='h-6 w-6 mr-3' />
                      Audit Now
                    </div>
                  )}
                </StarBorder>
              </form>
            </div>
          </div>

          {/* Interactive Reveal Effect */}
          <div
            ref={revealRef}
            className='absolute inset-0 pointer-events-none opacity-25 mix-blend-mode-lighten z-5'
            style={{
              background: "radial-gradient(circle, rgba(0, 119, 255, 0.8) 0%, rgba(0, 119, 255, 0.4) 30%, transparent 60%)",
              "--mx": "-9999px",
              "--my": "-9999px",
              WebkitMaskImage:
                "radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 80px, rgba(255,255,255,0.6) 160px, rgba(255,255,255,0.25) 240px, rgba(255,255,255,0) 320px)",
              maskImage:
                "radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 80px, rgba(255,255,255,0.6) 160px, rgba(255,255,255,0.25) 240px, rgba(255,255,255,0) 320px)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          />
        </div>

        {/* Stats Overview */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12'>
          <div className='grid md:grid-cols-4 gap-6'>
            <SpotlightCard className='text-center bg-black/95 backdrop-blur-lg border-white/10' spotlightColor='rgba(12, 138, 237, 0.3)'>
              <div className='bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-blue-400/30'>
                <BarChart3 className='h-8 w-8 text-blue-400' />
              </div>
              <h3 className='text-3xl font-bold text-white mb-2'>{stats.totalAudits}</h3>
              <p className='text-gray-300 font-medium'>Total Audits</p>
            </SpotlightCard>

            <SpotlightCard className='text-center bg-black/95 backdrop-blur-lg border-white/10' spotlightColor='rgba(34, 197, 94, 0.3)'>
              <div className='bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-green-400/30'>
                <TrendingUp className='h-8 w-8 text-green-400' />
              </div>
              <h3 className='text-3xl font-bold text-white mb-2'>{stats.averageScore}</h3>
              <p className='text-gray-300 font-medium'>Average Score</p>
            </SpotlightCard>

            <SpotlightCard className='text-center bg-black/95 backdrop-blur-lg border-white/10' spotlightColor='rgba(59, 130, 246, 0.3)'>
              <div className='bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-blue-400/30'>
                <Globe className='h-8 w-8 text-blue-400' />
              </div>
              <h3 className='text-3xl font-bold text-white mb-2'>{stats.websitesTracked}</h3>
              <p className='text-gray-300 font-medium'>Websites Tracked</p>
            </SpotlightCard>

            <SpotlightCard className='text-center bg-black/95 backdrop-blur-lg border-white/10' spotlightColor='rgba(168, 85, 247, 0.3)'>
              <div className='bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-purple-400/30'>
                <FileText className='h-8 w-8 text-purple-400' />
              </div>
              <h3 className='text-3xl font-bold text-white mb-2'>{stats.reportsGenerated}</h3>
              <p className='text-gray-300 font-medium'>Reports Generated</p>
            </SpotlightCard>
          </div>
        </div>

        {/* Tabs */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative'>
          <nav className='flex space-x-1 bg-black/60 backdrop-blur-lg rounded-2xl p-1 border border-white/10 w-full mx-auto relative '>
            {/* Animated background slider */}
            <div
              className={`absolute top-1 bottom-1 bg-gradient-to-r from-blue-500/80 to-blue-600/80 backdrop-blur-md rounded-xl transition-all duration-500 ease-out border border-blue-400/50 shadow-lg ${
                activeTab === "audit" ? "left-1 w-[calc(50%-2px)]" : "left-[calc(50%+2px)] w-[calc(50%-2px)]"
              }`}
            />

            <button
              onClick={() => setActiveTab("audit")}
              className={`relative z-10 px-8 py-4 w-full  text-lg font-medium transition-all duration-300 ease-out rounded-xl ${
                activeTab === "audit" ? "text-white font-semibold" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Recent Audits
            </button>

            <button
              onClick={() => setActiveTab("reports")}
              className={`relative z-10 px-8 py-4 w-full text-lg font-medium transition-all duration-300 ease-out rounded-xl ${
                activeTab === "reports" ? "text-white font-semibold" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Reports
            </button>
          </nav>
        </div>

        {/* Recent Audits Tab */}
        {activeTab === "audit" && (
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='space-y-6'>
              {audits.map((audit) => (
                <SpotlightCard
                  key={audit.id}
                  className='bg-black/95 backdrop-blur-lg border-white/10 hover:border-white/20 transition-all cursor-pointer'
                  spotlightColor='rgba(255, 255, 255, 0.1)'
                  onClick={() => router.push(`/audit/${audit.id}`)}
                >
                  <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center'>
                      <div className='w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mr-4 ring-2 ring-blue-400/30'>
                        <Globe className='h-6 w-6 text-blue-400' />
                      </div>
                      <div>
                        <h3 className='font-semibold text-white text-xl mb-1'>{audit.websiteUrl}</h3>
                        <p className='text-gray-300 flex items-center'>
                          <Clock className='h-4 w-4 mr-2' />
                          {audit.createdAt}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <div
                        className={`w-16 h-16 rounded-full text-white text-xl font-bold bg-gradient-to-br ${getScoreBadgeColor(
                          audit.overallScore
                        )} shadow-lg ring-4 ring-white/20 flex items-center justify-center`}
                      >
                        {audit.overallScore}
                      </div>
                      <StarBorder
                        as='button'
                        color='rgba(255, 255, 255, 0.6)'
                        thickness={1}
                        className='px-4 py-2'
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/audit/${audit.id}`);
                        }}
                      >
                        View Details
                      </StarBorder>
                      <StarBorder
                        as='button'
                        color='rgba(255, 255, 255, 0.4)'
                        thickness={1}
                        className='px-4 py-2'
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadAuditPdf(audit.id, audit.websiteUrl);
                        }}
                      >
                        <Download className='h-4 w-4 mr-2' />
                        PDF Report
                      </StarBorder>
                    </div>
                  </div>

                  <div className='grid md:grid-cols-5 gap-4'>
                    <div className='text-center bg-black/60 rounded-lg p-4 border border-white/10'>
                      <div className='flex items-center justify-center mb-2 text-blue-400'>{getScoreIcon(audit.performance.score)}</div>
                      <div className='text-sm font-medium text-gray-300 mb-1'>Performance</div>
                      <div className='text-2xl font-bold text-white'>{audit.performance.score}</div>
                      {audit.performance?.loadTime && <div className='text-xs text-gray-400 mt-1'>{audit.performance.loadTime}ms</div>}
                    </div>
                    <div className='text-center bg-black/60 rounded-lg p-4 border border-white/10'>
                      <div className='flex items-center justify-center mb-2 text-green-400'>{getScoreIcon(audit.seo.score)}</div>
                      <div className='text-sm font-medium text-gray-300 mb-1'>SEO</div>
                      <div className='text-2xl font-bold text-white'>{audit.seo.score}</div>
                      {audit.content?.wordCount && <div className='text-xs text-gray-400 mt-1'>{audit.content.wordCount} words</div>}
                    </div>
                    <div className='text-center bg-black/60 rounded-lg p-4 border border-white/10'>
                      <div className='flex items-center justify-center mb-2 text-purple-400'>
                        {getScoreIcon(audit.mobileFriendly.score)}
                      </div>
                      <div className='text-sm font-medium text-gray-300 mb-1'>Mobile</div>
                      <div className='text-2xl font-bold text-white'>{audit.mobileFriendly.score}</div>
                      {audit.mobileFriendly?.issues?.length > 0 && (
                        <div className='text-xs text-red-400 mt-1'>{audit.mobileFriendly.issues.length} issues</div>
                      )}
                    </div>
                    <div className='text-center bg-black/60 rounded-lg p-4 border border-white/10'>
                      <div className='flex items-center justify-center mb-2 text-yellow-400'>{getScoreIcon(audit.technical.score)}</div>
                      <div className='text-sm font-medium text-gray-300 mb-1'>Technical</div>
                      <div className='text-2xl font-bold text-white'>{audit.technical.score}</div>
                      {audit.links?.broken > 0 && <div className='text-xs text-red-400 mt-1'>{audit.links.broken} broken</div>}
                    </div>
                    <div className='text-center bg-black/60 rounded-lg p-4 border border-white/10'>
                      <div className='flex items-center justify-center mb-2 text-pink-400'>{getScoreIcon(audit.content.score)}</div>
                      <div className='text-sm font-medium text-gray-300 mb-1'>Content</div>
                      <div className='text-2xl font-bold text-white'>{audit.content.score}</div>
                      {audit.images?.withoutAlt > 0 && (
                        <div className='text-xs text-red-400 mt-1'>{audit.images.withoutAlt} missing alt</div>
                      )}
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <SpotlightCard className='bg-black/95 backdrop-blur-lg border-white/10' spotlightColor='rgba(255, 255, 255, 0.1)'>
              <h3 className='text-2xl font-semibold mb-6 text-white'>
                <ShinyText text='Generated Reports' className='font-semibold' speed={7} />
              </h3>
              <div className='space-y-4'>
                {audits.map((audit) => (
                  <div
                    key={audit.id}
                    className='flex items-center justify-between p-6 bg-black/60 rounded-lg hover:bg-black/70 cursor-pointer transition-all border border-white/10 hover:border-white/20'
                    onClick={() => router.push(`/audit/${audit.id}`)}
                  >
                    <div className='flex items-center'>
                      <div className='w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mr-4 ring-2 ring-purple-400/30'>
                        <FileText className='h-5 w-5 text-purple-400' />
                      </div>
                      <div>
                        <div className='font-medium text-white text-lg'>SEO Report - {audit.websiteUrl}</div>
                        <div className='text-gray-300'>Generated on {audit.createdAt}</div>
                      </div>
                    </div>
                    <div className='flex space-x-3'>
                      <StarBorder
                        as='button'
                        color='rgba(255, 255, 255, 0.6)'
                        thickness={1}
                        className='px-4 py-2'
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/audit/${audit.id}`);
                        }}
                      >
                        View Details
                      </StarBorder>
                      <StarBorder
                        as='button'
                        color='rgba(255, 255, 255, 0.4)'
                        thickness={1}
                        className='px-4 flex items-center py-2'
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadAuditPdf(audit.id, audit.websiteUrl);
                        }}
                      >
                        <Download className='h-4 w-4 mr-2' />
                        Download PDF
                      </StarBorder>
                    </div>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </div>
        )}

        {/* Summary Drawer/Panel */}
        {selectedAudit && (
          <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end md:items-center md:justify-center z-50'>
            <SpotlightCard
              className='bg-black/95 backdrop-blur-lg border-white/20 w-full md:max-w-4xl mx-4 md:rounded-2xl shadow-2xl'
              spotlightColor='rgba(255, 255, 255, 0.2)'
            >
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-2xl font-semibold text-white'>
                  Audit Details - <ShinyText text={selectedAudit.websiteUrl} className='font-semibold' speed={6} />
                </h3>
                <StarBorder
                  as='button'
                  color='rgba(255, 255, 255, 0.6)'
                  thickness={1}
                  className='px-4 py-2'
                  onClick={() => {
                    setSelectedAudit(null);
                    setSummary(null);
                  }}
                >
                  Close
                </StarBorder>
              </div>

              {isSummaryLoading && (
                <div className='text-gray-300 text-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4'></div>
                  Loading...
                </div>
              )}

              {!isSummaryLoading && summary && (
                <div className='space-y-8'>
                  <div className='bg-black/60 rounded-lg p-6 border border-white/10'>
                    <h4 className='font-semibold mb-4 text-white text-lg'>Title Tag</h4>
                    <div className='text-gray-300 space-y-2'>
                      <div>
                        <span className='font-medium text-blue-400'>Title:</span> {summary.audit.meta.title || "(missing)"}
                      </div>
                      <div>
                        <span className='font-medium text-blue-400'>Length:</span> {summary.audit.meta.titleLength} chars
                      </div>
                    </div>
                  </div>

                  <div className='bg-black/60 rounded-lg p-6 border border-white/10'>
                    <h4 className='font-semibold mb-4 text-white text-lg'>Top Keywords</h4>
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                      {summary.audit.keywords?.length ? (
                        summary.audit.keywords.map((k) => (
                          <div
                            key={k.keyword}
                            className='px-4 py-3 bg-black/70 rounded-lg border border-white/10 text-sm flex items-center justify-between'
                          >
                            <span className='text-white'>{k.keyword}</span>
                            <span className='text-gray-400 font-medium'>{k.density}%</span>
                          </div>
                        ))
                      ) : (
                        <div className='text-gray-400 col-span-full text-center py-4'>No keywords extracted.</div>
                      )}
                    </div>
                  </div>

                  <div className='bg-black/60 rounded-lg p-6 border border-white/10'>
                    <h4 className='font-semibold mb-4 text-white text-lg'>Priority Issues</h4>
                    <ul className='space-y-3'>
                      {summary.priorityIssues?.slice(0, 5).map((it, idx) => (
                        <li key={idx} className='flex items-start space-x-3'>
                          <div className='w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0'></div>
                          <span className='text-gray-300'>
                            {it.category && <span className='text-yellow-400 font-medium'>{it.category}: </span>}
                            {it.issue}
                          </span>
                        </li>
                      ))}
                      {!summary.priorityIssues?.length && (
                        <li className='text-gray-400 text-center py-4'>No high-priority issues detected.</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </SpotlightCard>
          </div>
        )}
      </div>
    </div>
  );
}
