FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN ls -al /app
RUN [ -f tsconfig.json ] && echo "tsconfig.json exists" || (echo "tsconfig.json MISSING" && exit 1)
RUN npm run build
CMD ["node", "dist/index.js"]
