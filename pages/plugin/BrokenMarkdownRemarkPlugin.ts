// @ts-nocheck
import { modifyChildren } from 'unist-util-modify-children';
import { globSync } from 'glob';

const plugin = (options) => (tree) => {
    modifyChildren((node, index, parent) => {
        if (node.children) {
            for (var child of node.children) {
                if (child.type == "image" && !child.url?.startsWith("/") && !child?.url?.startsWith("http")) {
                    if (globSync("src/**/" + child.url).length == 0) {
                        console.error(`Warning: Broken image link: ${child.url}`);
                        child.url = `/bad-image.png`;
                    }
                }
            }
        }
    })(tree)
}


export default plugin;