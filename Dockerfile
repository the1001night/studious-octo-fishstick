FROM node:20-alpine
WORKDIR /app
COPY package*.json .
RUN npm install --production && adduser -D -u 1000 appuser && chown -R appuser:appuser /app
USER appuser
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
