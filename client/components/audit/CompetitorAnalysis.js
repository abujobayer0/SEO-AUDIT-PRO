import { useState } from "react";
import { Users, Plus, Clock } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import SpotlightCard from "../SpotlightCard";

const CompetitorAnalysis = ({ auditId, competitors, setCompetitors }) => {
  const [newCompetitor, setNewCompetitor] = useState("");
  const [addingCompetitor, setAddingCompetitor] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const addCompetitor = async () => {
    if (!newCompetitor.trim()) {
      toast.error("Please enter a competitor URL");
      return;
    }

    setAddingCompetitor(true);
    try {
      const response = await api.post(`/audit/${auditId}/competitors`, {
        competitorUrl: newCompetitor.trim(),
      });

      setCompetitors((prev) => [...prev, response.data.competitor]);
      setNewCompetitor("");
      toast.success("Competitor added and analysis started!");
    } catch (error) {
      console.error("Failed to add competitor:", error);
      toast.error(error.message || "Failed to add competitor");
    } finally {
      setAddingCompetitor(false);
    }
  };

  const removeCompetitor = async (competitorId) => {
    try {
      await api.delete(`/audit/${auditId}/competitors/${competitorId}`);
      setCompetitors((prev) => prev.filter((c) => c.id !== competitorId));
      toast.success("Competitor removed");
    } catch (error) {
      console.error("Failed to remove competitor:", error);
      toast.error("Failed to remove competitor");
    }
  };

  return (
    <SpotlightCard className='bg-black/80 backdrop-blur-xl border-white/5 shadow-2xl mb-8' spotlightColor='rgba(168, 85, 247, 0.15)'>
      <h2 className='text-xl font-bold text-white mb-4 flex items-center'>
        <Users className='w-6 h-6 mr-2 text-orange-400' />
        Competitor Analysis
      </h2>

      {/* Add Competitor */}
      <div className='mb-6'>
        <div className='flex space-x-4'>
          <input
            type='url'
            value={newCompetitor}
            onChange={(e) => setNewCompetitor(e.target.value)}
            placeholder='Enter competitor URL (e.g., https://competitor.com)'
            className='flex-1 px-4 py-2 bg-black/40 backdrop-blur-lg border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-lg'
          />
          <button
            onClick={addCompetitor}
            disabled={addingCompetitor}
            className='bg-orange-500/80 text-white px-6 py-2 rounded-lg hover:bg-orange-500 disabled:opacity-50 flex items-center border border-orange-400/30'
          >
            <Plus className='w-4 h-4 mr-2' />
            {addingCompetitor ? "Adding..." : "Add Competitor"}
          </button>
        </div>
      </div>

      {/* Competitors List */}
      {competitors.length > 0 ? (
        <div className='space-y-4'>
          {competitors.map((competitor, index) => (
            <div key={competitor.id || index} className='bg-black/40 backdrop-blur-lg border border-white/10 rounded-lg p-4 shadow-lg'>
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <h3 className='font-semibold text-white'>{competitor.websiteUrl}</h3>
                  <p className='text-sm text-gray-400'>Added {new Date(competitor.createdAt).toLocaleDateString()}</p>
                </div>

                {competitor.overallScore && (
                  <div className='flex space-x-4 items-center'>
                    <div className='text-center'>
                      <div className={`text-2xl font-bold ${getScoreColor(competitor.overallScore)}`}>{competitor.overallScore}</div>
                      <p className='text-xs text-gray-400'>Overall</p>
                    </div>

                    <button onClick={() => removeCompetitor(competitor.id)} className='text-red-400 hover:text-red-300'>
                      Remove
                    </button>
                  </div>
                )}

                {!competitor.overallScore && (
                  <div className='text-yellow-400 flex items-center'>
                    <Clock className='w-4 h-4 mr-1' />
                    Analyzing...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-8 text-gray-400'>
          <Users className='w-16 h-16 mx-auto mb-4 text-gray-500' />
          <p>No competitors added yet</p>
          <p className='text-sm'>Add competitor URLs to compare performance</p>
        </div>
      )}
    </SpotlightCard>
  );
};

export default CompetitorAnalysis;
