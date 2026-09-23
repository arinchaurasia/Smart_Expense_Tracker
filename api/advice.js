export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Get API Key from Vercel Environment Variables
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ 
            error: "GEMINI_API_KEY is not set in Vercel Environment Variables." 
        });
    }

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = (data.error && data.error.message) 
                ? data.error.message 
                : "Gemini API request failed.";
            return res.status(response.status).json({ error: errorMsg });
        }
        return res.status(200).json(data);
    
    } catch (error) {
        console.error("Error in Vercel Gemini API handler:", error);
        return res.status(500).json({ error: "Internal server error connecting to Gemini API." });
    }
}
