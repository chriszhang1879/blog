'use client'
import Link from 'next/link';
import Image from "next/image";
import Testimonials from "@/components/testimonials";
import CircularButton from "@/components/circularButton";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Search } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  //搜索关键词
  const [searchQuery, setSearchQuery] = useState('');


  //这个ref是引用输入框 作用是获取输入框的值 如果输入框为空 那么searchQuery为空
  const searchInputRef = useRef<HTMLInputElement>(null);
    //  searchinputref.current 可以拿到真实的输入框dom元素 方便在代码中进行原生的操作比如手动聚焦 清空 选中等
    //  searchinputref.current?.focus()在代码里控制焦点 例如当用户点击搜索按钮却没有输入关键词的时候可以调用这个方法让输入框获得焦点
    //  searchInputRef.current?.blur();移走焦点
    //  searchInputRef.current?.value = "";清空输入框
    //  searchInputRef.current?.select();选中输入框 选中全部文本
    //  searchInputRef.current?.value = "xxxx";把当前输入框的值修改为xxxx    // 直接修改value属性
    //  searchInputRef.current?.scrollLeft=100;设置输入框的水平滚动位置
    //  把光标移到输入框的末尾
    //  searchInputRef.current?.setSelectionRange(0, searchInputRef.current.value.length);
    //  某些第三方库比如输入法 自动完成功能等需要传入真实的dom节点
    //  如果需求只是用户输入清空提交搜索等操作那么直接用state和事件处理函数即可 （value+onchange） 不需要ref
    //  当需要编程时聚焦选中测量或者与第三方库交互的时候需要ref


    const handleSearch = () => {
    try {
      //console.log('Search clicked');
      const query = searchQuery.trim();
      //console.log('Search query:', query);

      if (query) {
        console.log('Navigating to search page');
        // Using template literal with proper path
        //这个方法把浏览器地址改成/search?query=xxx给定的url 并加载相应的页面
        //search是目标页面路径  ？query=xxx是查询字符串 query是键 xxx 是值 encodeURIComponent是编码 将用户输入的空格中文等转成安全url格式避免了/和?等特殊字符破坏地址
        router.push(`/search/${encodeURIComponent(query)}`);
      } else {
        console.log('No query entered');
        // Optionally focus the search input
        //这个方法的作用是让输入框获得焦点
        searchInputRef.current?.focus();
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Handle Enter key press 点击操作触发搜索
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission if inside a form
      console.log('Enter key pressed');
      handleSearch();
    }
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-800 z-20">Home</Link>
        <span>•</span>
        <Link href="/blogs" className="hover:text-blue-800 z-20">Blogs and Articles</Link>
      </div>

      {/* Main Blog Post */}
      <div className="relative z-20">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
           worlds news
        </h1>

        <p className="text-lg text-red-600 mb-8 z-20">
          chinas news
        </p>

        {/* Write Story Button */}
        <div className="absolute top-0 z-20 right-0 md:right-8 flex justify-center items-center gap-3">
          <CircularButton href="/write" className="bg-lavender-50" />
        </div>
      </div>

      {/* Category Tabs */}
      {/*
        这里添加了三个关键CSS属性来解决点击问题：
        1. relative - 确保这个元素在z轴上ts-auto - 创建新的层叠上下文，使z-index生效
        2. z-20 - 确保这个元素在z轴上ts-auto - 明确指示这个元素应该接收鼠标事件（点击等）
        3. pointer-even - 确保这个元素在z轴上ts-auto - 创建新的层叠上下文，使z-index生效

        当页面中存在多层元素时，即使某些元素视觉上不可见（如透明元素），它们仍然可能
        捕获点击事件并阻止下层元素接收事件。通过设置合适的z-index和pointer-events，
        我们可以确保用户交互正确传递到预期的元素。
      */}
      <div className="flex flex-wrap gap-2 border-b pb-4 relative z-20 pointer-events-auto">
        <Link href="/" className="bg-blue-800 text-white px-4 py-2 rounded-full relative pointer-events-auto">
          All Posts
        </Link>
        <Link href="/category/web-design" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full relative pointer-events-auto">
          Web Design
        </Link>
        <Link href="/category/development" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full relative pointer-events-auto">
          Development
        </Link>
        <Link href="/category/databases" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full relative pointer-events-auto">
          Databases
        </Link>
        <Link href="/category/search-engines" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full relative pointer-events-auto">
          Search Engines
        </Link>
        <Link href="/category/analytics" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full relative pointer-events-auto">
          Analytics
        </Link>
        <Link href="/category/marketing" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full relative pointer-events-auto">
          Marketing
        </Link>
      </div>

      {/* Search Bar relative设置一个相对定位使得内部的搜索图标可以通过绝对定位放置在输入框内
         w-full使得容器炸句父元素的全部宽度
         max-w-md限制最大宽度为md 中等大小 防止在大屏幕上过宽
         ml-auto将搜索框向父元素的右侧对齐 使其位于页面右侧
         这里的z-20设置z轴位置 虽然视觉上看不出重叠但是世界上搜索框的点击区域延伸到博客卡片的上方导致了博客卡片的点击事件被搜索框拦截了
      */}
      <div className="relative w-full max-w-md ml-auto z-20">
        {/* Search Input 这个input的作用是接收用户输入的搜索关键词 value是搜索关键词 onChange是当用户输入时触发的事件 onKeyDown是当用户按下键盘时触发的事件 ref是引用输入框*/}
        <input
          type="text"
          placeholder="Search a post..."
          //w-full是设置输入框的宽度为父元素的全部宽度
          //max-w-md限制最大宽度为md 中等大小 防止在大屏幕上过宽
          //ml-auto将搜索框向父元素的右侧对齐 使其位于页面右侧
          //z-20设置z轴位置 使其位于其他元素之上
          //px-4 py-2 pl-10设置内边距
          //border border-gray-300设置边框
          //rounded-full设置圆角
          //focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent设置聚焦时的样式
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchQuery}  //这里把输入框变成了受控组件 他的显示内容始终等于searchQuery的值
          //onchange是当用户输入（敲击键盘或者粘贴或者删除的时候）时触发的事件  每次输入都会触发修改searchQuery的值
          //每次调用setSearchQuery都会触发重新渲染组件  上面的value是宠重新读取到的searchQuery的值
          //于是输入框立即显示最新字符实现实时变化
          // 如果撤销内容的话也会跟着清空刚刚的输入的字符 是一个双向数据流 实时变化的
          onChange={(e) => setSearchQuery(e.target.value)}
          //onkeydown是当用户按下键盘时触发的事件 这个handleKeyPress是检测enter键是否被按下 handlesearch发起跳转 读取到的也永远是最新值
          onKeyDown={handleKeyPress}
          ref={searchInputRef}
        />

        {/* Search Icon 图标 这里的absolute inset-y-0 left-0 pl-3 flex items-center是设置图标的位置 */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
          {/* Search Button 搜索按钮  button中的 title是鼠标悬停时显示的提示信息*/}
             <button
               onClick={handleSearch}
               className="text-red-400 hover:text-red-500 focus:outline-none"
               //这个title是鼠标悬停时显示的提示信息
               title="Search"
             >
               {/* Search Icon 搜索图标 */}
               <Search size={24} className="w-5 h-5" />
             </button>
        </div>
      </div>

      {/* Blog Posts Grid  这里添加的这个relative z-10是设置z轴位置 使其位于其他元素之上
       这里添加relative 创建新的堆叠上下文  z-10提高了真个网格的层叠级
       后面为每个博客添加了z-10提高了每个博客的层叠级  同时pointer-events-auto明确高速浏览器 即使有更高的z-index元素重叠 也要响应这个元素的点击事件
       这里浏览器的事件捕获是基于元素完整的区域包括这里的z-index的不可见区域 更高的z-index的元素会覆盖更低的z-index的元素

      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 relative z-10">
        {/* Sample Blog Posts  这行代码的作用是生成6个博客 fill(0)是生成6个0 map是生成6个博客 map的i是博客的序号 _是map的索引代表当前的索引*/}
        {Array(6).fill(0).map((_, i) => (
    // 生成6个博客链接
          <Link href={`/singlepost/${i+1}`} key={i} className="blog-card bg-white shadow relative pointer-events-auto">
           {/* Blog Card */}
            <div className="relative h-48 w-full">
               <Image
                 src={`https://picsum.photos/800/600?random=${i+1}`}
                 alt="Blog post image"
                 //这里的fill
                 fill
                //  这里设置图片的填充方式 cover 代表图片会填充整个区域
                 style={{objectFit: 'cover'}}
                 //unoptimized是优化图片
                 unoptimized
               />
            </div>
            {/* Blog Card Content */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="category-pill">Web Design</span>
                <span className="text-sm text-gray-500">June 24, 2025</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">How to Design a Modern Website in 2025</h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum, quisquam. Quas, voluptatum.
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Testimonials Section  这个组件是用来显示用户评论的*/}
      <Testimonials />
    </div>
  );
}
