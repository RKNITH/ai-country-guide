import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.0-flash";


if (!GEMINI_API_KEY) {
    console.error("❌ Missing GEMINI_API_KEY in .env file");
    process.exit(1);
}

// ✅ Payload builder
function buildPayload(country) {
    return {
        contents: [
            {
                parts: [
                    {
                        text: `
You are a Country Information Expert.

Task:
1. Check if "${country}" is a valid country in the world.
2. If not valid → ONLY reply: "ERROR: Invalid country name."
3. If valid → provide a detailed structured description with the following info:

- Country Name
- Capital City
- Official Language(s)
- Currency
- Population (latest estimate)
- Total Area
- National Sport
- National Bird
- National Animal
- Date of Independence or Founding
- Type of Government
- Current Head of State (President/King/etc.)
- Current Head of Government (Prime Minister if applicable)
- Neighboring Countries (with names)
- Major Physical Features (mountains, rivers, deserts)
- Climate
- GDP (approx)
- Political Summary
- Brief History (main events)
- Culture (ethnic groups, cuisine, arts, sports)
- Famous Tourist Attractions
- National Flag (provide only a valid image URL, e.g., from https://flagcdn.com)



Return result in plain text with sections well formatted.

            `,
                    },
                ],
            },
        ],
        generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1200,
        },
    };
}

//
app.post("/get-country", async (req, res) => {
    try {
        const { country } = req.body;

        if (!country || typeof country !== "string") {
            return res.status(400).json({ error: "Missing or invalid country input" });
        }

        const payload = buildPayload(country);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

        const response = await axios.post(url, payload, {
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY,
            },
            timeout: 30000,
        });

        let text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            return res.status(502).json({ error: "No content returned from AI" });
        }

        // Check invalid country
        if (text.includes("ERROR: Invalid country name")) {
            return res.json({ error: "Invalid country name. Please enter a valid one." });
        }

        // Extract flag URL if mentioned
        let flagMatch = text.match(/https?:\/\/\S+.(png|jpg|jpeg|svg)/);
        let flagUrl = flagMatch ? flagMatch[0] : null;

        // Clean text
        let cleaned = text.replace(/\*\*/g, "");

        res.json({
            info: {
                name: country,
                flag: flagUrl,
                details: cleaned,
            },
        });
    } catch (error) {
        console.error("🔥 Server error:", error.response?.data || error.message);
        res.status(500).json({
            error: "Internal server error",
            detail: error.response?.data || error.message,
        });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on port: ${PORT}`);
});
