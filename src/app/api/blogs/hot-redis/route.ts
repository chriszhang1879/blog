import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/model/blog";
import { getHotBlogIds, getBlogStats } from "@/lib/redis";

/**
 * 获取基于 Redis 的热门博客列表
 */
export async function GET(request: Request) {
  try {
    // 从URL参数中获取限制数量，默认为10
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // 从 Redis 获取热门博客ID列表
    const hotBlogIds = await getHotBlogIds(limit);
    
    if (hotBlogIds.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: [] 
      });
    }
    
    // 连接数据库
    await connectToDatabase();
    
    // 从 MongoDB 获取博客详细信息
    const hotBlogs = await Blog.find({
      _id: { $in: hotBlogIds }
    }).populate('author', 'name image');
    
    // 按照 Redis 返回的顺序排序博客
    const sortedBlogs = hotBlogIds.map(id => 
      hotBlogs.find(blog => blog._id.toString() === id)
    ).filter(Boolean);
    
    // 为每个博客添加 Redis 中的最新统计数据
    const blogsWithStats = await Promise.all(
      sortedBlogs.map(async (blog) => {
        const blogId = blog._id.toString();
        const stats = await getBlogStats(blogId);
        
        return {
          _id: blogId,
          title: blog.title,
          excerpt: blog.excerpt,
          slug: blog.slug,
          author: blog.author,
          categories: blog.categories,
          createdAt: blog.createdAt,
          ...stats // 添加 Redis 中的最新统计数据
        };
      })
    );
    
    return NextResponse.json({ 
      success: true, 
      data: blogsWithStats 
    });
  } catch (error) {
    console.error("Error fetching hot blogs from Redis:", error);
    return NextResponse.json(
      { error: "Failed to fetch hot blogs" }, 
      { status: 500 }
    );
  }
}
