import { NextRequest, NextResponse } from 'next/server';
import { checkIn, getUserCheckInInfo, getUserLocation } from '@/lib/userRedisService';
import mongoose from 'mongoose';
import { auth } from "@clerk/nextjs/server";



// 获取用户真实IP地址
function getIpAddress(req: NextRequest): string {

  //获取请求头中的x-forwarded-for 作用是获取用户的真实IP地址
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    //获取用户的真实IP地址
    //split(',')是将字符串按逗号分隔成数组
    // forwardedfor里面的ip地址是用逗号分隔的[203.1.113.12,203.2.113.12,203.3.113.12,203.4.113.12] 一般第一个是用户的真实IP地址
    //trim()是去除字符串两端的空格
    return forwardedFor.split(',')[0].trim();
  }
  return '127.0.0.1'; // 默认本地IP
}



// 处理用户打卡请求
export async function POST(req: NextRequest) {
  try {
    // 获取用户会话
    const session = await auth();
    const {userId} = session;
    //如果要获取更相信的clerk信息可以使用clerk的api  clerkclient来获取.getUser(userId)方法

    // 检查用户是否已登录
    if (!userId) {
      return NextResponse.json(
        { success: false, message: '请先登录' },
        { status: 401 }
      );
    }

    // 获取用户IP地址
    const ip = getIpAddress(req);

    // 获取用户地理位置
    const location = await getUserLocation(userId, ip);

    // 执行打卡 返回包含了consecutiveCheckIns totalCheckIns points lastCheckIn四个属性的对象
    const result = await checkIn(userId, location);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('打卡失败:', error);
    return NextResponse.json(
      { success: false, message: `打卡失败: ${error.message}` },
      { status: 500 }
    );
  }
}



// 获取用户打卡信息
export async function GET() {
  try {
    // 获取用户会话
    const { userId } =await auth();

    // 检查用户是否已登录
    if (!userId) {
      return NextResponse.json(
        { success: false, message: '请先登录' },
        { status: 401 }
      );
    }

    // 获取用户打卡信息  根据定义返回一个对象包含了用户的打卡信息  这个getusercheckininfo是userredisserver中暴露出来的函数 这个函数返回一个自定义的对象 对象中包含了consecutiveCheckIns totalCheckIns points lastCheckIn四个属性
    const checkInInfo = await getUserCheckInInfo(userId);


    // 检查用户今天是否已经打卡  这个hascheckedintoday是userredisserver中暴露出来的函数 这个函数返回一个布尔值
    const hasCheckedInToday = await mongoose.model('User').findById(userId).then(user => {
      if (!user || !user.lastCheckIn) return false;

      const today = new Date();
      const lastCheckIn = new Date(user.lastCheckIn);

      //这个return返回什么?根据定义返回boolean
      //返回一个布尔值
      //这个布尔值表示用户今天是否已经打卡
      return (
        lastCheckIn.getFullYear() === today.getFullYear() &&
        lastCheckIn.getMonth() === today.getMonth() &&
        lastCheckIn.getDate() === today.getDate()
      );
    });

    //最终整合以上信息返回一个json对象 这个json对象包含的属性有success checkInInfo hasCheckedInToday三个属性
    // 期中checkInInfo里面有consecutiveCheckIns totalCheckIns points lastCheckIn四个属性
    return NextResponse.json({
      success: true,
      //...checkInInfo里面有四个属性展开填入 这句代码是将checkInInfo对象的所有属性展开
      ...checkInInfo,
      //hasCheckedInToday 这句代码是将hasCheckedInToday属性添加到返回的对象中 这个属性返回值是布尔值
      hasCheckedInToday
    });
  } catch (error: any) {
    console.error('获取打卡信息失败:', error);
    return NextResponse.json(
      { success: false, message: `获取打卡信息失败: ${error.message}` },
      { status: 500 }
    );
  }
}
