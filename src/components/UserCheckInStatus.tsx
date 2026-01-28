"use client";
import { useUser } from '@clerk/nextjs';
import React, { useState, useEffect, useCallback } from 'react';
//import { useSession } from 'next-auth/react';
import { FaMedal, FaCalendarCheck, FaFire } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';


//定义接口
interface CheckInInfo {
  consecutiveCheckIns: number;
  totalCheckIns:number;
  points: number;
  hasCheckedInToday: boolean;
  lastCheckIn: string | null;
}

const UserCheckInStatus = () => {
  //获取用户信息
  const { user } = useUser();
  const [checkInInfo, setCheckInInfo] = useState<CheckInInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 获取用户打卡信息
  const fetchCheckInInfo = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      //默认方法是get
      const response = await fetch('/api/user/checkin');
      const data = await response.json();
      if (data.success) {
        setCheckInInfo({
          consecutiveCheckIns: data.consecutiveCheckIns || 0,
          totalCheckIns: data.totalCheckIns || 0,
          points: data.points || 0,
          hasCheckedInToday: data.hasCheckedInToday || false,
          lastCheckIn: data.lastCheckIn
        });
      }
    } catch (error) {
      console.error('获取打卡信息失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);


  // 用户打卡
  const handleCheckIn = async () => {
    if (!user || checkInInfo?.hasCheckedInToday) return;

    try {
      setCheckInLoading(true);
      const response = await fetch('/api/user/checkin', {
        method: 'POST'
      });
      //接受后端返回的数据 后端如何定义的这个response 解析出来面的json来判断  status是根据后端返回的状态码来判断的success表示成功
      const data = await response.json();

      if (data.success) {
        //这里查出来的message是后端返回的消息
        setMessage(data.message);
        // 重新获取打卡信息 将今天的记录拉出来以便展示最新的数据
        fetchCheckInInfo();
        // 3秒后清除消息为什么要清除消息?
        // 3秒后清除消息 避免消息一直显示
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


  
  // 初始加载和会话变化时获取打卡信息
  useEffect(() => {
    if (user) {
      fetchCheckInInfo();
    }
  }, [user,fetchCheckInInfo]);
  //这里不能引用fetchCheckInInfo 因为这个函数实在组件内定义的 理论上每次渲染都哦会创建新的函数引用 会造成无限循环


  // 如果用户未登录，不显示组件
  if (!user) return null;

  //nextjs有一个strict mode 严格模式 会双重调用某些声明周期的方法和hooks自动检查组件中的潜在错误

  return (
    <div className="flex  items-center space-x-2">
      {/* 打卡按钮 */}
      <button type="button"
        onClick={handleCheckIn}
        //正在加载中禁用 如果checkinloading为true（正在打卡中）或者checkininfo的hascheckedintoday为true（今天已经打卡了）或者isLoading为true 那么禁用
        disabled={checkInLoading || checkInInfo?.hasCheckedInToday || isLoading}
        className={`flex items-center px-4 py-2 rounded-full text-sm transition-all ${
          isLoading ? 'bg-gray-100 text-green-400 cursor-wait' :
          checkInInfo?.hasCheckedInToday
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        data-tooltip-id="checkin-tooltip"
        data-tooltip-content={isLoading ? '加载中...' : checkInInfo?.hasCheckedInToday ? '今日已打卡' : '点击签到'}
      >
        {checkInLoading ? (
          <span className="flex items-center">
            {/* //这个图标是加载中的图标 */}
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            打卡中
          </span>
        ) :
        (
          <>
            <FaCalendarCheck className="mr-1" />
            {checkInInfo?.hasCheckedInToday ? '已打卡' : '打卡'}
          </>
        )}
      </button>



      {/* 连续打卡天数 */}
      <div
        className="flex items-center text-amber-500"
        data-tooltip-id="streak-tooltip"
        data-tooltip-content={`连续打卡${checkInInfo?.consecutiveCheckIns || 0}天`}
      >
     {/* 这个fafire是火焰的图标 */}
        <FaFire className="mr-1" />
        <span className="font-semibold">{checkInInfo?.consecutiveCheckIns || 0}</span>
      </div>


      {/* 积分 */}
      <div
        className="flex items-center text-purple-600"
        data-tooltip-id="points-tooltip"
        //这个内容会显示在工具提示中这里显示在元素下方
        data-tooltip-content={`积分: ${checkInInfo?.points || 0}`}
      >
        {/* 这个faMedal是勋章的图标 */}
        <FaMedal className="mr-1" />
        <span className="font-semibold">{checkInInfo?.points || 0}</span>
      </div>

      {/* 消息提示 如果有message那么会展示div的内容 */}
      {message && (
        <div className="absolute top-16 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow-md z-50">
          {message}
        </div>
      )}

      {/* 工具提示 每一个tooltip id=xxx 都对应一个独立的提示实例
      这几个工具是react-tooltip的工具提示组件
      data-tooltip-id="checkin-tooltip" 这个id是react-tooltip的id
      data-tooltip-content="" 这个是工具提示的内容
      data-tooltip-place="top" 这个是工具提示的位置
      data-tooltip-variant="light" 这个是工具提示的样式
      */}
      <Tooltip id="checkin-tooltip" />
      <Tooltip id="streak-tooltip" />
      <Tooltip id="points-tooltip" />
    </div>
  );
};

export default UserCheckInStatus;
