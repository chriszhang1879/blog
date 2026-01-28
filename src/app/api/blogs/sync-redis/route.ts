import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/model/blog";
import { syncBlogsToRedis } from "@/lib/redis";
import { auth } from "@clerk/nextjs/server";

/**
 * 同步 MongoDB 中的博客数据到 Redis
 * 这个 API 应该受到保护，只允许管理员访问
 */
export async function POST(request: Request) {
  try {
    // 验证用户身份和权限
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }
    
    // 连接数据库
    await connectToDatabase();
    
    // 检查用户是否为管理员（假设用户模型中有 role 字段）
    const User = (await import("@/model/user")).default;
    const user = await User.findOne({ clerkId: userId });
    
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Permission denied" }, 
        { status: 403 }
      );
    }
    
    // 获取所有博客数据
    const blogs = await Blog.find().lean();
    
    // 同步到 Redis
    await syncBlogsToRedis(blogs);
    
    return NextResponse.json({ 
      success: true, 
      message: `Synced ${blogs.length} blogs to Redis` 
    });
  } catch (error) {
    console.error("Error syncing blogs to Redis:", error);
    return NextResponse.json(
      { error: "Failed to sync blogs to Redis" }, 
      { status: 500 }
    );
  }
}
