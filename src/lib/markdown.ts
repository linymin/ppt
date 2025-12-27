import { PPTPlan } from '@/types';

export function generateText(plan: PPTPlan): string {
  let text = `主题: ${plan.topic}\n\n`;
  
  if (plan.design) {
    text += `==================================================\n`;
    text += `[视觉设计方案]\n\n`;
    
    text += `1. 设计风格: ${plan.design.style.name}\n`;
    text += `   描述: ${plan.design.style.description}\n`;
    text += `   理由: ${plan.design.style.reason}\n\n`;
    
    text += `2. 色彩方案:\n`;
    text += `   - 主色: ${plan.design.colors.primary.name} (${plan.design.colors.primary.hex})\n`;
    const secondaryColors = plan.design.colors.secondary.map(c => `${c.name} (${c.hex})`).join(', ');
    text += `   - 辅助色: ${secondaryColors}\n\n`;
    
    text += `3. 字体建议:\n`;
    text += `   - 标题: ${plan.design.fonts.title}\n`;
    text += `   - 正文: ${plan.design.fonts.body}\n`;
  }

  text += `==================================================\n\n`;

  plan.pages.forEach((page, index) => {
    text += `第 ${index + 1} 页 [${page.type || '页面'}]: ${page.title}\n`;
    text += `--------------------------------------------------\n`;
    
    text += `[正文内容]\n`;
    text += `${page.content}\n\n`;

    if (page.visualEnabled !== false) {
       text += `[视觉建议]\n`;
       text += `${page.visual || '(暂无建议)'}\n`;
    } else {
       text += `[视觉建议]\n`;
       text += `(无需配图)\n`;
    }
    
    text += `\n==================================================\n\n`;
  });

  return text;
}

export function generateMarkdown(plan: PPTPlan): string {
  let md = `# ${plan.topic}\n\n`;

  plan.pages.forEach((page, index) => {
    md += `## Slide ${index + 1} (${page.type || 'slide'}): ${page.title}\n\n`;
    md += `### Content\n${page.content}\n\n`;
    md += `### Visual Suggestion\n${page.visual}\n\n`;
    md += `---\n\n`;
  });

  return md;
}
