import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 切换到 Edge Runtime
export const runtime = 'edge';

const modelId = process.env.DOUBAO_MODEL_ID || 'doubao-seed-1-6-lite-251015';

export async function POST(req: Request) {
  const apiKey = process.env.DOUBAO_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    return NextResponse.json(
      { error: 'API Key not configured.' }, 
      { status: 500 }
    );
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  });

  try {
    const { prompt } = await req.json();

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

    const completion = await client.chat.completions.create({
      model: modelId,
      messages: [
        { role: 'system', content: designSystemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const result = completion.choices[0].message.content;
    
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
        const parsedDesign = extractJSON(result);
        return NextResponse.json(parsedDesign);
    } catch (e) {
        console.error("JSON Parse Error", e);
        return NextResponse.json({ error: 'Failed to parse AI design response' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('AI Design Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
