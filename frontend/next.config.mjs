const api = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000");
const config = {
  agentRules: false,
  turbopack: { root: process.cwd() },
  images: {
    remotePatterns: [
      {
        protocol: api.protocol.slice(0, -1),
        hostname: api.hostname,
        port: api.port,
        pathname: "/uploads/**",
      },
    ],
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default config;
