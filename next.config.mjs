/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Short commit id shown in the workout app, so it's easy to tell which version a phone runs.
    NEXT_PUBLIC_APP_VERSION: (process.env.VERCEL_GIT_COMMIT_SHA || "dev").slice(0, 7),
  },
};

export default nextConfig;
