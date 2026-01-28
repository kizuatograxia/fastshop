# Build Stage for Frontend
FROM node:18-alpine as build

WORKDIR /app

# Copy root package.json (Frontend deps)
COPY package*.json ./
RUN npm install

# Copy source code and build frontend
COPY . .

# Inject Environment Variables (Frontend Build Time)
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Final Stage: Monolithic Server (Backend + Frontend)
FROM node:18-alpine

WORKDIR /app

# Copy backend dependencies
COPY server/package.json ./server/
RUN cd server && npm install

# Copy built frontend from build stage
COPY --from=build /app/dist ./dist

# Copy backend source code
COPY server ./server
COPY .env ./

# Expose port (Railway usually sets PORT to whatever it wants, defaulting to 5050 if local)
ENV PORT=5050
EXPOSE 5050

# Start the Backend (which serves the Frontend)
CMD ["node", "server/index.js"]
