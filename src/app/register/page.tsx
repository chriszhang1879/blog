"use client";
import Link from 'next/link';
import Image from 'next/image';
import {  useState } from 'react';
import { useRouter } from 'next/navigation';
import {  useSignUp } from '@clerk/nextjs';
import { POST } from '../api/blogs/interaction/route';
// import { useClerk } from '@clerk/nextjs';

export default function Register() {
  //定义了表单数据
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  //定义了错误信息
  const [error, setError] = useState('');
  //定义了加载状态
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  //定义了路由
  const router = useRouter();
  //定义了Clerk的useSignUp
  const { isLoaded, signUp } = useSignUp();
  // TODO
  //定义了表单输入处理函数
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //这里解析的表单数据  name value type checked是表单元素什么属性?
    //name是表单元素的name属性 value是表单元素的value属性 type是表单元素的type属性 checked是表单元素的checked属性
    const { name, value, type, checked } = e.target;
    //这里设置表单数据
    setFormData(prev => ({
      ...prev,//...prev是对象所以可以直接展开使用  如果是map不能直接展开成普通对象需要先转换成数组
      //这里使用了计算属性名 [name]的意义是动态设置属性名
      //例如name是firstName 那么[name]就是firstName
      //所以[name]: value 就是 firstName: value
      //这里使用了计算属性名
      //如果type是checkbox 那么checked是true否则是value
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    //如果Clerk没有加载完成 那么就返回  什么叫加载完成?
    //Clerk的useSignUp()钩子函数会在Clerk加载完成之后才会返回 这个方法是什么时候执行的?
    //这个方法是在组件加载完成之后执行的 也就是在useSignUp()钩子函数返回之后执行
    if (!isLoaded) return;
    //设置加载状态为true 如果是true表示现在开始创建用户中进行中
    setLoading(true);
    //设置错误信息为空
    setError('');
    // 表单验证
    if (!formData.email || !formData.password) {
      setError('邮箱和密码是必填项');
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      setLoading(false);
      return;
    }
    if (!formData.agreeTerms) {
      setError('请同意条款');
      setLoading(false);
      return;
    }
    try {
      console.log('开始创建用户...');
      // 使用最简化的参数调用 Clerk API
      const result = await signUp.create({
        emailAddress: formData.email,
        password: formData.password
      });

      console.log('用户创建结果:', result.status);

      // 准备验证邮箱
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      if (result.status === 'complete') {
        setSuccess(true);
        router.push('/verify-email');
      } else if (result.status === 'missing_requirements') {
        // 需要邮箱验证
        // await signUp.prepareEmailAddressVerification({
        //   strategy: 'email_code'
        // });
        router.push('/verify-email');
        return;
      } else {
        // 其他状态跳转到邮箱验证页面
        router.push('/verify-email');
      }
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string, code?: string, longMessage?: string }> };
      //console.error('注册错误详情:', JSON.stringify(error));
      setError(error.errors?.[0]?.message || '注册失败，请重试。');
    } finally {
      setLoading(false);
    }
  };
  // 不再需要社交登录处理函数，因为我们只使用邮箱密码注册


  // const  clerk= useClerk();

  // useEffect(() => {
  //   if(clerk&&clerk.loaded){
  //   const {captcha}=clerk;
  //   if (captcha) {
  //     captcha.mount({target:'#clerk-captcha'});
  //   }
  // }
  //   return () => {
  //     captcha?.unmount();
  //   }
  // },[clerk]);

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl my-10">
      <div className="md:flex">
        {/* 左侧图片 md:shrink-0 hidden md:block意思是md屏幕以下不显示 md屏幕以上显示 */}
        <div className="md:shrink-0 hidden md:block">
          <div className="h-full w-48 relative">
            <Image
              src="https://picsum.photos/600/800?random=40"
              unoptimized
              alt="Register background"
              fill
              style={{objectFit: 'cover'}}
            />
          </div>
        </div>

        {/* 右侧表单 */}
        <div className="p-8 w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Create an Account</h2>
            <p className="text-gray-600 mt-2">Join our community of writers and readers</p>
          </div>

          {error && (
            //错误信息 显示在表单上方  但是这个方法不一定实现 因为我设置所有的字段为required
            // 这导致如果确实字段的话页面内置的html5会自动接管检验而不会使用我定义的这个error方法
            <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          {
            success && (
              <div className="bg-green-50 text-green-500 p-3 rounded-md mb-4 text-sm">
                { "注册成功"}
              </div>
            )
          }

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="John"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Doe"
              />
            </div>

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
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
              {/* 提示信息 */}
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters with 1 uppercase, 1 number, and 1 special character</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.agreeTerms}
                onChange={handleChange}
                disabled={loading}
              />
              {/* 同意条款 */}
              <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-700">
                {/* {""}的意义是换行 */}
                I agree to the{" "}
                <Link href="/terms" className="text-blue-800 hover:underline">
                  Terms of Service
                </Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-blue-800 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div id="clerk-captcha">

            </div>

            <div>
            {/* 点击submit会触发handleSubmit函数 */}
              <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              //  禁用按钮这里考虑全面同时考虑了loading和用户是否同意条款
                disabled={loading || !formData.agreeTerms}
              >
                {/* loading时显示Creating Account...否则显示Create Account */}
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          {/* 移除社交登录选项，只保留邮箱密码注册 */}

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-blue-800 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );

}
