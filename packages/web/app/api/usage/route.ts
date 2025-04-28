import { NextRequest, NextResponse } from "next/server";
import { db, UserUsageTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { handleAuthorizationV2 } from "@/lib/handleAuthorization";

export async function GET(request: NextRequest) {
  try {
    // This will throw an error if not authorized
    const { userId } = await handleAuthorizationV2(request);
    
    // Get usage information
    const userUsage = await db
      .select()
      .from(UserUsageTable)
      .where(eq(UserUsageTable.userId, userId))
      .limit(1);
      
    if (!userUsage.length) {
      return NextResponse.json({
        tokenUsage: 0,
        maxTokenUsage: 100000, // Default free tier tokens
        subscriptionStatus: "active",
        currentPlan: "Free Tier",
        isActive: true
      });
    }
    
    return NextResponse.json({
      tokenUsage: userUsage[0].tokenUsage || 0,
      maxTokenUsage: userUsage[0].maxTokenUsage || 100000,
      subscriptionStatus: userUsage[0].subscriptionStatus || "inactive",
      currentPlan: userUsage[0].currentPlan || "Free Tier",
      isActive: userUsage[0].subscriptionStatus === "active"
    });
    
  } catch (error) {
    // Handle token limit errors specially
    if (error instanceof Error && error.message.includes("Token limit exceeded")) {
      return NextResponse.json({ 
        error: "Token limit exceeded. Please upgrade your plan for more tokens."
      }, { status: 429 });
    }
    
    console.error("Error fetching usage data:", error);
    return NextResponse.json({ 
      error: "Failed to fetch usage data",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
