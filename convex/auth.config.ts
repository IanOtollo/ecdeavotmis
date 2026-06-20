export default {
  providers: [
    {
      // Convex Auth's own JWKS endpoint (served by auth.addHttpRoutes in http.ts)
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
