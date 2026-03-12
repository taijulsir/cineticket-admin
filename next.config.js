
/** @type {import('next').NextConfig} */
const nextConfig = {
	distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
	images: {
		// Allow the external picsum.photos images used in the app
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'picsum.photos',
			},
		],
	},
};

module.exports = nextConfig;
