import Link from "next/link";
import { ArrowLeft, Download, Globe, Clock, BarChart3 } from "lucide-react";
import StarBorder from "../StarBorder";
import SpotlightCard from "../SpotlightCard";

const AuditHeader = ({ audit, onDownloadPdf }) => {
  const getScoreBadgeColor = (score) => {
    if (score >= 80) return "from-green-400 to-green-600";
    if (score >= 60) return "from-yellow-400 to-yellow-600";
    return "from-red-400 to-red-600";
  };

  return (
    <>
      {/* Header */}
      <header className='bg-black/40 backdrop-blur-2xl w-[90%] rounded-full absolute shadow-2xl border border-white/10 top-4 left-1/2 transform -translate-x-1/2 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-3'>
            <div className='flex items-center space-x-6'>
              <Link href={"/"}>
                <div className='flex items-center'>
                  <BarChart3 className='h-8 w-8 text-white' />
                  <span className='ml-2 text-xl font-bold text-white'>SEO Audit Pro</span>
                </div>
              </Link>
            </div>
            <div className='flex items-center space-x-4'>
              <StarBorder as='button' onClick={onDownloadPdf} color='rgba(255, 255, 255, 0.6)' thickness={1} className='px-6 py-3'>
                <Download className='w-4 h-4 mr-2' />
                Download PDF
              </StarBorder>{" "}
              <StarBorder
                as={Link}
                href='/dashboard'
                color='rgba(255, 255, 255, 0.4)'
                thickness={1}
                className='px-4 py-2 flex items-center'
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Back to Dashboard
              </StarBorder>
            </div>
          </div>
        </div>
      </header>

      {/* Website Header */}
      <div className='pt-24 max-w-7xl mx-auto  relative '>
        <SpotlightCard
          className='bg-black/40 backdrop-blur-2xl border-white/10 mx-4 sm:mx-6 lg:mx-8 mt-16 shadow-2xl'
          spotlightColor='rgba(59, 130, 246, 0.3)'
        >
          <div className='flex items-center justify-between p-4 relative z-10'>
            <div className='flex items-center space-x-6'>
              <div className='flex-shrink-0'>
                <div className='w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center ring-2 ring-blue-400/30'>
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
        </SpotlightCard>
      </div>
    </>
  );
};

export default AuditHeader;
