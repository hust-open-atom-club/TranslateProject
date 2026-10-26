import { useEffect, useMemo, useState } from "react";
import Card from "@components/Card";
import type { CollectionEntry } from "astro:content";

export type SearchItem = {
  title: string;
  data: CollectionEntry<"posts">["data"];
  slug: string;
  id: string;
};

interface Props {
  searchList: SearchItem[];
}

function formatPublishedDate(value: string | number | Date) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${value.getFullYear()}-${month}-${day}`;
  }
  const raw = String(value ?? "");
  if (/^\d{8}$/.test(raw)) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }
  return "";
}

export default function SearchBar({ searchList }: Props) {
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);

  const normalized = query.trim();

  const results = useMemo(() => {
    if (!ready || normalized.length < 2) return [];
    const needle = normalized.toLowerCase();
    return searchList.filter((item) =>
      item.title.toLowerCase().includes(needle)
    );
  }, [normalized, ready, searchList]);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("q") ?? "";
    setDraft(fromUrl);
    setQuery(fromUrl);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const params = new URLSearchParams(window.location.search);
    if (normalized.length >= 2) {
      params.set("q", normalized);
      history.replaceState(
        history.state,
        "",
        `${window.location.pathname}?${params.toString()}`
      );
    } else if (params.has("q")) {
      params.delete("q");
      const next = params.toString();
      history.replaceState(
        history.state,
        "",
        next ? `${window.location.pathname}?${next}` : window.location.pathname
      );
    }
  }, [normalized, ready]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setDraft(value);
    if (e.nativeEvent instanceof InputEvent && e.nativeEvent.isComposing) return;
    setQuery(value);
  };

  const handleCompositionEnd = (
    e: React.CompositionEvent<HTMLInputElement>
  ) => {
    const value = e.currentTarget.value;
    setDraft(value);
    setQuery(value);
  };

  return (
    <>
      <label className="relative block">
        <span className="absolute inset-y-0 left-0 flex items-center pl-2 opacity-75">
          <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M19.023 16.977a35.13 35.13 0 0 1-1.367-1.384c-.372-.378-.596-.653-.596-.653l-2.8-1.337A6.962 6.962 0 0 0 16 9c0-3.859-3.14-7-7-7S2 5.141 2 9s3.14 7 7 7c1.763 0 3.37-.66 4.603-1.739l1.337 2.8s.275.224.653.596c.387.363.896.854 1.384 1.367l1.358 1.392.604.646 2.121-2.121-.646-.604c-.379-.372-.885-.866-1.391-1.36zM9 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z"></path>
          </svg>
          <span className="sr-only">搜索</span>
        </span>
        <input
          className="block w-full rounded border border-skin-fill 
        border-opacity-40 bg-skin-fill py-3 pl-10
        pr-3 placeholder:italic placeholder:text-opacity-75 
        focus:border-skin-accent focus:outline-none"
          placeholder="搜索文章标题..."
          type="text"
          name="search"
          value={draft}
          onChange={handleChange}
          onCompositionEnd={handleCompositionEnd}
          autoComplete="off"
        />
      </label>

      {ready && normalized.length === 1 && (
        <div className="mt-8">请至少输入 2 个字符</div>
      )}

      {ready && normalized.length > 1 && (
        <div className="mt-8">
          {results.length > 0
            ? `找到 ${results.length} 条与「${normalized}」相关的结果`
            : `没有找到与「${normalized}」相关的已发布文章`}
        </div>
      )}

      <ul>
        {results.map((item) => {
          const date = formatPublishedDate(item.data.published_date);
          return (
            <Card
              id={item.id}
              href={`/posts/${item.slug}/`}
              frontmatter={{ ...item.data, priority: 0 }}
              hideStatus
              meta={[date, item.slug].filter(Boolean).join(" · ")}
              key={item.slug}
            />
          );
        })}
      </ul>
    </>
  );
}
