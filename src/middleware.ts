import { useAuth } from '@clerk/nextjs';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// 注意：路由配置已移至 createRouteMatcher 中

// 定义公开路由，不需要认证 需要认证的会自动跳转到登录页面
const publicRoutes = createRouteMatcher([
  //以下必须公开否则都会默认跳转到登录页面
  '/', // 首页
  '/login(.*)', // 登录页面 这两个要在env环境中配置
  '/register(.*)', // 注册页面
  // '/sign-in(.*)', // Clerk 登录默认路由 这两个不需要了 因为自定义了login和register页面  不用默认的
  // '/sign-up(.*)', // Clerk 注册默认路由
  '/verify-email(.*)', // 邮箱验证页面

  '/post/(.*)', // 文章详情页
  '/search(.*)', // 搜索页面
  '/api/posts/(.*)', // 获取文章的 API 这两个api路由被暴露的原因是首页文章需要被看到 用api读取数据
  '/api/user/favorites/count', // 获取收藏数的 API
   '/api/search', // 搜索 API
]);

// 定义忽略路由，完全绕过中间件
const ignoredRoutes = createRouteMatcher([
  '/api/webhook(.*)',
  '/_next/static/(.*)',
  '/favicon.ico',
  '/images/(.*)',
  '/api/auth(.*)', // 忽略 NextAuth 的 API 路由
]);

//这个clerkMiddleware的作用是什么？
export default clerkMiddleware(async (auth, req) => {


  // const path= new URL(req.url).pathname;

  // if(auth.userId&&path.startsWith('/login')||path.startsWith('/register')){
  //   return NextResponse.redirect(new URL('/', req.url));
  // }
  if (ignoredRoutes(req)) {
    //跳过之后返回的是undefined
    return;
  }

  // 如果不是公开路由，需要认证
  if (!publicRoutes(req)) {
    await auth.protect();
  }
});

//这行代码的意思是匹配的路由类型 基本匹配了大部分的路由包括api路由 同时我在ispublicroute和isignoredroute中允许了部分路由的访问
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
