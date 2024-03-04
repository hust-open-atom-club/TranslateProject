// @ts-nocheck
import { modifyChildren } from 'unist-util-modify-children';
import { globSync } from 'glob';
import { resolve } from 'path';

const plugin = (options) => (tree) => {
    modifyChildren((node, index, parent) => {
        if (node.children) {
            for (var child of node.children) {
                if (child.type == "image" && child.url && !child.url.startsWith("/") && !child.url.startsWith("http")) {
                    const path = resolve("src/content/blog");
                    let url = child.url;
                    if (url.indexOf("?") > -1) {
                        url = url.substring(0, url.indexOf("?"));
                        child.url = url;
                    }
                    if (globSync(`${path}/**/` + url).length == 0) {
                        console.error(`Warning: Broken image link: ${child.url}`);
                        child.url = `/bad-image.png`;
                    }
                }
            }
        }
    })(tree)
}


export default plugin;