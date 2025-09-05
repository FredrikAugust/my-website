# Fredrik's Personal Website

A simple Go web server that serves Fredrik's personal blog homepage. Displays the current date and a welcome message.

## Running locally

```bash
go run main.go
```

The server will start on port 8080.

## Docker

The application is containerized and automatically built using GitHub Actions. Docker images are pushed to GitHub Container Registry and can be used in Kubernetes deployments.