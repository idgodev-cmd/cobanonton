export default function sitemap() {
  const baseUrl = "https://cobanonton.com";
  const currentDate = new Date();

  return [
    // Homepage
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    // Main sections
    {
      url: `${base}/anime`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/drama`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/movie`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    // List pages
    {
      url: `${base}/anime/list`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${base}/drama/list`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${base}/movie/list`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    // Search page
    {
      url: `${base}/search`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    // Library
    {
      url: `${base}/library`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];
}
