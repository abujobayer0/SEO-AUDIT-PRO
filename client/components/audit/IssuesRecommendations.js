import { AlertTriangle, CheckCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import SpotlightCard from "../SpotlightCard";
import api from "@/lib/api";

const IssuesRecommendations = ({ auditData }) => {
  const issuesCategories = [
    { category: "Performance", issues: auditData.performance?.issues || [] },
    { category: "SEO", issues: auditData.seo?.issues || [] },
    { category: "Mobile", issues: auditData.mobileFriendly?.issues || [] },
    { category: "Technical", issues: auditData.technical?.issues || [] },
    { category: "Content", issues: auditData.content?.issues || [] },
  ];

  const suggestionsCategories = [
    { category: "Performance", suggestions: auditData.performance?.suggestions || [] },
    { category: "SEO", suggestions: auditData.seo?.suggestions || [] },
    { category: "Mobile", suggestions: auditData.mobileFriendly?.suggestions || [] },
    { category: "Technical", suggestions: auditData.technical?.suggestions || [] },
    { category: "Content", suggestions: auditData.content?.suggestions || [] },
  ];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ai, setAi] = useState(null);

  const handleSeoAnalyze = async () => {
    try {
      setLoading(true);
      setError("");
      setAi(null);
      const { data } = await api.post("/ai/seo-analyze", {
        websiteUrl: auditData?.websiteUrl || auditData?.url || auditData?.finalUrl || "",
        seo: auditData?.seo,
        content: auditData?.content,
        meta: auditData?.meta || auditData?.metaTags,
        keywords: auditData?.keywords || [],
      });
      setAi(data);
    } catch (e) {
      setError(e.message || "Failed to get AI SEO analysis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
      {/* Issues */}
      <SpotlightCard className='bg-black/80 backdrop-blur-xl border-white/5 shadow-2xl' spotlightColor='rgba(239, 68, 68, 0.15)'>
        <h2 className='text-xl font-bold text-white mb-4 flex items-center'>
          <AlertTriangle className='w-6 h-6 mr-2 text-red-400' />
          Issues Found
        </h2>
        <div className='space-y-4'>
          {issuesCategories.map(
            ({ category, issues }) =>
              issues.length > 0 && (
                <div key={category}>
                  <h3 className='font-semibold text-white mb-2'>{category}</h3>
                  <ul className='space-y-1 ml-4'>
                    {issues.map((issue, index) => (
                      <li key={index} className='text-red-400 text-sm'>
                        • {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )
          )}
        </div>
      </SpotlightCard>

      {/* Recommendations */}
      <SpotlightCard className='bg-black/80 backdrop-blur-xl border-white/5 shadow-2xl' spotlightColor='rgba(34, 197, 94, 0.15)'>
        <h2 className='text-xl font-bold text-white mb-4 flex items-center'>
          <CheckCircle className='w-6 h-6 mr-2 text-green-400' />
          Recommendations
        </h2>
        <div className='space-y-4'>
          {suggestionsCategories.map(
            ({ category, suggestions }) =>
              suggestions.length > 0 && (
                <div key={category}>
                  <h3 className='font-semibold text-white mb-2'>{category}</h3>
                  <ul className='space-y-1 ml-4'>
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className='text-green-400 text-sm'>
                        • {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )
          )}
        </div>
        <div className='pt-3'>
          <button
            onClick={handleSeoAnalyze}
            disabled={loading}
            className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-60 text-black font-semibold shadow'
          >
            <Sparkles className='w-4 h-4' />
            {loading ? "Analyzing..." : "AI SEO Deep Analysis"}
          </button>
          {error ? <p className='text-red-400 text-sm mt-2'>{error}</p> : null}

          {ai && (
            <div className='mt-4 space-y-3'>
              {ai.summary && <div className='bg-black/40 border border-white/10 p-4 rounded-lg text-gray-200'>{ai.summary}</div>}
              {Array.isArray(ai.quickWins) && ai.quickWins.length > 0 && (
                <div className='bg-black/40 border border-white/10 p-4 rounded-lg'>
                  <div className='text-white font-semibold mb-2'>Quick Wins</div>
                  <ul className='list-disc ml-5 text-gray-200 space-y-1'>
                    {ai.quickWins.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(ai.deepIssues) && ai.deepIssues.length > 0 && (
                <div className='bg-black/40 border border-white/10 p-4 rounded-lg'>
                  <div className='text-white font-semibold mb-2'>Deep Issues</div>
                  <ul className='list-disc ml-5 text-gray-200 space-y-1'>
                    {ai.deepIssues.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(ai.recommendations) && ai.recommendations.length > 0 && (
                <div className='bg-black/40 border border-white/10 p-4 rounded-lg'>
                  <div className='text-white font-semibold mb-2'>Recommendations</div>
                  <ul className='list-disc ml-5 text-gray-200 space-y-1'>
                    {ai.recommendations.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </SpotlightCard>
    </div>
  );
};

export default IssuesRecommendations;
