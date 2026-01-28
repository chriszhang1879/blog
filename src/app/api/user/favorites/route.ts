import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import User from '@/model/user';
import Blog from '@/model/blog';
import mongoose from 'mongoose';

//todo  这里可以使用MongoDB中的连接池重构
// 连接数据库的函数
async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw new Error('数据库连接失败');
  }
}

// 获取用户收藏的博客列表 用于后端获取所有的收藏添加检查收藏链接等接口
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    //返回的是一个Promise<void>类型
    await connectToDatabase();

    // 查找用户并填充收藏的博客信息这里的populate是 mongoose 的 populate 方法
    // populate 用于填充引用字段，将引用的文档内容填充到当前文档中 populate引用的内容有哪些
    // favorites: {
    //   type: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Blog'
    //   }],
    //   default: []
    // },
    //这里返回的userdoc是用户模型中的favorites字段填充后的对象数组而不是一个单纯的objectid数组
    //如果没有populate favorites字段将只包含objectid数组没有里面的详细信息
    const userDoc = await User.findOne({ clerkId: userId }).populate({
      //用户要填充的字段 是用户模型中的favorites字段
      path: 'favorites',
      // favorites字段引用的模型是Blog 告诉mongoose favorites字段引用的模型是Blog要从blog模型中获取数据
      model: Blog,
      // favorites字段引用的模型中的字段 而不是整个blog模型的所有信息
      select: '_id title excerpt slug author createdAt' // 只获取必要的字段
    })

    if (!userDoc) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({ favorites: userDoc.favorites }, { status: 200 });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    return NextResponse.json({ error: '获取收藏列表失败' }, { status: 500 });
  }
}

// 添加或移除收藏 post方法需要这个req参数 来获取body中的blogId和action前端通过post方法发送的
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    //blogid是string类型
    const { blogId, action } = await req.json();

    if (!blogId || !['add', 'remove'].includes(action)) {
      return NextResponse.json({ error: '无效的请求参数' }, { status: 400 });
    }

    await connectToDatabase();

    // 验证博客ID是否有效 这里的isvalid是mongoose的类型检查方法 因为blogid是string类型 需要转换成ObjectId类型进行检查
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return NextResponse.json({ error: '无效的博客ID' }, { status: 400 });
    }

    // 检查博客是否存在
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return NextResponse.json({ error: '博客不存在' }, { status: 404 });
    }

    const userDoc = await User.findOne({ clerkId: userId });
    if (!userDoc) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    if (action === 'add') {
      // 检查是否已经收藏
      if (!userDoc.favorites.includes(blogId)) {
        userDoc.favorites.push(blogId);
        await userDoc.save();
      }
      //这里返回给前端的时候如何获取信息?
      return NextResponse.json({ message: '添加收藏成功', isFavorite: true }, { status: 200 });
    } else {
      // 移除收藏
      userDoc.favorites = userDoc.favorites.filter(
        (id: mongoose.Types.ObjectId) => id.toString() !== blogId
      );
      await userDoc.save();
      //这里的response返回给前端  期中解析为json格式 req.json()是解析请求体中的json数据 里面包含message和isFavorite  response.ok是检测状态码是否在200-299之间
      return NextResponse.json({ message: '取消收藏成功', isFavorite: false }, { status: 200 });
    }
  } catch (error) {
    console.error('更新收藏失败:', error);
    return NextResponse.json({ error: '更新收藏失败' }, { status: 500 });
  }
}

// 检查博客是否已收藏
export async function HEAD(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const url = new URL(req.url);
    const blogId = url.searchParams.get('blogId');

    if (!blogId) {
      return NextResponse.json({ error: '缺少博客ID参数' }, { status: 400 });
    }

    await connectToDatabase();

    //这里返回的userDoc是用户模型中的favorites字段填充后的对象数组而不是一个单纯的objectid数组
    const userDoc = await User.findOne({ clerkId: userId });
    if (!userDoc) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }
    //检查博客是否已收藏 如果收藏返回true否则返回false  括号里面是回调函数some是ES6的数组方法
    const isFavorite = userDoc.favorites.some(
      //()里面是传入的参数id 箭头后是返回的值
      // favorites字段引用的模型中的_id字段与blogId相等 则返回true否则返回false
      (id: mongoose.Types.ObjectId) => id.toString() === blogId
    );
    //这里返回给前端的isFavorite是一个boolean值 true或者false  前端根据true或者false来显示收藏按钮
    return NextResponse.json({ isFavorite }, { status: 200 });
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    return NextResponse.json({ error: '检查收藏状态失败' }, { status: 500 });
  }
}
