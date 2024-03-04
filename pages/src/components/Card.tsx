import { slugifyStr } from "@utils/slugify";
import Datetime from "./Datetime";
import type { CollectionEntry } from "astro:content";

export interface Props {
  href?: string;
  frontmatter: CollectionEntry<"blog">["data"];
  secHeading?: boolean;
  body?: string;
}

export default function Card({ href, frontmatter, secHeading = true, body }: Props) {
  const {
    title,
    translator,
    status,
  } = frontmatter;

  const headerProps = {
    style: { viewTransitionName: slugifyStr(title) },
    className: "text-lg font-medium decoration-dashed hover:underline",
  };

  return (
    <li className="my-2 flex flex-row">
      <a
        href={href}
        className="flex-1 inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
      >
        {secHeading ? (
          <h2 {...headerProps}>{title}</h2>
        ) : (
          <h3 {...headerProps}>{title}</h3>
        )}
      </a>
      {
        status === 'collected' && <div className="px-2 mx-2 text-slate-500">
          {body && body.split(/\s/g).length} 词
        </div>
      }
      <div>
        <Status status={status} />
      </div>
      {/* <Datetime pubDatetime={pubDatetime} modDatetime={modDatetime} /> */}
      {/* <p>{description}</p> */}
    </li>
  );
}

function Status({ status }: { status: string }) {
  const statusTextMap = {
    'translated': '已翻译',
    'translating': '翻译中',
    'collected': '已收集',
    'proofreading': '校对中',
    'proofread': '已校对',
  } as any;

  const statusStyleMap = {
    'translated': 'bg-green-500',
    'translating': 'bg-yellow-300',
    'collected': 'bg-gray-500',
    'proofreading': 'bg-blue-500',
    'proofread': 'bg-purple-500',
  } as any;

  return (
    <span className="flex flex-row items-center">
      <span className={`flex w-3 h-3 me-3 ${statusStyleMap[status] || 'bg-gray-200'} rounded-full`}></span>
      <span>{statusTextMap[status] || status}</span>
    </span>
  )



}
