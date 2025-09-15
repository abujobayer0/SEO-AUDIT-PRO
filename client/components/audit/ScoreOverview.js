import { Monitor, Search, Smartphone, Accessibility, Settings } from "lucide-react";

const ScoreOverview = ({ auditData }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const scoreCards = [
    {
      icon: Monitor,
      title: "Performance",
      score: auditData.performance?.score || 0,
      color: "text-blue-600",
    },
    {
      icon: Search,
      title: "SEO",
      score: auditData.seo?.score || 0,
      color: "text-green-600",
    },
    {
      icon: Smartphone,
      title: "Mobile",
      score: auditData.mobileFriendly?.score || 0,
      color: "text-purple-600",
    },
    {
      icon: Accessibility,
      title: "Accessibility",
      score: auditData.accessibility?.score || 0,
      color: "text-orange-600",
    },
    {
      icon: Settings,
      title: "Technical",
      score: auditData.technical?.score || 0,
      color: "text-gray-600",
    },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-5 gap-6 mb-8'>
      {scoreCards.map(({ icon: Icon, title, score, color }) => (
        <div key={title} className='bg-white rounded-lg shadow p-6 text-center'>
          <Icon className={`w-8 h-8 ${color} mx-auto mb-2`} />
          <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
          <div className={`text-3xl font-bold mt-2 ${getScoreColor(score)}`}>{score}</div>
        </div>
      ))}
    </div>
  );
};

export default ScoreOverview;
