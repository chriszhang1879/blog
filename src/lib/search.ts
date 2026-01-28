import { prisma } from '@/lib/prisma';

export async function searchPosts(query: string) {
  try {
    // Implement your search logic here
    // This is a simple example using LIKE search
    // You can replace this with more advanced search functionality
    const results = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
      },
    });

    return results;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}
