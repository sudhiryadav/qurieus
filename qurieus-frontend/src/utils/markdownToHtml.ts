import { remark } from "remark";
import html from "remark-html";

function linkify(htmlString: string): string {
  // Email: basic pattern
  htmlString = htmlString.replace(
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    '<a href="mailto:$1">$1</a>'
  );
  // Phone: matches numbers like +1234567890, (123) 456-7890, 123-456-7890, etc.
  htmlString = htmlString.replace(
    /(\+?\d[\d\s\-().]{7,}\d)/g,
    (match) => {
      // Remove spaces, dashes, parentheses for tel: link
      const tel = match.replace(/[\s\-().]/g, "");
      return `<a href="tel:${tel}">${match}</a>`;
    }
  );
  return htmlString;
}

export default async function markdownToHtml(markdown: string) {
  const result = await remark().use(html).process(markdown);
  return linkify(result.toString());
}
