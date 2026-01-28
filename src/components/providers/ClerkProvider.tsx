'use client';

//这里使用clerk的provider组件  通过provider组件可以获取clerk的session数据 但是rename了ClerkProviderOriginal 因为需要定制化
//这里的as是重命名的意义  把clerkprovider重命名为clerkprovideroriginal 但是最终导入的还是clerkprovider
import { ClerkProvider as ClerkProviderOriginal } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';


export function ClerkProvider({ children }: { children: React.ReactNode }) {
  //获取当前主题 useTheme是next-themes的hook 作用是获取当前主题 解析出dark或者light
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  return (
    <ClerkProviderOriginal
      appearance={{
        baseTheme: isDarkMode ? dark : undefined,
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
          footerActionLink: 'text-blue-600 hover:text-blue-700',
          card: 'bg-white dark:bg-gray-800 shadow-md rounded-lg',
        },
      }}
    >
      {children}
    </ClerkProviderOriginal>
  );
}
