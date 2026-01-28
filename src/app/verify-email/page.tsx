"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function VerifyEmail() {
  //定义了表单数据
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isLoaded, signUp, setActive } = useSignUp();


  const router = useRouter();


  // 处理验证码提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 验证用户是否已登录 这里的verificationCode是用户输入的验证码 如果没有的话就返回 不执行
    if (!isLoaded || !verificationCode) return;
    setLoading(true);
    setError("");
    try {
        // 尝试验证邮箱 code是用户输入的验证码
      const result = await signUp.attemptEmailAddressVerification({
        // 使用刚刚重新发送的验证码  code是用户输入的验证码
        code: verificationCode,
      });
      //result.status是clerk返回的状态
      if (result.status === "complete") {
        // 设置活跃会话 激活当前会话以便后续的登录操作
        await setActive({ session: result.createdSessionId });
        // 调用API将用户信息存储到数据库
        const dbResponse = await fetch("/api/user/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            //这个createdUserId是clerk返回的用户id 
            clerkId: result.createdUserId,
            firstName: result.firstName || "",
            lastName: result.lastName || "",
            email: result.emailAddress || "",
          }),
        });

        if (dbResponse.ok) {
          router.push("/");
        } else {
          console.error("Failed to store user in database");
          // 继续导航，因为Clerk注册已成功
          router.push("/");
        }
      } else {
        setError("验证失败，请检查验证码或重新注册");
      }
    } catch (err: unknown) {
      // 这里是Clerk的错误处理 as是类型断言 将其转换为Clerk的错误类型  ?:是可选链操作符 表示如果errors存在则取第一个错误信息 如果不存在则取"验证失败，请重试"
      const error = err as { errors?: Array<{ message: string }> };
      setError(error.errors?.[0]?.message || "验证失败，请重试");
      console.error("Verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 处理重新发送验证码
  const handleResendCode = async () => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      // 准备邮箱验证 作用是重新发送验证码
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      //设置错误为空
      setError("");
    } catch (err: unknown) {
      // 这里是Clerk的错误处理
      // as是类型断言 将其转换为Clerk的错误类型
      // ?:是可选链操作符 表示如果errors存在则取第一个错误信息 如果不存在则取"发送验证码失败，请重试"
      const error = err as { errors?: Array<{ message: string }> };
      setError(error.errors?.[0]?.message || "发送验证码失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl my-10">
      <div className="md:flex">

        {/* 邮箱验证背景图片 */}
        <div className="md:shrink-0 hidden md:block">
          <div className="h-full w-48 relative">
            <Image
              src="https://picsum.photos/600/800?random=50"
              unoptimized
              alt="Verification background"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>

        {/* 邮箱验证表单 */}
        <div className="p-8 w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">验证您的邮箱</h2>
            <p className="text-gray-600 mt-2">
              我们已向您的邮箱发送了验证码，请输入以完成注册
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="verificationCode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                验证码
              </label>
              <input
                id="verificationCode"
                name="verificationCode"
                type="text"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={loading}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入6位验证码"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? "验证中..." : "验证邮箱"}
              </button>
            </div>
          </form>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="text-sm text-blue-800 hover:underline"
            >
              重新发送验证码
            </button>
            <Link href="/register" className="text-sm text-blue-800 hover:underline">
              返回注册
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
