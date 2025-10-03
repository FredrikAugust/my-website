FROM golang:1.25.1-trixie AS builder
WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download -x

COPY . ./
RUN GOOS=linux GOARCH=amd64 go build -ldflags="-X 'main.release=`git rev-parse --short=8 HEAD`'" -o /bin/server cmd/server/*.go

# BUILD TAILWIND CSS
# The URL uses x64 instead of amd64
ARG BUILDARCH
RUN ARCH=$( [ "${BUILDARCH}" = "amd64" ] && echo "x64" || echo "arm64" ) && \
  curl -sfLO https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-${ARCH}
RUN mv tailwindcss-linux-* tailwindcss
RUN chmod a+x tailwindcss
COPY tailwind.css ./
RUN ./tailwindcss -i ./tailwind.css -o ./static/styles/style.min.css

FROM gcr.io/distroless/base-debian12
WORKDIR /app

COPY --from=builder /bin/server ./
COPY --from=builder /src/static/ ./static/

CMD ["./server"]
