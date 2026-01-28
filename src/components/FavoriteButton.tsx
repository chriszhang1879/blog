"use client";

import React, { useState } from 'react';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  blogId: string;
  className?: string;
  showText?: boolean;
}
//这里使用的是构造函数和export function的区别是? 花括号里面是初始化参数 解构出来传入的参数
const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  blogId, 
  className = '', 
  showText = false 
}) => {

  //获取收藏状态 是否toggle展开
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isLoading, setIsLoading] = useState(false);

  //获取用户登录状态
  const { isSignedIn } = useAuth();
  const router = useRouter();
  
  const isFav = isFavorite(blogId);
  
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isSignedIn) {
      router.push('/login?redirect=back');
      return;
    }
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await toggleFavorite(blogId);
    } catch (error) {
      console.error('收藏操作失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button 
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`flex items-center gap-1 transition-all ${className}`}
      aria-label={isFav ? "取消收藏" : "添加收藏"}
    >
    {/* 这里显示的图标是根据isFav的值来判断的  是心形还是空心心形*/}
      <span className={`transition-transform ${isLoading ? 'animate-pulse' : ''} ${isFav ? 'scale-110' : 'scale-100'}`}>
        {isFav ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        )}
      </span>
      {/* 这里显示的文本是根据isFav的值来判断的  是已收藏还是收藏*/}
      {showText && (
        <span className={`text-sm ${isFav ? 'text-red-500' : ''}`}>
          {isFav ? '已收藏' : '收藏'}
        </span>
      )}
    </button>
  );
};

export default FavoriteButton;
