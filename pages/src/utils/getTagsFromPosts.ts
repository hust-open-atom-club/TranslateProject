import type { CollectionEntry } from "astro:content";
import getSortedPosts from "./getSortedPosts";

export const getTagFromSlug = (slug: string): string => {
  return slug.split("/")[0] || "";
};

export interface TagWithCount {
  tag: string;
  count: number;
}

export const getUniqueTags = (
  posts: CollectionEntry<"posts">[]
): TagWithCount[] => {
  const counter = new Map<string, number>();
  for (const post of posts) {
    const tag = getTagFromSlug(post.slug);
    if (!tag) continue;
    counter.set(tag, (counter.get(tag) || 0) + 1);
  }
  return Array.from(counter.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
};

export const getPostsByTag = (
  posts: CollectionEntry<"posts">[],
  tag: string
): CollectionEntry<"posts">[] => {
  const filtered = posts.filter(post => getTagFromSlug(post.slug) === tag);
  return getSortedPosts(filtered);
};
