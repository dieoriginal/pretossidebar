import { NextRequest } from 'next/server'

// Simple photo resolver using Wikipedia REST API.
// Given ?query=Casa+da+Música+Porto, returns a thumbnail image URL if available.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query')?.trim();
  if (!query) {
    return new Response(JSON.stringify({ error: 'Missing query' }), { status: 400 });
  }
  try {
    // First: search pages
    const searchUrl = `https://pt.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(query)}&limit=1`;
    const s = await fetch(searchUrl, { headers: { 'accept': 'application/json' } });
    const sJson = await s.json();
    const page = sJson?.pages?.[0];
    if (!page) {
      return new Response(JSON.stringify({ url: null }), { status: 200 });
    }
    const title = page.title;
    // Get page summary which often contains thumbnail
    const summaryUrl = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const r = await fetch(summaryUrl, { headers: { 'accept': 'application/json' } });
    const j = await r.json();
    const thumb = j?.thumbnail?.source || j?.originalimage?.source || null;
    return new Response(JSON.stringify({ url: thumb, title }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'lookup_failed' }), { status: 500 });
  }
}
