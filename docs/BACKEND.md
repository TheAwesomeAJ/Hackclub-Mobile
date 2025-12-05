# Backend 
Auth is handled using better-auth and backend is handled by convex. Convex 
The better-auth api runs on convex api routes, and was set up following [this guide](https://convex-better-auth.netlify.app/framework-guides/expo).
## Development Setup
### Run convex dev command to set up locally or cloud
```
pnpm dlx convex dev
```

### Generate a better auth secret
```
pnpm convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
```

### Setup client id and secret
Get a client ID and secret from [Hack Club](https://auth.hackclub.com/developer/apps)
```
pnpm dlx convex env set HACKCLUB_CLIENT_ID=your_client_id
pnpm dlx convex env set HACKCLUB_CLIENT_SECRET=your_client_secret
```
(tip: use `$(read)` so it doesn't get saved in your shell history)
