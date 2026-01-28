"use client";

import { useEffect } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";



export default function SSOCallback() {

  //usesignup是clerk提供的hook 用于处理用户注册
  //useSignIn()是clerk提供的hook 用于处理用户登录
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }



  //这个handleCallback函数可以用另外一个clerk内置的函数替代
  //signIn.handleRedirectCallback()这个函数直接调用即可内部封装了所有的登录逻辑 不需要自己去实现了（下面这个handlecallback可以省略了）
 // Handle the callback
    async function handleCallback() {
      try {
        console.log("SSO Callback: Starting OAuth callback process");
        console.log("SSO Callback: signIn object available:", !!signIn);

        // 检查signIn对象是否存在
        if (!signIn) {
          console.error("SSO Callback: signIn object is not available");
          //这个返回的url包含了错误信息 是自定义的错误信息
          router.push("/login?error=signin-not-available");
          return;
        }

        console.log("SSO Callback: Attempting first factor with oauth_callback strategy");
        // 使用非类型检查的方式调用方法
        // Clerk的类型定义与实际API可能有差异
        // 在运行时，oauth_callback是有效的策略
        // 如果直接使用 const result=await signIn.attemptFirstFactor({
        //   strategy: "oauth_callback"
        // });
        // 可能会报错 定义的类型可能不包含oauth_callback 与api的返回有冲突
        // 所以这里使用类型断言设置为any 不进行类型检查
       // const signInAny = signIn as unknown as any;
        //attemptFirstFactor是clerk提供的方法 用于尝试第一次认证
        //这里使用断言as 临时绕过ts 的类型检查是权宜之计（在不是运行错误的情况下使用）
        // 这个时候signIn没有ts内置的那些类型方法，此时就是一个普通的ts对象 可以有任何的方法 所以就不会报错了 不然strategy就会报错因为没有这个oauthcallbackj类型
        const result = await (signIn as any).attemptFirstFactor({
          //这里需要自己在clerk服务中配置对应的名字服务商
          strategy: "oauth_callback"
        });
        console.log("SSO Callback: Result received:", result);
        //result.status是clerk返回的状态
        if (result?.status === "complete") {
          console.log("SSO Callback: Authentication complete, setting active session");
          await setActive({ session: result.createdSessionId });
          console.log("SSO Callback: Session activated, redirecting to home");
          router.push("/");
        } else {
          console.error("SSO Callback: Unexpected result status:", result);
          router.push("/login?error=sso-failed");
        }
      } catch (err) {
        console.error("Error during SSO callback:", err);
        router.push("/login?error=sso-error");
      }
    }
    // 这里的嵌套用法比较常见 特别是当使用useeffect时候 因为是在useeffect中调用另一个异步函数，这个函数只是单纯定义并不会执行
   //  除非显示的去调用才会执行 所以这里调用handleCallback()
    // 没有这个调用的话handleCallback()函数是不会执行的
    handleCallback();

  }, [isLoaded, signIn, setActive, router]);


  //
  // 这是一个例子 定义在函数内部的另一个函数在定义完之后需要显示的去调用才会执行
  // useEffect(() => {
     // This function is defined but not executed yet
  //   function sayHello() {
  //     console.log("Hello!");
  //   }

     // Without this line, sayHello would never run
  //   sayHello();

  // }, []);



  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Processing your sign-in...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we complete your authentication.
          </p>
          <div className="mt-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
