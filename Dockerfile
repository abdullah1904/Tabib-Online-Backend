FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm db:generate
RUN pnpm build

RUN pnpm prune --prod

EXPOSE 3004

CMD ["sh", "-c", "npx prisma migrate deploy && pnpm start"]