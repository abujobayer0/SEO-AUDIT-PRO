import { Monitor, Search, Smartphone, Accessibility, Settings } from "lucide-react";
import SpotlightCard from "../SpotlightCard";

const ScoreOverview = ({ auditData }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const scoreCards = [
    {
      icon: Monitor,
      title: "Performance",
      score: auditData.performance?.score || 0,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      ringColor: "ring-blue-400/30",
    },
    {
      icon: Search,
      title: "SEO",
      score: auditData.seo?.score || 0,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      ringColor: "ring-green-400/30",
    },
    {
      icon: Smartphone,
      title: "Mobile",
      score: auditData.mobileFriendly?.score || 0,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      ringColor: "ring-purple-400/30",
    },
    {
      icon: Accessibility,
      title: "Accessibility",
      score: auditData.accessibility?.score || 0,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
      ringColor: "ring-orange-400/30",
    },
    {
      icon: Settings,
      title: "Technical",
      score: auditData.technical?.score || 0,
      color: "text-gray-400",
      bgColor: "bg-gray-500/20",
      ringColor: "ring-gray-400/30",
    },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-5 gap-6 mb-8'>
      {scoreCards.map(({ icon: Icon, title, score, color, bgColor, ringColor }) => (
        <SpotlightCard
          key={title}
          className='text-center bg-black/80 backdrop-blur-xl border-white/5 shadow-2xl'
          spotlightColor='rgba(255, 255, 255, 0.05)'
        >
          <div className={`${bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ${ringColor}`}>
            <Icon className={`w-8 h-8 ${color}`} />
          </div>
          <h3 className='text-lg font-semibold text-white mb-2'>{title}</h3>
          <div className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</div>
        </SpotlightCard>
      ))}
    </div>
  );
};

export default ScoreOverview;
