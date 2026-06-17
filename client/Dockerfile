# ---- Build stage: compile the React app ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# The app talks to the backend through nginx on the same origin (/api),
# so the API base URL is a relative path.
ENV VITE_API_URL=/api
RUN npm run build

# ---- Run stage: serve static files with nginx ----
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
