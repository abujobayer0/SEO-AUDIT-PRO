import Link from "next/link";
import { Image, AlertTriangle } from "lucide-react";
import SpotlightCard from "../SpotlightCard";

const ImagesAnalysis = ({ imagesData }) => {
  if (!imagesData) return null;

  return (
    <SpotlightCard className='bg-black/80 backdrop-blur-xl border-white/5 shadow-2xl mb-8' spotlightColor='rgba(168, 85, 247, 0.15)'>
      <h2 className='text-xl font-bold text-white mb-4 flex items-center'>
        <Image className='w-6 h-6 mr-2 text-purple-400' />
        Images Analysis ({imagesData.total || 0} images found)
      </h2>

      {/* Enhanced Statistics */}
      <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6'>
        <div className='text-center'>
          <div className='text-2xl font-bold text-blue-400'>{imagesData.total || 0}</div>
          <p className='text-sm text-gray-300'>Total Images</p>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-red-400'>{imagesData.withoutAlt || 0}</div>
          <p className='text-sm text-gray-300'>Missing Alt</p>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-yellow-400'>{imagesData.oversized || 0}</div>
          <p className='text-sm text-gray-300'>Oversized</p>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-orange-400'>{imagesData.tooSmall || 0}</div>
          <p className='text-sm text-gray-300'>Too Small</p>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-green-400'>{imagesData.lazyImages || 0}</div>
          <p className='text-sm text-gray-300'>Lazy Loaded</p>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-purple-400'>{imagesData.responsiveImages || 0}</div>
          <p className='text-sm text-gray-300'>Responsive</p>
        </div>
      </div>

      {/* Image Size Analysis */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <div className='bg-blue-500/20 p-4 rounded-lg text-center border border-blue-400/30'>
          <div className='text-lg font-bold text-white'>{((imagesData.totalSizeKB || 0) / 1024).toFixed(1)}MB</div>
          <p className='text-sm text-blue-400'>Total Size</p>
        </div>
        <div className='bg-green-500/20 p-4 rounded-lg text-center border border-green-400/30'>
          <div className='text-lg font-bold text-white'>{imagesData.avgSizeKB || 0}KB</div>
          <p className='text-sm text-green-400'>Average Size</p>
        </div>
        <div className='bg-purple-500/20 p-4 rounded-lg text-center border border-purple-400/30'>
          <div className='text-lg font-bold text-white'>{imagesData.modernFormats || 0}</div>
          <p className='text-sm text-purple-400'>Modern Formats</p>
        </div>
      </div>

      {/* Issues */}
      {imagesData.issues && imagesData.issues.length > 0 && (
        <div className='mb-6'>
          <h3 className='font-semibold text-white mb-2'>Issues Found:</h3>
          <ul className='space-y-1'>
            {imagesData.issues.map((issue, index) => (
              <li key={index} className='flex items-center text-red-400'>
                <AlertTriangle className='w-4 h-4 mr-2' />
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Enhanced Image List */}
      {imagesData.list && imagesData.list.length > 0 && (
        <div>
          <h3 className='font-semibold text-white mb-4'>Images Found on Page:</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto'>
            {imagesData.list.slice(0, 20).map((image, index) => (
              <div key={index} className='border border-white/10 rounded-lg p-3 bg-black/40 backdrop-blur-lg shadow-lg'>
                <div className='flex items-start space-x-3'>
                  <div className='flex-shrink-0'>
                    {image.src ? (
                      <img
                        src={image.src}
                        alt={image.alt || "No alt text"}
                        className='w-16 h-16 object-cover rounded border'
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextElementSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div className='w-16 h-16 bg-gray-600 rounded border hidden items-center justify-center text-gray-300 text-xs'>
                      No Image
                    </div>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-sm'>
                      <p className='text-white truncate' title={image.src}>
                        {image.src ? image.src.split("/").pop() : "No source"}
                      </p>
                      <p className='text-gray-300 text-xs mt-1'>
                        {image.width} × {image.height}px
                      </p>
                      {image.estimatedSizeKB && <p className='text-gray-300 text-xs'>~{image.estimatedSizeKB}KB</p>}
                      {image.format && (
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                            ["webp", "avif"].includes(image.format)
                              ? "bg-green-100 text-green-800"
                              : ["jpg", "jpeg"].includes(image.format)
                              ? "bg-blue-100 text-blue-800"
                              : image.format === "png"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {image.format.toUpperCase()}
                        </span>
                      )}
                      <div className='mt-2 space-y-1'>
                        {image.alt ? (
                          <p className='text-green-400 text-xs'>✓ Alt: {image.alt}</p>
                        ) : (
                          <p className='text-red-400 text-xs'>✗ Missing alt text</p>
                        )}
                        {image.loading === "lazy" && <p className='text-blue-400 text-xs'>⚡ Lazy loaded</p>}
                        {image.isOversized && <p className='text-yellow-400 text-xs'>⚠ Oversized</p>}
                        {image.isTooSmall && <p className='text-orange-400 text-xs'>⚠ Too small</p>}
                        {image.isResponsive && <p className='text-purple-400 text-xs'>📱 Responsive</p>}
                        {image.needsOptimization && <p className='text-red-400 text-xs'>🔧 Needs optimization</p>}
                        {image.isDecorative && <p className='text-gray-400 text-xs'>🎨 Decorative</p>}
                      </div>
                      {image.altQuality && image.altQuality.score < 100 && (
                        <div className='mt-2'>
                          <div className='flex items-center'>
                            <span className='text-xs text-gray-300'>Alt Quality:</span>
                            <div className='flex-1 bg-gray-600 rounded-full h-1 ml-2'>
                              <div
                                className={`h-1 rounded-full ${
                                  image.altQuality.score >= 80
                                    ? "bg-green-500"
                                    : image.altQuality.score >= 60
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${image.altQuality.score}%` }}
                              ></div>
                            </div>
                            <span className='text-xs text-gray-300 ml-2'>{image.altQuality.score}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {imagesData.list.length > 20 && (
            <div className='flex items-center justify-between mt-4'>
              <p className='text-gray-400'>Showing first 20 of {imagesData.list.length} images</p>
              <Link href={`#`} className='text-blue-400 hover:text-blue-300 text-sm' onClick={(e) => e.preventDefault()}>
                Load more coming soon
              </Link>
            </div>
          )}
        </div>
      )}
    </SpotlightCard>
  );
};

export default ImagesAnalysis;
