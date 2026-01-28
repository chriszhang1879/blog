import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/model/blog";

/**
 * 获取热门博客列表
 * 根据热度分数排序，返回指定数量的博客
 */
export async function GET(request: Request) {
  try {
    // 从URL参数中获取限制数量，默认为10
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // 连接数据库
    await connectToDatabase();
    
    // 使用博客模型的静态方法获取热门博客
    const hotBlogs = await Blog.getHotBlogs(limit);
    
    return NextResponse.json({ success: true, data: hotBlogs });
  } catch (error) {
    console.error("Error fetching hot blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch hot blogs" }, 
      { status: 500 }
    );
  }
}
