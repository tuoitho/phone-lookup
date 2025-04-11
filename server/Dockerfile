FROM node:18-alpine
# Cài đặt phụ thuộc để biên dịch better-sqlite3
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite-dev
    
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
