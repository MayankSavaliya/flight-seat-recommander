import React, { useState, useEffect } from 'react';
import { Plane, MapPin, Sun, Eye, ArrowRight, Check, Globe, Brain, Crosshair, Twitter, Github, Linkedin, ChevronDown, Quote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Reusable Components ---

const FeatureCard = ({ icon, title, children, gradient }) => (
  <div className="group bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
    <div className={`w-14 h-14 ${gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{children}</p>
  </div>
);

const Avatar = ({ name }) => (
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg ring-2 ring-white shadow-sm">
        {name.charAt(0).toUpperCase()}
    </div>
);

const TestimonialCard = ({ quote, name, title }) => (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 h-full flex flex-col">
        <Quote className="w-8 h-8 text-cyan-200 mb-4" />
        <p className="text-slate-600 mb-6 italic leading-loose flex-grow">"{quote}"</p>
        <div className="flex items-center gap-4">
            <Avatar name={name} />
            <div>
                <div className="font-bold text-slate-800">{name}</div>
                <div className="text-sm text-slate-500">{title}</div>
            </div>
        </div>
    </div>
);


const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left gap-4"
      >
        <h3 className="text-lg font-semibold text-slate-800">{question}</h3>
        <ChevronDown className={`w-6 h-6 text-cyan-500 transform transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] mt-4' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <p className="text-slate-600 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
};

// --- Main Landing Page Component ---

const LandingPage = () => {
  const [currentText, setCurrentText] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const navigate = useNavigate();

  const typewriterTexts = [
    "sunsets over the Pacific.",
    "the Swiss Alps at sunrise.",
    "the Northern Lights from 30,000 ft.",
    "Manhattan's skyline at dusk.",
    "Himalayan peaks in daylight."
  ];

  useEffect(() => {
    let timeout;
    const text = typewriterTexts[currentText];

    if (isTyping) {
      if (displayText.length < text.length) {
        timeout = setTimeout(() => setDisplayText(text.slice(0, displayText.length + 1)), 100);
      } else {
        timeout = setTimeout(() => setIsTyping(false), 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => setDisplayText(displayText.slice(0, -1)), 50);
      } else {
        setCurrentText((prev) => (prev + 1) % typewriterTexts.length);
        setIsTyping(true);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayText, isTyping, currentText]);

  const handleGetStarted = () => navigate('/input');
  const handleDemo = () => alert("Opening demo flight recommendation...");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 antialiased">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center ring-1 ring-slate-100">
              <Plane className="w-6 h-6 text-cyan-500" />
            </div>
            <span className="text-xl font-bold text-slate-800">FlightView AI</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-600 hover:text-cyan-600 transition-colors font-medium">Features</a>
            <a href="#how-it-works" className="text-slate-600 hover:text-cyan-600 transition-colors font-medium">How It Works</a>
            <a href="#testimonials" className="text-slate-600 hover:text-cyan-600 transition-colors font-medium">Reviews</a>
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-28 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-slate-800">Never Miss an</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 bg-clip-text text-transparent">
              Amazing Window View
            </span>
          </h1>
          <div className="h-16 mb-8">
            <p className="text-xl md:text-2xl text-slate-600">
              Imagine seeing{' '}
              <span className="font-semibold text-cyan-600">
                {displayText}
                <span className="inline-block w-0.5 h-6 bg-cyan-500 ml-1 animate-pulse align-bottom"></span>
              </span>
            </p>
          </div>
          <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
            Our AI analyzes your <strong className="text-slate-800">exact flight path, sun position, and timing</strong> to recommend the perfect window seat for spectacular scenic views.
          </p>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <button
              onClick={handleGetStarted}
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Find My Perfect Seat
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={handleDemo}
              className="group inline-flex items-center px-8 py-4 bg-white text-slate-700 font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all border border-slate-200"
            >
              View Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Everything You Need for the Perfect View</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">Our platform is packed with features to ensure you get the best seat in the house.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard title="Global Airport Database" gradient="bg-gradient-to-br from-cyan-400 to-blue-500" icon={<Globe className="w-7 h-7 text-white" />}>
              Search from thousands of airports worldwide with intelligent autocomplete and real-time data.
            </FeatureCard>
            <FeatureCard title="Smart Route Analysis" gradient="bg-gradient-to-br from-blue-500 to-purple-500" icon={<MapPin className="w-7 h-7 text-white" />}>
              Precise flight path calculations for distance, duration, and trajectory for optimal viewing.
            </FeatureCard>
            <FeatureCard title="Solar Position Tracking" gradient="bg-gradient-to-br from-amber-400 to-orange-500" icon={<Sun className="w-7 h-7 text-white" />}>
              Real-time sun angle computations to find the best sunset, sunrise, and lighting conditions.
            </FeatureCard>
            <FeatureCard title="View Preferences" gradient="bg-gradient-to-br from-green-400 to-teal-500" icon={<Eye className="w-7 h-7 text-white" />}>
              Customize recommendations for sunsets, sunrises, landscapes, or city skylines.
            </FeatureCard>
            <FeatureCard title="AI-Powered Analysis" gradient="bg-gradient-to-br from-indigo-500 to-purple-500" icon={<Brain className="w-7 h-7 text-white" />}>
              Advanced algorithms analyze multiple factors for the most accurate recommendations.
            </FeatureCard>
            <FeatureCard title="Detailed Reasoning" gradient="bg-gradient-to-br from-pink-500 to-rose-500" icon={<Crosshair className="w-7 h-7 text-white" />}>
              Understand exactly why a seat is recommended with clear, scientific explanations.
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Get Your Recommendation in 3 Simple Steps</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">It’s quick, easy, and provides instant, data-driven results.</p>
          </div>
          <div className="relative">
            {/* The connecting line */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-slate-200 -translate-y-1/2">
              <div className="absolute top-1/2 left-1/2 w-[calc(100%-20rem)] h-0.5 bg-cyan-300 -translate-x-1/2 -translate-y-1/2" />
            </div>

            <div className="relative grid lg:grid-cols-3 gap-12">
              <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
                <div className="flex justify-center items-center mb-6">
                  <div className="w-20 h-20 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center text-2xl font-bold ring-8 ring-white">1</div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Enter Flight Details</h3>
                <p className="text-slate-600">Provide your departure and arrival airports, and your flight date. That's all we need.</p>
              </div>
              <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
                <div className="flex justify-center items-center mb-6">
                  <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold ring-8 ring-white">2</div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">AI Analyzes Your Path</h3>
                <p className="text-slate-600">Our algorithm calculates your flight's trajectory and the sun's position at every point.</p>
              </div>
              <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
                <div className="flex justify-center items-center mb-6">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl font-bold ring-8 ring-white">3</div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Get Your Seat Pick</h3>
                <p className="text-slate-600">Receive an instant, data-driven recommendation for the left or right side of the plane.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Trusted by Avid Travelers</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">See what our users are saying about their incredible flight views.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="I never thought much about which side I sat on until I used FlightView AI. The sunrise over the Grand Canyon was absolutely breathtaking. A total game-changer!"
              name="Sarah K."
              title="Adventure Photographer"
            />
            <TestimonialCard
              quote="Flew from Tokyo to San Francisco and the app recommended the right side. I got the most incredible view of the Golden Gate Bridge as we descended. 10/10 recommend."
              name="Michael B."
              title="Frequent Business Traveler"
            />
            <TestimonialCard
              quote="As a nervous flyer, having something beautiful to look at makes a huge difference. The view of the Alps on my flight to Rome was stunning. Thank you!"
              name="Jessica L."
              title="Vacationer"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
          </div>
          <div>
            <FAQItem question="How accurate are the recommendations?" answer="Our recommendations are highly accurate, using real-time flight path data and precise astronomical calculations for the sun's position. While weather conditions can affect visibility, our tool gives you the best possible chance for a great view." />
            <FAQItem question="Do I need my flight number?" answer="No, you don't need a flight number. Just provide the departure and arrival airports and the date of travel. Our system calculates a standard great-circle route, which is a highly accurate approximation for most flights." />
            <FAQItem question="Is this service free to use?" answer="Yes, the basic flight recommendation service is completely free to use. We may introduce premium features in the future, but our core mission is to help everyone enjoy better views." />
            <FAQItem question="What if my flight path changes?" answer="Airlines generally stick to planned routes, but deviations can occur. Our model is based on the most common and direct flight path. For most of the journey, this will provide an accurate recommendation for the best scenic potential." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto py-12 px-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:order-2 space-x-6">
              <a href="#" className="text-slate-400 hover:text-cyan-500 transition-colors"><Twitter className="h-6 w-6" /></a>
              <a href="#" className="text-slate-400 hover:text-cyan-500 transition-colors"><Github className="h-6 w-6" /></a>
              <a href="#" className="text-slate-400 hover:text-cyan-500 transition-colors"><Linkedin className="h-6 w-6" /></a>
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
              <p className="text-center text-base text-slate-500">&copy; 2025 FlightView AI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;