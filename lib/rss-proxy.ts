interface RSSItem {
  title: string
  description: string
  link: string
  pubDate: string
  source?: string
  category?: string
  imageUrl?: string
}

interface RSSFeed {
  title: string
  description: string
  items: RSSItem[]
}

// Updated with more reliable RSS proxy services
const RSS_PROXY_SERVICES = [
  "https://api.rss2json.com/v1/api.json?rss_url=",
  "https://rss-proxy.vercel.app/api?url=",
  "https://api.allorigins.win/get?url=",
  "https://thingproxy.freeboard.io/fetch/",
]

// More reliable and accessible RSS feeds
const RELIABLE_FEEDS = {
  Technology: [
    "https://feeds.feedburner.com/TechCrunch",
    "https://www.wired.com/feed/rss",
    "https://feeds.arstechnica.com/arstechnica/index",
    "https://rss.cnn.com/rss/edition_technology.rss",
    "https://feeds.bbci.co.uk/news/technology/rss.xml",
  ],
  "World News": [
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://rss.cnn.com/rss/edition.rss",
    "https://feeds.reuters.com/reuters/worldNews",
    "https://www.npr.org/rss/rss.php?id=1001",
    "https://feeds.washingtonpost.com/rss/world",
  ],
  Business: [
    "https://feeds.reuters.com/reuters/businessNews",
    "https://rss.cnn.com/rss/money_latest.rss",
    "https://feeds.bbci.co.uk/news/business/rss.xml",
    "https://www.npr.org/rss/rss.php?id=1006",
    "https://feeds.feedburner.com/venturebeat/SZYF",
  ],
  Sports: [
    "https://feeds.bbci.co.uk/sport/rss.xml",
    "https://rss.cnn.com/rss/edition_sport.rss",
    "https://www.espn.com/espn/rss/news",
    "https://feeds.reuters.com/reuters/sportsNews",
    "https://www.npr.org/rss/rss.php?id=1055",
  ],
  Entertainment: [
    "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
    "https://rss.cnn.com/rss/edition_entertainment.rss",
    "https://feeds.feedburner.com/variety/headlines",
    "https://feeds.reuters.com/reuters/entertainment",
    "https://www.npr.org/rss/rss.php?id=1008",
  ],
  Health: [
    "https://feeds.bbci.co.uk/news/health/rss.xml",
    "https://rss.cnn.com/rss/edition_health.rss",
    "https://feeds.reuters.com/reuters/health",
    "https://www.npr.org/rss/rss.php?id=1128",
    "https://feeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC",
  ],
  Science: [
    "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
    "https://rss.cnn.com/rss/edition_space.rss",
    "https://feeds.feedburner.com/sciencedaily",
    "https://www.npr.org/rss/rss.php?id=1007",
    "https://feeds.reuters.com/reuters/scienceNews",
  ],
  Politics: [
    "https://feeds.bbci.co.uk/news/politics/rss.xml",
    "https://rss.cnn.com/rss/edition_politics.rss",
    "https://feeds.reuters.com/Reuters/PoliticsNews",
    "https://www.npr.org/rss/rss.php?id=1014",
    "https://feeds.washingtonpost.com/rss/politics",
  ],
  Gaming: [
    "https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNREZ0ZHpFU0FtVnVLQUFQAQ?hl=en-US&gl=US&ceid=US%3Aen",
  ],
  AI: [
    "https://news.google.com/rss/topics/CAAqIAgKIhpDQkFTRFFvSEwyMHZNRzFyZWhJQ1pXNG9BQVAB?hl=en-US&gl=US&ceid=US%3Aen",
  ],
}

// Backup Google News feeds (as fallback)
const GOOGLE_NEWS_FEEDS = {
  Technology:
    "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US%3Aen",
  "World News":
    "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US%3Aen",
  Business:
    "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US%3Aen",
  Sports:
    "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US%3Aen",
  Entertainment:
    "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US%3Aen",
  Health:
    "https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtVnVLQUFQAQ?hl=en-US&gl=US&ceid=US%3Aen",
  Science:
    "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US%3Aen",
  Politics:
    "https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNRFZ4ZERBU0FtVnVLQUFQAQ?hl=en-US&gl=US&ceid=US%3Aen",
  Gaming: 
    "https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNREZ0ZHpFU0FtVnVLQUFQAQ?hl=en-US&gl=US&ceid=US%3Aen",
  AI: 
    "https://news.google.com/rss/topics/CAAqIAgKIhpDQkFTRFFvSEwyMHZNRzFyZWhJQ1pXNG9BQVAB?hl=en-US&gl=US&ceid=US%3Aen",
}

