"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useParams } from 'next/navigation';

// 定义博客文章类型
interface BlogPost {
  id: number;
  title: string;
  category: string;
  date: string;
  image: string;
  excerpt: string;
}

export default function CategoryPage() {
  // 获取路由参数
  const params = useParams();
  //获取搜索参数 这个方法是nextjs内置的 用来获取url中的查询参
  const searchParams = useSearchParams();
  //获取分类参数
  const category = params.category as string;
  //获取路由
  const router = useRouter();
  
  // 获取当前页码，默认为1   10的意思是将字符串转换为数字 
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  
  // 搜索状态管理
  const [searchQuery, setSearchQuery] = useState('');
  
  // 博客文章数据状态
  const [posts, setPosts] = useState<BlogPost[]>([]);
  //加载状态
  const [loading, setLoading] = useState(true);

  const [totalPages, setTotalPages] = useState(8); // 总页数
  
  // 处理搜索提交
  const handleSearch = () => {
    //trim的作用是去除字符串两端的空白字符  中间的如何去掉？
    //trim()方法会返回一个新字符串，这个新字符串是原字符串去除两端空白字符后的结果
    if (searchQuery.trim()) {
      // 跳转到搜索结果页面
      router.push(`/search/${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  // 处理回车键搜索
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // 获取分类文章数据
  useEffect(() => {
    
    // 模拟从API获取数据
    // 实际项目中，这里应该调用后端API获取特定分类的文章
    setLoading(true);
    
    // 模拟API延迟
    setTimeout(() => {
      // 根据页码生成不同的模拟数据
      const postsPerPage = 12; // 每页显示的文章数量
      const offset = (currentPage - 1) * postsPerPage; // 计算偏移量
      
      // 生成模拟数据，根据页码设置不同的ID和内容
      const mockPosts = Array(postsPerPage).fill(0).map((_, i) => ({
        id: offset + i + 1,
        title: `${getCategoryName(category)} 博客文章 ${offset + i + 1}`,
        category: decodeURIComponent(category),
        date: `2025-06-${30 - ((offset + i) % 30)}`, // 循环日期
        image: `https://picsum.photos/800/600?random=${offset + i + 20}`,
        excerpt: `这是第${currentPage}页的第${i+1}篇关于${getCategoryName(category)}的博客文章摘要。这里包含了文章的简短介绍和主要内容概述。页码：${currentPage}`
      }));
      
      setPosts(mockPosts);
      setLoading(false);
    }, 500);
  }, [category, currentPage]);// 添加currentPage作为依赖项，确保页码变化时重新获取数据
  
  // 格式化日期显示 传入的是日期字符串
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };
  
  // 获取分类的中文名称
  const getCategoryName = (categorySlug: string) => {
    //categorymap定义为一个map 对象  key是分类的string类型这力的[key:string]是定义key的类型   value也是string类型代表分类的中文名称 后面花括号是对象字面量
    const categoryMap: {[key: string]: string} = {
        //代表传入的是web-design那么返回的是网页设计在页面上显示 这里使用categorymap[key]来获取value 这个存储函数在上面去实现
      'web-design': '网页设计',
      'development': '开发技术',
      'databases': '数据库',
      'search-engines': '搜索引擎',
      'analytics': '数据分析',
      'marketing': '营销策略'
    };
    //如果categorymap中没有找到对应的key 那么就返回categoryslug  decodeURIComponent是将url编码的字符串解码
    return categoryMap[categorySlug] || decodeURIComponent(categorySlug);
  };

  return (
    <div className="space-y-8">
      {/* 面包屑导航 */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-800">首页</Link>
        <span>•</span>
        <Link href="/postlist" className="hover:text-blue-800">所有文章</Link>
        <span>•</span>
        <span className="text-gray-700">{getCategoryName(category)}</span>
      </div>

 {/* //这里的text-3l是在屏幕宽度小于640px时显示的文本大小 md:text-4xl是在屏幕宽度大于等于640px时显示的文本大小 font-bold代表粗体 */}
      <h1 className="text-3xl md:text-4xl font-bold">{getCategoryName(category)}文章</h1>

      {/* 过滤器和搜索 */}
      <div className="flex flex-col md:flex-row md:justify-between gap-5">
        {/* 分类过滤器 */}
        <div className="flex flex-wrap gap-2">
          <Link href="/postlist" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full">
            所有文章
          </Link>
          <Link 
            href="/category/web-design" 
            className={`${category === 'web-design' ? 'bg-blue-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-2 rounded-full`}
          >
            网页设计
          </Link>
          <Link 
            href="/category/development" 
            className={`${category === 'development' ? 'bg-blue-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-2 rounded-full`}
          >
            开发技术
          </Link>
          <Link 
            href="/category/databases" 
            className={`${category === 'databases' ? 'bg-blue-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-2 rounded-full`}
          >
            数据库
          </Link>
          <Link 
            href="/category/search-engines" 
            className={`${category === 'search-engines' ? 'bg-blue-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-2 rounded-full`}
          >
            搜索引擎
          </Link>
          <Link 
            href="/category/analytics" 
            className={`${category === 'analytics' ? 'bg-blue-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-2 rounded-full`}
          >
            数据分析
          </Link>
          <Link 
            href="/category/marketing" 
            className={`${category === 'marketing' ? 'bg-blue-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-2 rounded-full`}
          >
            营销策略
          </Link>
        </div>

        {/* 搜索框 */}
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="搜索博客..." 
            //这里的focus:outline-none 代表消除浏览器默认的聚焦样式 
            // 使用自己定义的聚焦模式比如focusring等 focus:ring-2代表聚焦时的宽度 focus:ring-blue-500代表聚焦时的边框颜色 focus:border-transparent代表聚焦时的边框颜色
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {/* 搜索图标 inset-y-0代表垂直方向上占满相当于top-0 bottom-0    right-0右侧边缘为零紧贴父元素右侧 使其右对齐  一般配合absolute使用绝对定位的固定元素或者需要垂直拉伸的元素*/}
          <div 
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={handleSearch}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 hover:text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          {/* 搜索图标 inset-y-0代表将顶部和底部边缘设置为零 垂直方向填满父元素等同于top-0 bottom-0*/}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 加载状态 */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
        </div>
      ) : (
        <>
          {/* 文章网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {posts.map((post) => (
              //网格的布局模式是grid grid的布局排列是垂直的
              <Link href={`/singlepost/${post.id}`} key={post.id} className="blog-card bg-white shadow hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48 w-full">
                  <Image 
                    src={post.image} 
                    unoptimized
                    alt={post.title} 
                    fill 
                    style={{objectFit: 'cover'}} 
                  />
                </div>
                {/* 博客卡片内容 */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="category-pill">
                      {getCategoryName(category)}
                    </span>
                    <span className="text-sm text-gray-500">{formatDate(post.date)}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* 分页 */}
          <div className="flex justify-center mt-12">
            <nav className="inline-flex rounded-md shadow">
              {/* 上一页按钮 */}
              <Link 
                href={`/category/${category}?page=${Math.max(1, currentPage - 1)}`}
                className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 ${currentPage === 1 ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'} text-sm font-medium text-gray-700`}
                aria-disabled={currentPage === 1}
              >
                <span className="sr-only">上一页</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </Link>

              {/* 页码按钮 - 动态生成 设置总页数 _代表不关系元素内容 i+1代表显示页码用于显示 */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
              //filter效果是过滤出符合条件的元素 返回的是一个数组 filter接受一个回调函数作为参数 这个回调函数对数组中的每个元素进行判断 返回true的元素会被保留在结果数组中
                .filter(pageNum => {
                  // 显示当前页、第一页、最后一页、当前页前后一页
                  return (
                    //这个filter过滤后返回true的元素是当前页前后页面 第一页或者最后一页
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    //Math.abs(pageNum - currentPage) <= 1 用于判断当前页是否在当前页的前后一页 保存当前页的前后页
                    //假设当当前页是5 总页数是10 那么返回true的元素是1  4 5 6  10
                    Math.abs(pageNum - currentPage) <= 1
                  );
                })
                //map效果是将数组中的每个元素进行处理 返回一个新的数组 map接受一个回调函数作为参数 这个回调函数对数组中的每个元素进行处理 返回处理后的元素
                //pagenum是当前页 index是当前页的索引 filteredpages是过滤后的页码数组 
                .map((pageNum, index, filteredPages) => {
                  // 如果不连续，添加省略号
                  if (index > 0 && filteredPages[index - 1] !== pageNum - 1) {
                    return (
                      //返回true的元素是当前页前后页面 第一页或者最后一页
                      <span key={`ellipsis-${pageNum}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    );
                  }
                  //返回true的元素是当前页前后页面 第一页或者最后一页
                  return (
                    <Link 
                      key={pageNum}
                      href={`/category/${category}?page=${pageNum}`}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 ${pageNum === currentPage ? 'bg-blue-800 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} text-sm font-medium`}
                    >
                      {pageNum}
                    </Link>
                  );
                 }
                )
               }

              {/* 下一页按钮 */}
              <Link 
                href={`/category/${category}?page=${Math.min(totalPages, currentPage + 1)}`}
                className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 ${currentPage === totalPages ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'} text-sm font-medium text-gray-700`}
                aria-disabled={currentPage === totalPages}
              >
                <span className="sr-only">下一页</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </nav>
          </div>
          
        </>
      )}
    </div>
  );
}
