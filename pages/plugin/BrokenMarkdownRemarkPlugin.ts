// @ts-nocheck
import { modifyChildren } from 'unist-util-modify-children';
import { globSync } from 'glob';
import { resolve } from 'path';

const plugin = (options) => (tree) => {
    console.log(tree)
    modifyChildren((node, index, parent) => {
        if (node.children) {
            for (var child of node.children) {
                if (child.type == "image" && !child.url?.startsWith("/") && !child?.url?.startsWith("http")) {
                    if (globSync("src/content/blog/**/" + child.url).length == 0) {
                        console.error(`Warning: Broken image link: ${child.url}`);
                        child.url = `/bad-image.png`;
                    }
                }
            }
        }
    })(tree)
}


export default plugin;