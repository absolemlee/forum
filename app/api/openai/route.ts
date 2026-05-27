import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  const body = await request.json().catch(() => null);
  const question =
    typeof body?.question === "string" ? body.question.trim() : "";

  if (!question) {
    return NextResponse.json(
      { error: "Question is required.", code: "INVALID_REQUEST" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a knowlegeable assistant that provides quality information.",
          },
          {
            role: "user",
            content: `Tell me ${question}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Upstream AI service request failed.",
          code: "UPSTREAM_API_ERROR",
        },
        { status: response.status },
      );
    }

    const responseData: unknown = await response.json().catch(() => null);
    const reply =
      typeof (responseData as any)?.choices?.[0]?.message?.content === "string"
        ? (responseData as any).choices[0].message.content
        : null;

    if (!reply) {
      return NextResponse.json(
        { error: "No response content was returned.", code: "EMPTY_RESPONSE" },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error.", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
};
