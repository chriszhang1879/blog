import { NextRequest, NextResponse } from "next/server";
//import { getServerSession } from "next-auth";
//import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/mongodb/clientPromise";
import User from "@/model/user";
import { auth } from "@clerk/nextjs/server";  

//这个文件是用于处理用户更新信息的  主要是修改用户名和头像的接口 
//PUT方法用于更新用户信息
  /**
   * PUT /api/user/update
   * 
   * Updates the user's profile.
   * 
   * @param {NextRequest} req The request object.
   * 
   * @returns {Promise<NextResponse>} The response object.
   * 
   * @throws {Error} If an error occurs while updating the user profile.
   */
export async function PUT(req: NextRequest) {
  try {

    //这里使用nextauth进行认证的
    // Check if user is authenticated
   // const session = await getServerSession(authOptions);
    
    // if (!session || !session.user.id) {
    //   return NextResponse.json(
    //     { error: "You must be logged in to update your profile" },
    //     { status: 401 }
    //   );
    // }
    
    // clerk的authhook
    //使用clerk来获取当前登录用户的信息 代码实现
    //clerk的authhook返回一个对象 里面包含当前登录用户的信息
    //user是clerk的用户信息

    const user = await auth();
    // Connect to database 这里返回的dbConnect是一个Promise里面存储的是mongoose连接
    //await dbConnect();
    await dbConnect;
    
    // Get request body httpresponse中的字段那些  body中是自己定义的字段
    const body = await req.json();
    //从body中获取name和image的值
    const { name, image } = body;
    
    // Only allow updating certain fields  将updateData设置为一个对象 里面存储name和image
    const updateData: Record<string, string> = {};
    if (name) updateData.name = name;
    if (image) updateData.image = image;
    
    // Don't proceed if no valid fields to update
    //如果updateData为空 那么就返回错误
    //object的方法有哪些? 用于操作对象的方法
    //Object.keys(updateData)返回一个数组
    //Object.values(updateData)返回一个数组
    //Object.entries(updateData)返回一个数组
    //Object.assign(updateData)返回一个对象
    //Object.freeze(updateData)返回一个冻结的对象
    //Object.seal(updateData)返回一个密封的对象
    //Object.preventExtensions(updateData)返回一个不可扩展的对象
    //Object.isFrozen(updateData)返回一个布尔值
    //Object.isSealed(updateData)返回一个布尔值
    //Object.isExtensible(updateData)返回一个布尔值
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }
    
    // Update user in database 这个findByIdAndUpdate是mongoose的查询方法作用是更新用户信息
    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
      //select的意思是选择性返回字段 select -password表示不返回password字段
    ).select("-password");
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
    
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "An error occurred while updating your profile" },
      { status: 500 }
    );
  }
}
