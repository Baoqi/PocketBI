FROM golang:1.19-bullseye as builder

# build
WORKDIR /app

COPY go.mod ./
COPY go.sum ./

RUN set -x && apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ca-certificates unzip && \
    rm -rf /var/lib/apt/lists/*

RUN go mod download

COPY ./main.go ./main.go
COPY ./pkg ./pkg
COPY ./migrations ./migrations

RUN go build -o /pocketbi main.go


# deploy
FROM debian:bullseye-slim
RUN set -x && apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ca-certificates procps vim-tiny curl && \
    rm -rf /var/lib/apt/lists/*

ENV TZ=Asia/Shanghai
WORKDIR /app

COPY --from=builder /pocketbi /pocketbi
COPY pb_public /app/pb_public


EXPOSE 8090
# TODO add a health check to the API
HEALTHCHECK NONE

ENTRYPOINT ["/pocketbi serve --http 0.0.0.0:8090"]
