import React, { useState, useEffect } from 'react';
import { Plane, MapPin, Sun, Eye, Star, ArrowRight, Check, Globe, Clock, Zap, Brain, Crosshair, Twitter, Github, Linkedin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [currentText, setCurrentText] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const navigate = useNavigate();

  const typewriterTexts = [
    "Sunsets over the Pacific Ocean",
    "The Swiss Alps at sunrise", 
    "Northern Lights from above",
    "Manhattan skyline at dusk",
    "Himalayan peaks in daylight",
    "Aurora Borealis at midnight"
  ];

  useEffect(() => {
    let timeout;
    const text = typewriterTexts[currentText];

    if (isTyping) {
      if (displayText.length < text.length) {
        timeout = setTimeout(() => {
          setDisplayText(text.slice(0, displayText.length + 1));
        }, 100);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50);
      } else {
        setCurrentText((prev) => (prev + 1) % typewriterTexts.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, currentText, typewriterTexts]);

  const handleGetStarted = () => {
    navigate('/input');
  };

  const handleDemo = () => {
    alert("Opening demo flight recommendation...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-cyan-200/30 to-blue-300/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-teal-200/30 to-green-300/20 rounded-full blur-2xl"></div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center ring-1 ring-cyan-100">
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
      <section className="relative px-6 pt-16 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Icon */}
          <div className="flex justify-center items-center mb-8 relative">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center ring-1 ring-cyan-100">
                <Plane className="w-12 h-12 text-cyan-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                <Sun className="w-4 h-4 text-amber-500" />
              </div>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-slate-800">Never Miss</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 bg-clip-text text-transparent">
              Amazing Views
            </span>
          </h1>

          {/* Dynamic Subtitle */}
          <div className="h-16 mb-8">
            <p className="text-xl md:text-2xl text-slate-600 font-light">
              Like{' '}
              <span className="font-semibold text-cyan-600 tracking-wide">
                {displayText}
                <span className="inline-block w-0.5 h-6 bg-cyan-500 ml-1 animate-pulse"></span>
              </span>
            </p>
          </div>

          {/* Description */}
          <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Our AI analyzes your <strong className="text-slate-800">exact flight path</strong>, 
            <strong className="text-slate-800"> sun position</strong>, and 
            <strong className="text-slate-800"> timing</strong> to recommend the perfect window seat 
            for spectacular scenic experiences.
          </p>

          {/* CTA Button */}
          <div className="mb-12">
            <button
              onClick={handleGetStarted}
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:from-cyan-600 hover:to-blue-700"
            >
              <span className="relative z-10">Find My Perfect Seat</span>
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-500" />
              <span className="font-medium">7,000+ Airports Worldwide</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-500" />
              <span className="font-medium">Real-time Sun Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-500" />
              <span className="font-medium">AI-Powered Recommendations</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Powerful Features</h2>
            <p className="text-xl text-slate-600">Everything you need for the perfect flight experience</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-cyan-100 hover:border-cyan-300 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Global Airport Database</h3>
              <p className="text-slate-600 leading-relaxed">Search from thousands of airports worldwide with intelligent autocomplete and real-time data.</p>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Smart Route Analysis</h3>
              <p className="text-slate-600 leading-relaxed">Precise flight path calculations with distance, duration, and trajectory analysis for optimal viewing.</p>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-amber-100 hover:border-amber-300 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sun className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Solar Position Tracking</h3>
              <p className="text-slate-600 leading-relaxed">Real-time sun angle computations for optimal sunset and sunrise viewing opportunities.</p>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-green-100 hover:border-green-300 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">View Preferences</h3>
              <p className="text-slate-600 leading-relaxed">Customize recommendations for sunsets, sunrises, landscapes, or city skylines.</p>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-indigo-100 hover:border-indigo-300 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">AI-Powered Analysis</h3>
              <p className="text-slate-600 leading-relaxed">Advanced machine learning algorithms analyze multiple factors for perfect recommendations.</p>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-pink-100 hover:border-pink-300 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Crosshair className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Detailed Reasoning</h3>
              <p className="text-slate-600 leading-relaxed">Understand exactly why each recommendation is made with clear, scientific explanations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visualization Showcase */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">See Your Flight Before You Fly</h2>
            <p className="text-xl text-slate-600">Advanced visualization for complete flight planning</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h3 className="text-3xl font-bold text-slate-800">Interactive Flight Visualization</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Animated Flight Paths</h4>
                    <p className="text-slate-600">Watch your journey unfold on a detailed interactive map</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Real-time Sun Tracking</h4>
                    <p className="text-slate-600">See exactly when and where the best views will appear</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">3D Globe Experience</h4>
                    <p className="text-slate-600">Immersive 3D visualization with Cesium technology</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleDemo}
                className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Try Interactive Demo 
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
            
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-cyan-100">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-semibold text-lg">Flight Visualization</span>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-white/60 rounded-full"></div>
                      <div className="w-3 h-3 bg-white/60 rounded-full"></div>
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-48 bg-white/10 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-white/80 mx-auto mb-2" />
                      <span className="text-white/80 font-medium">Interactive 2D & 3D Maps</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-2">
                  <div className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg text-sm font-medium">2D Map View</div>
                  <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">3D Globe View</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Your Window to the World Awaits</h2>
              <p className="text-xl text-cyan-100 mb-10 leading-relaxed max-w-2xl mx-auto">
                Get instant, data-driven seat recommendations and never miss a spectacular view again.
              </p>
              <button
                onClick={handleGetStarted}
                className="group inline-flex items-center px-8 py-4 bg-white text-cyan-600 font-bold text-lg rounded-2xl hover:bg-cyan-50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start Your Perfect Flight Experience 
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-cyan-100">
        <div className="max-w-7xl mx-auto py-12 px-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:order-2 space-x-6">
              <a href="#" className="text-slate-400 hover:text-cyan-500 transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-cyan-500 transition-colors">
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-cyan-500 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" />
              </a>
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