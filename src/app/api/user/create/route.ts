import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';

// 处理用户创建请求
export async function POST(req: NextRequest) {

  try {
    await connectToDatabase();

   // const mongoose=await import('mongoose')
    // 验证用户是否已登录
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: '未授权' }, { status: 401 });
    }
    // 解析请求体
    const body = await req.json();
    const { clerkId, firstName, lastName, email } = body;

    // 验证clerkId是否与当前登录用户一致 clerkid是前端传过来的
    if (clerkId !== userId) {
      return NextResponse.json({ success: false, message: '无权创建其他用户' }, { status: 403 });
    }
    // 获取Clerk用户信息以进行额外验证  clerkClient()返回一个clerkClient实例
    // 需要先await解构出来再试用 不然报错 会出现 xxx does not exist 这样的错误
    const clerk = await clerkClient();
    // clerk.users.getUser(userId)获取用户信息
    const clerkUser = await clerk.users.getUser(userId);
    // 创建用户文档
    const user = await mongoose.model(' User').create({
      _id: userId, // 使用Clerk的userId作为MongoDB的_id
      //fistname 和lastname如果数据库没有定义那么会被丢弃掉 不会存储在数据库
      clerkId: clerkId,
      firstName: firstName || clerkUser.firstName,
      lastName: lastName || clerkUser.lastName,
      email: email || clerkUser.emailAddresses[0]?.emailAddress,
      createdAt: new Date(),
      points: 0,
      totalCheckIns: 0,
      consecutiveCheckIns: 0
    });
    //保存用户文档
    await user.save();
    //返回给前端信息 success true message 用户创建成功 user对象包含id firstName lastName email
    return NextResponse.json({
      success: true,
      message: '用户创建成功',
      // user: {
      //   id: user._id,
      //   firstName: user.firstName,
      //   lastName: user.lastName,
      //   email: user.email
      // }
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('创建用户失败:', err);
    return NextResponse.json(
      { success: false, message: `创建用户失败: ${err.message}` },
      { status: 500 }
    );
  }
}
