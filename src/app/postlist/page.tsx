"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// 定义博客文章类型
interface BlogPost {
  id: number;
  title: string;
  category: string;
  date: string;
  image: string;
  excerpt: string;
}

export default function PostList() {
  // 获取查询参数
  const searchParams = useSearchParams();
  // 获取分类参数 获取的是当前页面跳转的分类参数
  const categoryParam = searchParams.get('category');
  // 获取当前页码，默认为1   parseInt is used to convert the string to a number 如果page参数没有或者null就返回1
  //第二个数字10是进制
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  // 搜索状态管理
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  


  //以下都是定义文章类型
  // 博客文章数据状态
  const [posts, setPosts] = useState<BlogPost[]>([]);
  //搜索状态管理
  const [loading, setLoading] = useState(true);
  //总页数
  const [totalPages, setTotalPages] = useState(8); 
  

  
  // 获取分类的中文名称
  const getCategoryName = (categorySlug: string | null) => {
    if (!categorySlug) return '全部文章';
    // 分类映射 定义一个数据结构 是一个对象  key标注是一个string   value默认是string类型  key和value都只是占位符可以换成其他的也行
    // 这种情况适合于键名不确定或者不确定元素数量的场景同时允许任意符合类型的键值对 
    // 但是无法使用自动补全因为结构不够清晰比如id：string  也不能为不同的属性指定不同的类型比如id：number name:string
    // []表示键名是动态获取的可以是任意给定的名字 比如webdesign development databases searchengines analytics marketing等等这些随意给定
    const categoryMap: {[key: string]: string} = {
      'web-design': '网页设计',
      'development': '开发技术',
      'databases': '数据库',
      'search-engines': '搜索引擎',
      'analytics': '数据分析',
      'marketing': '市场营销'
    };
    //这里返回的是分类的中文名称 如果没有找到对应的中文名称那么就返回分类的英文名称  decodeURIComponent是解码成中文
    // ||是或者的意思 如果categorySlug为null那么就返回categorySlug
    return categoryMap[categorySlug] || (categorySlug ? decodeURIComponent(categorySlug) : categorySlug);
  };
  
  // 格式化日期显示
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };
  
  // 处理搜索提交
  const handleSearch = () => {
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
  
  // 获取博客文章数据
  useEffect(() => {
    // 模拟从API获取数据
    setLoading(true);
    // 模拟API延迟
    setTimeout(() => { 
      // 每页显示的文章数量
      const postsPerPage = 12;
      // 计算偏移量 作用是根据当前页码和每页显示的文章数量来确定从数据源中获取哪一部分数据
      const offset = (currentPage - 1) * postsPerPage;
    
      // 生成所有模拟数据  50是文章数量 fill(0)是填充0 map是映射 map里面的_是当前元素 i是当前索引 _代表忽略当前元素
      const allPosts = Array(50).fill(0).map((_, i) => {
        // 为每篇文章随机分配一个分类
        const categories = ['web-design', 'development', 'databases', 'search-engines', 'analytics', 'marketing'];
     
        const randomCategory = categories[i % categories.length];
        
        return {
          id: i + 1,
          title: `博客文章 ${i + 1}`,
          category: randomCategory,
          date: `2025-06-${30 - (i % 30)}`,
          image: `https://picsum.photos/800/600?random=${i + 10}`,
          excerpt: `这是第${Math.floor(i/postsPerPage) + 1}页的第${(i % postsPerPage) + 1}篇博客文章摘要。这里包含了文章的简短介绍和主要内容概述。`
        };
      });
      
      // 如果有分类参数，过滤文章过滤时候返回一个数组   如果没有分类参数，返回所有文章
      const filteredByCategory = categoryParam 
      //categoryParam是分类参数 如果有分类参数，过滤文章 过滤出来的是所有categoryParam对应的分类文章
      //filter返回的是一个数组 
        ? allPosts.filter(post => post.category === categoryParam)
        : allPosts;
      
      // 计算总页数 具体是根据过滤后的文章数量来计算的
      const calculatedTotalPages = Math.ceil(filteredByCategory.length / postsPerPage);
      setTotalPages(calculatedTotalPages);
      
      // 根据当前页码获取对应的文章 具体是根据当前页码和每页显示的文章数量来确定从数据源中获取哪一部分数据 offset+postsPerPage是结束位置
      const paginatedPosts = filteredByCategory.slice(offset, offset + postsPerPage);

      setPosts(paginatedPosts);
      
      setLoading(false);
      
    }, 500);
  
  }, [categoryParam, currentPage]); // 当分类参数或页码变化时重新获取数据
  
  
  return (
    <div className="space-y-8">
      {/* Breadcrumb  flex默认是水平布局 如果没有指定高和宽那么会默认占据父元素的全宽 高度由内容和内边距决定 
      这里的items-center表示垂直居中 space-x-2表示水平间距
       text-sm表示字体大小 text-gray-500表示字体颜色 */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
       {/* 面包屑导航 */}
        <Link href="/" className="hover:text-blue-800 z-20">首页</Link>
        <span>•</span>
        <Link href="/postlist" className="hover:text-blue-800 z-20">博客</Link>
       {/* 如果有分类参数，显示分类名称 */}
        {categoryParam && (
          <>
            <span>•</span>
            <span className="text-blue-800">{getCategoryName(categoryParam)}</span>
          </>
        )}
      </div>
      
      {/* 标题 如果有分类参数，显示分类名称，否则显示所有博客文章
         默认移动端小屏幕使用3xl字体中等屏幕及以上使用4xl字体
         文本大小都是响应式的
      */}
      <h1 className="text-3xl md:text-4xl font-bold">
        {categoryParam ? `${getCategoryName(categoryParam)}文章` : '所有文章'}
      </h1>

      {/* Filters and Search 这里的flex-col表示垂直布局 md:flex-row表示在中等屏幕及以上使用水平布局 sd是small device
       md:justify-between表示在中等屏幕及以上使用justify-between   justify-between是主轴上均匀分布项目
       justify-center表示在主轴上居中对齐比如行排列的话就是水平居中
       items-center表示在交叉轴上居中对齐比如行排列的话就是垂直居中 比如在行排列中就是垂直居中 在列排列中就是水平居中
       gap-5表示间距 对flex容器的主轴和交叉轴上都应用这个间距 无论是行布局flexrow还是列布局flexcol 
       如果仅仅设置行和列方向的不同间距 那么使用gap-x gap-y space-x space-y 
       可以结合响应式前缀比如md:gap-x-2 sd:gap-y-2表示中等屏幕上x方向间距为2 小屏幕上y方向间距为2
       */}
      <div className="flex flex-col md:flex-row md:justify-between items-center gap-5">
        {/* 分类过滤器 - 使用查询参数方式 */}
        <div className="flex flex-wrap gap-2">
          {/* 所有文章 */}
          <Link 
            href="/postlist" 
            className={`${!categoryParam ? 'bg-blue-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-2 rounded-full`}
          >
            全部文章
          </Link>
          {/* 使用查询参数方式筛选分类 */}
          <Link 
            href="/postlist?category=web-design" 
            className={`${categoryParam === 'web-design' ? 'bg-blue-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-2 rounded-full`}
          >
            网页设计
          </Link>
          <Link 
            href="/postlist?category=development" 
            className={`${categoryParam === 'development' ? 'bg-blue-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-2 rounded-full`}
          >
            开发技术
          </Link>
          <Link 
            href="/postlist?category=databases" 
            className={`${categoryParam === 'databases' ? 'bg-blue-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-2 rounded-full`}
          >
            数据库
          </Link>
          <Link 
            href="/postlist?category=search-engines" 
            className={`${categoryParam === 'search-engines' ? 'bg-blue-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-2 rounded-full`}
          >
            搜索引擎
          </Link>
          <Link 
            href="/postlist?category=analytics" 
            className={`${categoryParam === 'analytics' ? 'bg-blue-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-2 rounded-full`}
          >
            数据分析
          </Link>
          <Link 
            href="/postlist?category=marketing" 
            className={`${categoryParam === 'marketing' ? 'bg-blue-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-2 rounded-full`}
          >
            市场营销
          </Link>
        </div>
        
        {/* Search Bar wfull是默认的移动端宽度 md:w-64是中等屏幕及以上宽度 */}
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="搜索博客..." 
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {/* Search Icon */}
          <div 
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={handleSearch}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 hover:text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          
          {/* Clear Icon 效果是点击输入框清空输入框 如何实现这个功能?
          */}
          {/* <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div> */}
        </div>
      </div>



      {/* 加载状态显示 */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
        </div>
       ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600">没有找到相关文章</p>
        </div>
       ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
         {/* 这里实际重定向到singlepost页面 来渲染页面 但是url显示的是postlist参数形式 */}
          {posts.map((post) => (
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
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="bg-gray-100 text-gray-700 text-xs px-1 py-1 rounded-full">
                    {getCategoryName(post.category)}
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
      )}

      {/* 分页导航 */}
      <div className="flex justify-center mt-12">
        {/* 这里的nav表示内联导航对屏幕阅读更加友好 能够辅助技术识别这是导航区 换成div完全不影响功能 
        inline-flex表示内联水平布局 元素宽度根据内容自适应由具体内容决定  同时内部元素可以使用flex布局 元素和导航栏并排显示
        rounded-md表示圆角 shadow表示阴影 */}
        <nav className="inline-flex rounded-md shadow">
          {/* 上一页按钮  这里的max函数作用是防止页码小于1 max是取最大值 1是默认值 如果当前页码是1那么上一页按钮将被禁用 如果当前页码大于1那么上一页按钮将被启用 */}
          <Link 
            href={`/postlist?${categoryParam ? `category=${categoryParam}&` : ''} page=${Math.max(1, currentPage - 1)}`}
            className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-500 
              // 当前页码为1时禁用 否则启用  aria-disabled是无障碍访问属性  cursor-not-allowed是禁用样式表示不能点击
              ${currentPage === 1 ? 'bg-gray-500 cursor-not-allowed' : 'bg-white hover:bg-gray-50'} text-sm font-medium text-gray-700`}
              aria-disabled={currentPage === 1}
          >
            {/* <span className="sr-only">上一页</span> */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </Link>



          {/* 页码按钮 - 动态生成 
              这个from方法是创造页面组数 从1到totalpages的数组   第二个参数是映射函数将索引i转换为i+1(页码) _代表索引 i是值 传进来的i是索引
              filter是过滤数组 筛选展示哪些页码
           */}
          {
            Array.from({ length: totalPages }, (_, i) => i + 1)
             .filter(pageNum => {
              // 显示当前页、第一页、最后一页、当前页前后一页
              return (
                pageNum === 1 || 
                pageNum === totalPages || 
                Math.abs(pageNum - currentPage) <= 1
              );
             })
            //map的作用是遍历数组 pagenum是过滤后的页码 index是索引 filteredpages是过滤后的页码数组是一个数组 
            .map((pageNum, index, filteredPages) => {
              // 如果不连续，添加省略号
              if (index > 0 && filteredPages[index - 1] !== pageNum - 1) {
                return (
                  <span key={`ellipsis-${pageNum}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                );
              }
              //map遍历数组返回一个react元素
              return (
                <Link 
                  key={pageNum}
                  href={`/postlist?${categoryParam ? `category=${categoryParam}&` : ''}page=${pageNum}`}
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
            href={`/postlist?${categoryParam ? `category=${categoryParam}&` : ''}page=${Math.min(totalPages, currentPage + 1)}`}
            className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 ${currentPage === totalPages ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'} text-sm font-medium text-gray-700`}
            //这里的aria-disabled是无障碍访问属性 当前页码等于总页数时禁用按钮
            aria-disabled={currentPage === totalPages}
          >
            {/* 这个标签span的下一页是设置无障碍访问属性的 */}
         {/*   <span className="sr-only">fdfdfdf</span> */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </nav>
      </div>
    </div>
  );
}