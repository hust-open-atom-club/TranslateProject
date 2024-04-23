import { STATUS_LIST } from "@config";
import type { CollectionEntry } from "astro:content";


export type CountItem = {
    status: string;
    desc: string;
    count: number;
}

const getStatusCount = (posts: CollectionEntry<"posts">[]) => {
    return STATUS_LIST.map(u => ({
        status: u.status,
        desc: u.text,
        count: posts.filter(x => x.data.status === u.status).length
    })) as CountItem[];
};

export default getStatusCount;
