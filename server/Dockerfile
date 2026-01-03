FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Wait for DB before starting could be handled by a script, 
# but for simplicity we rely on restart policy or depends_on condition (if advanced)
# or just crash and restart.
CMD ["npm", "start"]
