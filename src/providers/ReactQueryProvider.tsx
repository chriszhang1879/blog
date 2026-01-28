"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // 为每个请求创建一个新的QueryClient实例，避免在客户端和服务器端之间共享缓存  什么时候回共享缓存
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // 默认配置
        staleTime: 60 * 1000, // 1分钟内数据不会被标记为过期
        refetchOnWindowFocus: false, // 窗口获得焦点时不重新获取数据
        retry: 1, // 失败时最多重试1次
      },
    },
  }));

  return (
    //QueryClientProvider是react-query提供的组件  用于提供queryClient实例 
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
