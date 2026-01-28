"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";


//定义QueryProviderProps接口 接口内部有children属性
interface QueryProviderProps {
  children: ReactNode;
}
//定义QueryProvider组件 这里的default是默认导出 children是解构的children属性
//这个组件是提供全局的queryclient实例  通过QueryClientProvider组件来提供queryclient实例 确保整个应用都能访问到同一个queryclient实例
// 用于优化数据获取和缓存  通过queryclient实例可以管理数据获取和缓存  避免了重复获取数据
export default function QueryProvider({ children }: QueryProviderProps) {
   //useState()的使用中都是解构赋值的，[]里面的都是解构出来的参数 但是不需要第二个参数setqueryclient
  // useState的作用是保存queryClient实例 执行函数new QueryClient()是创建queryClient实例
  // [queryclient]的中括号是解构出来  这里的queryclient是自定义的变量名吗？
  // useState的返回值是一个数组，其中第一个元素是当前状态值，第二个元素是更新状态值的函数这里不需要
  //代表只在首次渲染时候创造一个queryclient实例 避免了每次都创建新的queryclient实例
  // 在整个生命周期保持不变  usestate()能够保证在整个生命周期保持一致
  const [queryClient] = useState(() => new QueryClient());
 //返回QueryClientProvider组件
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
