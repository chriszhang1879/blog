'use client';

import { SignUp } from '@clerk/nextjs';
//这个文件是用于显示注册页面  是自定义的页面吗？
//SignUp是clerk提供的组件 用于显示注册页面
//SignUp组件的属性值
//appearance:用于自定义SignUp组件的外观
//routing:用于指定SignUp组件的路由方式 具体是path还是redirect 如果是path的话那么SignUp组件的路径就是path指定的路径 如果是redirect的话那么SignUp组件的路径就是signInUrl指定的路径
//path:用于指定SignUp组件的路径
//signInUrl:用于指定SignUp组件的登录页面路径 具体的作用是当用户注册成功后会跳转到signInUrl指定的路径
export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
              card: 'bg-white dark:bg-gray-800 shadow-xl rounded-xl',
              headerTitle: 'text-2xl font-bold text-center',
              headerSubtitle: 'text-gray-600 dark:text-gray-300 text-center',
              socialButtonsBlockButton: 'border border-gray-300 dark:border-gray-600',
              formFieldLabel: 'text-gray-700 dark:text-gray-300',
              formFieldInput: 'border border-gray-300 dark:border-gray-600 dark:bg-gray-700',
              footerActionText: 'text-gray-600 dark:text-gray-400',
              footerActionLink: 'text-blue-600 hover:text-blue-700 dark:text-blue-400',
            },
          }}
        // path指定了注册流程会在当前页面内完成
          routing="path"
          //确保注册流程会在当前页面内完成 注册过程中的不同步骤会这个基本路径的后面加上不同的参数
          path="/sign-up"
          // signInUrl:用于指定SignUp组件的登录页面路径 具体的作用是当用户注册成功后会跳转到signInUrl指定的路径
          //这里也可以使用afterSignInUrl来指定注册成功后跳转的页面 比如用户的dashboard等这时 自己完成登录步骤展示用户信息 不需要跳转再重复登录
          //这里如果是社交登录的话登录后会自动执行后续登录步骤 如果是邮箱密码登录的话登录后会跳转到signInUrl指定的路径再自行登录
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}
