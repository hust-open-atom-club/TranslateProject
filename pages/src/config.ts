import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://hctt.hust.openatom.club/", // replace this with your deployed domain
  author: "HCTT",
  desc: "",
  title: "HCTT",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 20,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const STATUS_LIST: {
  status: string;
  text?: string;
  tabText?: string;
  hideInTab?: boolean;
  color?: string;
}[] = [
    { status: "collected", text: "去翻译", tabText: "待翻译", color: "bg-gray-500" },
    { status: "translating", text: "翻译中", tabText: "待提交", color: "bg-yellow-300" },
    { status: "translated", text: "去校对", tabText: "待校对", color: "bg-orange-500" },
    { status: "proofread", text: "去发布", tabText: "待发布", color: "bg-purple-500" },
    { status: "proofreading", text: "校对中", hideInTab: true, color: "bg-blue-500" },
    { status: "published", text: "已发布", hideInTab: true, tabText: "已发布", color: "bg-green-500" },
  ];

export const RANK_LIST: {
  status: string;
  text?: string;
  tabText?: string;
  hideInTab?: boolean;
  color?: string;
  weight: number;
  description?: string;
}[] = [
    { status: "all", text: "总榜", tabText: "总榜", color: "bg-yellow-500", weight: 0, description: "排序公式：选题数目*0.5 + 翻译数目*1.0+校对数目*1.0+发布数目*0.8" },
    { status: "translator", text: "翻译", tabText: "翻译王者", color: "bg-green-500", weight: 1 },
    { status: "proofreader", text: "校验", tabText: "校验大佬", color: "bg-purple-500" , weight: 1},
    { status: "collector", text: "选题", tabText: "用心选题", color: "bg-red-500" , weight: 0.5},
    { status: "publisher", text: "发布", tabText: "编辑部业绩", color: "bg-blue-500" , weight: 0.8},
  ];

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "Facebook",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Facebook`,
    active: true,
  },
  {
    name: "Instagram",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Instagram`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:yourmail@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: false,
  },
  {
    name: "Twitter",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Twitter`,
    active: false,
  },
  {
    name: "Twitch",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Twitch`,
    active: false,
  },
  {
    name: "YouTube",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on YouTube`,
    active: false,
  },
  {
    name: "WhatsApp",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on WhatsApp`,
    active: false,
  },
  {
    name: "Snapchat",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Snapchat`,
    active: false,
  },
  {
    name: "Pinterest",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Pinterest`,
    active: false,
  },
  {
    name: "TikTok",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on TikTok`,
    active: false,
  },
  {
    name: "CodePen",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on CodePen`,
    active: false,
  },
  {
    name: "Discord",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Discord`,
    active: false,
  },
  {
    name: "GitLab",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on GitLab`,
    active: false,
  },
  {
    name: "Reddit",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Reddit`,
    active: false,
  },
  {
    name: "Skype",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Skype`,
    active: false,
  },
  {
    name: "Steam",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Steam`,
    active: false,
  },
  {
    name: "Telegram",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Telegram`,
    active: false,
  },
  {
    name: "Mastodon",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Mastodon`,
    active: false,
  },
];
