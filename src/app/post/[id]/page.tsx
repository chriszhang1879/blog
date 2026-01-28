"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

import PostSidebar from "@/components/post/PostSidebar";
import CommentSection from "@/components/CommentSection";

// 模拟文章数据
const mockPost = {
  id: "1",
  title: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ullam modi eum aut.",
  content: `
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis voluptas, quae, quidem, fugiat quas quia quibusdam voluptates doloribus ipsam doloremque repellendus. Quaerat, laborum consequuntur</p>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias neque fugiat itaque quas esse sunt cupiditate possimus cumque asperiores, dolorem, dolores eligendi amet perferendis illum repellat nam quam facilis veritatis. Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint ipsa fuga nihil numquam, quam dicta quas exercitationem aliquam maxime quaerat.</p>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias neque fugiat itaque quas esse sunt cupiditate possimus cumque asperiores, dolorem, dolores eligendi amet perferendis illum repellat nam quam facilis veritatis. Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint ipsa fuga nihil numquam, quam dicta quas exercitationem aliquam maxime quaerat, enim autem culpa sequi at! Earum facere in ducimus culpa. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Libero fuga modi amet error aliquid eos nobis vero soluta facilis, voluptatem, voluptates quod suscipit obcaecati voluptate quaerat laborum, voluptatum dicta ipsum.</p>
  `,
  coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
  author: {
    name: "John Doe",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Lorem ipsum dolor sit, amet consectetur adipisicing elit."
  },
  category: "Web Design",
  createdAt: "2 days ago",
  tags: ["design", "web", "frontend"]
};

export default function PostPage() {

  
  //作用是获取url中的id
  const params = useParams();
  const [post, setPost] = useState(mockPost);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 在实际应用中，这里应该从API获取文章数据
    // 例如：
    // const fetchPost = async () => {
    //   try {
    //     const response = await fetch(`/api/posts/${params.id}`);
    //     if (!response.ok) throw new Error('Failed to fetch post');
    //     const data = await response.json();
    //     setPost(data);
    //   } catch (error) {
    //     console.error('Error fetching post:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchPost();

    // 模拟API请求延迟
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded w-full mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 主内容区 */}
        <div className="w-full lg:w-2/3">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center text-sm text-gray-600 mb-6">
            <span>Written by </span>
            <span className="font-medium mx-1">{post.author.name}</span>
            <span> on </span>
            <Link href={`/category/${post.category.toLowerCase().replace(/\s+/g, '-')}`} className="mx-1 text-blue-600 hover:underline">
              {post.category}
            </Link>
            <span className="mx-1">•</span>
            <span>{post.createdAt}</span>
          </div>
          
          {post.coverImage && (
            <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
              <Image 
                src={post.coverImage} 
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          {/* 评论区 */}
          <CommentSection postId={params.id as string} />
        </div>
        
        {/* 侧边栏 */}
        <PostSidebar post={post} />
      </div>
    </div>
  );
}
