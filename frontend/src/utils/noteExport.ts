interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  date: string;
  attendees?: string[];
  meetingTime?: string;
  createdAt: string;
  updatedAt: string;
}

export const exportToMarkdown = (note: Note): string => {
  let markdown = `# ${note.title}\n\n`;
  
  // Add metadata
  markdown += `**Date:** ${new Date(note.date).toLocaleDateString()}\n`;
  if (note.meetingTime) {
    markdown += `**Time:** ${note.meetingTime}\n`;
  }
  markdown += `**Category:** ${note.category}\n`;
  
  if (note.tags.length > 0) {
    markdown += `**Tags:** ${note.tags.join(', ')}\n`;
  }
  
  if (note.attendees && note.attendees.length > 0) {
    markdown += `**Attendees:** ${note.attendees.join(', ')}\n`;
  }
  
  markdown += `\n---\n\n`;
  
  // Convert HTML content to markdown (basic conversion)
  let content = note.content;
  
  // Convert HTML headers to markdown
  content = content.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1');
  content = content.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1');
  content = content.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1');
  content = content.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1');
  content = content.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1');
  content = content.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1');
  
  // Convert HTML formatting to markdown
  content = content.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  content = content.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  content = content.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  content = content.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  content = content.replace(/<u[^>]*>(.*?)<\/u>/gi, '_$1_');
  
  // Convert lists
  content = content.replace(/<ul[^>]*>/gi, '');
  content = content.replace(/<\/ul>/gi, '');
  content = content.replace(/<ol[^>]*>/gi, '');
  content = content.replace(/<\/ol>/gi, '');
  content = content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1');
  
  // Convert blockquotes
  content = content.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1');
  
  // Convert paragraphs
  content = content.replace(/<p[^>]*>/gi, '');
  content = content.replace(/<\/p>/gi, '\n\n');
  
  // Convert line breaks
  content = content.replace(/<br[^>]*>/gi, '\n');
  
  // Remove any remaining HTML tags
  content = content.replace(/<[^>]*>/g, '');
  
  // Clean up extra whitespace
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  content = content.trim();
  
  markdown += content;
  
  // Add footer
  markdown += `\n\n---\n\n*Generated on ${new Date().toLocaleString()}*\n`;
  markdown += `*Note ID: ${note.id}*`;
  
  return markdown;
};

export const downloadMarkdown = (note: Note): void => {
  const markdown = exportToMarkdown(note);
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const exportToHTML = (note: Note): string => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${note.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
      color: #333;
    }
    .metadata {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      border-left: 4px solid #007bff;
    }
    .metadata p {
      margin: 0.5rem 0;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.875rem;
    }
    .content {
      margin-top: 2rem;
    }
    .footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #ddd;
      font-size: 0.875rem;
      color: #666;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
    h1 {
      color: #1976d2;
      border-bottom: 2px solid #e3f2fd;
      padding-bottom: 0.5rem;
    }
    ul, ol {
      padding-left: 1.5rem;
    }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 1rem;
      margin-left: 0;
      font-style: italic;
    }
    @media print {
      body {
        padding: 1rem;
      }
      .footer {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <h1>${note.title}</h1>
  
  <div class="metadata">
    <p><strong>Date:</strong> ${new Date(note.date).toLocaleDateString()}</p>
    ${note.meetingTime ? `<p><strong>Time:</strong> ${note.meetingTime}</p>` : ''}
    <p><strong>Category:</strong> ${note.category}</p>
    ${note.attendees && note.attendees.length > 0 ? `<p><strong>Attendees:</strong> ${note.attendees.join(', ')}</p>` : ''}
    ${note.tags.length > 0 ? `
      <p><strong>Tags:</strong></p>
      <div class="tags">
        ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    ` : ''}
  </div>
  
  <div class="content">
    ${note.content}
  </div>
  
  <div class="footer">
    <p>Generated on ${new Date().toLocaleString()}</p>
    <p>Note ID: ${note.id}</p>
  </div>
</body>
</html>`;

  return html;
};

export const downloadHTML = (note: Note): void => {
  const html = exportToHTML(note);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const printNote = (note: Note): void => {
  const html = exportToHTML(note);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
};

export const copyToClipboard = async (note: Note): Promise<void> => {
  const markdown = exportToMarkdown(note);
  
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(markdown);
      return;
    } catch (error) {
      console.warn('Failed to use Clipboard API, falling back to legacy method');
    }
  }
  
  // Fallback for older browsers
  const textArea = document.createElement('textarea');
  textArea.value = markdown;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw new Error('Failed to copy to clipboard');
  } finally {
    document.body.removeChild(textArea);
  }
};