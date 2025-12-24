import { PPTPlan } from '@/types';

export function generateMarkdown(plan: PPTPlan): string {
  let md = `# ${plan.topic}\n\n`;

  plan.pages.forEach((page, index) => {
    md += `## Slide ${index + 1}: ${page.title}\n\n`;
    md += `### Content\n${page.content}\n\n`;
    md += `### Visual Suggestion\n${page.visual}\n\n`;
    md += `---\n\n`;
  });

  return md;
}
