"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { SignInButton } from './auth/SignInButton';
import { SignUpButton } from './auth/SignUpButton';
import { UserButton } from './auth/UserButton';
import UserCheckInStatus from './UserCheckInStatus';
import FavoritesIndicator from './FavoritesIndicator';


//在导航组件中有clerk的认证和状态的判断存储等信息  如果直接输入url地址访问可能没有这些clerk的认证信息所以会重定向到login页面
const Navbar = () => {
  //usePathname是nextjs提供的hook 用于获取当前页面的路径
  //searchParams是nextjs提供的hook 这个hook有多个返回值 返回对象是url中的查询参数  用于获取当前页面的多个查询参数 获取的内容是url中的查询参数
  //usePathname是nextjs提供的hook 用于获取当前页面的路径  这个hook只有一个返回值就是当前页面的路径
  const pathname = usePathname();
  //useAuth是clerk提供的hook 用于获取当前用户的认证状态
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <header className="w-full py-4 px-6 bg-white shadow-sm ">
      <div className="max-w-7xl mx-auto flex justify-between items-center ">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 z-20">
          <div className="text-blue-800 font-bold text-2xl flex items-center z-20">
            <span className="inline-block w-8 h-8 bg-blue-800 text-white flex items-center justify-center rounded mr-2">
              📚
            </span>
            lamalog.
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-6 z-20">
          <Link href="/" className={` ${pathname === '/' ? 'font-medium' : ''} hover:text-blue-800 z-20`}>
            Home
          </Link>
          <Link href="/trending" className={`${pathname === '/trending' ? 'text-red-500' : ''}  hover:text-blue-800 z-20`}>
            Trending
          </Link>
          <Link href="/popular" className={`${pathname === '/popular' ? 'font-medium' : ''} hover:text-blue-800 z-20`}>
            Most Popular
          </Link>
          <Link href="/about" className={`${pathname === '/about' ? 'font-medium' : ''} hover:text-blue-800 z-20`}>
            About
          </Link>
        </nav>

        {/* Auth Buttons */}
        {isLoaded && isSignedIn ? (
          <div className="relative flex items-center space-x-4  z-20">
            {/* 用户打卡状态组件 */}
            <UserCheckInStatus />

            {/* 收藏博客指示器 */}
            <FavoritesIndicator />

            <Link
              href="/dashboard"
              // 根据当前路径添加font-medium类 如果当前路径是dashboard 则添加font-medium类 否则为空（不添加）
              // hover:text-blue-800表示鼠标悬停时添加text-blue-800类
              className={`${pathname === '/dashboard' ? 'font-medium' : ''} hover:text-blue-800  transition-colors transition-duration-5000`}
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className={`${pathname === '/profile' ? 'font-medium' : ''} hover:text-blue-800`}
            >
              Profile
            </Link>

            {/*用户按钮 定义了显示用户头像和下拉菜单 提供用户账户管理选项 包含登出功能设置了aftersignouturl确保登出后跳转到首页 自定义了样式*/}
           {/* //TODO 这个用户按钮可以自定义实现 */}
            <UserButton />
          </div>
        ) : (
          // 未登录状态 显示的是登录和注册按钮 是自己定义的样式 mode是登录后跳转到首页通过自定义来实现 扩展了clerk的默认属性
          //TODO 这两个登录注册可以自定义实现
          <div className="flex space-x-2 z-20">
            <SignInButton mode="redirect" redirectUrl="/sign-in" className="bg-blue-800 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors" />
            <SignUpButton mode="redirect" redirectUrl="/sign-up" className="border border-blue-800 text-blue-800 px-4 py-2 rounded-full font-medium hover:bg-blue-50 transition-colors" />
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
