FROM public.ecr.aws/docker/library/node:18-slim as builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

ENV DB_PATH=/app/build/db.sqlite3
ENV NODE_ENV=production

RUN mkdir /app/build && yarn build:db && yarn build

FROM public.ecr.aws/docker/library/node:18-slim as runner

# Install TINI
RUN apt-get update && \
    apt-get install -y --no-install-recommends tini && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/package.json /app/yarn.lock ./

RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/database.js ./database.js
COPY --from=builder /app/catalogHash.js ./catalogHash.js

COPY --from=builder /app/build ./build
COPY --from=builder /app/catalog ./catalog
COPY --from=builder /app/public ./public
COPY --from=builder /app/catalogHash.json ./catalogHash.json

ENTRYPOINT ["/usr/bin/tini", "--"]

ENV DB_PATH=/app/build/db.sqlite3
ENV NODE_ENV=production

CMD ["node", "server.js"]

