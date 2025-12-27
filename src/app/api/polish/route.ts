import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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
    const { type, context } = await req.json();

    let systemPrompt = '';
    let userPrompt = '';

    // console.log('Polish Request:', { type, context }); // Debug Log

    if (type === 'visual') {
        systemPrompt = `你是一名专业的视觉艺术指导。请根据用户提供的 PPT 内容，生成一个高质量的 AI 绘画提示词。
        
        生成格式要求（严格遵守）：
        [主体] + [动作/场景] + [风格/材质] + [构图/光效] + [色调/氛围]
        
        示例：
        [一个正在思考的商务人士] + [站在未来城市的落地窗前俯瞰] + [赛博朋克风格，玻璃与金属质感] + [背影构图，边缘光] + [冷色调，科技感]
        
        直接返回提示词字符串，不要包含任何解释或其他文字。`;
        userPrompt = `PPT页面标题：${context.title}\n页面内容：${context.content}`;
    } else if (type === 'content_from_title') {
        systemPrompt = `你是一名专业的 PPT 内容策划。请根据用户提供的 PPT 页面标题，生成该页面的详细正文内容，并同时生成对应的视觉设计提示词。
        
        要求：
        1. 内容结构化，条理清晰，包含 3-5 个核心要点。
        2. 语言专业、精炼，适合演示文稿。
        3. 必须以 JSON 格式返回，包含 "content" (正文) 和 "visual" (视觉提示词) 两个字段。
        4. "visual" 字段必须严格遵守格式：[主体] + [动作/场景] + [风格/材质] + [构图/光效] + [色调/氛围]
        
        返回 JSON 示例（不要包含 markdown 格式，直接返回纯 JSON）：
        {
            "content": "- 要点1\n- 要点2",
            "visual": "[主体] + [动作]..."
        }`;
        userPrompt = `页面标题：${context.title}`;
    } else if (type === 'polish_content') {
        systemPrompt = `你是一名专业的文案编辑。请对用户提供的 PPT 正文内容进行润色和优化，并同时生成对应的视觉设计提示词。
        
        要求：
        1. 保持原意，但语言更专业、更有感染力。
        2. 优化逻辑结构，使其更清晰。
        3. 必须以 JSON 格式返回，包含 "content" (润色后的正文) 和 "visual" (视觉提示词) 两个字段。
        4. "visual" 字段必须严格遵守格式：[主体] + [动作/场景] + [风格/材质] + [构图/光效] + [色调/氛围]
        
        返回 JSON 示例（不要包含 markdown 格式，直接返回纯 JSON）：
        {
            "content": "优化后的内容...",
            "visual": "[主体] + [动作]..."
        }`;
        userPrompt = `原始内容：\n${context.content}`;
    }

    const completion = await client.chat.completions.create({
      model: modelId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      // Remove response_format: { type: 'json_object' } as it might cause issues if the model isn't strictly compatible
      // response_format: (type === 'content_from_title' || type === 'polish_content') ? { type: 'json_object' } : undefined,
    });

    const result = completion.choices[0].message.content;
    console.log('Polish Raw Response:', result); // Debug log
    
    // For JSON responses, parse them
    if (type === 'content_from_title' || type === 'polish_content') {
        try {
            // Robust JSON extraction
            let jsonStr = result || '{}';
            const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (codeBlockMatch) {
              jsonStr = codeBlockMatch[1];
            }
            
            const firstBrace = jsonStr.indexOf('{');
            const lastBrace = jsonStr.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
            }

            const jsonResult = JSON.parse(jsonStr);
            return NextResponse.json(jsonResult);
        } catch (e) {
            console.error('Failed to parse polish JSON', e, result);
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
        }
    }

    return NextResponse.json({ result });

  } catch (error: any) {
    console.error('Polish API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}