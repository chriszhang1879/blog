import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/model/blog";
import { auth } from "@clerk/nextjs/server";

/**
 * 记录博客交互（浏览、点赞、评论、分享）
 */
export async function POST(request: Request) {
  try {
    // 验证用户身份（可选，某些交互如浏览可以不需要登录）
    const { userId } = await auth();
    
    // 解析请求体
    const { blogId, interactionType } = await request.json();
    //如果blogId或interactionType为空
    if (!blogId || !interactionType) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }
    
    // 连接数据库
    await connectToDatabase();
    
    // 查找博客
    const blog = await Blog.findById(blogId);
    //如果博客不存在
    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found" }, 
        { status: 404 }
      );
    }
    
    // 根据交互类型更新博客热度
    switch (interactionType) {
      case 'view':
        //增加浏览量 这个方法是Blog模型中的一个方法 作用是增加浏览量
        await blog.incrementViews();
        break;
      case 'like':
        //点赞通常需要用户登录
        if (!userId) {
          return NextResponse.json(
            { error: "Authentication required for this action" }, 
            { status: 401 }
          );
        }
        await blog.like();
        break;
      case 'comment':
        // 评论通常需要用户登录
        if (!userId) {
          return NextResponse.json(
            { error: "Authentication required for this action" }, 
            { status: 401 }
          );
        }
        await blog.addComment();
        break;
      case 'share':
        await blog.share();
        break;
      default:
        return NextResponse.json(
          { error: "Invalid interaction type" }, 
          { status: 400 }
        );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Blog ${interactionType} recorded successfully`,
      heatScore: blog.heatScore
    });
  } catch (error) {
    console.error(`Error recording blog interaction:`, error);
    return NextResponse.json(
      { error: "Failed to record blog interaction" }, 
      { status: 500 }
    );
  }
}
