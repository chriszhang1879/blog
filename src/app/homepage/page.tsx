"use client";
import Link from 'next/link';
import Image from 'next/image';
import CircularButton from '@/components/circularButton';

export default function Homepage() {
  return (
    <div className="space-y-12">
      {/* Hero Section  overflow-hidden的的意思是*/}
      <section className="relative bg-blue-800 text-white rounded-xl overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://picsum.photos/1200/600?random=50"
            //unoptimized属性是让图片不被优化
            unoptimized
            //alt属性是图片的替代文本
            alt="Hero background"
            //fill属性是让图片填充整个容器
            fill
            //style属性是让图片填充整个容器
            style={{objectFit: 'cover'}}
            //priority属性是让图片优先加载
              priority
          />
        </div>
        <div className="relative z-10 p-8 md:p-12 lg:p-16 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Welcome to Lamalog
          </h1>
          <p className="text-lg md:text-xl mb-8">
            A modern blog platform for sharing ideas, knowledge, and inspiration.
          </p>
          <div className="flex items-center space-x-6">
            <Link
              href="/register"
              className="inline-block bg-white text-blue-800 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
            <CircularButton href="/write" className="bg-lavender-50" />
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Posts</h2>
          <Link href="/postlist" className="text-blue-800 hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <Link href={`/singlepost/${i+1}`} key={i} className="blog-card bg-white shadow">
              <div className="relative h-48 w-full">
                <Image
                  src={`https://picsum.photos/800/600?random=${i+60}`}
                  unoptimized
                  alt="Featured post image"
                  fill
                  style={{objectFit: 'cover'}}
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="category-pill">Featured</span>
                  <span className="text-sm text-gray-500">June 24, 2025</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Featured Post Title {i+1}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum, quisquam.
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Web Design', icon: '🎨', color: 'bg-pink-100 text-pink-800' },
            { name: 'Development', icon: '💻', color: 'bg-blue-100 text-blue-800' },
            { name: 'Databases', icon: '🗄️', color: 'bg-yellow-100 text-yellow-800' },
            { name: 'Search Engines', icon: '🔍', color: 'bg-purple-100 text-purple-800' },
            { name: 'Marketing', icon: '📈', color: 'bg-green-100 text-green-800' },
            { name: 'Technology', icon: '🚀', color: 'bg-red-100 text-red-800' },
          ].map((category, i) => (
            <Link
              href={`/category/${category.name.toLowerCase().replace(' ', '-')}`}
              key={i}
              className={`${category.color} rounded-lg p-4 text-center hover:shadow-md transition-shadow`}
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <div className="font-medium">{category.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Posts */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recent Posts</h2>
          <Link href="/postlist" className="text-blue-800 hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Link href={`/singlepost/${i+4}`} key={i} className="blog-card bg-white shadow">
              <div className="relative h-40 w-full">
                <Image
                  src={`https://picsum.photos/800/600?random=${i+70}`}
                  unoptimized
                  alt="Recent post image"
                  fill
                  style={{objectFit: 'cover'}}
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="category-pill">Recent</span>
                  <span className="text-sm text-gray-500">June 24, 2025</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Recent Post Title {i+1}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gray-100 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Subscribe to our Newsletter</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Stay updated with our latest articles, news, and special offers. No spam, just valuable content.
        </p>
        <form className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            className="bg-blue-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
}
