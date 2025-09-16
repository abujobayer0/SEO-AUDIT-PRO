import { TrendingUp, AlertTriangle, CheckCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import SpotlightCard from "../SpotlightCard";
import api from "@/lib/api";

const PerformanceMetrics = ({ performanceData, websiteUrl }) => {
  if (!performanceData) return null;

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiResult, setAiResult] = useState(null);

  const handleExplain = async () => {
    try {
      setAiLoading(true);
      setAiError("");
      setAiResult(null);
      const { data } = await api.post("/ai/perf-explain", {
        websiteUrl: websiteUrl || "",
        performance: performanceData,
      });
      setAiResult(data);
    } catch (e) {
      setAiError(e.message || "Failed to get AI analysis");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <SpotlightCard className='bg-black/80 backdrop-blur-xl border-white/5 shadow-2xl mb-8' spotlightColor='rgba(59, 130, 246, 0.15)'>
      <h2 className='text-xl font-bold text-white mb-6 flex items-center'>
        <TrendingUp className='w-6 h-6 mr-2 text-blue-400' />
        Performance Metrics
      </h2>

      {/* Core Web Vitals */}
      {performanceData.coreWebVitals && (
        <div className='mb-6'>
          <h3 className='text-lg font-semibold text-white mb-4'>Core Web Vitals</h3>
          <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4'>
            {Object.entries(performanceData.coreWebVitals).map(([key, value]) => (
              <div key={key} className='bg-black/40 backdrop-blur-lg p-4 rounded-lg border border-white/5 shadow-lg'>
                <p className='text-sm text-gray-300 capitalize'>{key.replace(/([A-Z])/g, " $1").trim()}</p>
                <p className='text-lg font-semibold text-white'>
                  {typeof value === "number"
                    ? key.includes("Time") || key.includes("Paint")
                      ? `${Math.round(value)}ms`
                      : key.includes("Shift")
                      ? value.toFixed(3)
                      : Math.round(value)
                    : value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Performance Metrics */}
      {performanceData.metrics && (
        <div className='mb-6'>
          <h3 className='text-lg font-semibold text-white mb-4'>Detailed Performance Metrics</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='bg-blue-500/20 p-4 rounded-lg border border-blue-400/30'>
              <p className='text-sm text-blue-400'>DOM Content Loaded</p>
              <p className='text-lg font-semibold text-white'>{performanceData.metrics.domContentLoaded}ms</p>
            </div>
            <div className='bg-green-500/20 p-4 rounded-lg border border-green-400/30'>
              <p className='text-sm text-green-400'>Load Complete</p>
              <p className='text-lg font-semibold text-white'>{performanceData.metrics.loadComplete}ms</p>
            </div>
            <div className='bg-purple-500/20 p-4 rounded-lg border border-purple-400/30'>
              <p className='text-sm text-purple-400'>DNS Time</p>
              <p className='text-lg font-semibold text-white'>{performanceData.metrics.dnsTime}ms</p>
            </div>
            <div className='bg-orange-500/20 p-4 rounded-lg border border-orange-400/30'>
              <p className='text-sm text-orange-400'>TCP Time</p>
              <p className='text-lg font-semibold text-white'>{performanceData.metrics.tcpTime}ms</p>
            </div>
            <div className='bg-red-500/20 p-4 rounded-lg border border-red-400/30'>
              <p className='text-sm text-red-400'>Request Time</p>
              <p className='text-lg font-semibold text-white'>{performanceData.metrics.requestTime}ms</p>
            </div>
            <div className='bg-yellow-500/20 p-4 rounded-lg border border-yellow-400/30'>
              <p className='text-sm text-yellow-400'>Response Time</p>
              <p className='text-lg font-semibold text-white'>{performanceData.metrics.responseTime}ms</p>
            </div>
            <div className='bg-indigo-500/20 p-4 rounded-lg border border-indigo-400/30'>
              <p className='text-sm text-indigo-400'>Redirect Time</p>
              <p className='text-lg font-semibold text-white'>{performanceData.metrics.redirectTime}ms</p>
            </div>
            <div className='bg-pink-500/20 p-4 rounded-lg border border-pink-400/30'>
              <p className='text-sm text-pink-400'>DOM Interactive</p>
              <p className='text-lg font-semibold text-white'>{performanceData.metrics.domInteractive}ms</p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Issues & Suggestions */}
      {(performanceData.issues?.length > 0 || performanceData.suggestions?.length > 0) && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {performanceData.issues?.length > 0 && (
            <div className='bg-black/40 backdrop-blur-lg p-6 rounded-lg border border-white/5 shadow-lg'>
              <h3 className='text-lg font-semibold text-white mb-3'>Performance Issues</h3>
              <ul className='space-y-2'>
                {performanceData.issues.map((issue, index) => (
                  <li key={index} className='flex items-start text-red-400'>
                    <AlertTriangle className='w-4 h-4 mr-2 mt-0.5 flex-shrink-0' />
                    <span className='text-sm text-gray-300'>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {performanceData.suggestions?.length > 0 && (
            <div className='bg-black/40 backdrop-blur-lg p-6 rounded-lg border border-white/5 shadow-lg'>
              <h3 className='text-lg font-semibold text-white mb-3'>Performance Suggestions</h3>
              <ul className='space-y-2'>
                {performanceData.suggestions.map((suggestion, index) => (
                  <li key={index} className='flex items-start text-green-400'>
                    <CheckCircle className='w-4 h-4 mr-2 mt-0.5 flex-shrink-0' />
                    <span className='text-sm text-gray-300'>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className='mt-6'>
        <button
          onClick={handleExplain}
          disabled={aiLoading}
          className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-black font-semibold shadow'
        >
          <Sparkles className='w-4 h-4' />
          {aiLoading ? "Analyzing..." : "AI Explain & Fixes"}
        </button>
        {aiError ? <p className='text-red-400 text-sm mt-2'>{aiError}</p> : null}

        {aiResult && (
          <div className='mt-4 space-y-3'>
            {aiResult.summary && <div className='bg-black/40 border border-white/10 p-4 rounded-lg text-gray-200'>{aiResult.summary}</div>}
            {Array.isArray(aiResult.actions) && aiResult.actions.length > 0 && (
              <div className='bg-black/40 border border-white/10 p-4 rounded-lg'>
                <div className='text-white font-semibold mb-2'>Priority Actions</div>
                <ul className='list-disc ml-5 text-gray-200 space-y-1'>
                  {aiResult.actions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </SpotlightCard>
  );
};

export default PerformanceMetrics;
