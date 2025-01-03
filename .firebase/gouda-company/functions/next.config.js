"use strict";

// next.config.js
var nextConfig = {
  // Exclude Firebase Functions from Next.js compilation
  typescript: {
    ignoreBuildErrors: true
  },
  webpack: (config) => {
    config.externals.push({
      "firebase-functions": "firebase-functions"
    });
    return config;
  }
};
module.exports = nextConfig;
