import { createFileRoute, redirect } from "@tanstack/react-router";

// Old discovery URL: listings now live on the home page.
export const Route = createFileRoute("/search")({
  beforeLoad: () => { throw redirect({ to: "/", statusCode: 301 }); },
});
