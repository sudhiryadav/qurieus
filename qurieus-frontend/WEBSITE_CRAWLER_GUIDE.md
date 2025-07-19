# Website Crawler Admin Feature

## Overview

The Website Crawler is an admin-only feature that allows you to crawl websites, extract meaningful content, and generate documents for users who don't have their own documents. This is particularly useful for providing sample content or creating knowledge bases from public websites.

## Features

### 🔍 **Recursive Website Crawling**
- Crawls websites starting from a homepage URL
- Follows internal links recursively up to a configurable depth
- Respects robots.txt and implements polite crawling delays
- Extracts meaningful content from multiple pages

### 📄 **Content Extraction**
- Extracts page titles, meta descriptions, and main content
- Removes navigation, headers, footers, and other non-content elements
- Cleans and normalizes text content
- Preserves document structure and formatting

### ⚙️ **Configurable Settings**
- **Maximum Depth**: How deep to crawl from the homepage (1-10 levels)
- **Maximum Pages**: Total number of pages to crawl (1-1000)
- **Delay**: Time between requests to be respectful to servers (0-5000ms)
- **Include Links**: Whether to extract and follow internal links
- **Respect Robots.txt**: Whether to check robots.txt before crawling

### 📊 **Real-time Progress Tracking**
- Live progress updates during crawling
- Status indicators (running, completed, failed)
- Page count and completion percentage
- Ability to stop crawling at any time

### 💾 **Document Generation**
- Download extracted content as text files
- Generate documents for user consumption
- Integration with existing document processing system

## Access

### Prerequisites
- Admin or Super Admin role required
- Valid authentication token

### Navigation
1. Log in as an admin user
2. Navigate to **Admin** → **Website Crawler** in the sidebar
3. The crawler interface will be available

## Usage Guide

### Step 1: Enter Website URL
1. In the **Website Crawler** tab, enter the homepage URL of the website you want to crawl
2. Ensure the URL includes the protocol (e.g., `https://example.com`)
3. The system will validate the URL format

### Step 2: Configure Settings (Optional)
1. Click on the **Settings** tab
2. Adjust crawling parameters:
   - **Maximum Depth**: Recommended 3-5 for most websites
   - **Maximum Pages**: Recommended 50-100 for initial testing
   - **Delay**: Recommended 1000ms to be respectful to servers

### Step 3: Start Crawling
1. Click **Start Crawling** button
2. The system will begin crawling in the background
3. Monitor progress in the **Crawl Progress** section
4. You can stop crawling at any time using the **Stop** button

### Step 4: Review Results
1. Once crawling is complete, extracted content will appear in the **Extracted Content** section
2. Review the content to ensure it meets your needs
3. The content includes page titles, text, and source URLs

### Step 5: Generate Document
1. Click **Download Document** to save the content as a text file
2. Click **Generate for User** to create a document in the system for user queries
3. The generated document will be available for AI-powered Q&A

## API Endpoints

### Start Crawling
```http
POST /api/v1/admin/website-crawler/start
Content-Type: application/json
Authorization: Bearer <token>

{
  "url": "https://example.com",
  "settings": {
    "maxDepth": 3,
    "maxPages": 50,
    "includeImages": false,
    "includeLinks": true,
    "respectRobotsTxt": true,
    "delay": 1000
  }
}
```

### Get Crawl Status
```http
GET /api/v1/admin/website-crawler/status/{job_id}
Authorization: Bearer <token>
```

### Stop Crawling
```http
POST /api/v1/admin/website-crawler/stop/{job_id}
Authorization: Bearer <token>
```

### Get All Jobs
```http
GET /api/v1/admin/website-crawler/jobs
Authorization: Bearer <token>
```

### Download Content
```http
POST /api/v1/admin/website-crawler/download
Content-Type: application/json
Authorization: Bearer <token>

{
  "content": "extracted content...",
  "sourceUrl": "https://example.com",
  "format": "txt"
}
```

### Generate Document
```http
POST /api/v1/admin/website-crawler/generate-document
Content-Type: application/json
Authorization: Bearer <token>

{
  "content": "extracted content...",
  "sourceUrl": "https://example.com",
  "title": "Website Content from example.com",
  "description": "Automatically generated document from website crawling"
}
```

## Technical Details

### Content Extraction Algorithm
1. **Title Extraction**: Gets the `<title>` tag content using regex
2. **Meta Description**: Extracts meta description for context
3. **Main Content**: Uses multiple regex patterns to find main content:
   - `<main>`, `<article>` tags
   - `<div>` with class containing "main" or "content"
   - `<div>` with id "content" or "main"
   - Fallback to `<body>` content
