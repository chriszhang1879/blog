'use client';

import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

export function UserProfile() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    //如果用户未加载 那么就显示一个加载中的动画
    return <div className="animate-pulse h-24 bg-gray-200 rounded-md"></div>;
  }

  if (!user) {
    //如果用户未登录 那么就显示一个提示信息
    return <div>请先登录查看个人资料</div>;
  }

  return (
    <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="relative w-24 h-24 mb-4">
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={user.fullName || '用户头像'}
            fill
            className="rounded-full object-cover border-2 border-blue-500"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-2xl font-bold">
            {user.firstName?.charAt(0) || user.username?.charAt(0) || '?'}
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold">{user.fullName || user.username}</h2>
        {user.emailAddresses.length > 0 && (
           <p className="text-gray-600 dark:text-gray-300 mt-1">{user.emailAddresses[0].emailAddress}</p>
        )}

      <div className="mt-6 w-full">
        <h3 className="text-lg font-semibold mb-2">个人信息</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">用户名</span>
            <span>{user.username || '未设置'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">名字</span>
            <span>{user.firstName || '未设置'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">姓氏</span>
            <span>{user.lastName || '未设置'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">注册时间</span>
            {/* //这里clerk的createdat属性返回的是一个iso格式的时间字符串 需要正确的去处理tolocaldatestring
            // 这里如果进一步想要改进时间显示 可以使用dayjs库或者date-fns库灵活进行实践格式化处理 */}
            <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '未知'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
