import { NextResponse } from "next/server";
import { wordList } from "./wordList.js";

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

function pickRandomWord(usedWords) {
  const available = wordList.filter(
    (w) => !usedWords.includes(w.toUpperCase())
  );
  const pool = available.length > 0 ? available : wordList;
  return pool[Math.floor(Math.random() * pool.length)].toUpperCase();
}

export async function POST(req) {
  try {
    const { usedWords = [] } = await req.json();

    const plainWord = pickRandomWord(usedWords);

    const systemPrompt = `You are a Caesar cipher encoder. You must always respond with ONLY a valid JSON object and nothing else. No explanation, no markdown, no backticks.`;

    const userPrompt = `
Encrypt this word using Caesar cipher with a shift of 3.
A becomes D, B becomes E, ..., X becomes A, Y becomes B, Z becomes C.

Word to encrypt: ${plainWord}

Respond ONLY with this exact JSON format:
{"word": "${plainWord}", "cipher": "ENCRYPTED_RESULT"}

The cipher must be ALL UPPERCASE.
`.trim();

    const formattedMessages = [
      {
        role: "user",
        content: systemPrompt,
      },
      {
        role: "assistant",
        content: `Understood. I will encrypt the given word using Caesar cipher shift 3 and respond only with the JSON object.`,
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
        console.warn("Rate limit hit — using local encryption.");
        return NextResponse.json({
          word: plainWord,
          cipher: encryptCaesar(plainWord),
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
      return NextResponse.json({
        word: plainWord,
        cipher: encryptCaesar(plainWord),
        fallback: true,
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("Gemma returned non-JSON:", raw);
      return NextResponse.json({
        word: plainWord,
        cipher: encryptCaesar(plainWord),
        fallback: true,
      });
    }

    const { cipher } = parsed;

    if (!cipher) {
      return NextResponse.json({
        word: plainWord,
        cipher: encryptCaesar(plainWord),
        fallback: true,
      });
    }

    const isValid = verifyCaesar(plainWord, cipher);

    if (!isValid) {
      console.warn(`Cipher mismatch — Gemma said cipher=${cipher} for word=${plainWord}. Correcting.`);
      return NextResponse.json({
        word: plainWord,
        cipher: encryptCaesar(plainWord),
      });
    }

    return NextResponse.json({
      word: plainWord,
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
      console.warn("Network failure detected — using local encryption.");
      const { usedWords = [] } = {};
      const plainWord = pickRandomWord(usedWords);
      return NextResponse.json({
        word: plainWord,
        cipher: encryptCaesar(plainWord),
        fallback: true,
      });
    }

    return NextResponse.json(
      { error: "Internal server error.", detail: err.message },
      { status: 500 }
    );
  }
}