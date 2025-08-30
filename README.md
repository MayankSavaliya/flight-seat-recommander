# Flight Seat Recommender

A full-stack application that helps users find and recommend the best airplane seats based on various factors including flight route, sun position, and airport information.

## 🌟 Features

- Airport search functionality
- Real-time flight route calculations
- Sun position analysis for optimal seat selection
- MongoDB integration for airport data
- RESTful API backend
- Modern React frontend with Vite

## 🏗 Project Structure

```
├── frontend/           # React + Vite frontend application
│   ├── src/           # Source files
│   │   ├── components/# React components
│   │   └── assets/    # Static assets
│   └── public/        # Public assets
│
└── backend/           # Node.js backend server
    ├── config/       # Configuration files
    ├── models/       # Database models
    ├── routes/       # API routes
    ├── services/     # Business logic
    └── data/         # Static data files
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/flight-seat-recommander.git
cd flight-seat-recommander
```

2. Install Backend Dependencies:
```bash
cd backend
npm install
```

3. Install Frontend Dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
Create a `.env` file in the backend directory with:
```
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

## 🛠 Tech Stack

### Frontend
- React
- Vite
- Modern UI components

### Backend
- Node.js
- Express.js
- MongoDB
- RESTful API architecture

## 🌍 Features in Detail

1. **Airport Search**
   - Comprehensive airport database
   - Quick search functionality
   - Detailed airport information

2. **Flight Route Information**
   - Flight path details
   - Interactive interface
   - Real-time route calculations

3. **Seat Recommendations**
   - Sun position analysis
   - Optimal seat suggestions
   - Consideration of flight direction and time

4. **Data Integration**
   - MongoDB database integration
   - Real-time data processing
   - Efficient data management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgments

- All contributors who have helped with the project
- Airport data providers

## 📞 Contact

For any queries or suggestions, please open an issue in the repository.
