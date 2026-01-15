import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API初期化
let genAI: GoogleGenerativeAI | null = null;

export function initializeGemini(apiKey: string) {
    genAI = new GoogleGenerativeAI(apiKey);
}

export function getGeminiModel() {
    if (!genAI) {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
        if (!apiKey) {
            throw new Error('Gemini APIキーが設定されていません');
        }
        initializeGemini(apiKey);
    }
    return genAI!.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

export interface ReceiptData {
    date: string; // YYYY-MM-DD形式
    amount: number;
    store?: string;
    category?: string;
}

/**
 * レシート画像を解析してJSON形式でデータを抽出
 */
export async function analyzeReceipt(imageFile: File): Promise<ReceiptData> {
    try {
        const model = getGeminiModel();

        // 画像をBase64に変換
        const imageData = await fileToGenerativePart(imageFile);

        const prompt = `
あなたはレシート解析の専門家です。
この画像からレシートの情報を抽出し、以下のJSON形式で返してください。

{
  "date": "YYYY-MM-DD形式の日付",
  "amount": 数値（合計金額）,
  "store": "店名（もしあれば）",
  "category": "カテゴリ"
}

カテゴリは以下から最も適切なものを選んでください：
- 食費（スーパー、コンビニ、レストラン、カフェなど）
- 交通費（電車、バス、タクシー、ガソリンなど）
- 書籍・文房具（本屋、文具店など）
- 日用品（ドラッグストア、100円ショップなど）
- 衣類（アパレル、靴など）
- 医療費（病院、薬局など）
- 娯楽（映画、ジム、ゲームなど）
- 通信費（携帯、ネットなど）
- 光熱費（電気、ガス、水道など）
- その他

店名や商品内容から最も適切なカテゴリを推測してください。

注意事項：
- 日付は必ずYYYY-MM-DD形式で返してください
- 金額は数値のみを返してください（カンマや円マークは不要）
- 店名やカテゴリが不明な場合は空文字列を返してください
- JSONのみを返し、他の説明文は不要です
`;

        const result = await model.generateContent([prompt, imageData]);
        const response = await result.response;
        const text = response.text();

        // JSONを抽出（マークダウンのコードブロックを除去）
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('JSON形式のレスポンスが取得できませんでした');
        }

        const data: ReceiptData = JSON.parse(jsonMatch[0]);
        return data;
    } catch (error) {
        console.error('レシート解析エラー:', error);
        throw error;
    }
}

/**
 * ファイルをGemini用の形式に変換
 */
async function fileToGenerativePart(file: File) {
    const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
        };
        reader.readAsDataURL(file);
    });

    return {
        inlineData: {
            data: base64Data,
            mimeType: file.type,
        },
    };
}
