FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# # Stage 2: Serve với Nginx
FROM nginx:alpine
# Sao chép kết quả build từ stage trước
COPY --from=build /app/dist /usr/share/nginx/html
# Cấu hình Nginx để hỗ trợ SPA (Single Page Application) routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
