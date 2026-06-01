import { createServerFn } from '@tanstack/react-start'
import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'

export type FreshnessResult = {
  score: number
  label: string
  notes: string
  suggestedDiscount: number
}

const AnalyzeSchema = z.object({ imageBase64: z.string(), mimeType: z.string() })

export const analyzeFreshness = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => AnalyzeSchema.parse(raw))
  .handler(async ({ data }): Promise<FreshnessResult> => {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY ไม่ได้ตั้งค่า')

    const ai = new GoogleGenAI({ apiKey })

    const prompt = `วิเคราะห์ความสดของอาหารในภาพนี้ และตอบในรูปแบบ JSON เท่านั้น (ไม่ต้องมีข้อความอื่น):
{
  "score": <ตัวเลข 0-100 ความสด>,
  "label": "<สดมาก|ดี|พอใช้|ควรรีบใช้|ใกล้หมด>",
  "notes": "<คำอธิบายสั้นๆ เป็นภาษาไทย 1-2 ประโยค>",
  "suggestedDiscount": <เปอร์เซ็นต์ส่วนลดที่แนะนำ 0-80>
}

เกณฑ์:
- 80-100: สดมาก ลดราคา 0-10%
- 60-79: ดี ลดราคา 10-20%
- 40-59: พอใช้ ลดราคา 20-40%
- 20-39: ควรรีบใช้ ลดราคา 40-60%
- 0-19: ใกล้หมด ลดราคา 60-80%`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: data.mimeType, data: data.imageBase64 } },
          ],
        },
      ],
    })

    const text = response.text ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('AI ไม่สามารถวิเคราะห์ภาพได้')

    return JSON.parse(jsonMatch[0]) as FreshnessResult
  })
