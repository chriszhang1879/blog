import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Blog from '@/model/blog';

export async function GET(request: Request) {
  try {
    //TODO 这里传递参也可以自定义props 传入
  // 从url参数中获取搜索关键词 返回的是一个url对象 从中可以获取哪些参数？
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('query');
    if (!query) {
      return NextResponse.json({ message: 'No search query provided' }, { status: 400 });
    }

    // Connect to MongoDB
    await connectToDatabase();
    // Search blogs where title, content, categories 或 tags 匹配关键词（不区分大小写）
    const results = await Blog.find({
       // 在blog集合中查询返回符合条件的所有文档 这里的regex是正则表达式 $options: 'i'是不区分大小写
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { categories: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ]
    })
    .populate('author', 'username')    //author字段存储的是objectid引用用户的集合 populate会执行一次额外查询 把对应用户文档合并进结果
    // .select('title content categories tags') 这里如果定义后端返回的数据字段的话就使用select的好处是只返回前端需要的数据 减少数据的传输量             //第二个参数是选择性字段 仅仅选取username和email字段 减少数据量
    .lean({virtuals: true}); //把mongoose文档转换成js对象 去掉了getter setter等开销 适合只读场景 性能更好 序列化json更加轻量
//  这里的virtuals: true的作用是 保证虚拟字段timeAgoVirtual被包含在输出中 或者使用select('timeAgoVirtual')以确保前端能够使用timeAgoVirtual字段
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Search error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        //这里返回具体的错误信息便于调试
        { message: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { message: 'Failed to search blogs' },
        { status: 500 }
      );
    }
  }
}
