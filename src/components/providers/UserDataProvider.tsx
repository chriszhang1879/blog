'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useUserData } from '@/hooks/useUserData';

// 定义用户数据上下文的类型
interface UserDataContextType {
  //用户数据
  userData: any;
  //是否加载完成
  isLoaded: boolean;
  //是否登录
  isSignedIn: boolean | undefined;
}

// 创建上下文 初始化 这个createcontext是react提供的hook 作用是创建一个上下文
// 设定userdatacontext的类型为UserDataContextType
const UserDataContext = createContext<UserDataContextType>({
  //用户数据
  userData: {},
  //是否加载完成
  isLoaded: false,
  //是否登录
  isSignedIn: false,
});

// 导出上下文的 Hook 这个usecontext是react提供的hook 作用是获取上下文
// 这个useusercontexthook封装了usecontext的调用
// 这里也可以添加各种错误检查默认值的处理等
// 这个hook用于在任何组件中获取用户数据
export const useUserDataContext = () => useContext(UserDataContext);

// 提供者组件 这个provider是react提供的hook 作用是提供上下文
// 传入的作用是提供用户数据到被包裹的组件树中
export function UserDataProvider({ children }: { children: ReactNode }) {
  // 使用我们之前创建的 Hook 获取用户数据
  const { userData, isLoaded, isSignedIn } = useUserData();

  return (
// .provider是固定写法 provider的作用范围是从组件树的 UserDataProvider 组件开始到组件树的结束
// provider内的value值的变化会触发所有消费该context的组件重新渲染
//  value是provider必须属性定义了要传给消费者组件的数据  里面的数据类型必须与context创建时的类型一致（在这里也就是UserDataContextType类型）
    <UserDataContext.Provider value={{ userData, isLoaded, isSignedIn }}>
      {children}
    </UserDataContext.Provider>
  );
}
