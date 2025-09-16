import { FileText, Sparkles } from "lucide-react";
import { useState } from "react";
import SpotlightCard from "../SpotlightCard";
import api from "@/lib/api";

const MetaTags = ({ meta, auditData, keywords = [], hideAiActions = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [variants, setVariants] = useState([]);

  const currentTitle = meta?.title || auditData.metaTags?.title || "";
  const currentDescription = auditData.metaTags?.description || "";
  const descriptionLength = auditData.metaTags?.descriptionLength || 0;
  const titleLength = meta?.length || auditData.metaTags?.titleLength || 0;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError("");
      setVariants([]);

      const resp = await api.post("/ai/meta-suggestions", {
        url: auditData?.url || auditData?.finalUrl || auditData?.websiteUrl || auditData?.auditUrl || "",
        title: currentTitle,
        description: currentDescription,
        keywords: (auditData?.keywords || keywords || []).filter(Boolean),
        auditContext: JSON.stringify({
          score: auditData?.overallScore,
          headings: auditData?.headings,
          h1: auditData?.headings?.h1,
          h2: auditData?.headings?.h2,
          pageTitle: currentTitle,
          metaDescription: currentDescription,
        }),
      });

      setVariants(resp?.data?.variants || []);
    } catch (e) {
      setError(e.message || "Failed to generate suggestions");
    } finally {
      setLoading(false);
    }
  };
  return (
    <SpotlightCard className='bg-black/80 backdrop-blur-xl border-white/5 shadow-2xl' spotlightColor='rgba(34, 197, 94, 0.15)'>
      <h2 className='text-xl font-bold text-white mb-4 flex items-center'>
        <FileText className='w-6 h-6 mr-2 text-green-400' />
        Meta Tags
      </h2>
      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-300'>Title Tag</label>
          <p className='text-white bg-black/40 backdrop-blur-lg p-3 rounded mt-1 border border-white/5 shadow-lg'>
            {currentTitle || "Not found"}
          </p>
          <p className='text-sm text-gray-400 mt-1'>Length: {titleLength} characters</p>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-300'>Meta Description</label>
          <p className='text-white bg-black/40 backdrop-blur-lg p-3 rounded mt-1 border border-white/5 shadow-lg'>
            {currentDescription || "Not found"}
          </p>
          <p className='text-sm text-gray-400 mt-1'>Length: {descriptionLength} characters</p>
        </div>

        {!hideAiActions && (
          <div className='pt-2'>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-60 text-black font-semibold shadow'
            >
              <Sparkles className='w-4 h-4' />
              {loading ? "Generating..." : "Generate Suggestions"}
            </button>
          </div>
        )}

        {!hideAiActions && (error ? <p className='text-red-400 text-sm'>{error}</p> : null)}

        {!hideAiActions && variants?.length ? (
          <div className='mt-4 grid gap-3'>
            {variants.map((v, idx) => (
              <div key={idx} className='rounded-xl border border-white/10 p-4 bg-black/40'>
                <div className='text-xs text-gray-400 mb-2'>Variant {idx + 1}</div>
                {v.title ? (
                  <div className='mb-2'>
                    <div className='text-gray-300 text-xs'>Title</div>
                    <div className='text-white'>{v.title}</div>
                    <div className='text-gray-500 text-xs mt-1'>Chars: {v.title.length}</div>
                  </div>
                ) : null}
                {v.description ? (
                  <div className='mb-2'>
                    <div className='text-gray-300 text-xs'>Description</div>
                    <div className='text-white'>{v.description}</div>
                    <div className='text-gray-500 text-xs mt-1'>Chars: {v.description.length}</div>
                  </div>
                ) : null}
                {v.rationale ? <div className='text-gray-400 text-xs'>Reason: {v.rationale}</div> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </SpotlightCard>
  );
};

export default MetaTags;
