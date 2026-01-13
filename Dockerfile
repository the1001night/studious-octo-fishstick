FROM node:20-alpine
WORKDIR /app
COPY package*.json .
RUN npm install
RUN useradd -m appuser
RUN chown -R appuser:appuser /app
USER appuser
COPY . .
EXPOSE 5000
CMD ["npm", "start"]