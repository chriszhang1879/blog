"use client";

import React from 'react';
import Link from 'next/link';
import { useFavorites } from '@/context/FavoritesContext';

interface FavoritesIndicatorProps {
  className?: string;
}
//这个方法的作用是显示收藏按钮 传进来的类型是FavoritesIndicatorProps  参数通过props传入解构为className
const FavoritesIndicator: React.FC<FavoritesIndicatorProps> = ({ className = '' }) => {
  //获取收藏数量和加载状态 这个provider用来获取收藏数量和加载状态 loadingfavorites是收藏加载状态 favoritescount是收藏数量
  const { favoritesCount, loadingFavorites } = useFavorites();
  
  return (
    <Link 
      href="/dashboard/favorites" 
      className={`relative flex items-center hover:text-blue-800 ${className}`}
    >
      {/* 这里显示的图标是心形 */}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
      
      {/* 如果没有加载收藏数据 并且收藏数量大于0 那么显示收藏数量 */}
      {!loadingFavorites && favoritesCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {favoritesCount > 99 ? '99+' : favoritesCount}
        </span>
      )}
    </Link>
  );
};

export default FavoritesIndicator;
