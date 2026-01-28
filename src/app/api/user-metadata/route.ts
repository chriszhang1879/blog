import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from '@/model/user';

 //这里即使用户使用不同的方式登录 只要是同一个email就会关联到同一个数据库的用户
 //每次登录都会更新用户的最新clerkid
  //解决了多种登录方式的问题
export async function GET() {
  // Get the authenticated user's ID 服务器端获取用户信息的方法
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
  //  const clerkClient = await clerkClient();
    // Connect to the database 返回的是mongoose连接是一个Mongoose实例 以供后续操作
    //await connectToDatabase();

    // Get user data from the database
    // Using mongoose directly since the connection returns mongoose instance
   //const userData = await mongoose.connection.collection("users").findOne({ clerkId: userId });
    //如果用户不存在
    // if (!userData) {
    //   return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    // }

    // Update Clerk user's public metadata
    // clerkClient returns a Promise that resolves to a client with users property

    //clerkClient()返回一个Promise 所以需要await等待解析后才能对user属性进行更新操作
    const clerk = await clerkClient();
    //获取clerk用户信息 getUser方法是获取用户的完整信息
    const clerkUser = await clerk.users.getUser(userId);
    //获取clerk用户邮箱 这里即使是使用社交登录也会获取到邮箱比如google或者github也会有邮箱获取到
    const clerkemail = clerkUser.emailAddresses[0].emailAddress;
    //如果clerk用户邮箱不存在
    if(!clerkemail){
       return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }
    //连接数据库 返回一个mongoose连接 是一个Mongoose实例 以供后续操作
    //如果不调用这个方法那么mongoose模型将无法连接到数据库
    //这个方法确保在使用mongoose模型之前已经建立了数据库连接才能使用具体的方法
    await connectToDatabase();
    //通过clerk用户邮箱查询数据库中的用户信息
    //这里说过的是mongoose模型进行查询性能更好 基于预定义的模型schema架构 返回mongoose文档对象
    //可以自定义类型转换和验证 基于schema定义
    //支持中间件
    //支持索引
    //支持聚合操作
    //支持事务
    //支持事件监听
    let userData = await User.findOne({ email: clerkemail });
    //如果用户不存在
    if (!userData) {
       const newuser = {
        clerkId: userId, //clerk分配的唯一用户id
        email: clerkemail, //clerk的用户邮箱
        username: clerkUser.firstName || clerkUser.lastName || "user", //clerk的用户名称
        image: clerkUser.imageUrl || "", //clerk的用户头像
         // role:"user", //clerk的用户角色
        //clerkUser.externalAccounts是clerk的字段 这里为什么用externalAccounts[0]？
        //因为clerkUser.externalAccounts是一个数组 里面包含多个provider 但是我们只需要第一个
         //什么情况下会产生多个provider？
        provider:clerkUser.externalAccounts[0].provider,
       }
       //clerkUser.provider是clerk的字段 create的作用是创建一个新用户存储到数据库中
       //返回的是一个mongoose文档对象 可以用于后续操作 这个result是一个mongoose文档对象里面包含了user的_id username email等信息
       const  result =  await User.create(newuser);
       //...result是将result对象展开  _id:result._id.toString()是将_id转换为字符串方便后续的查询
       //const dbuserid = result._id.toString();
       userData = {...result, _id:result._id.toString()};
    }  else {
      //如果clerkid不等于数据库中的clerkid
        if(userData.clerkId !== userId){
          //作用是更新数据库中的用户信息
            await User.updateOne(
              //更新数据库中的用户信息
              {clerkId:userData.clerkId}, //查询条件 指定要更新哪些文档 查找clerkid等于userData.clerkId的文档 只有匹配这个条件的文档才会被更新
              //更新后的用户信息
              {clerkId:userId} //更新后的用户信息  将clerkid更新为当前登录的clerkid
             );
            //userData.clerkId = userId;
        }
    }

    //更新clerk用户publicmetadata 这段代码的作用是将用户信息同步到clerk
    //存储的信息是刚刚从数据库中查询到的用户所有信息 但是这里的dbuserid作用是将数据库中的用户信息同步到clerk
    await clerk.users.updateUser(
      userId,
      {
      //  update clerk users public metadata
      publicMetadata: {
        // Add the database user ID 自定义的一个字段 用于建立clerk和数据库的关联
        //作用是利用clerk的前端方法useuser()获取到数据库用户的id 无需额外的查询
        dbUserId: userData._id, //数据库用户的id  但是clerk自己还有一个clerkid 要区分是不同的 这个dbuserid是为了将来查询数据库数据方方便的
        // You can add other fields as needed
        // role: userData.role,
        // preferences: userData.preferences,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user metadata:", error);
    return NextResponse.json({ error: "Failed to update user metadata" }, { status: 500 });
  }
}
