# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Empty API base -> requests become relative paths (e.g. /api/auth/login).
# nginx below proxies /api/ to the backend container, so this stays
# same-origin in production with no CORS involved.
ENV VITE_API_BASE_URL=""
RUN npm run build

# ---- serve stage ----
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
