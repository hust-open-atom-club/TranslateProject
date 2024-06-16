import { STATUS_LIST } from "@config";
import { slugifyStr } from "@utils/slugify";
import type { CollectionEntry } from "astro:content";

export interface Props {
  id?: string;
  href?: string;
  frontmatter: CollectionEntry<"posts">["data"];
  secHeading?: boolean;
  body?: string;
  publishCard?: boolean;
}

export default function Card({ id, href, frontmatter, secHeading = true, body, publishCard }: Props) {
  const {
    title,
    status,
  } = frontmatter;

  const headerProps = {
    style: { viewTransitionName: slugifyStr(id || title) },
    className: "text-lg font-medium decoration-dashed hover:underline",
  };

  return (
    <li className={publishCard ? "mb-8" : ""} >
      <div className="my-2 flex flex-row">
        <a
          href={href}
          className="flex-1 inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
        >
          {secHeading ? (
            id ? (
              <h2 {...headerProps}>
                <img className="inline-block w-6 h-6 me-2" src={"/assets/logo_" + id.split('/')[0] + ".png"} alt={id.split('/')[0] + " icon"} />
                {title}
              </h2>
            ) : (
              <h2 {...headerProps}>{title}</h2>
            )
          ) : (
            id ? (
              <h3 {...headerProps}>
                <img className="inline-block w-6 h-6 me-2" src={"/assets/logo_" + id.split('/')[0] + ".png"} alt={id.split('/')[0] + " icon"} />
                {title}
              </h3>
            ) : (
              <h3 {...headerProps}>{title}</h3>
            )
          )}
        </a>
        {
          status === 'collected' && <div className="px-2 mx-2 text-slate-500">
            {body && body.split(/\s/g).length} 词
          </div>
        }
        <div>
          {!publishCard && <Status status={status} id={id} />}
        </div>
        {/* <Datetime pubDatetime={pubDatetime} modDatetime={modDatetime} /> */}
      </div>
      {publishCard &&
        <p className="break-all">
          <span className="mr-2">{body?.replace("#", "")?.substring(0, 130)}</span>
          <a href={href} className="text-orange">[阅读更多]</a>
        </p>
      }
    </li>
  );
}

function Status({ status, id }: { status: string, id: string | undefined }) {
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
  else {
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
