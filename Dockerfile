FROM node:23.1-slim

WORKDIR /app

COPY package.json .

RUN npm install

EXPOSE 5000

CMD ["npm", "run", "start"]
