"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

//搜索页面
export default function SearchPage() {
  //搜索关键词
  const [searchQuery, setSearchQuery] = useState('');
  //路由
  const router = useRouter();
  //这里的e是事件对象  React.FormEvent是表单事件类型
  const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
    //这里的search?query是搜索的关键词 转到search/[query]页面
      router.push(`/search/${encodeURIComponent(searchQuery)}`);

  };

  //这里展示搜索框 form表单是提交搜索关键词
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Search</h1>
          <p className="mt-2 text-gray-600">Find what you&apos;re looking for</p>
        </div>
        {/* max-w-md mx-auto是设置最大宽度为md效果是设置最大宽度为md 并且水平居中 */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              //这个value是搜索关键词 作用是获取用户输入的搜索关键词 onChange是当用户输入时触发的事件
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full px-10 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
