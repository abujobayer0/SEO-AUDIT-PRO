import { Search } from "lucide-react";
import SpotlightCard from "../SpotlightCard";

const ContentAnalysis = ({ contentData }) => {
  if (!contentData) return null;

  return (
    <SpotlightCard className='bg-black/80 backdrop-blur-xl border-white/5 shadow-2xl' spotlightColor='rgba(59, 130, 246, 0.15)'>
      <h2 className='text-xl font-bold text-white mb-4 flex items-center'>
        <Search className='w-6 h-6 mr-2 text-blue-400' />
        Content Analysis
      </h2>

      {/* Content Statistics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <div className='text-center'>
          <div className='text-2xl font-bold text-blue-400'>{contentData.wordCount || 0}</div>
          <p className='text-sm text-gray-300'>Words</p>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-green-400'>{contentData.characterCount || 0}</div>
          <p className='text-sm text-gray-300'>Characters</p>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-purple-400'>{contentData.sentenceCount || 0}</div>
          <p className='text-sm text-gray-300'>Sentences</p>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-orange-400'>{contentData.paragraphCount || 0}</div>
          <p className='text-sm text-gray-300'>Paragraphs</p>
        </div>
      </div>

      {/* Readability Score */}
      {contentData.readabilityScore && (
        <div className='mb-6'>
          <h3 className='text-lg font-semibold text-white mb-2'>Readability Score</h3>
          <div className='flex items-center'>
            <div className='flex-1 bg-gray-600 rounded-full h-2 mr-3'>
              <div
                className={`h-2 rounded-full ${
                  contentData.readabilityScore >= 80 ? "bg-green-500" : contentData.readabilityScore >= 60 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${contentData.readabilityScore}%` }}
              ></div>
            </div>
            <span className='text-sm font-medium text-white'>{contentData.readabilityScore}/100</span>
          </div>
          <p className='text-xs text-gray-400 mt-1'>
            {contentData.readabilityScore >= 80
              ? "Very Easy"
              : contentData.readabilityScore >= 60
              ? "Easy"
              : contentData.readabilityScore >= 40
              ? "Moderate"
              : contentData.readabilityScore >= 20
              ? "Difficult"
              : "Very Difficult"}
          </p>
        </div>
      )}

      {/* Top Keywords */}
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-white mb-3'>Top Keywords</h3>
        {contentData.topKeywords && contentData.topKeywords.length > 0 ? (
          <div className='space-y-2'>
            {contentData.topKeywords.map((keyword, index) => (
              <div
                key={index}
                className='flex items-center justify-between bg-black/40 backdrop-blur-lg p-3 rounded border border-white/5 shadow-lg'
              >
                <div className='flex items-center'>
                  <span className='text-white font-medium'>{keyword.keyword}</span>
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded ${
                      keyword.type === "word"
                        ? "bg-blue-100 text-blue-800"
                        : keyword.type === "bigram"
                        ? "bg-green-100 text-green-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {keyword.type}
                  </span>
                </div>
                <div className='text-right'>
                  <div className='text-blue-400 font-semibold'>{keyword.density}%</div>
                  <div className='text-xs text-gray-400'>{keyword.count} times</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-gray-400'>No keywords extracted</p>
        )}
      </div>

      {/* Content Quality Indicators */}
      {contentData.qualityIndicators && (
        <div className='mb-6'>
          <h3 className='text-lg font-semibold text-white mb-3'>Content Quality Indicators</h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div
              className={`p-3 rounded text-center border ${
                contentData.qualityIndicators.hasLists
                  ? "bg-green-500/20 text-green-400 border-green-400/30"
                  : "bg-red-500/20 text-red-400 border-red-400/30"
              }`}
            >
              <div className='text-lg font-bold'>{contentData.qualityIndicators.hasLists ? "✓" : "✗"}</div>
              <div className='text-sm'>Lists</div>
            </div>
            <div
              className={`p-3 rounded text-center border ${
                contentData.qualityIndicators.hasQuestions
                  ? "bg-green-500/20 text-green-400 border-green-400/30"
                  : "bg-red-500/20 text-red-400 border-red-400/30"
              }`}
            >
              <div className='text-lg font-bold'>{contentData.qualityIndicators.hasQuestions ? "✓" : "✗"}</div>
              <div className='text-sm'>Questions</div>
            </div>
            <div
              className={`p-3 rounded text-center border ${
                contentData.qualityIndicators.hasNumbers
                  ? "bg-green-500/20 text-green-400 border-green-400/30"
                  : "bg-red-500/20 text-red-400 border-red-400/30"
              }`}
            >
              <div className='text-lg font-bold'>{contentData.qualityIndicators.hasNumbers ? "✓" : "✗"}</div>
              <div className='text-sm'>Numbers</div>
            </div>
            <div
              className={`p-3 rounded text-center border ${
                contentData.qualityIndicators.hasLinks
                  ? "bg-green-500/20 text-green-400 border-green-400/30"
                  : "bg-red-500/20 text-red-400 border-red-400/30"
              }`}
            >
              <div className='text-lg font-bold'>{contentData.qualityIndicators.hasLinks ? "✓" : "✗"}</div>
              <div className='text-sm'>Links</div>
            </div>
          </div>
          {contentData.qualityIndicators.repetitivePhrases > 0 && (
            <div className='mt-3 p-3 bg-yellow-500/20 rounded border border-yellow-400/30'>
              <p className='text-sm text-yellow-400'>
                <strong>Repetitive Phrases:</strong> {contentData.qualityIndicators.repetitivePhrases} detected
              </p>
            </div>
          )}
        </div>
      )}

      {/* Freshness Analysis */}
      {contentData.freshnessAnalysis && (
        <div>
          <h3 className='text-lg font-semibold text-white mb-3'>Content Freshness</h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div
              className={`p-3 rounded text-center border ${
                contentData.freshnessAnalysis.isRecent
                  ? "bg-green-500/20 text-green-400 border-green-400/30"
                  : "bg-red-500/20 text-red-400 border-red-400/30"
              }`}
            >
              <div className='text-lg font-bold'>{contentData.freshnessAnalysis.isRecent ? "✓" : "✗"}</div>
              <div className='text-sm'>Recent Content</div>
            </div>
            <div
              className={`p-3 rounded text-center border ${
                contentData.freshnessAnalysis.hasDates
                  ? "bg-green-500/20 text-green-400 border-green-400/30"
                  : "bg-red-500/20 text-red-400 border-red-400/30"
              }`}
            >
              <div className='text-lg font-bold'>{contentData.freshnessAnalysis.hasDates ? "✓" : "✗"}</div>
              <div className='text-sm'>Has Dates</div>
            </div>
            <div
              className={`p-3 rounded text-center border ${
                contentData.freshnessAnalysis.hasTimeReferences
                  ? "bg-green-500/20 text-green-400 border-green-400/30"
                  : "bg-red-500/20 text-red-400 border-red-400/30"
              }`}
            >
              <div className='text-lg font-bold'>{contentData.freshnessAnalysis.hasTimeReferences ? "✓" : "✗"}</div>
              <div className='text-sm'>Time References</div>
            </div>
          </div>
        </div>
      )}
    </SpotlightCard>
  );
};

export default ContentAnalysis;
