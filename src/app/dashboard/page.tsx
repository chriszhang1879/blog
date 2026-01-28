"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { FaMapMarkerAlt, FaCalendarCheck, FaMedal, FaFire, FaBookmark, FaHeart } from 'react-icons/fa';
import { useFavorites } from "../../context/FavoritesContext";

// 用户打卡信息接口
interface CheckInInfo {
  consecutiveCheckIns: number;
  totalCheckIns: number;
  points: number;
  hasCheckedInToday: boolean;
  lastCheckIn: string | null;
}

// 地理位置信息接口
interface LocationInfo {
  city: string;
  country: string;
  ip: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export default function DashboardPage() {
//useauth方法用于获取用户登录状态 可以使用的方法是isloaded issignedin userid sessionid orgid orgrole orgslug gettoken signout等
//isloaded和isgisnedin是clerk的hook 表示用户是否加载完成和是否登录 是不同的状态
//isloaded表示用户是否加载完成
//isgisnedin表示用户是否登录
//isloaded为true时 isgisnedin为true时 才表示用户已经登录
//isloaded为true时 isgisnedin为false时 表示用户未登录
//isloaded为false时 isgisnedin为true时 表示用户未登录
//isloaded为false时 isgisnedin为false时 表示用户未登录
//isloaded为false时 表示用户未登录
//isgisnedin为false时 表示用户未登录
//isloaded为true时 表示用户加载完成
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const { favorites, favoritesCount, loadingFavorites } = useFavorites();
  const [showFavorites, setShowFavorites] = useState(false);


  //存储用户打卡信息
  const [checkInInfo, setCheckInInfo] = useState<CheckInInfo | null>(null);
  //存储用户地理位置信息
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  //存储用户打卡加载状态
  const [checkInLoading, setCheckInLoading] = useState(false);
  //存储用户打卡消息
  const [message, setMessage] = useState('');

  // 获取用户打卡信息
  const fetchCheckInInfo = async () => {
    try {
      const response = await fetch('/api/user/checkin');//这里默认是get请求
      const data = await response.json();
      
      if (data.success) {
        setCheckInInfo({
          consecutiveCheckIns: data.consecutiveCheckIns || 0,
          totalCheckIns: data.totalCheckIns || 0,
          points: data.points || 0,
          hasCheckedInToday: data.hasCheckedInToday || false,
          lastCheckIn: data.lastCheckIn
        });
        
        // 如果有地理位置信息
        if (data.lastLocation) {
          setLocationInfo(data.lastLocation);
        }
      }
      //这里的error是一个js的错误对象 转成字符创的话就是error.message
    } catch (error) {
      //这句话是判断error是否是Error类型 如果是Error类型 就输出error.message 否则输出'获取打卡信息失败
      // 这个error是js的错误对象
      console.error( error instanceof Error ? error.message : '获取打卡信息失败');
    }
  };

  // 用户打卡
  const handleCheckIn = async () => {
    //如果已经打卡过今天 就不执行
    if (checkInInfo?.hasCheckedInToday) return;
    
    try {
      //设置加载状态
      setCheckInLoading(true);
      //发送请求  这里post请求传到后端 后端会根据if条件判断是处理哪种类型的post 
      // 通过  await req.body 然后body.action来判断是处理哪种类型的post
      // 或者通过req.nextUrl.searchParams.get('action')来判断是处理哪种类型的post 
      const response = await fetch('/api/user/checkin', {
        method: 'POST'
      });
      //获取响应数据 这里是json数据
      const data = await response.json();
// Define in a shared types file 
// 这里的json数据可以定义一个共享接口 await response.json() as CheckInResponse 更加明确结构 这样可以使用类型检查和自动补全

// interface CheckInResponse {
//   success: boolean;
//   consecutiveCheckIns: number;
//   totalCheckIns: number;
//   points: number;
//   hasCheckedInToday: boolean;
//   lastCheckIn: string | null;
//   message?: string;
// }      
      if (data.success) {
        //设置消息 返回的消息是？
        setMessage(data.message);
        // 重新获取打卡信息 这个方法的作用是更新状态 将今天的打卡信息更新到状态中以便后续的连续打卡的展示
        fetchCheckInInfo();
        
        // 3秒后清除消息 为什么要3秒后清除消息？
        // 因为消息会一闪而过
        // 这里使用setTimeout是因为React的setState是异步的
        // 所以需要等待setState完成后再清除消息
        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        setMessage(data.message || '打卡失败');
      }
    } catch (error) {
      console.error('打卡失败:', error);
      setMessage('打卡失败，请稍后再试');
    } finally {
      setCheckInLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchCheckInInfo();
      setLoading(false);
    } else if (isLoaded && !isSignedIn) {
      router.push('/login');
    }
  }, [isLoaded, isSignedIn, router, fetchCheckInInfo]);

