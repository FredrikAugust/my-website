# Fredrik's Personal Website

A simple Go web server that serves Fredrik's homepage.

The website is developed partially following the guide from [golang.dk](https://golang.dk/).

[`Taskfile`](https://taskfile.dev/) is used to automate tasks such as building, testing, and deploying the website.

Make sure to install tailwindcss to be able to build the CSS:

```bash
curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-macos-arm64
chmod +x tailwindcss-macos-arm64
mv tailwindcss-macos-arm64 tailwindcss
```

Run the dev server (this requires `air`):

```bash
task start:dev
```
