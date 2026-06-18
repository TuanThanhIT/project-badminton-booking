FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV TZ=Asia/Ho_Chi_Minh

COPY package.json package-lock.json ./

RUN apk add --no-cache tzdata \
  && npm ci --omit=dev

COPY --chown=node:node . .

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:8080/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["npm", "start"]
