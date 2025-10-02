/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://mushrf.co',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
  },
  exclude: ['/api/*', '/admin/*'],
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
};

