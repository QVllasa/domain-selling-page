import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const domainName = process.env.NEXT_PUBLIC_DOMAIN_NAME || 'yourdomain.com'
  const baseUrl = `https://${domainName}`

  return [
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/de`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}