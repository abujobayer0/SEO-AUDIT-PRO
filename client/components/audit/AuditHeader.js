import Link from "next/link";
import { ArrowLeft, Download, Globe, Clock, BarChart3 } from "lucide-react";
import StarBorder from "../StarBorder";

const AuditHeader = ({ audit, onDownloadPdf }) => {
  const getScoreBadgeColor = (score) => {
    if (score >= 80) return "from-green-400 to-green-600";
    if (score >= 60) return "from-yellow-400 to-yellow-600";
    return "from-red-400 to-red-600";
  };

  return (
    <>
      {/* Header */}
      <header className='bg-black/30 backdrop-blur-md border-b border-white/10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div className='flex items-center space-x-6'>
              <div className='flex items-center'>
                <BarChart3 className='h-8 w-8 text-white' />
                <span className='ml-2 text-xl font-bold text-white'>SEO Audit Pro</span>
              </div>
              <Link href='/dashboard' className='flex items-center text-gray-300 hover:text-white transition-colors'>
                <ArrowLeft className='w-5 h-5 mr-2' />
                Back to Dashboard
              </Link>
            </div>
            <div className='flex items-center space-x-4'>
              <StarBorder as='button' onClick={onDownloadPdf} color='rgba(255, 255, 255, 0.6)' thickness={1} className='px-6 py-3'>
                <Download className='w-4 h-4 mr-2' />
                Download PDF
              </StarBorder>
            </div>
          </div>
        </div>
      </header>

      {/* Website Header */}
      <div className='bg-black/20 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl p-8 mb-8 mx-4 sm:mx-6 lg:mx-8 mt-8'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-6'>
            <div className='flex-shrink-0'>
              <div className='w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center'>
                <Globe className='w-8 h-8 text-white' />
              </div>
            </div>
            <div>
              <h1 className='text-3xl font-bold text-white mb-2'>{audit.websiteUrl}</h1>
              <p className='text-gray-300 flex items-center text-lg'>
                <Clock className='w-5 h-5 mr-2' />
                Analyzed on {new Date(audit.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className='text-center'>
            <div
              className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-white text-3xl font-bold bg-gradient-to-br ${getScoreBadgeColor(
                audit.overallScore
              )} shadow-lg ring-4 ring-white/20`}
            >
              {audit.overallScore}
            </div>
            <p className='text-sm text-gray-300 mt-3 font-medium'>Overall Score</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuditHeader;
