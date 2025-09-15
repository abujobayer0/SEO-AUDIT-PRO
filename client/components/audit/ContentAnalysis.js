import { Search } from "lucide-react";

const ContentAnalysis = ({ contentData }) => {
  if (!contentData) return null;

  return (
    <div className='bg-white rounded-lg shadow p-6'>
      <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
        <Search className='w-6 h-6 mr-2 text-blue-600' />
        Content Analysis
      </h2>

      {/* Content Statistics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <div className='text-center'>
          <div className='text-2xl font-bold text-blue-600'>{contentData.wordCount || 0}</div>
          <p className='text-sm text-gray-600'>Words</p>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-green-600'>{contentData.characterCount || 0}</div>
          <p className='text-sm text-gray-600'>Characters</p>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-purple-600'>{contentData.sentenceCount || 0}</div>
          <p className='text-sm text-gray-600'>Sentences</p>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-orange-600'>{contentData.paragraphCount || 0}</div>
          <p className='text-sm text-gray-600'>Paragraphs</p>
        </div>
      </div>

      {/* Readability Score */}
      {contentData.readabilityScore && (
        <div className='mb-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>Readability Score</h3>
          <div className='flex items-center'>
            <div className='flex-1 bg-gray-200 rounded-full h-2 mr-3'>
              <div
                className={`h-2 rounded-full ${
                  contentData.readabilityScore >= 80 ? "bg-green-500" : contentData.readabilityScore >= 60 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${contentData.readabilityScore}%` }}
              ></div>
            </div>
            <span className='text-sm font-medium text-gray-700'>{contentData.readabilityScore}/100</span>
          </div>
          <p className='text-xs text-gray-500 mt-1'>
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
        <h3 className='text-lg font-semibold text-gray-900 mb-3'>Top Keywords</h3>
        {contentData.topKeywords && contentData.topKeywords.length > 0 ? (
          <div className='space-y-2'>
            {contentData.topKeywords.slice(0, 10).map((keyword, index) => (
              <div key={index} className='flex items-center justify-between bg-gray-50 p-3 rounded'>
                <div className='flex items-center'>
                  <span className='text-gray-900 font-medium'>{keyword.keyword}</span>
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
                  <div className='text-blue-600 font-semibold'>{keyword.density}%</div>
                  <div className='text-xs text-gray-500'>{keyword.count} times</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-gray-500'>No keywords extracted</p>
        )}
      </div>

      {/* Content Quality Indicators */}
      {contentData.qualityIndicators && (
        <div className='mb-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-3'>Content Quality Indicators</h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div
              className={`p-3 rounded text-center ${
                contentData.qualityIndicators.hasLists ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              <div className='text-lg font-bold'>{contentData.qualityIndicators.hasLists ? "✓" : "✗"}</div>
              <div className='text-sm'>Lists</div>
            </div>
            <div
              className={`p-3 rounded text-center ${
                contentData.qualityIndicators.hasQuestions ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              <div className='text-lg font-bold'>{contentData.qualityIndicators.hasQuestions ? "✓" : "✗"}</div>
              <div className='text-sm'>Questions</div>
            </div>
            <div
              className={`p-3 rounded text-center ${
                contentData.qualityIndicators.hasNumbers ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              <div className='text-lg font-bold'>{contentData.qualityIndicators.hasNumbers ? "✓" : "✗"}</div>
              <div className='text-sm'>Numbers</div>
            </div>
            <div
              className={`p-3 rounded text-center ${
                contentData.qualityIndicators.hasLinks ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              <div className='text-lg font-bold'>{contentData.qualityIndicators.hasLinks ? "✓" : "✗"}</div>
              <div className='text-sm'>Links</div>
            </div>
          </div>
          {contentData.qualityIndicators.repetitivePhrases > 0 && (
            <div className='mt-3 p-3 bg-yellow-50 rounded'>
              <p className='text-sm text-yellow-700'>
                <strong>Repetitive Phrases:</strong> {contentData.qualityIndicators.repetitivePhrases} detected
              </p>
            </div>
          )}
        </div>
      )}

      {/* Freshness Analysis */}
      {contentData.freshnessAnalysis && (
        <div>
          <h3 className='text-lg font-semibold text-gray-900 mb-3'>Content Freshness</h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div
              className={`p-3 rounded text-center ${
                contentData.freshnessAnalysis.isRecent ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              <div className='text-lg font-bold'>{contentData.freshnessAnalysis.isRecent ? "✓" : "✗"}</div>
              <div className='text-sm'>Recent Content</div>
            </div>
            <div
              className={`p-3 rounded text-center ${
                contentData.freshnessAnalysis.hasDates ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              <div className='text-lg font-bold'>{contentData.freshnessAnalysis.hasDates ? "✓" : "✗"}</div>
              <div className='text-sm'>Has Dates</div>
            </div>
            <div
              className={`p-3 rounded text-center ${
                contentData.freshnessAnalysis.hasTimeReferences ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              <div className='text-lg font-bold'>{contentData.freshnessAnalysis.hasTimeReferences ? "✓" : "✗"}</div>
              <div className='text-sm'>Time References</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentAnalysis;
