/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  webpack(config) {
    config.resolve.fallback = {
      fs: false,
      path: false,
      constants: false,
      http: false,
      https: false,
      querystring: false,
      stream: require.resolve("stream-browserify"),
      crypto: require.resolve("crypto-browserify"),
      zlib: require.resolve("browserify-zlib"),
    }
    return config
  },
}
