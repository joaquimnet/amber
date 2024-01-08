FROM node:20-alpine

RUN mkdir /app
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN rm -rf dist
ENV NODE_ENV=production
RUN npm run build && npm prune

CMD ["npm", "start"]