function cleanText(text: string): string {
  return text
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

async function fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
        "Cache-Control": "no-cache",
      },
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function fetchWithProxy(url: string, proxyService: string): Promise<string> {
  let proxyUrl: string;
  
  if (proxyService.includes("rss2json")) {
    proxyUrl = proxyService + encodeURIComponent(url);
  } else if (proxyService.includes("allorigins")) {
    proxyUrl = proxyService + encodeURIComponent(url);
  } else if (proxyService.includes("thingproxy")) {
    proxyUrl = proxyService + url;
  } else {
    proxyUrl = proxyService + url;
  }

  console.log(`🔄 Trying proxy: ${proxyService.split('/')[2]}`);

  const response = await fetchWithTimeout(proxyUrl, 15000);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.text();

  // Handle different proxy response formats
  if (proxyService.includes("allorigins")) {
    try {
      const jsonData = JSON.parse(data);
      return jsonData.contents || data;
    } catch {
      return data;
    }
  } else if (proxyService.includes("rss2json")) {
    try {
      const jsonData = JSON.parse(data);
      if (jsonData.status === "ok" && jsonData.items) {
        return convertRss2JsonToXML(jsonData);
      } else {
        throw new Error(`RSS2JSON error: ${jsonData.message || "Unknown error"}`);
      }
    } catch (error) {
      throw new Error(`RSS2JSON parsing error: ${error}`);
    }
  }

  return data;
}

function convertRss2JsonToXML(jsonData: any): string {
  let xml = '<?xml version="1.0"?><rss><channel>';
  xml += `<title>${jsonData.feed?.title || "News Feed"}</title>`;
  xml += `<description>${jsonData.feed?.description || ""}</description>`;

  jsonData.items?.forEach((item: any) => {
    xml += "<item>";
    xml += `<title><![CDATA[${item.title || ""}]]></title>`;
    xml += `<description><![CDATA[${item.description || item.content || ""}]]></description>`;
    xml += `<link>${item.link || item.guid || ""}</link>`;
    xml += `<pubDate>${item.pubDate || new Date().toISOString()}</pubDate>`;
    xml += `<source>${item.author || "RSS Feed"}</source>`;
    xml += "</item>";
  });

  xml += "</channel></rss>";
  return xml;
}

function parseXMLFeed(xmlString: string, category: string): RSSFeed {
  const items: RSSItem[] = [];

  try {
    console.log(`📰 Parsing XML feed for category: ${category}`);

    // Extract feed title and description
    const titleMatch = xmlString.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/i);
    const feedTitle = titleMatch ? cleanText(titleMatch[1] || titleMatch[2] || "News Feed") : "News Feed";

    const descMatch = xmlString.match(
      /<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/i,
    );
    const feedDescription = descMatch ? cleanText(descMatch[1] || descMatch[2] || "") : "";

    // Extract items with more flexible parsing
    const itemPattern = /<item[^>]*>[\s\S]*?<\/item>/gi;
    const itemMatches = xmlString.match(itemPattern) || [];

    console.log(`🔍 Found ${itemMatches.length} items in feed`);

    for (const itemXml of itemMatches.slice(0, 15)) {
      try {
        const titleMatch = itemXml.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/i);
        const title = titleMatch ? cleanText(titleMatch[1] || titleMatch[2] || "") : "";

        const descMatch = itemXml.match(
          /<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>|<content:encoded[^>]*><!\[CDATA\[(.*?)\]\]><\/content:encoded>/i,
        );
        const description = descMatch ? cleanText(descMatch[1] || descMatch[2] || descMatch[3] || "") : "";

        const linkMatch = itemXml.match(/<link[^>]*>(.*?)<\/link>|<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/i);
        const link = linkMatch ? (linkMatch[1] || linkMatch[2]).trim() : "";

        const pubDateMatch = itemXml.match(/<pubDate[^>]*>(.*?)<\/pubDate>|<published[^>]*>(.*?)<\/published>/i);
        const pubDate = pubDateMatch ? (pubDateMatch[1] || pubDateMatch[2]).trim() : new Date().toISOString();

        const sourceMatch = itemXml.match(/<source[^>]*>(.*?)<\/source>|<author[^>]*>(.*?)<\/author>/i);
        const source = sourceMatch ? cleanText(sourceMatch[1] || sourceMatch[2] || "RSS Feed") : "RSS Feed";

        if (title && link && title.length > 5) {
          items.push({
            title,
            description: description.substring(0, 500), // Limit description length
            link,
            pubDate,
            source,
            category,
          });
        }
      } catch (error) {
        console.warn("⚠️ Error parsing individual item:", error);
        continue;
      }
    }

    console.log(`✅ Successfully parsed ${items.length} items for ${category}`);

    return {
      title: feedTitle,
      description: feedDescription,
      items,
    };
  } catch (error) {
    console.error(`❌ Error parsing XML feed for ${category}:`, error);
    return { title: "Error", description: "Failed to parse feed", items: [] };
  }
}

