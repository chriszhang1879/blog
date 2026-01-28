import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import User from '../../../../model/user';
import bcrypt from 'bcryptjs';

// 修改密码API
export async function POST(req: NextRequest) {
  try {
    // 获取用户ID
    const { userId} = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 解析请求体 这里的body是js对象 解构出来的时currentPassword和newPassword对应的值
    const body = await req.json();
    const { currentPassword, newPassword } = body;
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: '当前密码和新密码都是必填项' }, { status: 400 });
    }
    
    // 连接数据库 获取的是一个connnection链接以便对model进行操作
    await connectToDatabase();
    
    // 查找用户
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }
    
    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: '当前密码不正确' }, { status: 400 });
    }
    
    // 加密新密码 10是加密的强度越高越安全但是越耗时
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 更新密码
    user.password = hashedPassword;
    await user.save();
    
    return NextResponse.json({ success: true, message: '密码修改成功' }, { status: 200 });
  } catch (error) {
    console.error('修改密码失败:', error);
    return NextResponse.json({ error: '修改密码失败' }, { status: 500 });
  }
}
