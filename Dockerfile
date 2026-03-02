FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm db:generate
RUN pnpm build

EXPOSE 3004

CMD ["sh", "-c", "npx prisma migrate deploy && pnpm start"]