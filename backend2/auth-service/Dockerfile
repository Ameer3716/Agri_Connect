FROM node:18-alpine
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY . .

# ARG PORT
# ENV PORT=${PORT:-5001}
# ... other ENVs like MONGO_URI, JWT_SECRET, REDIS_HOST etc., will be injected at runtime

EXPOSE ${PORT:-5001}
CMD [ "node", "server.js" ]