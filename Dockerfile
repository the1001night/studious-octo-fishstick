FROM node:20-alpine
WORKDIR /app
COPY package*.json .
RUN npm install --production && chown -R node:node /app
USER node
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
