FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN ls -al /app
RUN cat /app/tsconfig.json
RUN npx tsc -p /app/tsconfig.json
CMD ["node", "dist/index.js"]
