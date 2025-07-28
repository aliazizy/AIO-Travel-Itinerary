import { NextApiRequest, NextApiResponse } from 'next';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface WebSearchResponse {
  results: SearchResult[];
  query: string;
}

// Simple web search using DuckDuckGo Instant Answer API
async function performWebSearch(query: string, limit: number = 5): Promise<SearchResult[]> {
  try {
    // Use DuckDuckGo's instant answer API (free, no API key required)
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'AIO Travel Itinerary Assistant/1.0'
      }
    });

    if (!response.ok) {
      throw new Error('Search API request failed');
    }

    const data = await response.json();
    const results: SearchResult[] = [];

    // Extract results from DuckDuckGo response
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics.slice(0, limit)) {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 100),
            url: topic.FirstURL,
            snippet: topic.Text
          });
        }
      }
    }

    // If no related topics, try to use the abstract
    if (results.length === 0 && data.Abstract) {
      results.push({
        title: data.Heading || 'Search Result',
        url: data.AbstractURL || '#',
        snippet: data.Abstract
      });
    }

    // Fallback: create mock results if no real results found
    if (results.length === 0) {
      results.push({
        title: `Search results for: ${query}`,
        url: '#',
        snippet: `No specific web search results found for "${query}". This is a placeholder result as web search functionality requires additional API setup.`
      });
    }

    return results;
  } catch (error) {
    console.error('Web search error:', error);
    
    // Return mock results on error
    return [
      {
        title: `Search results for: ${query}`,
        url: '#',
        snippet: `Web search temporarily unavailable. This is a mock result for "${query}". To enable real web search, configure a search API provider.`
      }
    ];
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<WebSearchResponse | { error: string }>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, limit = 5 } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await performWebSearch(query, Math.min(limit, 10));

    return res.status(200).json({
      results,
      query
    });

  } catch (error) {
    console.error('Web search API error:', error);
    return res.status(500).json({
      error: 'Failed to perform web search'
    });
  }
}