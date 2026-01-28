'use client';

import { SignUpButton as ClerkSignUpButton } from '@clerk/nextjs';
import { Button } from '../ui/Button';
//定义SignUpButtonProps接口
interface SignUpButtonProps {
  mode?: 'modal' | 'redirect';
  className?: string;
}
//定义SignUpButton组件
export function SignUpButton({ mode = 'redirect', className}: SignUpButtonProps) {
//返回SignUpButton组件
  return (
    <ClerkSignUpButton mode={mode} >
      <Button className={className} variant="outline">注册</Button>
    </ClerkSignUpButton>
  );
}