export async function fetchRSSFeed(category: string): Promise<RSSFeed> {
  console.log(`🌐 Fetching RSS feed for ${category}`);

  const reliableFeeds = RELIABLE_FEEDS[category as keyof typeof RELIABLE_FEEDS] || [];
  const googleFeed = GOOGLE_NEWS_FEEDS[category as keyof typeof GOOGLE_NEWS_FEEDS];

  // Prioritize reliable feeds, then Google News as backup
  const allFeeds = [...reliableFeeds, ...(googleFeed ? [googleFeed] : [])];

  if (allFeeds.length === 0) {
    throw new Error(`No RSS feeds configured for category: ${category}`);
  }

  let lastError: Error | null = null;

  // Try each feed URL
  for (const feedUrl of allFeeds) {
    console.log(`🔄 Trying feed: ${feedUrl}`);

    // Try direct fetch first (faster and more reliable)
    try {
      const response = await fetchWithTimeout(feedUrl, 10000);

      if (response.ok) {
        const xmlText = await response.text();
        if (xmlText && (xmlText.includes("<item") || xmlText.includes("<entry"))) {
          console.log(`✅ Direct fetch successful for: ${feedUrl}`);
          const result = parseXMLFeed(xmlText, category);
          if (result.items.length > 0) {
            return result;
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ Direct fetch failed for ${feedUrl}: ${error}`);
      lastError = error as Error;
    }

    // Try with proxy services only if direct fetch fails
    for (const proxyService of RSS_PROXY_SERVICES) {
      try {
        const xmlText = await fetchWithProxy(feedUrl, proxyService);
        if (xmlText && (xmlText.includes("<item") || xmlText.includes("<entry") || xmlText.includes("title"))) {
          console.log(`✅ Proxy fetch successful for: ${feedUrl}`);
          const result = parseXMLFeed(xmlText, category);
          if (result.items.length > 0) {
            return result;
          }
        }
      } catch (error) {
        console.log(`⚠️ Proxy ${proxyService.split('/')[2]} failed for ${feedUrl}: ${error}`);
        lastError = error as Error;
        continue;
      }
    }
  }

  throw new Error(`All RSS feeds failed for category: ${category}. Last error: ${lastError?.message}`);
}

export async function fetchNewsByCategory(category: string): Promise<RSSItem[]> {
  try {
    const feed = await fetchRSSFeed(category);
    return feed.items;
  } catch (error) {
    console.error(`❌ Failed to fetch news for category ${category}:`, error);
    throw error;
  }
}

export async function fetchAllNews(): Promise<RSSItem[]> {
  const categories = Object.keys(RELIABLE_FEEDS);
  const allItems: RSSItem[] = [];
  const errors: string[] = [];
  const successful: string[] = [];

  console.log(`🔄 Fetching news from ${categories.length} categories`);

  // Fetch categories in parallel with a reasonable concurrency limit
  const batchSize = 3;
  for (let i = 0; i < categories.length; i += batchSize) {
    const batch = categories.slice(i, i + batchSize);
    
    const promises = batch.map(async (category) => {
      try {
        console.log(`📂 Fetching ${category}...`);
        const items = await fetchNewsByCategory(category);
        console.log(`✅ ${category}: ${items.length} articles`);
        successful.push(category);
        return items.slice(0, 5); // Limit items per category for better performance
      } catch (error) {
        console.error(`❌ Failed to fetch ${category}:`, error);
        errors.push(`${category}: ${error instanceof Error ? error.message : "Unknown error"}`);
        return [];
      }
    });

    const results = await Promise.all(promises);
    results.forEach((items) => allItems.push(...items));
  }

  console.log(`📊 Total articles fetched: ${allItems.length} from ${successful.length}/${categories.length} categories`);
  
  if (errors.length > 0) {
    console.warn(`⚠️ Categories that failed (${errors.length}):`, errors);
  }

  if (allItems.length === 0) {
    throw new Error(`All RSS feeds failed. Errors: ${errors.join("; ")}`);
  }

  // Sort by publication date and remove duplicates
  const uniqueItems = allItems.filter((item, index, self) => 
    index === self.findIndex(t => t.link === item.link)
  );

  return uniqueItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}

export function getAvailableCategories(): string[] {
  return Object.keys(RELIABLE_FEEDS);
}
