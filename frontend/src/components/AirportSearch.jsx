import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, PlaneTakeoff } from 'lucide-react';

function AirportSearch({
  label,
  placeholder,
  value,
  onChange,
  name,
  hasError,
  required = true
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const componentRef = useRef(null);
  const suggestionsListRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const API_BASE = 'http://localhost:3001';

  useEffect(() => {
    if (value) {
      setQuery(value.displayName || `${value.city} (${value.iata})`);
    } else {
      setQuery('');
    }
  }, [value]);

  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsListRef.current) {
      const selectedItem = suggestionsListRef.current.children[selectedIndex];
      if (selectedItem) {
        selectedItem.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (componentRef.current && !componentRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchAirports = async (searchQuery) => {
    if (searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/airports/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setSuggestions(data.results || []);
    } catch (error) {
      console.error('Airport search failed:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    setSelectedIndex(-1);

    if (value) {
      onChange(null);
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      searchAirports(inputValue);
    }, 300);
  };

  const handleSuggestionSelect = (airport) => {
    onChange(airport);
    setIsFocused(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsFocused(false);
        break;
      default:
        break;
    }
  };

  const handleClear = () => {
    setQuery('');
    onChange(null);
    setSuggestions([]);
    setIsFocused(true);
  };

  const showSuggestions = isFocused && suggestions.length > 0;
  const showNoResults = isFocused && query.length > 0 && suggestions.length === 0 && !isLoading;

  return (
    <div ref={componentRef} className="relative w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center">
        <PlaneTakeoff className="w-4 h-4 mr-2 text-cyan-500" />
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          name={name}
          className={`w-full pl-12 pr-12 py-4 bg-white/90 border-2 rounded-xl focus:ring-2 transition-all text-slate-800 placeholder-slate-400 font-medium ${
            hasError
              ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
              : 'border-slate-200 focus:ring-cyan-200 focus:border-cyan-400 hover:border-slate-300'
          }`}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          required={required && !value}
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-cyan-500 animate-spin" />
          ) : (
            query && (
              <button
                type="button"
                onClick={handleClear}
                className="h-6 w-6 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-slate-600" />
              </button>
            )
          )}
        </div>
      </div>

      {(showSuggestions || showNoResults) && (
        <ul ref={suggestionsListRef} className="absolute z-10 w-full mt-3 bg-white/95 backdrop-blur-sm border border-cyan-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
          {showSuggestions && suggestions.map((airport, index) => (
            <li
              key={airport.iata}
              className={`px-6 py-4 cursor-pointer flex items-center gap-4 transition-all first:rounded-t-2xl last:rounded-b-2xl ${
                index === selectedIndex 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                  : 'hover:bg-cyan-50 text-slate-700'
              }`}
              onMouseDown={() => handleSuggestionSelect(airport)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                index === selectedIndex 
                  ? 'bg-white/20' 
                  : 'bg-gradient-to-br from-cyan-500 to-blue-500'
              }`}>
                <PlaneTakeoff className={`h-5 w-5 ${
                  index === selectedIndex ? 'text-white' : 'text-white'
                }`} />
              </div>
              <div className="flex-1">
                <p className={`font-bold text-sm ${
                  index === selectedIndex ? 'text-white' : 'text-slate-800'
                }`}>
                  {airport.city}, {airport.country} ({airport.iata})
                </p>
                <p className={`text-sm ${
                  index === selectedIndex ? 'text-white/80' : 'text-slate-600'
                }`}>
                  {airport.name}
                </p>
              </div>
            </li>
          ))}
          {showNoResults && (
            <li className="px-6 py-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">No airports found for "{query}"</p>
                <p className="text-slate-400 text-sm mt-1">Try a different search term</p>
              </div>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default AirportSearch;