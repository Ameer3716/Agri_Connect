FROM node:18-alpine
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY . .

# Environment variables will be passed in during runtime (e.g. docker run -e ...)
# Or use ARG for build-time env vars if absolutely necessary (not common for URLs)
# ARG API_GATEWAY_PORT
# ENV API_GATEWAY_PORT=${API_GATEWAY_PORT:-5000}
# ARG AUTH_SERVICE_URL
# ENV AUTH_SERVICE_URL=${AUTH_SERVICE_URL}
# ARG MAIN_SERVICE_URL
# ENV MAIN_SERVICE_URL=${MAIN_SERVICE_URL}
# ARG FRONTEND_URL
# ENV FRONTEND_URL=${FRONTEND_URL}

EXPOSE ${API_GATEWAY_PORT:-5000}
CMD [ "node", "server.js" ]