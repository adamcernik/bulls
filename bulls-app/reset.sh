#!/bin/bash
# Kill any running React instances
echo "Stopping any running React servers..."
pkill -f "react-scripts start" || true

# Wait a moment
sleep 2

# Start the app
echo "Starting React app on port 3005..."
npm start 