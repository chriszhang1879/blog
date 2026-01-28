'use client';

import { UserButton as ClerkUserButton } from '@clerk/nextjs';
//定义UserButton组件 使用原生的clerk的UserButton组件进行扩展
export function UserButton() {
  return (
    <ClerkUserButton 
      appearance={{
        elements: {
          userButtonAvatarBox: 'w-10 h-10',
          userButtonBox: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full',
        }
      }}
      afterSignOutUrl="/"
    />
  );
}
