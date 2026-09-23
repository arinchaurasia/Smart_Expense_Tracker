/* BudgetMind Serverless API: Gemini 1.5/3.1 Flash Bill & Document Scanner */

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured in Vercel Environment Variables." });
    }

    try {
        const { mimeType, fileData, textContent } = req.body;

        const systemPrompt = `You are an expert bill and receipt scanner for BudgetMind.
Analyze the provided document/image/text and extract bill items into a JSON array.
For each bill/item found, output an object with:
- "name": string (short name of vendor or item, e.g. "Starbucks", "Electricity Bill")
- "amount": number (positive numeric value only, e.g. 250)
- "category": string (Must be ONE of: "Food", "Transport", "Shopping", "Education", "Entertainment", "Bills", "Other")

Return ONLY valid JSON array format, like:
[
  {"name": "Zomato Order", "amount": 450, "category": "Food"},
  {"name": "Uber Ride", "amount": 180, "category": "Transport"}
]
Do NOT include markdown formatting or extra commentary outside the JSON array.`;

        const parts = [];
        if (textContent) {
            parts.push({ text: `${systemPrompt}\n\nDocument Content:\n${textContent}` });
        } else if (fileData && mimeType) {
            parts.push({ text: systemPrompt });
            parts.push({
                inlineData: {
                    mimeType: mimeType,
                    data: fileData
                }
            });
        } else {
            return res.status(400).json({ error: "No file or text content provided." });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-latest:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: parts }] })
        });

        const data = await response.json();
        if (!response.ok || !data.candidates || !data.candidates[0]) {
            const errorMsg = (data.error && data.error.message) ? data.error.message : "Bill scan failed.";
            return res.status(response.status || 500).json({ error: errorMsg });
        }

        const rawText = data.candidates[0].content.parts[0].text;
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        const jsonString = jsonMatch ? jsonMatch[0] : rawText;
        const items = JSON.parse(jsonString);

        return res.status(200).json({ items: items });

    } catch (error) {
        console.error("Error in scan-bill handler:", error);
        return res.status(500).json({ error: "Failed to parse bill. Make sure file is legible." });
    }
}
