import type { CollectionEntry } from "astro:content";

const getSortedPosts = (posts: CollectionEntry<"posts">[]) => {
    // TODO: implement sorting

    // split all the posts by its status
    const publishedPosts = posts.filter((post
      : CollectionEntry<"posts">
    ) => post.data.status === "published");
    const otherPosts = posts.filter((post
      : CollectionEntry<"posts">
    ) => post.data.status !== "published");
    // sort the published posts by its published date
    publishedPosts.sort((a: CollectionEntry<"posts">, b: CollectionEntry<"posts">) => {
      return new Date(b.data.published_date).getTime() - new Date(a.data.published_date).getTime();
    });
    // combine the sorted published posts with the other posts
    posts = publishedPosts.concat(otherPosts);

    // .sort(
    //   (a, b) =>
    //     Math.floor(
    //       new Date(b.data.modDatetime ?? b.data.pubDatetime).getTime() / 1000
    //     ) -
    //     Math.floor(
    //       new Date(a.data.modDatetime ?? a.data.pubDatetime).getTime() / 1000
    //     )
    // );

    return posts;
};

export default getSortedPosts;
