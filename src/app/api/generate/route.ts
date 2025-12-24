import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const apiKey = process.env.DOUBAO_API_KEY;
const modelId = process.env.DOUBAO_MODEL_ID || 'doubao-seed-1-6-lite-251015';

const client = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
  }

  try {
    const { prompt, mode } = await req.json();

    const systemPrompt = `You are an expert presentation planner.
    Your task is to generate a structured PPT outline based on the user's idea.
    
    Mode: ${mode === 'detail' ? 'Detailed Script (Focus on comprehensive explanation)' : 'Presentation Slides (Focus on key points and brevity)'}
    
    Return ONLY valid JSON content. Do not include markdown formatting like \`\`\`json.
    
    The JSON structure must be:
    {
      "topic": "Suggested Title for the Presentation",
      "pages": [
        {
          "title": "Page Title (e.g., Cover, Introduction, Pain Points)",
          "content": "Key content points or script. Use \\n for line breaks. If bullet points, start with - ",
          "visual": "Description of the visual elements. Avoid using double quotes inside the string, or escape them properly."
        }
      ]
    }
    
    Ensure logical flow: Cover -> Table of Contents -> Problem/Context -> Solution/Core Idea -> Details -> Conclusion.
    IMPORTANT: Ensure all strings are properly escaped for JSON.
    `;

    const completion = await client.chat.completions.create({
      model: modelId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    
    // Attempt to parse JSON. Sometimes LLMs wrap in markdown.
    let jsonStr = content || '{}';
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
        const parsed = JSON.parse(jsonStr);
        // Add IDs if missing and normalize content
        if (parsed.pages) {
            parsed.pages = parsed.pages.map((p: any, idx: number) => ({
                ...p,
                id: `page-${Date.now()}-${idx}`,
                content: Array.isArray(p.content) ? p.content.join('\n') : p.content
            }));
        }
        return NextResponse.json(parsed);
    } catch (e) {
        console.error("JSON Parse Error", e, jsonStr);
        return NextResponse.json({ error: 'Failed to parse AI response', raw: content }, { status: 500 });
    }

  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
