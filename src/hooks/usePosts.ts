'use client';

// Re-export from the new organized structure
// This maintains backward compatibility while using the new architecture
export { default } from '@/functions/posts/functionPosts';
export type { Post, FilterData } from '@/functions/posts/functionPosts';