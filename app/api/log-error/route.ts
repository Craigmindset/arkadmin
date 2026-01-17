import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, data } = body;

    console.log("=== CLIENT ERROR LOG ===");
    console.log("Message:", message);
    if (data) {
      console.log("Data:", data);
    }
    console.log("=======================");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging client error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
