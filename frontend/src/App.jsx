import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import FlightInput from './components/FlightInput'
import Results from './components/Results'
import InteractiveFlightMap from './components/InteractiveFlightMap'
import { LoadingOverlay } from './components/UI/LoadingOverlay'

// API base URL - adjust based on your backend setup
const API_BASE = 'http://localhost:3001';

function App() {
  const navigate = useNavigate()

  const [flightData, setFlightData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Navigation helpers
  const goLanding = () => navigate('/')
  const goInput = () => navigate('/input')
  const goResults = () => navigate('/results')
  const goInteractive = () => navigate('/interactive-map')

  const handleStartJourney = () => goInput()

  const handleFlightSubmit = async (data) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/api/flight/recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to get recommendation')

      const result = await response.json()

      const combinedData = {
        ...data,
        finalRecommendation: result.finalRecommendation,
        flightDetails: result.flightDetails,
        flightPoints: result.flightPoints,
        metadata: result.metadata,
      }

      setFlightData(combinedData)
      goResults()
    } catch (err) {
      console.error('Error getting flight data:', err)
      setError(`Failed to get recommendation: ${err.message}`)
      setFlightData(data) // fallback
      goResults()
    } finally {
      setLoading(false)
    }
  }

  const handleReturnToHome = () => {
    setFlightData(null)
    goLanding()
  }

  const handleViewVisualization = () => {
    goInteractive()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {loading && <LoadingOverlay message="Processing your flight route..." />}

      <Routes>
        <Route
          path="/"
          element={<LandingPage onStartJourney={handleStartJourney} />}
        />

        <Route
          path="/input"
          element={
            <FlightInput
              onSubmit={handleFlightSubmit}
              onBack={handleReturnToHome}
              error={error}
            />
          }
        />

        <Route
          path="/results"
          element={
            <Results
              flightData={flightData}
              onBack={() => goInput()}
              onViewVisualization={handleViewVisualization}
              onReturnHome={handleReturnToHome}
            />
          }
        />

        <Route
          path="/interactive-map"
          element={
            <InteractiveFlightMap
              flightData={flightData}
              onBack={goResults}
              onReturnHome={handleReturnToHome}
            />
          }
        />
      </Routes>
    </div>
  )
}

export default App