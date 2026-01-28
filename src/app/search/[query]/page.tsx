"use client"
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// 这个接口定义了从API返回的MongoDB文档结构
interface SearchResult {
  _id: string; // MongoDB返回的是_id而不是id
  title: string;
  content: string;
  excerpt?: string; // 使用可选属性，因为可能不存在
  slug: string;
  author: {
    _id: string; // 同样，作者的ID也是_id
    username: string;
  };
  featured: boolean;
  categories: string[];
  tags?: string[]; // 使用可选属性，因为可能不存在
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
  timeAgoVirtual: string;
}

// 这个接口定义了转换后前端使用的数据结构
interface TransformedResult {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  //slug: string;
  author: {
    id: string;
    username: string;
  };
  //featured: boolean;
  categories: string[];
  tags: string[];
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
  timeAgoVirtual: string;
}

export default function SearchResultsPage() {

  //用于展示搜索结果在页面显示
  const [results, setResults] = useState<TransformedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 获取路由动态段 /search/[query]
  const params = useParams();
  //这里的query字段必须是当前路径的动态段也就是[]中的query
  const query = (params.query as string) || '';

  useEffect(() => {
    //这里的query是搜索关键词
    if (query) {
      fetchResults(query);
    }
    //依赖项数组 [query] 意味着当query发生变化时 useEffect中的代码会重新执行 整个页面重新渲染
  }, [query]);

  const fetchResults = async (query: string) => {
    try {
      const response = await fetch(`/api/search?query=${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
       // 这个body没用 因为是get请求自动忽略body post才有用 body: JSON.stringify({ query }),
      });
      if (!response.ok) throw new Error('Failed to fetch results');
      const blog = await response.json();
      // Transform the data to match our SearchResult interface
       //数据类型转换的方法：：将从后端返回的MongoDB数据转换为前端使用的格式
         //1.在前端定义接口的方法
            // 这里进行类型转换到方法可以在前端定义新类型 返回transformedresult类型 这里是自己定义的setresults方法设置的transformedresult类型数组
            // 而传入的后端返回的原始类型必须仍是是SearchResult类型 要与后端返回的数据类型一致
         //2.后端有选择性返回数据
            // 或者直接在MongoDB后端返回数据的时候使用select有选择的返回
      const transformedResults: TransformedResult[] = blog.map((data: SearchResult) => ({
        // 使用_id作为前端的id
        // MongoDB文档中的主键是_id而不是id
        //  因为后端MongoDB数据库使用了lean方法 已经将nextresponse数据序列化全部转成字符串了
        //  所以这里不需要再使用toString()方法
        // 但即使使用lean()转换为JS对象，字段名仍然是_id
        id:     data._id,
        title:   data.title,
        content: data.content,
        excerpt: data.excerpt || '',
        //slug: data.slug,
        author: {
          //这里id是string类型 返回的是user文档的_id
          id: data.author._id,
          //这里的username是user文档的username字段
          username: data.author.username
        },
        //featured: data.featured,
        categories: data.categories,
        tags: data.tags || [],
        views: data.views,
        likes: data.likes,
        comments: data.comments,
        createdAt: new Date(data.createdAt).toISOString(),
        timeAgoVirtual: data.timeAgoVirtual

      }));
      setResults(transformedResults);
    } catch (err) {
      console.error('Error fetching results:', err);
      // 正确做法是从Error对象中提取错误消息（string类型）在进行渲染
      // 如果写setError（err as string）会报错 因为 err作为一个error对象不能直接去渲染 即使as string进行类型转换 但只是ts的类型断言 不会在运行时候转换成string类型
      // 所以如果去渲染这个err 那么会报错  Objects are not valid as a React child (found: [object Error])
      // 正确做法是使用instanceof操作符来检查err是否是Error对象 这个error是ts内置的类型
      // err.message这个方法返回的是string类型
      setError(err instanceof Error ? err.message : "failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          {/* 这个意思是搜索结果*/}
          <h1 className="text-3xl font-bold text-gray-900">
            Search Results for &quot;{query || 'No query provided'}&quot;
          </h1>
        </div>

        {loading && (
          <div className="text-center py-8">
         {/* 意思是正在加载*/}

            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            <p>No results found</p>
          </div>
        )}

        <div className="space-y-4">
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {result.title}
              </h2>
              <p className="text-gray-600 line-clamp-2">{result.content}</p>
              <p className="text-sm text-gray-500 mt-2">
                Created: {new Date(result.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {result.timeAgoVirtual}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
