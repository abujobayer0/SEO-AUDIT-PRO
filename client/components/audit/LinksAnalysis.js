import { ExternalLink, AlertTriangle, CheckCircle } from "lucide-react";
import SpotlightCard from "../SpotlightCard";

const LinksAnalysis = ({ linksData }) => {
  if (!linksData) return null;

  const linksNoTextIssue = (linksData.issues || []).find((i) => /links without descriptive text/i.test(i));
  const linksNoTextCount = linksNoTextIssue ? parseInt(linksNoTextIssue, 10) || 0 : 0;

  return (
    <SpotlightCard className='bg-black/80 backdrop-blur-xl border-white/5 shadow-2xl mb-8' spotlightColor='rgba(34, 197, 94, 0.15)'>
      <h2 className='text-xl font-bold text-white mb-4 flex items-center'>
        <ExternalLink className='w-6 h-6 mr-2 text-green-400' />
        Links Analysis ({linksData.total || 0} links found)
      </h2>

      {/* Enhanced Statistics */}
      <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6'>
        <div className='text-center'>
          <div className='text-2xl font-bold text-blue-400'>{linksData.total || 0}</div>
          <p className='text-sm text-gray-300'>Total Links</p>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-green-400'>{linksData.external || 0}</div>
          <p className='text-sm text-gray-300'>External</p>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-blue-400'>{linksData.internal || 0}</div>
          <p className='text-sm text-gray-300'>Internal</p>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-purple-400'>{linksData.anchor || 0}</div>
          <p className='text-sm text-gray-300'>Anchor</p>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-red-400'>{linksData.broken || 0}</div>
          <p className='text-sm text-gray-300'>Broken</p>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-yellow-400'>{linksData.noFollow || 0}</div>
          <p className='text-sm text-gray-300'>NoFollow</p>
        </div>
      </div>

      {/* Link Analysis Details */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <div className='bg-blue-500/20 p-4 rounded-lg text-center border border-blue-400/30'>
          <div className='text-lg font-bold text-white'>{linksData.opensInNewTab || 0}</div>
          <p className='text-sm text-blue-400'>Open in New Tab</p>
        </div>
        <div className='bg-red-500/20 p-4 rounded-lg text-center border border-red-400/30'>
          <div className='text-lg font-bold text-white'>{linksData.insecure || 0}</div>
          <p className='text-sm text-red-400'>Insecure HTTP</p>
        </div>
        <div className='bg-orange-500/20 p-4 rounded-lg text-center border border-orange-400/30'>
          <div className='text-lg font-bold text-white'>{linksData.withoutTextCount || 0}</div>
          <p className='text-sm text-orange-400'>Without Text</p>
        </div>
      </div>

      {/* Link Analysis Summary */}
      {linksData.analysis && (
        <div className='mb-6'>
          <h3 className='text-lg font-semibold text-white mb-3'>Link Analysis Summary</h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-black/60 p-4 rounded-lg border border-white/10'>
              <div className='text-sm text-gray-300'>Link Density</div>
              <div className='text-lg font-bold text-white'>{linksData.analysis.linkDensity?.toFixed(2) || 0} per 1000 chars</div>
            </div>
            <div className='bg-black/60 p-4 rounded-lg border border-white/10'>
              <div className='text-sm text-gray-300'>Average Link Length</div>
              <div className='text-lg font-bold text-white'>{linksData.analysis.averageLinkLength?.toFixed(1) || 0} chars</div>
            </div>
            <div className='bg-black/60 p-4 rounded-lg border border-white/10'>
              <div className='text-sm text-gray-300'>Common Domains</div>
              <div className='text-lg font-bold text-white'>{Object.keys(linksData.analysis.commonDomains || {}).length}</div>
            </div>
          </div>
        </div>
      )}

      {linksNoTextCount > 0 && (
        <div className='mb-4 text-sm text-gray-300'>
          <span className='font-medium'>Links without descriptive text:</span>{" "}
          <span className='text-red-400 font-semibold'>{linksNoTextCount}</span>
        </div>
      )}

      {/* Issues */}
      {linksData.issues && linksData.issues.length > 0 && (
        <div className='mb-6'>
          <h3 className='font-semibold text-white mb-2'>Issues Found:</h3>
          <ul className='space-y-1'>
            {linksData.issues.map((issue, index) => (
              <li key={index} className='flex items-center text-red-400'>
                <AlertTriangle className='w-4 h-4 mr-2' />
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Enhanced Link List */}
      {linksData.list && linksData.list.length > 0 && (
        <div>
          <h3 className='font-semibold text-white mb-4'>Links Found on Page:</h3>

          {/* Filter Tabs */}
          <div className='flex flex-wrap gap-2 mb-4'>
            <button className='px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm border border-blue-400/30'>
              All ({linksData.list.length})
            </button>
            <button className='px-3 py-1 bg-gray-500/20 text-gray-300 rounded text-sm border border-gray-400/30'>
              External ({linksData.list.filter((link) => link.type === "external").length})
            </button>
            <button className='px-3 py-1 bg-gray-500/20 text-gray-300 rounded text-sm border border-gray-400/30'>
              Internal ({linksData.list.filter((link) => link.type === "internal").length})
            </button>
            <button className='px-3 py-1 bg-gray-500/20 text-gray-300 rounded text-sm border border-gray-400/30'>
              Anchor ({linksData.list.filter((link) => link.type === "anchor").length})
            </button>
            <button className='px-3 py-1 bg-gray-500/20 text-gray-300 rounded text-sm border border-gray-400/30'>
              Broken ({linksData.list.filter((link) => !link.isWorking).length})
            </button>
          </div>

          <div className='max-h-96 overflow-y-auto'>
            <div className='space-y-2'>
              {linksData.list.slice(0, 50).map((link, index) => (
                <div key={index} className='border border-white/10 rounded-lg p-3 bg-black/40 backdrop-blur-lg shadow-lg'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center space-x-2 mb-2'>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            link.type === "external"
                              ? "bg-green-100 text-green-800"
                              : link.type === "internal"
                              ? "bg-blue-100 text-blue-800"
                              : link.type === "anchor"
                              ? "bg-purple-100 text-purple-800"
                              : link.type === "mailto"
                              ? "bg-yellow-100 text-yellow-800"
                              : link.type === "tel"
                              ? "bg-orange-100 text-orange-800"
                              : link.type === "javascript"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {link.type || "unknown"}
                        </span>
                        {link.target === "_blank" && <span className='px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs'>New Tab</span>}
                        {link.rel && link.rel.includes("nofollow") && (
                          <span className='px-2 py-1 bg-red-100 text-red-600 rounded text-xs'>NoFollow</span>
                        )}
                        {link.rel && link.rel.includes("noopener") && (
                          <span className='px-2 py-1 bg-green-100 text-green-600 rounded text-xs'>NoOpener</span>
                        )}
                        {link.statusCode && (
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              link.statusCode >= 200 && link.statusCode < 300
                                ? "bg-green-100 text-green-600"
                                : link.statusCode >= 300 && link.statusCode < 400
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {link.statusCode}
                          </span>
                        )}
                      </div>

                      <p className='text-sm font-medium text-white truncate' title={link.text || "No anchor text"}>
                        {link.text || "No anchor text"}
                      </p>

                      <p className='text-xs text-gray-300 truncate mt-1' title={link.href}>
                        {link.href}
                      </p>

                      {link.title && <p className='text-xs text-gray-400 mt-1'>Title: {link.title}</p>}

                      {/* Link Quality Indicators */}
                      <div className='mt-2 flex flex-wrap gap-1'>
                        {link.hasDescriptiveText && (
                          <span className='px-2 py-1 bg-green-100 text-green-600 rounded text-xs'>✓ Descriptive</span>
                        )}
                        {link.isAccessible && <span className='px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs'>♿ Accessible</span>}
                        {link.isSecure && <span className='px-2 py-1 bg-green-100 text-green-600 rounded text-xs'>🔒 Secure</span>}
                        {link.responseTime && (
                          <span className='px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs'>{link.responseTime}ms</span>
                        )}
                        {link.redirectCount > 0 && (
                          <span className='px-2 py-1 bg-yellow-100 text-yellow-600 rounded text-xs'>{link.redirectCount} redirects</span>
                        )}
                      </div>

                      {/* Link Quality Score */}
                      {link.quality && link.quality.score < 100 && (
                        <div className='mt-2'>
                          <div className='flex items-center'>
                            <span className='text-xs text-gray-300'>Quality:</span>
                            <div className='flex-1 bg-gray-600 rounded-full h-1 ml-2'>
                              <div
                                className={`h-1 rounded-full ${
                                  link.quality.score >= 80 ? "bg-green-500" : link.quality.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                                style={{ width: `${link.quality.score}%` }}
                              ></div>
                            </div>
                            <span className='text-xs text-gray-300 ml-2'>{link.quality.score}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className='flex-shrink-0 ml-4 flex flex-col items-center'>
                      {link.isWorking ? (
                        <CheckCircle className='w-5 h-5 text-green-500' />
                      ) : (
                        <AlertTriangle className='w-5 h-5 text-red-500' />
                      )}
                      {link.errorMessage && (
                        <span className='text-xs text-red-500 mt-1 text-center' title={link.errorMessage}>
                          Error
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {linksData.list.length > 50 && (
              <p className='text-gray-400 text-center mt-4'>Showing first 50 of {linksData.list.length} links</p>
            )}
          </div>
        </div>
      )}
    </SpotlightCard>
  );
};

export default LinksAnalysis;
