# Auth
Auth is handled using better-auth and convex for the backend.
The better-auth api runs on convex api routes, and was set up following [this guide](https://convex-better-auth.netlify.app/framework-guides/expo).
## Development Setup
Set the better auth secret
```
pnpm convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
```
