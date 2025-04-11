FROM node:18-alpine
# LowDB không cần các phụ thuộc biên dịch như better-sqlite3
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
