FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

RUN npm install --no-save \
  @rollup/rollup-linux-x64-musl@4.49.0 \
  lightningcss-linux-x64-musl@1.30.1 \
  @tailwindcss/oxide-linux-x64-musl@4.1.12

ARG VITE_BACKEND_URL=/api
ARG VITE_SOCKET_URL=
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

COPY . .

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
