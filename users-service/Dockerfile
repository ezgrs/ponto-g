FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build
RUN npx tsc-alias

ENV NODE_ENV=production
ENV DATABASE_MIGRATIONS_RUN=true

EXPOSE 3000

CMD ["node", "dist/main"]
