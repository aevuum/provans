// Lightweight shim to satisfy repository-level TypeScript checks.
// The real Nest AppModule lives in `src/backend/src/app.module.ts`. This
// file provides a minimal export so tooling that imports `./app.module`
// (like `src/main.ts`) can typecheck without pulling backend sources.

export class AppModule {}
