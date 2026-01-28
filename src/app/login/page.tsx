"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignIn } from '@clerk/nextjs';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  //isloaded表示usesignin这个hook已经加载完毕就绪可以进行验证工作了你 signin是核心交互阶段处理用户登录 setactive设置当前活动的会话更新
  const { isLoaded, signIn, setActive } = useSignIn();
  // 处理邮箱密码登录
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      // 使用Clerk的邮箱密码登录
      const result = await signIn.create({
        identifier: email,
        password,
      });
      //判断登录状态
      if (result.status === 'complete') {
        // 设置活跃会话 session是clerk的会话id 这个id是临时的吗？
        // 是的 每次登录都是一个新的临时id 这个id是和临时会话绑定的 用于服务器识别当前用户
        await setActive({ session: result.createdSessionId });
        router.push('/');
      } else {
        // 处理多因素认证或其他情况
        console.log(result);
      }
      //unknown比any更安全 或者自己定义一个clerkerror类型的接口这样更加清晰明确
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid email or password');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 处理社交登录
  const handleSocialLogin = async (provider: 'oauth_google' | 'oauth_facebook') => {
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      console.log(`Social login: Attempting ${provider} login`);

      // 检查Clerk配置是否正确 signIn是clerk提供的对象 这个对象用于检查Clerk是否配置正确 如果为真那么 signIn是存在的
      if (!signIn) {
        console.error('Social login: signIn object is not available');
        setError('Authentication service not available. Please try again later.');
        setLoading(false);
        return;
      }

      // 使用Clerk的社交登录
      console.log('Social login: Redirecting to OAuth provider...');

      //使用 signIn.authenticateWithRedirect()方法进行社交登录 提供三个参数
      await signIn.authenticateWithRedirect({
        strategy: provider,
        //这里使用我们自定义的sso-callback的页面 需要我们在sso-callback页面中处理回调 需要再clerk的服务商配置中天健social connection
         //比如google的connection名称是oauth_google需要配置这个名字和回调进行对应
         //同时确保clerk的回调地址和当前页面的回调地址一致 加入url地址当前的地址http://localhost:3000/sso-callback
        //.env文件中配置要加入publishableKey和secretKey
        //这个是clerk的回调地址 用于处理回调
        redirectUrl: '/sso-callback',
        //这个是成功回调后的跳转地址 如果在ssocallba中重定向了这里也可以不写
        redirectUrlComplete: '/'
      });

      // 注意：如果重定向成功，以下代码不会执行
      console.log('Social login: Redirect did not occur as expected');
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Social login error:', error.message || error);
      setError(`Social login failed: ${error.message || 'Please check your network connection and try again.'}`);
      setLoading(false);
    }
  };



  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl my-10">
      <div className="md:flex">
        <div className="md:shrink-0 hidden md:block">
          <div className="h-full w-48 relative">
            <Image
              src="https://picsum.photos/600/800?random=30"
              unoptimized
              alt="Login background"
              fill
              style={{objectFit: 'cover'}}
              priority//优先加载
            />
          </div>
        </div>
        <div className="p-10 w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-800 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
{/*
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => handleSocialLogin('oauth_google')}
                disabled={loading || !isLoaded}
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <FaGoogle className="text-red-500" />
                Sign in with Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('oauth_facebook')}
                disabled={loading || !isLoaded}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <FaFacebook />
                Sign in with Facebook
              </button> */}
              <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('oauth_facebook')}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  disabled={loading}
                >
                  <span className="sr-only">Sign in with Facebook</span>
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('oauth_google')}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  disabled={loading}
                >
                  <span className="sr-only">Sign in with Google</span>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                    </g>
                  </svg>
                </button>
              </div>
            </div>

          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-blue-800 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
