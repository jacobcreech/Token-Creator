/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = {
  nextConfig,
  webpack(config){
    config.resolve.fallback = { 
      fs: false, 
      path: false, 
      constants: false, 
      stream: require.resolve('stream-browserify'), 
      crypto: require.resolve('crypto-browserify'),
      zlib: require.resolve('browserify-zlib')
    }
    return config;
  },
};