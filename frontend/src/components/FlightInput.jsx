import { useState } from 'react';
import AirportSearch from './AirportSearch';
import { 
  ArrowLeft, 
  Loader2, 
  Plane, 
  Calendar, 
  Clock, 
  Sun, 
  Moon, 
  Star, 
  Sparkles, 
  MapPin 
} from 'lucide-react';

// To keep the code clean, you can define your preferences array outside the component
const preferences = [
  { 
    id: 'sunrise', 
    icon: Sun, 
    label: 'Sunrise', 
    description: 'Catch the golden hour',
    color: 'from-orange-400 to-yellow-400',
  },
  { 
    id: 'sunset', 
    icon: Moon, 
    label: 'Sunset', 
    description: 'Watch the sky turn colors',
    color: 'from-purple-500 to-pink-500',
  },
  { 
    id: 'general', 
    icon: Star, 
    label: 'Best Views', 
    description: 'Optimal viewing experience',
    color: 'from-cyan-400 to-blue-500',
  }
];

// Reusable component for form sections
const FormSection = ({ icon, title, subtitle, children }) => {
  const Icon = icon;
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-sky-100 to-cyan-200 rounded-2xl shadow-md">
          <Icon className="w-8 h-8 text-cyan-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
        <p className="text-slate-500 mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  );
};

// Main Component
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
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleAirportChange = (airport, name) => {
    setFormData(prev => ({ ...prev, [name]: airport }));
    setErrors(prev => ({ ...prev, fromAirport: null, toAirport: null }));
  };

  const handlePreferenceChange = (preference) => {
    setFormData(prev => ({ ...prev, viewPreference: preference }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fromAirport) newErrors.fromAirport = 'Departure airport is required.';
    if (!formData.toAirport) newErrors.toAirport = 'Arrival airport is required.';
    if (formData.fromAirport?.iata && formData.fromAirport?.iata === formData.toAirport?.iata) {
      newErrors.toAirport = 'Arrival and departure airports cannot be the same.';
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
        // No need to set isSubmitting to false if the parent component handles unmounting.
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-slate-100 font-sans antialiased">
      <div className="container mx-auto px-4 py-8 md:py-12">
        
        {/* Back Button */}
        <div className="max-w-5xl mx-auto mb-6">
          <button 
            className="group flex items-center gap-2 text-slate-600 hover:text-cyan-600 font-semibold transition-colors duration-300"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Header */}
        <header className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-white rounded-full shadow-lg">
             <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full">
                <Plane className="w-10 h-10 text-white" />
             </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">
              Plan Your Perfect Flight
            </span>
          </h1>
          <p className="text-lg text-slate-500 mt-4">
            Find the most spectacular window seat experience for your journey.
          </p>
        </header>

        {/* Form Container */}
        <main className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl shadow-cyan-100/50 border border-slate-200/80">
            <form onSubmit={handleSubmit} className="space-y-16">

              {/* Airport Selection Section */}
              <FormSection
                icon={MapPin}
                title="Choose Your Route"
                subtitle="Select departure and arrival airports"
              >
                <div className="grid md:grid-cols-2 gap-6 items-start">
                  <AirportSearch
                    label="From"
                    placeholder="e.g., JFK, Los Angeles"
                    value={formData.fromAirport}
                    onChange={(airport) => handleAirportChange(airport, 'fromAirport')}
                    error={errors.fromAirport}
                  />
                  <AirportSearch
                    label="To"
                    placeholder="e.g., LAX, Tokyo"
                    value={formData.toAirport}
                    onChange={(airport) => handleAirportChange(airport, 'toAirport')}
                    error={errors.toAirport}
                  />
                </div>
              </FormSection>

              {/* Date and Time Section */}
              <FormSection
                icon={Calendar}
                title="Flight Schedule"
                subtitle="Tell us when you are flying"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Flight Date</label>
                    <input
                      type="date"
                      name="departureDate"
                      value={formData.departureDate}
                      onChange={handleInputChange}
                      min={today}
                      className={`w-full p-4 border rounded-xl transition duration-300 ${errors.departureDate ? 'border-red-400 bg-red-50' : 'border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50'}`}
                    />
                    {errors.departureDate && <p className="text-red-600 text-sm mt-1">{errors.departureDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Departure Time</label>
                    <input
                      type="time"
                      name="departureTime"
                      value={formData.departureTime}
                      onChange={handleInputChange}
                      className={`w-full p-4 border rounded-xl transition duration-300 ${errors.departureTime ? 'border-red-400 bg-red-50' : 'border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50'}`}
                    />
                    {errors.departureTime && <p className="text-red-600 text-sm mt-1">{errors.departureTime}</p>}
                  </div>
                </div>
              </FormSection>

              {/* View Preference Section */}
              <FormSection
                icon={Star}
                title="Select Your View"
                subtitle="Choose your preferred viewing experience"
              >
                <div className="grid sm:grid-cols-3 gap-4">
                  {preferences.map((pref) => {
                    const Icon = pref.icon;
                    const isSelected = formData.viewPreference === pref.id;
                    return (
                      <button
                        key={pref.id}
                        type="button"
                        onClick={() => handlePreferenceChange(pref.id)}
                        className={`p-5 rounded-xl border-2 text-left transition-all duration-300 transform hover:scale-105 ${
                          isSelected 
                            ? 'border-cyan-500 bg-cyan-50 shadow-lg' 
                            : 'border-slate-200 hover:border-cyan-400 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${pref.color} mr-3 shadow-md`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-bold text-slate-800">{pref.label}</span>
                        </div>
                        <p className="text-sm text-slate-500">{pref.description}</p>
                      </button>
                    );
                  })}
                </div>
              </FormSection>

              {/* Submit Button */}
              <div className="text-center pt-6 flex justify-center">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-3 px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-6 h-6" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      <span>Get Seat Recommendation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default FlightInput;