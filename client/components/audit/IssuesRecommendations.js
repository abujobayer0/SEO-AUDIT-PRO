import { AlertTriangle, CheckCircle } from "lucide-react";

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
      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
          <AlertTriangle className='w-6 h-6 mr-2 text-red-600' />
          Issues Found
        </h2>
        <div className='space-y-4'>
          {issuesCategories.map(
            ({ category, issues }) =>
              issues.length > 0 && (
                <div key={category}>
                  <h3 className='font-semibold text-gray-900 mb-2'>{category}</h3>
                  <ul className='space-y-1 ml-4'>
                    {issues.map((issue, index) => (
                      <li key={index} className='text-red-600 text-sm'>
                        • {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
          <CheckCircle className='w-6 h-6 mr-2 text-green-600' />
          Recommendations
        </h2>
        <div className='space-y-4'>
          {suggestionsCategories.map(
            ({ category, suggestions }) =>
              suggestions.length > 0 && (
                <div key={category}>
                  <h3 className='font-semibold text-gray-900 mb-2'>{category}</h3>
                  <ul className='space-y-1 ml-4'>
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className='text-green-600 text-sm'>
                        • {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
};

export default IssuesRecommendations;
