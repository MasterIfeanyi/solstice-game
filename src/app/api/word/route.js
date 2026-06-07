import { NextResponse } from "next/server";

const SHIFT = 3;

function encryptCaesar(word) {
    return word
        .toUpperCase()
        .split("")
        .map((char) => {
            if (char >= "A" && char <= "Z") {
                return String.fromCharCode(
                    ((char.charCodeAt(0) - 65 + SHIFT) % 26) + 65
                );
            }
            return char;
        })
        .join("");
}

function verifyCaesar(plain, cipher) {
    return encryptCaesar(plain) === cipher.toUpperCase();
}

export async function POST(req) {
    try {
        const { usedWords = [] } = await req.json();
        const seed = Math.floor(Math.random() * 1000000);
        const offset = Math.round(Math.random() * 999) + 1;

        const systemPrompt = `You are a word generator for a Caesar cipher game. You must always respond with ONLY a valid JSON object and nothing else. No explanation, no markdown, no backticks.`;

        const userPrompt = `
Using random seed ${seed} and offset ${offset}, generate a completely random common English dictionary word between 4 and 8 letters long.

Then encrypt it using Caesar cipher with a shift of 3 (A becomes D, B becomes E, Z becomes C, etc).

Respond ONLY with this exact JSON format:
{"word": "PLAIN", "cipher": "ENCRYPTED"}

Rules:
- The word must be a real English dictionary word
- The word must be ALL UPPERCASE
- The cipher must be ALL UPPERCASE
- No proper nouns
- The seed is ${seed} and offset is ${offset} — use both to ensure true uniqueness
- You MUST NOT use any of these recently used words: ${usedWords.length > 0 ? usedWords.join(", ") : "none yet"}
- Pick something completely different from that list
`.trim();

        const formattedMessages = [
            {
                role: "user",
                content: systemPrompt,
            },
            {
                role: "assistant",
                content: `Understood. I will respond with only a JSON object containing a random English word and its Caesar cipher encryption. No extra text.`,
            },
            {
                role: "user",
                content: userPrompt,
            },
        ];

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://solstice-cipher.app",
                    "X-Title": "Solstice Cipher",
                },
                body: JSON.stringify({
                    model: "google/gemma-4-26b-a4b-it:free",
                    messages: formattedMessages,
                    temperature: 1.0,
                    max_tokens: 100,
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("OpenRouter error:", errorData);

            if (response.status === 429) {
                console.warn("Rate limit hit — switching to fallback word list.");
                const { wordList } = await import("./wordList.js");
                const available = wordList.filter((w) => !usedWords.includes(w.toUpperCase()));
                const randomWord = available[Math.floor(Math.random() * available.length)].toUpperCase();
                return NextResponse.json({
                    word: randomWord,
                    cipher: encryptCaesar(randomWord),
                    fallback: true,
                });
            }

            return NextResponse.json(
                { error: "Failed to reach Gemma." },
                { status: 500 }
            );
        }

        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content?.trim();

        if (!raw) {
            return NextResponse.json(
                { error: "Empty response from Gemma." },
                { status: 500 }
            );
        }

        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch {
            console.error("Gemma returned non-JSON:", raw);
            return NextResponse.json(
                { error: "Gemma returned invalid JSON." },
                { status: 500 }
            );
        }

        const { word, cipher } = parsed;

        if (!word || !cipher) {
            return NextResponse.json(
                { error: "Gemma response missing fields." },
                { status: 500 }
            );
        }

        const isValid = verifyCaesar(word, cipher);

        if (!isValid) {
            console.warn(`Cipher mismatch — Gemma said: word=${word}, cipher=${cipher}. Correcting.`);
            return NextResponse.json({
                word: word.toUpperCase(),
                cipher: encryptCaesar(word),
            });
        }

        return NextResponse.json({
            word: word.toUpperCase(),
            cipher: cipher.toUpperCase(),
        });

    } catch (err) {
        console.error("Word API error:", err.message);

        const isNetworkError =
            err.message === "fetch failed" ||
            err.message === "Failed to fetch" ||
            err.code === "ECONNREFUSED" ||
            err.code === "ENOTFOUND" ||
            err.code === "ETIMEDOUT" ||
            err.cause?.code === "ECONNREFUSED" ||
            err.cause?.code === "ENOTFOUND" ||
            err.cause?.code === "ETIMEDOUT";

        if (isNetworkError) {
            console.warn("Network failure detected — switching to fallback word list.");

            const { wordList } = await import("./wordList.js");
            const randomWord = wordList
                .filter((w) => !usedWords.includes(w.toUpperCase()))
            [Math.floor(Math.random() * (wordList.length - usedWords.length))]
                .toUpperCase();

            return NextResponse.json({
                word: randomWord,
                cipher: encryptCaesar(randomWord),
                fallback: true,
            });
        }

        return NextResponse.json(
            { error: "Internal server error.", detail: err.message },
            { status: 500 }
        );
    }
}