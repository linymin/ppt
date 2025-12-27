import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 设置最大执行时间为 60 秒（Vercel Pro 限制，Hobby 计划可能限制为 10 秒，但建议配置）
export const maxDuration = 60;

const modelId = process.env.DOUBAO_MODEL_ID || 'doubao-seed-1-6-lite-251015';

export async function POST(req: Request) {
  const apiKey = process.env.DOUBAO_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    return NextResponse.json(
      { error: 'API Key not configured. Please edit .env.local and set DOUBAO_API_KEY to your actual key.' }, 
      { status: 500 }
    );
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  });

  try {
    const { prompt, mode } = await req.json();

    const systemPrompt = `你是一名顶级的演示文稿策划专家。请根据用户的输入内容，将其转化为一份完整的、可直接用于 PPT 制作的大纲。

核心准则（严禁违反）：
1. **原子化拆分**：严禁将不同的二级/三级标题或不同编号的逻辑点合并在同一张幻灯片上。每一页幻灯片只能承载一个核心子标题或一个独立的概念。
2. **不设页数上限**：根据内容的复杂程度，生成尽可能多的幻灯片。不要为了缩减篇幅而压缩内容，必须 100% 覆盖输入内容中的所有事实、数据和逻辑。
3. **深度覆盖**：提取并呈现输入内容中的所有核心数据、事实、逻辑论据。确保逻辑链条完整无缺。
4. **结构化**：必须严格包含以下页面类型：
   - 封面页 (title)
   - 目录页 (toc)
   - 章节页 (chapter)
   - 内容页 (content)
   - 总结页 (conclusion)
5. **视觉对齐**：为每一页提供具体的 AI 视觉创意提示词，提示词语言必须为中文，确保风格统一且与正文高度相关。
6. **语言一致性**：必须使用与输入文字完全相同的语言输出（包括视觉提示词）。
7. **章节映射逻辑**：
   - 每一个【章节页 (chapter)】中列出的 N 个子话题/要点，必须在后面紧跟 N 个对应的【内容页 (content)】。
   - 例如：若章节页标题为“市场分析”，要点为“1.竞争格局”、“2.用户画像”，则后续必须生成两页：一页标题为“竞争格局”，另一页标题为“用户画像”。

页面类型分布要求：
- 封面页 (title): 1页。
- 目录页 (toc): 1页，展示全局大纲。
- 章节页 (chapter): 划分大模块，并在 content 中列出该模块的子要点。
- 内容页 (content): 详细展开章节页提到的每一个子要点。
- 结束页 (conclusion): 1页，总结或致谢。

JSON 返回格式要求：
{
  "topic": "PPT标题",
  "pages": [
    {
      "title": "页面标题",
      "type": "title" | "toc" | "chapter" | "content" | "conclusion",
      "content": "核心内容要点。使用 \\n 换行。如果是列表，请以 - 开头。",
      "visual": "视觉创意提示词（中文）。格式必须为：[主体] + [动作/场景] + [风格/材质] + [构图/光效] + [色调/氛围]。不要包含双引号。"
    }
  ]
}

Mode: ${mode === 'detail' ? '详细脚本模式（侧重全面解释）' : '演示胶片模式（侧重关键点和简洁）'}

请只返回合法的 JSON 字符串，不要包含 markdown 格式（如 \`\`\`json）。`;

    const designSystemPrompt = `你是一名资深的 PPT 视觉设计师，拥有顶尖的审美和设计能力。请根据用户提供的 PPT 内容主题，提供全套视觉设计方案。

核心任务：
从以下维度给出详细建议：
1. **设计风格定义**：推荐一种具体的视觉风格（如：现代极简、数据驱动、未来主义、孟菲斯、包豪斯等），并解释选择该风格的原因。
2. **色彩方案**：
   - 提供 1 个主色（Brand Color）。
   - 提供 2-3 个辅助色（Secondary Colors）。
   - 给出具体的 Hex 色号。
   - 要求配色方案必须符合行业属性或内容情绪（例如：医疗的严谨与洁净、AI 的科技与未来感、金融的稳重与信任）。
3. **字体系统**：推荐一组适合的标题字体和正文字体（需考虑中文环境的可读性与美感，如：思源黑体、微软雅黑、方正悠黑等）。

返回格式要求：
必须返回纯 JSON 格式，结构如下：
{
  "style": {
    "name": "风格名称",
    "description": "风格描述",
    "reason": "选择原因"
  },
  "colors": {
    "primary": { "name": "主色名称", "hex": "#RRGGBB" },
    "secondary": [
      { "name": "辅助色1名称", "hex": "#RRGGBB" },
      { "name": "辅助色2名称", "hex": "#RRGGBB" }
    ]
  },
  "fonts": {
    "title": "标题字体建议",
    "body": "正文字体建议"
  }
}

请只返回合法的 JSON 字符串，不要包含 markdown 格式（如 \`\`\`json）。`;

    // Execute both requests in parallel
    const [contentCompletion, designCompletion] = await Promise.all([
      client.chat.completions.create({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
      client.chat.completions.create({
        model: modelId,
        messages: [
          { role: 'system', content: designSystemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      })
    ]);

    const contentStr = contentCompletion.choices[0].message.content;
    const designStr = designCompletion.choices[0].message.content;

    console.log('AI Content Response:', contentStr); 
    console.log('AI Design Response:', designStr);

    // Helper to extract JSON
    const extractJSON = (str: string | null) => {
        let jsonStr = str || '{}';
        const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
            jsonStr = codeBlockMatch[1];
        }
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        }
        return JSON.parse(jsonStr);
    };

    try {
        const parsedContent = extractJSON(contentStr);
        const parsedDesign = extractJSON(designStr);

        const result = {
            ...parsedContent,
            design: parsedDesign
        };

        // Add IDs if missing and normalize content
        if (result.pages) {
            result.pages = result.pages.map((p: Record<string, any>, idx: number) => ({
                ...p,
                id: `page-${Date.now()}-${idx}`,
                content: Array.isArray(p.content) ? p.content.join('\n') : p.content,
                type: p.type || 'content' // Default to content if missing
            }));
        }
        return NextResponse.json(result);
    } catch (e) {
        console.error("JSON Parse Error", e);
        return NextResponse.json({ error: 'Failed to parse AI response', rawContent: contentStr, rawDesign: designStr }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error('AI Generation Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
