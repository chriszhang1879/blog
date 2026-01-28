"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import CommentSection from '@/components/CommentSection';
import PostSidebar from '@/components/post/PostSidebar';

export default function SinglePost() {
  // 获取动态路由参数
  const params = useParams();
  const postId = params.id;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-800">Home</Link>
        <span>•</span>
        <Link href="/blogs" className="hover:text-blue-800">Blogs and Articles</Link>
        <span>•</span>
        <span className="text-gray-700">Post ID: {postId}</span>
      </div>

      {/* Post Header */}
      <div className="relative mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Blog Post {postId}: Lorem ipsum, dolor sit amet consectetur adipisicing elit.
        </h1>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white">
              JD
            </div>
            <span>John Doe</span>
          </div>
          <span>•</span>
          <span>June 24, 2025</span>
          <span>•</span>
          <span>5 min read</span>
        </div>

        {/* Featured Image */}
        <div className="relative w-full h-80 md:h-96 mb-8 rounded-lg overflow-hidden">
          <Image 
            src={`https://picsum.photos/1200/800?random=${postId}`}
            alt="Blog post featured image" 
            fill 
            style={{objectFit: 'cover'}} 
            unoptimized
          />
        </div>
      </div>

      {/* Post Content */}
      <div className="prose max-w-none">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.
        </p>
        <h2>Subheading for Blog Post {postId}</h2>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.
        </p>
        <blockquote>
         &quot;Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.&quot;
        </blockquote>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.
        </p>
      </div>

      {/* Comments Section */}
      <CommentSection postId={postId as string} />

      {/* PostSidebar */}
      {/* <PostSidebar post={} /> */}

      {/* Related Posts */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold mb-6">Related Posts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            // 生成3个相关博客链接每个博客链接地址是singlepost/1 singlepost/2 singlepost/3  key的意思是给每个元素一个唯一的标识
            // Number的作用是将字符串转换为数字 +1之后都是数字
            // i是数组的索引 从0开始 前面的_是不使用这个变量 这个变量代表数组中的元素
            <Link href={`/singlepost/${Number(postId) + 1}`} key={i} className="blog-card bg-white shadow">
              {/* Blog Card */}
              <div className="relative h-48 w-full">
                <Image 
                  src={`https://picsum.photos/800/600?random=${Number(postId) + i }`} 
                  alt="Blog post image" 
                  fill 
                  style={{objectFit: 'cover'}} 
                  unoptimized//意思是不优化图片 optimized是优化图片
                />
              </div>
              {/* Blog Card Content */}
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="category-pill">Web Design</span>
                  <span className="text-sm text-gray-500">June 24, 2025</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Related Article {Number(postId) + i + 1}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum, quisquam. Quas, voluptatum.
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
