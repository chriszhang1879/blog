"use client";
import Image from "next/image";

// Testimonial data structure 这个接口只能在当前文件中使用吗？
interface Testimonial {
  id: number;
  name: string;
  company: string;
  image: string;
  comment: string;
  stars: number;
}

export default function Testimonials() {
  // Sample testimonial data
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Ethan Caldwell",
      company: "NextWave",
      image: "/testimonial-1.jpg",
      comment: "Impressive work! Fast loading times, intuitive design, and flawless backend integration. Highly recommend.",
      stars: 5
    },
    {
      id: 2,
      name: "Liam Bennett",
      company: "CodeCraft",
      image: "/testimonial-2.jpg",
      comment: "Outstanding developer! Built a robust site with perfect functionality. Efficient and detail-oriented.",
      stars: 5
    },
    {
      id: 3,
      name: "Noah Williams",
      company: "BrightWeb",
      image: "/testimonial-3.jpg",
      image: "https://i.pravatar.cc/150?img=3",
      comment: "Creative and skilled! Produced a modern, user-friendly site that exceeded expectations. Great communication.",
      stars: 5
    },
    {
      id: 4,
      name: "Ava Thompson",
      company: "TechMosaic",
      image: "https://i.pravatar.cc/150?img=4",
      comment: "Professional work! Delivered on time with polished design and seamless functionality. Top-notch developer.",
      stars: 5
    }
  ];

  // Generate star rating display 这里的count是星星的数量
  const renderStars = (count: number) => {
    return Array(count)
      .fill(0)
      .map((_, i) => (
        <svg 
          key={i}
          className="w-4 h-4 text-yellow-400" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
        </svg>
      ));
  };

  return (
    <section className="py-12 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        {/* Testimonials Section */}
        <h2 className="text-3xl font-bold text-center mb-12">What our customers say</h2>
        {/* Testimonials Grid 产生的效果是将 testimonial 显示成 1 列 2 列 4 列 */}
        {/* gap-6 是设置 testimonial 之间的间距 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {/* 传入的 testimonial 数据 也就是我们上面定义的 testimonials的mock数据 */}
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-gray-800 p-6 rounded-lg flex flex-col"
            >
              {/* Testimonial Rating */}
              <div className="flex items-center mb-2">
                {renderStars(testimonial.stars)}
              </div>
              {/* Testimonial Comment */}
              <p className="text-sm mb-6 flex-grow">
                {testimonial.comment}
              </p>
              {/* Testimonial Author */}
              <div className="flex items-center mt-auto">
                {/* Testimonial Author Image tailwind的属性解释一下比如relative w-10 h-10 mr-3 rounded-full overflow-hidden代表的是什么？
                relative是设置图片的相对定位 配合image的fill属性来正确设置显示图片的大小 如果没有的话图片会显示在整个文档中无法正确定位位置
                在创建层叠结构的时候relative是必须的 正确的表达位置关系
                w-10 h-10是设置图片的宽度和高度
                mr-3是设置图片的右边距
                rounded-full是设置图片的圆角
                overflow-hidden是设置图片的溢出隐藏
                 */}
                <div className="w-10 h-10 mr-3 rounded-full overflow-hidden">
                  <Image 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    fill
                    style={{objectFit: "cover"}}
                    className="rounded-full"
                  />
                </div>
                {/* Testimonial Author Name and Company */}
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-xs text-gray-400">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
