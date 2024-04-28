import { STATUS_LIST } from "@config";
import { slugifyStr } from "@utils/slugify";
import type { CollectionEntry } from "astro:content";

export interface Props {
  id?: string;
  href?: string;
  frontmatter: CollectionEntry<"posts">["data"];
  secHeading?: boolean;
  body?: string;
}

export default function Card({ id, href, frontmatter, secHeading = true, body }: Props) {
  const {
    title,
    status,
  } = frontmatter;

  const headerProps = {
    style: { viewTransitionName: slugifyStr(id || title) },
    className: "text-lg font-medium decoration-dashed hover:underline",
  };

  return (
    <li className="my-2 flex flex-row">
      <a
        href={href}
        className="flex-1 inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
      >
        {secHeading ? (
          <h2 {...headerProps}><span >[{id.split('/')[0]}]</span> {title}</h2>
        ) : (
          <h3 {...headerProps}><span >[{id.split('/')[0]}]</span> {title}</h3>
        )}
      </a>
      {
        status === 'collected' && <div className="px-2 mx-2 text-slate-500">
          {body && body.split(/\s/g).length} 词
        </div>
      }
      <div>
        <Status status={status} id={id} />
      </div>
      {/* <Datetime pubDatetime={pubDatetime} modDatetime={modDatetime} /> */}
      {/* <p>{description}</p> */}
    </li>
  );
}

function Status({ status, id }: { status: string, id: string }) {
  const getStyle = (status: string) => {
    var s = STATUS_LIST.find(s => s.status === status);
    if (s) return s.color;
    else return "bg-gray-200";
  }

  const getText = (status: string) => {
    var s = STATUS_LIST.find(s => s.status === status);
    if (s) return s.text;
    else return status;
  }

  if (status === 'collected' || status === 'translated' || status === 'proofread') {
    return (
      <span className="flex flex-row items-center">
        <span className={`flex w-3 h-3 me-3 ${getStyle(status)} rounded-full`}></span>
        <span>
          <a
          href={`https://github.com/hust-open-atom-club/TranslateProject/edit/master/sources/${id}`}
          className="text-skin-accent hover:underline"
          >
            {getText(status)}
          </a>
        </span>
      </span>
    )
  }
  else{
    return (
      <span className="flex flex-row items-center">
        <span className={`flex w-3 h-3 me-3 ${getStyle(status)} rounded-full`}></span>
        <span>
          {getText(status)}
        </span>
      </span>
    )
  }
}
