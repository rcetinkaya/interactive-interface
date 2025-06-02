import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /paper\/dist\/paper-core\.min\.js$/,
      })
    );
    return config;
  },
};

export default nextConfig;
