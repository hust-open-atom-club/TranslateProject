import type { CollectionEntry } from "astro:content";

const getSortedPosts = (posts: CollectionEntry<"posts">[]) => {
  return posts;

    // TODO: implement sorting

    // .sort(
    //   (a, b) =>
    //     Math.floor(
    //       new Date(b.data.modDatetime ?? b.data.pubDatetime).getTime() / 1000
    //     ) -
    //     Math.floor(
    //       new Date(a.data.modDatetime ?? a.data.pubDatetime).getTime() / 1000
    //     )
    // );
};

export default getSortedPosts;
