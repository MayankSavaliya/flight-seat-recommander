const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  city: {
    type: String,
    index: true
  },
  country: {
    type: String,
    index: true
  },
  iata: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  icao: {
    type: String,
    uppercase: true,
    index: true
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  searchText: {
    type: String,
    index: 'text'
  }
}, {
  timestamps: true
});

// Create compound indexes for better search performance
airportSchema.index({ name: 'text', city: 'text', country: 'text', iata: 'text', icao: 'text' });
airportSchema.index({ coordinates: '2dsphere' }); // For geospatial queries
airportSchema.index({ country: 1, city: 1 });

// Pre-save middleware to create search text
airportSchema.pre('save', function(next) {
  this.searchText = `${this.name} ${this.city} ${this.country} ${this.iata} ${this.icao || ''}`.toLowerCase();
  next();
});

// Static method for text search
airportSchema.statics.searchAirports = function(query, options = {}) {
  const {
    limit = 10,
    country = null
  } = options;

  const searchQuery = {
    $or: [
      { searchText: { $regex: query, $options: 'i' } }
    ]
  };

  if (country) {
    searchQuery.$and = [{ country: { $regex: country, $options: 'i' } }];
  }

  return this.find(searchQuery)
    .limit(limit)
    .lean();
};


module.exports = mongoose.model('Airport', airportSchema);
