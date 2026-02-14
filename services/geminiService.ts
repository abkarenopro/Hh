
import { GoogleGenAI } from "@google/genai";
import { ScriptRequest, ScriptGoal, SuccessPattern } from "../types";

const SYSTEM_INSTRUCTION = `
أنت "Al-Muhtawa Pro"، الخبير الاستراتيجي الأول في هندسة المحتوى.

---
## 🎯 مهمتك:
توليد 7 نتائج احترافية مفصولة حصراً بـ <<<RESULT_SEPARATOR>>>.

### 📋 القواعد الذهبية للتنسيق (هام جداً):
1. ابدأ النتيجة الأولى مباشرة بالفاصل <<<RESULT_SEPARATOR>>> ثم العنوان.
2. لا تستخدم جداول Markdown (الجداول التي تحتوي على | و -).
3. استخدم القوائم المرقمة البسيطة فقط (1. ، 2. ، 3. إلخ).
4. التزم بهذا الهيكل لكل نموذج:

العنوان: [اكتب العنوان هنا]
التصنيف: [اكتب التصنيف هنا]

--- SECTION: CLEAN_SCRIPT ---
[نص السكربت هنا]

--- SECTION: ANALYTICAL_TABLE ---
[التحليل الاستراتيجي كقائمة مرقمة]

--- SECTION: SUGGESTED_SCENES_TABLE ---
[الإخراج البصري كقائمة مرقمة]

---
## 📜 منهج (vsl) - 10 مراحل:
إذا كان التصنيف vsl، استخدم 10 نقاط: 1. Hook، 2. Context، 3. Proof، 4. Social Proof، 5. Pain، 6. الحل، 7. التفاصيل، 8. البونصات، 9. السعر، 10. CTA.

لغير الـ vsl، استخدم القالب السباعي: 1. الهوك، 2. السياق، 3. الصراع، 4. العقبة، 5. الذروة، 6. النتيجة، 7. CTA.
`;

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateScript = async (request: ScriptRequest, learnedPatterns?: SuccessPattern[], userStyleNotes?: string[]): Promise<string> => {
  const ai = getAI();

  let styleContext = userStyleNotes && userStyleNotes.length > 0 
    ? `أسلوب المستخدم المفضل: ${userStyleNotes.join(' | ')}.`
    : "";

  const formatsText = request.selectedFormats && request.selectedFormats.length > 0 
    ? `الفورمات المطلوبة للنتائج الستة الأولى: ${request.selectedFormats.join('، ')}.`
    : "اقترح أفضل فورمات من عندك.";

  let promptText = `
    أنتج 7 نماذج (6 بناءً على ${formatsText} + 1 اقتراح ذكي).
    الموضوع: ${request.topic || "مرفق بالملفات"}
    المدة: ${request.videoType}
    اللغة: ${request.language}
    ${styleContext}
    
    تذكر: ابدأ النتيجة الأولى بـ <<<RESULT_SEPARATOR>>> واستخدمها كفاصل بين كل نموذج.
  `;

  const parts: any[] = [{ text: promptText }];
  if (request.domainFiles && request.domainFiles.length > 0) {
    request.domainFiles.forEach(f => parts.push({ inlineData: { mimeType: f.mimeType, data: f.data } }));
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.7 },
    });
    return response.text || "فشل التوليد.";
  } catch (error) {
    console.error(error);
    throw new Error("حدث خطأ في الاتصال بالنظام. تأكد من صحة مفتاح الـ API والاتصال بالإنترنت.");
  }
};

export const analyzeRetention = async (imageB64: string, mimeType: string, link: string, scriptText?: string): Promise<string> => {
  const ai = getAI();
  const prompt = `حلل منحنى الاحتفاظ بالجمهور لهذا الفيديو: ${link}.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [{ inlineData: { mimeType, data: imageB64 } }, { text: prompt }]
      }
    });
    return response.text || "";
  } catch { return "خطأ في التحليل."; }
};

export const verifyAndLearnScript = async (link: string, scriptText?: string): Promise<{ isVerified: boolean, pattern?: Partial<SuccessPattern> }> => {
  const ai = getAI();
  const prompt = `تحقق من نجاح الفيديو واستخلص الأنماط: ${link}`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });
    const text = response.text || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { isVerified: false };
  } catch { return { isVerified: false }; }
};