  if (loading) {
    return (
      //加载动画 效果是旋转的圆
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
      </div>
    );
  }




  // Mock data for demonstration 模拟数据 这里定义数据不需要声明具体类型可以直接定义
  const mockPosts = [
    { id: 1, title: "Getting Started with NextAuth", status: "published", date: "June 20, 2025" },
    { id: 2, title: "The Power of Social Login", status: "draft", date: "June 22, 2025" },
    { id: 3, title: "Building a Blog with Next.js", status: "published", date: "June 18, 2025" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="mt-4 md:mt-0">
          <Link 
            href="/dashboard/new-post"
            className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create New Post
          </Link>
        </div>
      </div>

      {/* 用户打卡和积分信息 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-semibold mb-2">打卡信息</h2>
          
          {/* 打卡按钮 */}
          <button
            onClick={handleCheckIn}
            disabled={checkInLoading || checkInInfo?.hasCheckedInToday}
            className={`flex items-center px-4 py-2 rounded-md text-sm transition-all ${
              checkInInfo?.hasCheckedInToday 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-800 text-white hover:bg-blue-700'
            }`}
          >
            {checkInLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                打卡中
              </span>
            ) : (
              <>
                <FaCalendarCheck className="mr-2" />
                {checkInInfo?.hasCheckedInToday ? '今日已打卡' : '今日打卡'}
              </>
            )}
          </button>
        </div>

        {/* 打卡信息卡片  这里的打卡天数积分最近位置都是从redis中获取的 包括当天是否打卡*/}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center text-blue-800 mb-2">
              <FaCalendarCheck className="mr-2" />
              <h3 className="font-semibold">总打卡天数</h3>
            </div>
            <p className="text-3xl font-bold text-blue-800">{checkInInfo?.totalCheckIns || 0}</p>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <div className="flex items-center text-amber-600 mb-2">
              <FaFire className="mr-2" />
              <h3 className="font-semibold">连续打卡</h3>
            </div>
            <p className="text-3xl font-bold text-amber-600">{checkInInfo?.consecutiveCheckIns || 0}天</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center text-purple-700 mb-2">
              <FaMedal className="mr-2" />
              <h3 className="font-semibold">积分</h3>
            </div>
            <p className="text-3xl font-bold text-purple-700">{checkInInfo?.points || 0}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center text-green-700 mb-2">
              <FaMapMarkerAlt className="mr-2" />
              <h3 className="font-semibold">最近位置</h3>
            </div>
            <p className="text-md font-medium text-green-700">
              {locationInfo ? `${locationInfo.city}, ${locationInfo.country}` : '暂无位置信息'}
            </p>
          </div>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
            {message}
          </div>
        )}
      </div>


      {/* 展示用户的文章列表 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total Posts</h2>
          <p className="text-3xl font-bold text-blue-800">3</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Published</h2>
          <p className="text-3xl font-bold text-green-600">2</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Drafts</h2>
          <p className="text-3xl font-bold text-amber-500">1</p>
        </div>
        <div 
          className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowFavorites(!showFavorites)}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold mb-2">Favorites</h2>
            <FaHeart className="text-red-500 text-xl" />
          </div>
          <div className="flex items-center">
            <p className="text-3xl font-bold text-red-500 mr-2">{favoritesCount}</p>
            {loadingFavorites && <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin ml-2"></div>}
          </div>
        </div>
      </div>
      
      {/* 收藏博客列表 */}
      {showFavorites && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center">
              <FaBookmark className="text-red-500 mr-2" /> Your Favorite Posts
            </h2>
            <button 
              onClick={() => setShowFavorites(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          <div className="p-4">
            {loadingFavorites ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
              </div>
            ) : favorites.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {favorites.map((blog) => (
                  <li key={blog._id} className="py-3 flex justify-between items-center hover:bg-gray-50 px-4 rounded">
                    <Link href={`/blog/${blog.slug || blog._id}`} className="text-blue-800 hover:underline flex-1">
                      {blog.title}
                    </Link>
                    <div className="text-sm text-gray-500">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-4 text-gray-500">You haven&apos;t favorited any posts yet.</p>
            )}
          </div>
        </div>
      )}
      
      {/* 展示用户的文章列表 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Your Posts</h2>
        </div>
        {/* //展示用户的文章列表 overflow-x-auto是水平滚动 */}
        <div className="overflow-x-auto">
          {/* w-full是让表格占满父容器 */}
          <table className="w-full">
            {/* //表头 */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            {/* //表体 */}
            <tbody className="divide-y divide-gray-200">
              {mockPosts.map((post) => (
                <tr key={post.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{post.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* //编辑和删除按钮 */}
                    <Link href={`/dashboard/edit/${post.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                      Edit
                    </Link>
                    <button className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
