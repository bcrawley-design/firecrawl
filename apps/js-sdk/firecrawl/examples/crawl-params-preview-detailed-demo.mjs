import { createServer } from 'node:http';
import Firecrawl from '../dist/index.js';

function createMockServer() {
  return createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/v2/crawl/params-preview') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        const parsed = JSON.parse(body || '{}');
        const response = {
          success: true,
          data: {
            url: parsed.url,
            includePaths: ['/docs/*', '/changelog/*'],
            excludePaths: ['/admin/*', '/auth/*'],
            maxDiscoveryDepth: 2,
            limit: 50,
          },
          warning: 'Prompt was broad; maxDepth capped to 2.',
          context: {
            websiteUrlCount: 14,
            sampledWebsiteUrls: [
              'https://docs.firecrawl.dev/docs/introduction',
              'https://docs.firecrawl.dev/changelog',
            ],
          },
        };

        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(response));
      });
      return;
    }

    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'not found' }));
  });
}

async function run() {
  const server = createMockServer();
  await new Promise(resolve => server.listen(8787, '127.0.0.1', resolve));

  const client = new Firecrawl({
    apiKey: 'demo-key-not-used-locally',
    apiUrl: 'http://127.0.0.1:8787',
  });

  const detailed = await client.crawlParamsPreviewDetailed(
    'https://docs.firecrawl.dev',
    'Crawl docs and changelog pages only',
  );

  const legacy = await client.crawlParamsPreview(
    'https://docs.firecrawl.dev',
    'Crawl docs and changelog pages only',
  );

  console.log('=== crawlParamsPreviewDetailed ===');
  console.log(JSON.stringify(detailed, null, 2));
  console.log('\n=== crawlParamsPreview (legacy) ===');
  console.log(JSON.stringify(legacy, null, 2));

  server.close();
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
