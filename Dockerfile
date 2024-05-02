FROM node:20 as builder

COPY . /build
WORKDIR /build

# Prevent vite build OOM
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN yarn install --frozen-lockfile && yarn build

FROM nginx:stable

COPY --from=builder /build/dist /usr/share/nginx/html
