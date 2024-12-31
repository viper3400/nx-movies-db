# syntax=docker.io/docker/dockerfile:1

FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY ./apps/movies-ui/.next/standalone/package*.json ./
RUN npm i
COPY ./apps/movies-ui/.next/standalone/apps/movies-ui ./
COPY ./apps/movies-ui/.next/static ./.next/static
COPY ./apps/movies-ui/public ./.next/public

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=deps --chown=nextjs:nodejs /app ./

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
#ENV HOSTNAME="0.0.0.0"
# CMD ["node", "server.js"]
# CMD ["sh", "-c", "set -a && source .env.local && set +a && node server.js"]
CMD ["sh", "-c", "export $(grep -v '^#' .env.local | xargs) && node server.js"]
