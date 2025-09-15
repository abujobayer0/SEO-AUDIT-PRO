import { FileText } from "lucide-react";

const MetaTags = ({ meta, auditData }) => {
  return (
    <div className='bg-white rounded-lg shadow p-6'>
      <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
        <FileText className='w-6 h-6 mr-2 text-green-600' />
        Meta Tags
      </h2>
      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700'>Title Tag</label>
          <p className='text-gray-900 bg-gray-50 p-3 rounded mt-1'>{meta?.title || auditData.metaTags?.title || "Not found"}</p>
          <p className='text-sm text-gray-500 mt-1'>Length: {meta?.length || auditData.metaTags?.titleLength || 0} characters</p>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700'>Meta Description</label>
          <p className='text-gray-900 bg-gray-50 p-3 rounded mt-1'>{auditData.metaTags?.description || "Not found"}</p>
          <p className='text-sm text-gray-500 mt-1'>Length: {auditData.metaTags?.descriptionLength || 0} characters</p>
        </div>
      </div>
    </div>
  );
};

export default MetaTags;
