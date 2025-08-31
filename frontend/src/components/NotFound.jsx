import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Search, Plane } from 'lucide-react'

function NotFound() {
  const navigate = useNavigate()

  const handleGoHome = () => navigate('/')
  const handleGoBack = () => navigate(-1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon and 404 */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-white rounded-full shadow-lg">
            <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full">
              <Plane className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600 mb-4">
            404
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Page Not Found
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            Oops! The page you're looking for seems to have taken a different flight path. Let's get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleGoHome}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </button>
          
          <button
            onClick={handleGoBack}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-slate-500 text-sm mb-4">Or try one of these:</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => navigate('/input')}
              className="text-cyan-600 hover:text-cyan-700 text-sm flex items-center justify-center gap-1 transition-colors font-medium"
            >
              <Search className="w-4 h-4" />
              Plan Flight
            </button>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <button
              onClick={() => navigate('/interactive-map')}
              className="text-cyan-600 hover:text-cyan-700 text-sm transition-colors font-medium"
            >
              Interactive Map
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-cyan-100/50 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-100/50 rounded-full blur-xl"></div>
      </div>
    </div>
  )
}

export default NotFound
