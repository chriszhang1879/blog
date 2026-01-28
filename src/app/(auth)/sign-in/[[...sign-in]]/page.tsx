'use client';


//传入clerk 定义的SignIn组件 提供了clerk的登录功能
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <SignIn
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
          //指定使用路径路由方式
          routing="path"
          //指定登录页面的路径
          path="/sign-in"
          //指定注册页面的路径
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}
