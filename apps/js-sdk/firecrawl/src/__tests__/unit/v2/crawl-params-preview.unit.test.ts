import {
  crawlParamsPreview,
  crawlParamsPreviewDetailed,
} from "../../../v2/methods/crawl";
import { describe, test, expect, jest } from "@jest/globals";

describe("v2.crawl params preview unit", () => {
  test("crawlParamsPreviewDetailed returns params + warning + context", async () => {
    const http = {
      post: jest.fn().mockResolvedValue({
        status: 200,
        data: {
          success: true,
          data: { includePaths: ["/blog/*"], limit: 25 },
          warning: "Prompt was broad; maxDepth capped to 2.",
          context: {
            websiteUrlCount: 17,
            sampledWebsiteUrls: ["https://docs.firecrawl.dev/blog", "https://docs.firecrawl.dev/changelog"],
          },
        },
      }),
    } as any;

    const result = await crawlParamsPreviewDetailed(
      http,
      "https://docs.firecrawl.dev",
      "Crawl product docs and changelog pages",
    );

    expect(result).toEqual({
      params: { includePaths: ["/blog/*"], limit: 25 },
      warning: "Prompt was broad; maxDepth capped to 2.",
      context: {
        websiteUrlCount: 17,
        sampledWebsiteUrls: ["https://docs.firecrawl.dev/blog", "https://docs.firecrawl.dev/changelog"],
      },
    });
    expect(http.post).toHaveBeenCalledWith("/v2/crawl/params-preview", {
      url: "https://docs.firecrawl.dev",
      prompt: "Crawl product docs and changelog pages",
    });
  });

  test("crawlParamsPreview keeps legacy shape for backward compatibility", async () => {
    const http = {
      post: jest.fn().mockResolvedValue({
        status: 200,
        data: {
          success: true,
          data: { includePaths: ["/docs/*"] },
          warning: "No sitemap found; fallback inferred paths.",
        },
      }),
    } as any;

    const result = await crawlParamsPreview(
      http,
      "https://docs.firecrawl.dev",
      "Crawl docs only",
    );

    expect(result).toEqual({
      includePaths: ["/docs/*"],
      warning: "No sitemap found; fallback inferred paths.",
    });
  });
});