4. **Link Extraction**: Finds all `<a>` tags and converts to absolute URLs
5. **Content Cleaning**: Removes scripts, styles, navigation, and normalizes text

### Crawling Strategy
1. **Recursive Depth-First**: Crawls pages recursively up to specified depth
2. **Same-Domain Only**: Only follows links within the same domain
3. **Duplicate Prevention**: Tracks visited URLs to avoid loops
4. **Respectful Delays**: Implements configurable delays between requests
5. **Error Handling**: Continues crawling even if individual pages fail

### Performance Considerations
- **Frontend Processing**: Uses Next.js API routes with fetch API
- **Memory Management**: Processes pages incrementally to avoid memory issues
- **Timeout Handling**: 30-second timeout per page request
- **Background Processing**: Crawling runs in background async functions

## Best Practices

### For Admins
1. **Start Small**: Begin with low depth (2-3) and page limits (20-50)
2. **Test First**: Always test on a small website before crawling large sites
3. **Respect Servers**: Use appropriate delays (1000ms+) to avoid overwhelming servers
4. **Monitor Progress**: Watch the progress indicators and stop if needed
5. **Review Content**: Always review extracted content before generating documents

### For Different Website Types
- **Blog Sites**: Use depth 3-5, focus on article content
- **Documentation Sites**: Use depth 2-3, focus on main content areas
- **News Sites**: Use depth 2-3, be mindful of dynamic content
- **E-commerce Sites**: Use depth 1-2, focus on product descriptions

### Content Quality
- **Filter Results**: Remove low-quality or duplicate content
- **Structure Content**: Organize content by sections or topics
- **Add Context**: Include source URLs and timestamps
- **Validate Accuracy**: Ensure extracted content is accurate and complete

## Troubleshooting

### Common Issues

1. **Crawling Fails Immediately**
   - Check URL format and accessibility
   - Verify network connectivity
   - Check if website blocks automated requests

2. **No Content Extracted**
   - Website may use JavaScript for content
   - Check if content is in iframes
   - Verify CSS selectors are appropriate

3. **Crawling Takes Too Long**
   - Reduce maximum depth and page limits
   - Increase delay between requests
   - Check for infinite link loops

4. **Poor Content Quality**
   - Adjust CSS selectors for better content targeting
   - Filter out navigation and footer content
   - Review and clean extracted text manually

### Error Messages

- **"Invalid URL provided"**: Check URL format and protocol
- **"Job not found"**: Crawl job may have expired or been cleared
- **"Admin access required"**: Verify user has admin privileges
- **"HTTP 403/429"**: Website is blocking automated requests

### Performance Optimization

1. **Database Storage**: In production, use Redis or database for job storage
2. **Caching**: Cache crawled content to avoid re-crawling
3. **Rate Limiting**: Implement proper rate limiting per domain
4. **Monitoring**: Add metrics for crawl success rates and performance

## Security Considerations

1. **Authentication**: All endpoints require valid admin authentication
2. **Input Validation**: URLs are validated before processing
3. **Rate Limiting**: Implement delays to avoid overwhelming target servers
4. **Content Filtering**: Filter out potentially malicious content
5. **Access Control**: Only admin users can access crawler functionality

## Future Enhancements

### Planned Features
1. **Advanced Content Filtering**: AI-powered content quality assessment
2. **Scheduled Crawling**: Automatically crawl websites on schedule
3. **Content Deduplication**: Remove duplicate content automatically
4. **Multi-language Support**: Handle websites in different languages
5. **Image and Media Extraction**: Extract and process images and videos
6. **Sitemap Integration**: Use sitemaps for more efficient crawling
7. **Robots.txt Parser**: Proper robots.txt parsing and compliance

### Integration Opportunities
1. **Document Processing**: Direct integration with existing document pipeline
2. **Embedding Generation**: Automatic embedding generation for crawled content
3. **Search Indexing**: Add crawled content to search indexes
4. **Analytics**: Track crawling performance and content quality metrics

## Support

For issues or questions about the Website Crawler:
1. Check the troubleshooting section above
2. Review server logs for detailed error messages
3. Test with simple websites first
4. Contact the development team for technical support

---

**Note**: This feature is intended for legitimate use cases only. Always respect website terms of service and robots.txt files. Use appropriate delays and limits to avoid overwhelming target servers. 