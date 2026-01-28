import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import Comment from '@/model/comment';
import User from '@/model/user';
import mongoose from 'mongoose';

// 获取特定博客文章的评论 传入参数的时候如何参数比较复杂 既有路由参数又有查询参数的话可以自定义props传入也可以
export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;

    // 验证博客ID是否有效 这是防御性编程 检查传入的字段是否是ObjectId类型 增强安全性防止注入攻击或者无效输入
    // 提前失败处理 如果格式不对不会继续执行后续代码提升代码性能
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: '无效的博客ID' }, { status: 400 });
    }

    await connectToDatabase();
    //这段代码的执行流程是comment 先查询数据库find创建了一个mongodb的query对象可以继续链式调用后续方法sort populate lean等
    //当查询执行完毕后通过await等地啊解析成文档数组并返回
    // find函数返回的是所有满足条件的文档数组 每个元素是mongoose文档实例 lean后是普通js对象
    // 获取评论并按时间倒序排列，同时关联用户信息 find是返回一个Promise对象 
    const comments = await Comment.find({ post: postId })
      //sort是按照时间倒序排列  -1是倒序从新倒旧（最新的评论在前） 1是正序从旧到新（最旧的评论在前）
      // createdAt和updatedAt是Mongoose的默认字段 createdAt是创建时间 updatedAt是更新时间
      .sort({ createdAt: -1 })
      //populate是 mongoose 的 populate 方法 返回的是一个Promise<Blog>类型
      .populate('user', 'name image')
      // lean()方法用于将Mongoose查询结果转换为普通JavaScript对象，而不是Mongoose文档实例没有MongoDd文档的额外方法和虚拟属性 
      // 直接返回给前端方便前端渲染  减少内存使用
      // 但是 lean()方法会失去Mongoose文档实例的其他方法和属性 没有moogoose文档的实例方法
      .lean();

      //这里返回的数据结构是评论的数组  自己定义返回的数据结构  形成良好的api接口设计范式
    return NextResponse.json({data:comments,success:true,count:comments.length});
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json({ error: '获取评论失败' }, { status: 500 });
  }
}

// 添加评论
export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { userId } = await auth();
    const { postId } = params;

    // 验证用户是否已登录
    if (!userId) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 验证博客ID是否有效
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: '无效的博客ID' }, { status: 400 });
    }

    const { content } = await req.json();

    // 验证评论内容 content.trim()是去除字符串两端的空白字符 如果为空或者只包含空白字符则返回错误
    // 这里的string可以进行数量的判断检测 比如string.length！==24不符合ObjectId的长度 string.strim()是去除字符串两端的空白字符
    if (!content || content.trim() === '') {
      return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 });
    }

    await connectToDatabase();

    // 查找用户
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 创建新评论
    const newComment = new Comment({
      content,
      user: user._id,
      post: postId,
    });

    await newComment.save();

    // 返回包含用户信息的评论
    const populatedComment = await Comment.findById(newComment._id)
      .populate('user', 'name image')
      .lean();

    return NextResponse.json(populatedComment, { status: 201 });
  } catch (error) {
    console.error('添加评论失败:', error);
    return NextResponse.json({ error: '添加评论失败' }, { status: 500 });
  }
}
