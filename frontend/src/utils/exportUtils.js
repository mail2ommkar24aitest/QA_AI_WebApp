/**
 * Utility to parse Markdown tables and export to CSV (Excel compatible)
 */
export function downloadTableAsExcel(markdownText, filename = 'test_cases_export.csv') {
  const lines = markdownText.split('\n');
  // Detect if it's a pipe table or a comma-separated list
  const isPipeTable = lines.some(l => l.trim().startsWith('|') && l.trim().endsWith('|'));
  
  let rows = [];

  if (isPipeTable) {
    const tableLines = lines.filter(line => line.trim().startsWith('|') && line.trim().endsWith('|'));
    rows = tableLines
      .filter(line => !line.includes('---')) // Remove separator row
      .map(line => {
        const cells = line.split('|').slice(1, -1);
        return cells.map(cell => {
          let content = cell.trim();
          if (content.includes('"') || content.includes(',')) {
            content = `"${content.replace(/"/g, '""')}"`;
          }
          return content;
        }).join(',');
      });
  } else {
    // Basic CSV heuristic: lines with multiple commas
    rows = lines.filter(l => (l.match(/,/g) || []).length >= 2);
  }
  
  if (rows.length < 1) return;

  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
