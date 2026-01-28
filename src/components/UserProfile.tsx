'use client';

import { useUser } from '@clerk/nextjs';
import { useUserDataContext } from './providers/UserDataProvider';

export function UserProfile() {
  // 从 Clerk 获取基本用户信息 客户端获取user对象的方式useuser这个hoo
  const { user } = useUser();
  
  // 从我们的上下文获取合并的数据库数据 这个useUserDataContext是自定义的hook 我们定义了里面的usedata和isloaded变量
  const { userData, isLoaded } = useUserDataContext();
  
  //如果数据库数据没有加载完成
  if (!isLoaded) {
    return <div className="p-4">加载中...</div>;
  }
  
  //如果用户没有登录
  if (!user) {
    return <div className="p-4">请先登录</div>;
  }
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">用户资料</h2>
      
      <div className="mb-4">
        <div className="flex items-center space-x-4">
          <img 
            src={user.imageUrl} 
            alt={user.fullName || '用户头像'} 
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h3 className="text-xl font-semibold">{user.fullName}</h3>
            <p className="text-gray-600 dark:text-gray-300">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">数据库信息</h3>
        {userData ? (
          //bg-gray-50代表浅灰色 dark:bg-gray-700代表深色模式下的背景色 p-4代表内边距 rounded代表圆角 布局是默认是flex
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
            <p><span className="font-medium">数据库用户ID:</span> {userData.dbUserId}</p>
            {userData.role && (
              <p><span className="font-medium">角色:</span> {userData.role}</p>
            )}
            {userData.preferences && (
              <div>
                <p className="font-medium">偏好设置:</p>
                <pre className="bg-gray-100 dark:bg-gray-600 p-2 rounded mt-1 text-sm overflow-auto">
                  {JSON.stringify(userData.preferences, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <p>未找到数据库信息</p>
        )}
      </div>
    </div>
  );
}
