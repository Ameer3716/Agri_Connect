FROM node:18-alpine
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY . .

# ARG PORT
# ENV PORT=${PORT:-5002}
# ... other ENVs like MONGO_URI, MYSQL_HOST, JWT_SECRET, AUTH_SERVICE_URL etc., will be injected at runtime

EXPOSE ${PORT:-5002}
CMD [ "node", "server.js" ]