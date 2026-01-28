"use client";

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaUser, FaClock } from 'react-icons/fa';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    image?: string;
  };
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comment, setComment] = useState('');
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  // 获取评论列表
  const { data: comments = [], isLoading, error } = useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      return response.json();
    },
    staleTime: 60000, // 1分钟内不重新获取数据
  });

  // 提交评论
  const { mutate: submitComment, isPending } = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      return response.json();
    },
    onSuccess: () => {
      // 重置评论输入框
      setComment('');
      // 重新获取评论列表
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  // 处理评论提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    if (comment.trim()) {
      submitComment(comment);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mt-16 bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-2xl font-bold mb-6">评论 ({comments.length})</h3>

      {/* 评论表单 */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={isSignedIn ? "写下你的评论..." : "请登录后发表评论"}
            rows={4}
            disabled={!isSignedIn || isPending}
          ></textarea>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isSignedIn || !comment.trim() || isPending}
            className={`px-4 py-2 rounded-md ${
              isSignedIn && comment.trim() && !isPending
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } transition-colors`}
          >
            {isPending ? '提交中...' : '提交评论'}
          </button>
        </div>
      </form>

      {/* 评论列表 */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-4">加载评论中...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">加载评论失败</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-gray-500">暂无评论，快来发表第一条评论吧！</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {comment.user.image ? (
                    <Image
                      src={comment.user.image}
                      alt={comment.user.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-gray-500" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{comment.user.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <FaClock className="text-xs" />
                    <span>{formatDate(comment.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="pl-13 ml-10">
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
