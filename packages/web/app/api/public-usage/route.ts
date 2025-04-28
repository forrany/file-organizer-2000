import { NextRequest, NextResponse } from "next/server";
import { db, UserUsageTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getToken } from "@/lib/handleAuthorization";
import { verifyKey } from "@unkey/api";

export async function GET(request: NextRequest) {
  try {
    const token = getToken(request);
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }
    
    // Verify the key without checking for subscription status
    const { result, error } = await verifyKey(token);
    
    if (!result.valid) {
      return NextResponse.json({ 
        error: "Invalid key",
        message: "Please provide a valid license key"
      }, { status: 401 });
    }
    
    const userId = result.ownerId;
    
    // Get basic usage information without checking subscription status
    const userUsage = await db
      .select()
      .from(UserUsageTable)
      .where(eq(UserUsageTable.userId, userId))
      .limit(1);
      
    if (!userUsage.length) {
      // Return default values for new users
      return NextResponse.json({
        tokenUsage: 0,
        maxTokenUsage: 100000, // Default free tier tokens
        subscriptionStatus: "inactive",
        currentPlan: "Free Tier",
        isActive: false
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
    console.error("Error fetching public usage data:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      message: "Failed to fetch usage data"
    }, { status: 500 });
  }
} 