/**
 * Simple utility to convert Atlassian Document Format (ADF) to plain text.
 * Jira v3 API returns descriptions in this complex JSON format.
 */
export function adfToText(adf) {
  if (!adf) return '';
  if (typeof adf === 'string') return adf;
  
  let text = '';
  
  function traverse(node) {
    if (node.text) {
      text += node.text;
    }
    if (node.content) {
      node.content.forEach(traverse);
    }
    // Add newlines for paragraphs and list items
    if (node.type === 'paragraph' || node.type === 'listItem') {
      text += '\n';
    }
  }

  try {
    if (Array.isArray(adf.content)) {
      adf.content.forEach(traverse);
    }
  } catch (e) {
    console.error('Error parsing ADF:', e);
    return JSON.stringify(adf); // Fallback to JSON if parsing fails
  }
  
  return text.trim();
}
