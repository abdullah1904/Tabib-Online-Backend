FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm build

RUN pnpm install --prod --frozen-lockfile

EXPOSE 3004

CMD ["node", "dist/index.js"]
