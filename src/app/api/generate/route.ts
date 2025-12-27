import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 切换到 Edge Runtime
export const runtime = 'edge';

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
2. **适度篇幅**：生成约 8-15 页的幻灯片，确保内容详实但不过于冗长。
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

    // 开启流式传输 (stream: true)
    const stream = await client.chat.completions.create({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        stream: true, // Enable streaming
    });

    // 创建一个 ReadableStream 来返回数据
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) {
          console.error('Stream error:', err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
