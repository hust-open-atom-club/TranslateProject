import { STATUS_LIST } from "@config";
import { slugifyStr } from "@utils/slugify";
import type { CollectionEntry } from "astro:content";
import { marked } from 'marked';
import truncate from "html-truncator";

// 定义一个函数，解析body为markdown格式，然后去掉解析出来的所有h标签元素
const parseBody = (body: string, href: string) => {
  let marked_content = marked(body.substring(0, 1000)); // 避免过长的解析
  // check type of marked_content
  if (typeof marked_content !== 'string') {
    return body.substring(0, 130) + "……&nbsp&nbsp<a href={" + href + "}>[阅读更多]</a>";
  }
  // remove h1
  marked_content = marked_content.replace(/<h..*?>.*?<\/h.>/g, '');
  // remove img
  marked_content = marked_content.replace(/<img.*?>/g, '');
  // limit shown content length, but keep the html tags which are not closed
  marked_content = truncate(marked_content, 130);
  // default end is '...', remove it
  marked_content = marked_content.replace(/\.\.\.$/, "");
  // get the last tag of the content
  let lastTag = marked_content.lastIndexOf('<');
  // record the last tag
  let lastTagContent = marked_content.substring(lastTag);
  // remove the last tag
  marked_content = marked_content.substring(0, lastTag);
  let end = "……&nbsp&nbsp<a href={" + href + "}>[阅读更多]</a>" + lastTagContent;
  return marked_content + end;
}

// 定义一个函数，解析20240428格式为2024-04-28
const parseDate = (date: string) => {
  return date.substring(0, 4) + "-" + date.substring(4, 6) + "-" + date.substring(6, 8);
}

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
    published_date
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
        <p {...headerProps}>{parseDate(published_date.toString())}</p>
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
      // 去掉段后间隔，设置max-width为100%
        <div className="break-all prose" style={{maxWidth: "100%"}} >
          {/* 注意需要my-0否则继承 */}
          <p className="my-0" dangerouslySetInnerHTML={{
            __html: parseBody(body || "", href || "") }} >
              </p>
          
        </div>
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
