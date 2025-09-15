import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const PerformanceMetrics = ({ performanceData }) => {
  if (!performanceData) return null;

  return (
    <div className='bg-white rounded-lg shadow p-6 mb-8'>
      <h2 className='text-xl font-bold text-gray-900 mb-6 flex items-center'>
        <TrendingUp className='w-6 h-6 mr-2 text-blue-600' />
        Performance Metrics
      </h2>

      {/* Core Web Vitals */}
      {performanceData.coreWebVitals && (
        <div className='mb-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Core Web Vitals</h3>
          <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4'>
            {Object.entries(performanceData.coreWebVitals).map(([key, value]) => (
              <div key={key} className='bg-gray-50 p-4 rounded-lg'>
                <p className='text-sm text-gray-600 capitalize'>{key.replace(/([A-Z])/g, " $1").trim()}</p>
                <p className='text-lg font-semibold text-gray-900'>
                  {typeof value === "number"
                    ? key.includes("Time") || key.includes("Paint")
                      ? `${Math.round(value)}ms`
                      : key.includes("Shift")
                      ? value.toFixed(3)
                      : Math.round(value)
                    : value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Performance Metrics */}
      {performanceData.metrics && (
        <div className='mb-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Detailed Performance Metrics</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='bg-blue-50 p-4 rounded-lg'>
              <p className='text-sm text-blue-600'>DOM Content Loaded</p>
              <p className='text-lg font-semibold text-blue-900'>{performanceData.metrics.domContentLoaded}ms</p>
            </div>
            <div className='bg-green-50 p-4 rounded-lg'>
              <p className='text-sm text-green-600'>Load Complete</p>
              <p className='text-lg font-semibold text-green-900'>{performanceData.metrics.loadComplete}ms</p>
            </div>
            <div className='bg-purple-50 p-4 rounded-lg'>
              <p className='text-sm text-purple-600'>DNS Time</p>
              <p className='text-lg font-semibold text-purple-900'>{performanceData.metrics.dnsTime}ms</p>
            </div>
            <div className='bg-orange-50 p-4 rounded-lg'>
              <p className='text-sm text-orange-600'>TCP Time</p>
              <p className='text-lg font-semibold text-orange-900'>{performanceData.metrics.tcpTime}ms</p>
            </div>
            <div className='bg-red-50 p-4 rounded-lg'>
              <p className='text-sm text-red-600'>Request Time</p>
              <p className='text-lg font-semibold text-red-900'>{performanceData.metrics.requestTime}ms</p>
            </div>
            <div className='bg-yellow-50 p-4 rounded-lg'>
              <p className='text-sm text-yellow-600'>Response Time</p>
              <p className='text-lg font-semibold text-yellow-900'>{performanceData.metrics.responseTime}ms</p>
            </div>
            <div className='bg-indigo-50 p-4 rounded-lg'>
              <p className='text-sm text-indigo-600'>Redirect Time</p>
              <p className='text-lg font-semibold text-indigo-900'>{performanceData.metrics.redirectTime}ms</p>
            </div>
            <div className='bg-pink-50 p-4 rounded-lg'>
              <p className='text-sm text-pink-600'>DOM Interactive</p>
              <p className='text-lg font-semibold text-pink-900'>{performanceData.metrics.domInteractive}ms</p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Issues & Suggestions */}
      {(performanceData.issues?.length > 0 || performanceData.suggestions?.length > 0) && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {performanceData.issues?.length > 0 && (
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-3'>Performance Issues</h3>
              <ul className='space-y-2'>
                {performanceData.issues.map((issue, index) => (
                  <li key={index} className='flex items-start text-red-600'>
                    <AlertTriangle className='w-4 h-4 mr-2 mt-0.5 flex-shrink-0' />
                    <span className='text-sm'>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {performanceData.suggestions?.length > 0 && (
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-3'>Performance Suggestions</h3>
              <ul className='space-y-2'>
                {performanceData.suggestions.map((suggestion, index) => (
                  <li key={index} className='flex items-start text-green-600'>
                    <CheckCircle className='w-4 h-4 mr-2 mt-0.5 flex-shrink-0' />
                    <span className='text-sm'>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PerformanceMetrics;
