"use client";
import Link from "next/link";
import { useEffect, useState } from "react";


//需要传入参数的时候如果不明确参数类型，可以使用interface来定义参数类型 
interface CircularButtonProps {
  href: string;
  className?: string;
}

export default function CircularButton({ href, className = "" }: CircularButtonProps) {
 
    const [rotation, setRotation] = useState(0);
  

    // Add hover state to pause rotation
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
    //return 的意思是如果isHovered为true，就返回，不执行下面的代码
    if (isHovered) return;
    //这里设置一个定时器，每50毫秒旋转0.5度 这个函数会在组件卸载时自动清除
    const interval = setInterval(() => {
      //这里的setRotation是设置旋转角度  每50毫秒旋转0.5度
      setRotation(prev => (prev + 0.5) % 360);
    }, 50);
    //这里的return意思是执行清除定时器的操作 
    return () => clearInterval(interval);
  }, [isHovered])


  return (
    <Link 
    //这里设置一个链接 href是点击按钮后跳转的页面
      href={href}
      //这里设置一个类名 className是按钮的样式 pointer-events-auto确保按钮可点击
      className={`relative block w-32 h-32 pointer-events-auto ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {/* 这里设置一个div 用于创建一个绝对定位的容器  用于将文本和背景一起旋转*/}
      {/* Circular text */}
      <div 
      //absolute是设置绝对定位  inset-0是设置容器的大小为父元素的全部  w-full h-full是设置容器的大小为父元素的全部
        className="absolute inset-0 w-full h-full"
        //style={{ transform: `rotate(${rotation}deg)` }}是设置容器的旋转角度
       // {}是js语法 里面可以写js表达式包含css样式 transform是css 的变换属性用于修改元素呈现模式
       // 反引号是js语法  这里的rotate是css的变换属性  ${rotation}deg是js的表达式
         style={{ transform: `rotate(${rotation}deg)` }}
      >
        
        <svg viewBox="0 0 100 100" className="w-full h-full">
            {/*这里设置一个路径，用于绘制圆弧*/}
          <path
            id="textPath"
            //d是路径数据  用于定义路径的形状
            d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            fill="none"
            stroke="none"
          />
          {/*这里设置一个文本，用于显示文字*/}
          <text className="text-sm font-medium">
            <textPath xlinkHref="#textPath" startOffset="0%">
              Write your story • Share your idea •
            </textPath>
          </text>
        </svg>
      </div>
      
      {/* Blue circle background */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-blue-700 rounded-full flex items-center justify-center">
        {/* Arrow icon */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8 text-white" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          {/*这里设置一个路径，用于绘制箭头*/}
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M14 5l7 7m0 0l-7 7m7-7H3" 
          />
        </svg>
      </div>
    </Link>
  );
}
