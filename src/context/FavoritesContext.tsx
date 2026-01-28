"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';

// 定义收藏博客的类型
export interface FavoriteBlog {
  _id: string;
  title: string;
  excerpt?: string;
  slug?: string;
  author: string | { _id: string; username: string };
  createdAt: string;
}

// 定义上下文类型 这些数据都是数据库中的数据
interface FavoritesContextType {
    //收藏博客的数组
  favorites: FavoriteBlog[];
    //收藏博客的数量
  favoritesCount: number;
    //检查博客是否收藏 接收一个blogid参数 返回一个boolean类型
  isFavorite: (blogId: string) => boolean;
    //切换收藏状态 接收一个blogid参数 返回一个Promise<boolean>类型
  toggleFavorite: (blogId: string) => Promise<boolean>;
    //收藏博客的加载状态
  loadingFavorites: boolean;
    //刷新收藏博客
  refreshFavorites: () => Promise<void>;
}


//！！！！！！
//以下context和provider 是创建收藏功能的context 和provider两个函数 提供给usefavoriteshook使用 管理收藏状态和先关的操作方法
// 详细启动流程是


// 应用启动初始化流程
//   ↓
// layout.tsx 中的 FavoritesProvider 初始化
//   ↓
// FavoritesContext.tsx 中的 useEffect 触发 fetchFavorites
//   ↓
// 发送请求到 /api/user/favorites (GET)
//   ↓
// route.ts 处理请求，从数据库查询用户收藏
//   ↓
// 从 User 模型中获取 favorites 字段并填充博客数据
//   ↓
// 返回收藏列表给前端
//   ↓
// FavoritesContext 中更新 favorites 状态




// 用户点击收藏按钮
//   ↓
// 组件调用 useFavorites().toggleFavorite(blogId)
//   ↓
// FavoritesContext 中的 toggleFavorite 方法执行
//   ↓
// 根据当前状态决定 action 是 'add' 还是 'remove'
//   ↓
// 发送请求到 /api/user/favorites (POST)，包含 blogId 和 action
//   ↓
// route.ts 处理请求，更新数据库中的用户收藏
//   ↓
// 根据 action 在 User 模型中添加或删除 favorites 字段中的博客 ID
//   ↓
// 返回更新后的状态给前端
//   ↓
// FavoritesContext 重新获取最新的收藏列表
//   ↓
// 组件通过 useFavorites() 获取更新后的状态并重新渲染

// 检查收藏状态
// 组件需要检查博客是否已收藏
//   ↓
// 调用 useFavorites().isFavorite(blogId)
//   ↓
// FavoritesContext 中的 isFavorite 方法在本地 favorites 数组中查找
//   ↓
// 返回布尔值表示是否已收藏

//后端检查收藏状态
//   ↓
// 发送请求到 /api/user/favorites (HEAD)
//   ↓
// route.ts 处理请求，检查数据库中的用户收藏
//   ↓
// 返回布尔值表示是否已收藏


// favorites字段是objectid数组 引用了blog模型   存储的是博客的objectid 额不是blog模型中的所有信息
// 前端context 的收藏状态 favorites是完整的对象数组 包含了标题照耀等信息  通过populate方法获取的api获取的


//创建上下文 括号里的undefined是FavoritesContextType类型  createContext用于在组件树中提供上下文共享数据这里是收藏博客的数据状态方法等
//FavoritesContextType | undefined表示可以存储的类型是FavoritesContextType类型或者undefined类型
//括号里面是初始值
//这个favoritecontext用于在usecontext中消费FavoritesContextType类型的数据
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);
// 自定义Hook，方便组件使用上下文
export function useFavorites() {
  //这里返回的是FavoritesContext中的value
   const context = useContext(FavoritesContext);
   if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
   }
   return context;
}
//上下文提供者组件 FavoritesProvider是FavoritesContext的提供者组件
//返回的是FavoritesContext.Provider组件
export function FavoritesProvider({ children }: { children: ReactNode }) {
    //定义收藏博客的数组
  const [favorites, setFavorites] = useState<FavoriteBlog[]>([]);
  //定义收藏博客的数组
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  //定义收藏博客的加载状态
  const { isLoaded, isSignedIn } = useAuth();
  //todo 这里学习usecallback方法 以及后面的useeffect循环依赖
  // 加载用户收藏的博客 - 使用useCallback避免无限循环
  const fetchFavorites = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setFavorites([]);
      setLoadingFavorites(false);
      return;
    }
    try {
      setLoadingFavorites(true);
      const response = await fetch('/api/user/favorites');

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      } else {
        console.error('获取收藏列表失败');
      }
    } catch (error) {
      console.error('获取收藏列表错误:', error);
    } finally {
      setLoadingFavorites(false);
    }
  }, [isLoaded, isSignedIn]);
  // 检查博客是否已收藏
  const isFavorite = (blogId: string) => {
    return favorites.some(blog => blog._id === blogId);
  };
  //定义切换收藏状态的函数
  // 切换收藏状态
  const toggleFavorite = async (blogId: string) => {
    if (!isSignedIn) {
      // 如果用户未登录，可以提示用户登录
      console.log('请先登录');
      return false;
    }
    //判断当前博客是否已收藏
    const action = isFavorite(blogId) ? 'remove' : 'add';

    try {
      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blogId, action }),
      });

      if (response.ok) {
        const result = await response.json();
        // 更新本地状态
        await fetchFavorites();

        return result.isFavorite;
      }
      //这里返回的是result.isFavorite
      return isFavorite(blogId);
    } catch (error) {
      console.error('更新收藏状态失败:', error);
      return isFavorite(blogId);
    }
  };

 // 当用户认证状态变化时重新加载收藏
 useEffect(() => {
    if (isLoaded) {
      fetchFavorites();
    }
  }, [isLoaded, fetchFavorites]);
  //这里如果fetchfavorites的引用发生变化那么就会重新执行useEffect

  //定义value对象 里面包含 favorites favoritesCount isFavorite toggleFavorite loadingFavorites refreshFavorites
  const value = {
    favorites,
    favoritesCount: favorites.length,
    isFavorite,
    toggleFavorite,
    loadingFavorites,
    refreshFavorites: fetchFavorites
  };

  return (
    //FavoritesContext.Provider是FavoritesContext的提供者组件 用于在组件树中提供上下文共享数据
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
