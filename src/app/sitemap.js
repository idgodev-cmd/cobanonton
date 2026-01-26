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
      url: `${baseUrl}/anime`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/drama`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/movie`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    // List pages
    {
      url: `${baseUrl}/anime/list`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/drama/list`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/movie/list`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    // Search page
    {
      url: `${baseUrl}/search`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    // Library
    {
      url: `${baseUrl}/library`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];
}
