"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

interface Author {
  name: string;
  avatar: string;
  bio: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  coverImage: string;
  author: Author;
  category: string;
  createdAt: string;
  tags: string[];
}

interface PostSidebarProps {
  post: Post;
}

export default function PostSidebar({ post }: PostSidebarProps) {

  const [isSaved, setIsSaved] = useState(false);

  // 使用useMutation处理保存文章操作
  const savePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      setIsSaved(true);
    }
  });

  // 使用useMutation处理删除文章操作
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      alert("文章已删除");
      // 在实际应用中，这里应该重定向到首页
      // router.push('/');
    }
  });

  const handleSavePost = () => {
    savePostMutation.mutate(post.id);
  };

  const handleDeletePost = () => {
    if (window.confirm("确定要删除这篇文章吗？")) {
      deletePostMutation.mutate(post.id);
    }
  };

  return (
    <div className="w-full lg:w-1/3 space-y-8">
      {/* 作者信息卡片 */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">Author</h3>
        <div className="flex items-center mb-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
            <Image 
              src={post.author.avatar} 
              alt={post.author.name}
              fill
              className="object-cover"
            />
          </div>
          <h4 className="font-medium">{post.author.name}</h4>
        </div>
      
        <p className="text-gray-600 text-sm">{post.author.bio}</p>
        
        <div className="mt-4 flex space-x-2">
          {/*这里的href的作用是 为什么要设置#?   */}
          <Link href="#" className="text-blue-600 hover:text-blue-800">
            这个svg图标代表
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="inline-block">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>
          </Link>
          <Link href="#" className="text-blue-600 hover:text-blue-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="inline-block">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* 文章操作 */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">Actions</h3>
        <div className="space-y-3">
          <button 
            onClick={handleSavePost}
            disabled={isSaved}
            className="flex items-center text-gray-700 hover:text-blue-600 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {isSaved ? "已收藏" : "收藏这篇文章"}
          </button>
          
          <button 
            onClick={handleDeletePost}
            className="flex items-center text-gray-700 hover:text-red-600 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            删除这篇文章
          </button>
        </div>
      </div>

      {/* 分类 */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">Categories</h3>
        <ul className="space-y-2">
          <li>
            <Link href="/category/all" className="text-gray-700 hover:text-blue-600 transition">
              All
            </Link>
          </li>
          <li>
            <Link href="/category/web-design" className="text-gray-700 hover:text-blue-600 transition">
              Web Design
            </Link>
          </li>
          <li>
            <Link href="/category/development" className="text-gray-700 hover:text-blue-600 transition">
              Development
            </Link>
          </li>
          <li>
            <Link href="/category/databases" className="text-gray-700 hover:text-blue-600 transition">
              Databases
            </Link>
          </li>
          <li>
            <Link href="/category/search-engines" className="text-gray-700 hover:text-blue-600 transition">
              Search Engines
            </Link>
          </li>
        </ul>
      </div>

      {/* 标签云 */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link 
              key={tag}
              href={`/tag/${tag}`}
              className="px-3 py-1 bg-gray-100 text-sm rounded-full text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
