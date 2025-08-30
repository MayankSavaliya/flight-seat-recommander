import { useState } from 'react';
import AirportSearch from './AirportSearch';
import { ArrowLeft, Loader2, Plane, Calendar, Clock, Sun, Moon, Star, Sparkles, MapPin } from 'lucide-react';

function FlightInput({ onSubmit, onBack }) {
  const [formData, setFormData] = useState({
    fromAirport: null,
    toAirport: null,
    departureDate: '',
    departureTime: '',
    viewPreference: 'general'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAirportChange = (airport, name) => {
    setFormData(prev => ({ ...prev, [name]: airport }));
    // Clear errors when a selection is made
    if (errors.fromAirport || errors.toAirport) {
      setErrors(prev => ({ ...prev, fromAirport: null, toAirport: null }));
    }
  };

  const handlePreferenceChange = (preference) => {
    setFormData(prev => ({ ...prev, viewPreference: preference }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fromAirport) newErrors.fromAirport = 'Departure airport is required.';
    if (!formData.toAirport) newErrors.toAirport = 'Arrival airport is required.';
    if (formData.fromAirport && formData.toAirport && formData.fromAirport.iata === formData.toAirport.iata) {
      newErrors.toAirport = 'Arrival airport cannot be the same as departure.';
    }
    if (!formData.departureDate) newErrors.departureDate = 'Please select a flight date.';
    if (!formData.departureTime) newErrors.departureTime = 'Please select a departure time.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setTimeout(() => {
        onSubmit(formData);
        // The parent component will handle navigation, no need to setIsSubmitting(false)
      }, 1500);
    }
  };

  const preferences = [
    { 
      id: 'sunrise', 
      icon: Sun, 
      label: 'Sunrise', 
      description: 'Catch the golden hour',
      color: 'from-orange-500 to-yellow-500',
      bgColor: 'from-orange-500/20 to-yellow-500/20'
    },
    { 
      id: 'sunset', 
      icon: Moon, 
      label: 'Sunset', 
      description: 'Watch the sky turn colors',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-500/20 to-pink-500/20'
    },
    { 
      id: 'general', 
      icon: Star, 
      label: 'Best Views', 
      description: 'Optimal viewing experience',
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'from-blue-500/20 to-indigo-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-cyan-200/20 to-blue-300/15 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-teal-200/20 to-green-300/15 rounded-full blur-2xl"></div>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Navigation */}
        <div className="flex justify-between mb-8">
          <button 
            className="flex items-center text-slate-600 hover:text-cyan-600 font-medium transition-colors group"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center items-center mb-8 relative">
              <div className="relative">
                <div className="w-20 h-20 bg-white rounded-full shadow-2xl flex items-center justify-center ring-1 ring-cyan-100">
                  <Plane className="w-10 h-10 text-cyan-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              <span className="text-slate-800">Plan Your</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 bg-clip-text text-transparent">
                Perfect Flight
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Tell us about your journey and we'll find you the most <strong className="text-slate-800">spectacular window seat</strong> experience
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-cyan-100 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Airport Selection */}
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="flex justify-center items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Choose Your Route</h2>
                  <p className="text-slate-600">Select your departure and arrival airports</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <AirportSearch
                      label="From Airport"
                      placeholder="e.g., JFK, Los Angeles..."
                      name="fromAirport"
                      value={formData.fromAirport}
                      onChange={(airport) => handleAirportChange(airport, 'fromAirport')}
                      hasError={!!errors.fromAirport}
                    />
                    {errors.fromAirport && <p className="text-red-500 text-sm mt-2 flex items-center">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                      {errors.fromAirport}
                    </p>}
                  </div>

                  <div className="space-y-2">
                    <AirportSearch
                      label="To Airport"
                      placeholder="e.g., LAX, Tokyo Narita..."
                      name="toAirport"
                      value={formData.toAirport}
                      onChange={(airport) => handleAirportChange(airport, 'toAirport')}
                      hasError={!!errors.toAirport}
                    />
                    {errors.toAirport && <p className="text-red-500 text-sm mt-2 flex items-center">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                      {errors.toAirport}
                    </p>}
                  </div>
                </div>
              </div>

              {/* Date and Time */}
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="flex justify-center items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Flight Schedule</h2>
                  <p className="text-slate-600">When are you flying?</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                      Flight Date
                    </label>
                    <input
                      type="date"
                      className={`w-full px-4 py-4 bg-white/90 border-2 rounded-xl focus:ring-2 transition-all text-slate-800 placeholder-slate-400 ${
                        errors.departureDate ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-cyan-200 focus:border-cyan-400 hover:border-slate-300'
                      }`}
                      name="departureDate"
                      value={formData.departureDate}
                      onChange={handleInputChange}
                      min={today}
                      required
                    />
                    {errors.departureDate && <p className="text-red-500 text-sm mt-2 flex items-center">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                      {errors.departureDate}
                    </p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-500" />
                      Departure Time
                    </label>
                    <input
                      type="time"
                      className={`w-full px-4 py-4 bg-white/90 border-2 rounded-xl focus:ring-2 transition-all text-slate-800 placeholder-slate-400 ${
                        errors.departureTime ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-cyan-200 focus:border-cyan-400 hover:border-slate-300'
                      }`}
                      name="departureTime"
                      value={formData.departureTime}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.departureTime && <p className="text-red-500 text-sm mt-2 flex items-center">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                      {errors.departureTime}
                    </p>}
                  </div>
                </div>
              </div>

              {/* View Preference */}
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="flex justify-center items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">What would you like to see?</h2>
                  <p className="text-slate-600">Choose your viewing preference for the best experience</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {preferences.map((pref) => {
                    const Icon = pref.icon;
                    return (
                      <button
                        key={pref.id}
                        type="button"
                        onClick={() => handlePreferenceChange(pref.id)}
                        className={`group p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden transform hover:scale-105 ${
                          formData.viewPreference === pref.id
                            ? 'border-cyan-300 bg-gradient-to-br from-cyan-50 to-blue-50 text-slate-800 shadow-xl shadow-cyan-200/50'
                            : 'border-slate-200 bg-white/90 text-slate-700 hover:border-cyan-200 hover:bg-cyan-50/50 hover:shadow-lg'
                        }`}
                      >
                        <div className="relative z-10">
                          <div className="flex items-center mb-3">
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${pref.color} mr-3 group-hover:scale-110 transition-transform`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-bold text-lg">{pref.label}</span>
                          </div>
                          <p className="text-sm opacity-75 leading-relaxed">{pref.description}</p>
                        </div>
                        {formData.viewPreference === pref.id && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center pt-8">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="group px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-lg rounded-2xl shadow-xl transform transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-200 flex items-center mx-auto disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 hover:shadow-2xl"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      <span>Processing Your Request...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                      <span>Get My Perfect Seat Recommendation</span>
                      <div className="w-2 h-2 bg-white rounded-full ml-3 animate-pulse"></div>
                    </>
                  )}
                </button>
                <div className="flex flex-wrap justify-center items-center gap-6 text-slate-500 text-sm mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span className="font-medium">AI-powered analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Real-time sun tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span className="font-medium">Global airport database</span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlightInput;