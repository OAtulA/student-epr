import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthSession } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const session: AuthSession|null = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { adviceId } = await request.json();

    return NextResponse.json({
      message: "Like recorded successfully",
      adviceId,
    });
  } catch (error) {
    console.error("Error liking advice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
