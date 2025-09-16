import { AlertTriangle, CheckCircle } from "lucide-react";
import SpotlightCard from "../SpotlightCard";

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
      </SpotlightCard>
    </div>
  );
};

export default IssuesRecommendations;
