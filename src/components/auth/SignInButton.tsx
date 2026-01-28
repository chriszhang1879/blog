'use client';

//为什么要写signinbutton as clerkSignInButton？ 因为需要自定义SignInButton组件，SignInButton是clerk的组件，SignInButton as clerkSignInButton是将SignInButton重命名为clerkSignInButton，
//否则会产生命名冲突问题
//这里是将siginbutton进行重命名导入，当需要创建自定义包装组件时候能够在保持代码清晰和避免命名冲突的同时还能扩展第三方库的功能
import { SignInButton as ClerkSignInButton } from '@clerk/nextjs';
import { Button } from '../ui/Button';
//定义SignInButtonProps接口
interface SignInButtonProps {
  mode?: 'modal' | 'redirect';
  className?: string;
}
//定义SignInButton组件
export function SignInButton({ mode = 'redirect', className }: SignInButtonProps) {
  return (
    //添加clerk中siginbutton的默认属性扩展 redirect作用是登录后跳转到首页
    <ClerkSignInButton mode={mode}>
      <Button className={className}>登录</Button>
    </ClerkSignInButton>
  );
}
