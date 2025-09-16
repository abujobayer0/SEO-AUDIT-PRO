import { FileText } from "lucide-react";
import SpotlightCard from "../SpotlightCard";

const MetaTags = ({ meta, auditData }) => {
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
            {meta?.title || auditData.metaTags?.title || "Not found"}
          </p>
          <p className='text-sm text-gray-400 mt-1'>Length: {meta?.length || auditData.metaTags?.titleLength || 0} characters</p>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-300'>Meta Description</label>
          <p className='text-white bg-black/40 backdrop-blur-lg p-3 rounded mt-1 border border-white/5 shadow-lg'>
            {auditData.metaTags?.description || "Not found"}
          </p>
          <p className='text-sm text-gray-400 mt-1'>Length: {auditData.metaTags?.descriptionLength || 0} characters</p>
        </div>
      </div>
    </SpotlightCard>
  );
};

export default MetaTags;
