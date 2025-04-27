FROM node:18-alpine
WORKDIR /app
COPY ../../tsconfig.json ./tsconfig.base.json
COPY package*.json ./
RUN npm install
COPY . .
RUN npx tsc -p /app/tsconfig.json
CMD ["node", "dist/index.js"]
