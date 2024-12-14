# 1. Stage: Clone und Build
FROM node:22

# Setze das Arbeitsverzeichnis
WORKDIR /staging


# # Copy the rest of the source code
COPY . .
RUN rm -rf node_modules
RUN rm -rf ./apps/movies-ui/.next
RUN rm -rf ./apps/movies-ui/.env.local
RUN rm -rf .nx

# Install dependencies
RUN npm ci

RUN npx nx build movies-ui --verbose

WORKDIR /staging/apps/movies-ui

# Exponiere den Port, auf dem die App laufen soll
EXPOSE 3000

# Starte die App
CMD ["npx", "next", "start"]
