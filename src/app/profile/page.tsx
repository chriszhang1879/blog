"use client";

// import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth, useClerk, useSession, useSignIn, useSignUp, useUser } from "@clerk/nextjs";
//这里是自定义的一个获取用户数据的hook 需要使用usecontext来导出
import { useUserDataContext } from "../../components/providers/UserDataProvider";
//这里是自定义的一个修改密码的modal
import ChangePasswordModal from "../../components/ChangePasswordModal";


//TODO
//这个页面可以使用我自己定义的useprofile这个页面
export default function ProfilePage() {

      //以下方法必须在client端使用 并且必须在provider中使用
    // useSignIn处理用户登录 useSignUp处理用户注册 useUser获取当前用户详细信息 提供user对象包含个人信息 邮箱等 用于显示用户资料
    // useClerk获取当前用户详细信息 提供user对象包含个人信息 邮箱等 用于显示用户资料
    // useAuth获取当前用户认证状态 提供isloaded和issignedin属性 用于判断用户是否登录
    // useClerk获取当前用户详细信息 提供user对象包含个人信息 邮箱等 用于显示用户资料
    // useSession获取当前用户会话状态 提供sessionid和token 用于标识用户目前的状态登入登出等
       // sessionid用于标识用户目前的状态登入登出等
      // token用于标识用户的身份存储一些临时的用户数据可以定制  用于验证api接口的权限 有过期时间
   //这个useauthhook是clerk提供的hook 用于获取用户认证状态 只能用于客户端 服务器端只能用auth()函数
	const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  // 从上下文获取用户数据 是自己定义的hook 用于获取用户数据
  const {userData} = useUserDataContext();
  //定义loading状态
  const [loading, setLoading] = useState(true);
  //定义changePasswordModalOpen状态 这个模态框用于修改密码 是弹出的模态框
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  useEffect(() => {
    //这两个属性都是clerk的useauthhook的属性  isloaded表示用户认证状态是否已经加载完成（true才表示clerk已经初始化完毕认证状态已经确认（无论登录还是未登录）
    // issignedin表示用户是否登录（true才表示用户已经登录 false未登录 undefined在isloaded为false时才会出现表示登录状态不确定）
     // 如果只检查issignedin的话会导致页面显示内容然后再重定向 造成闪烁 同时确认两个状态确保用户认证状态已经加载完成在显示受保护内容
    if (!isLoaded || !isSignedIn) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, router]);
  //这里的isloaded代表clerk初始化完毕认证状态已经确认进入到登录状态 insignin代表用户是否登录undefined->false->true登录完毕
   //改变的时机是：当页面加载完成initial render的时候
   //            开始认证的时候也就是检测issignedin'的时候
   //            网络重连后会检查这两个状态
   //            或者sessipn过期 手动session失效等情况
              //  token refresh刷新token
  // router 是确保使用最新的route路由实例


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
      //这里的属性解释 max-w-4xl表示最大宽度为4xl在tailwind中表示896px 随着屏幕大小变化而变化但不会超过这个值
      // mx-auto表示水平居中 这里的mx是margin的x轴方向的
      // 布局方式默认是垂直布局 div这样的块级土元素会占据一整行并垂直堆叠
      // 颜色会继承父元素的背景色 如果没有就是透明
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Your Profile</h1>
         {/* //shadow-md表示阴影 md是中等大小的阴影  具体是圆角的阴影 p-6表示内边距 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* //这里的属性解释 flex flex-col md:flex-row items-center md:items-start 如果没有使用md,lg等属性就默认是小屏幕布局 */}
        <div className="flex flex-col md:flex-row  items-center md:items-start gap-8">
          <div className="relative w-32 h-32 rounded-full overflow-hidden mt-2">
            <Image
              src={userData?.image || `https://ui-avatars.com/api/?name=${userData?.name || 'User'}&background=random&size=128`}
              alt="Profile"
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* flex-1表示占据剩余空间 */}
          <div className="flex-1">

            <div className="flex flex-row justify-center space-x-50 mb-6 items-center">
              <h2 className="text-2xl font-semibold">{userData?.name || "User"}</h2>
              <p className="text-2xl text-gray-600 ">{userData?.email || "Email"}</p>
            </div>

            {/* grid grid-cols-1 md:grid-cols-2 gap-4表示网格布局 1列1行 md:grid-cols-2表示在md屏幕及以上显示2列2行 gap-4表示间距 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-500">Authentication Method</h3>
                <p className="mt-1">{userData?.email?.includes("@gmail.com") ? "Google" :
                    userData?.email?.includes("@facebook.com") ? "Facebook" : "Email/Password"}</p>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-500">Account Created</h3>
                <p className="mt-1">June 24, 2025</p>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-500 ">Role</h3>
                <p className="mt-1 capitalize">{userData?.role || "user"}</p>
              </div>

              <div className="border rounded-md p-4 ">
                <h3 className="text-sm font-medium text-gray-500 ">Last Login</h3>
                <p className="mt-1">Today</p>
              </div>
            </div>


            {/* 这里是编辑个人信息的按钮  flex-wrap表示换行 space-x-4表示x轴方向的间距*/}
            <div className="mt-6 flex flex-wrap space-x-4">
              <Link
                href="/profile/edit"
                // transition-colors表示颜色过渡动画效果是  hover:bg-blue-700表示鼠标悬停时背景颜色变为蓝色
                className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition-colors transition-duration-2000"
              >
                Edit Profile
              </Link>
              {/* 这里是修改密码的按钮 */}
              <button type="button"
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                edit password
              </button>
            </div>
          </div>
        </div>
      </div>
        {/* 修改密码弹窗  之前没有显示是因为这个组件没有被渲染 没有在return语句内部导致的*/}
      <ChangePasswordModal
         isOpen={isChangePasswordModalOpen}
          //这个函数代表关闭modal 通过setischangePasswordModalOpen(false)来关闭modal
         onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  )
}
