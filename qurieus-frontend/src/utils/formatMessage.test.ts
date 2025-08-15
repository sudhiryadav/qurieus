import { formatMessageText } from './formatMessage';

describe('formatMessageText', () => {
  test('should make HTTP URLs clickable', () => {
    const input = 'Check out this link: http://example.com';
    const result = formatMessageText(input);
    expect(result).toContain('<a href="http://example.com"');
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  test('should make HTTPS URLs clickable', () => {
    const input = 'Check out this link: https://example.com';
    const result = formatMessageText(input);
    expect(result).toContain('<a href="https://example.com"');
  });

  test('should make www URLs clickable with https protocol', () => {
    const input = 'Check out this link: www.example.com';
    const result = formatMessageText(input);
    expect(result).toContain('<a href="https://www.example.com"');
  });

  test('should handle URLs with query parameters', () => {
    const input = 'Check out this link: https://example.com?param=value';
    const result = formatMessageText(input);
    expect(result).toContain('<a href="https://example.com?param=value"');
  });

  test('should handle URLs with paths', () => {
    const input = 'Check out this link: https://example.com/path/to/page';
    const result = formatMessageText(input);
    expect(result).toContain('<a href="https://example.com/path/to/page"');
  });

  test('should handle multiple URLs in the same text', () => {
    const input = 'Check out these links: http://example1.com and https://example2.com';
    const result = formatMessageText(input);
    expect(result).toContain('<a href="http://example1.com"');
    expect(result).toContain('<a href="https://example2.com"');
  });

  test('should preserve other formatting', () => {
    const input = '**Bold text** with a link: https://example.com';
    const result = formatMessageText(input);
    expect(result).toContain('<strong class="font-semibold">Bold text</strong>');
    expect(result).toContain('<a href="https://example.com"');
  });

  test('should escape HTML to prevent XSS', () => {
    const input = '<script>alert("xss")</script>https://example.com';
    const result = formatMessageText(input);
    expect(result).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(result).toContain('<a href="https://example.com"');
  });

  test('should handle empty text', () => {
    const result = formatMessageText('');
    expect(result).toBe('');
  });

  test('should handle text with no URLs', () => {
    const input = 'This is just regular text with no URLs.';
    const result = formatMessageText(input);
    expect(result).toBe(input);
  });
});
