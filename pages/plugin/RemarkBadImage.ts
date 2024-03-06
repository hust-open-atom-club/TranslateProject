import { modifyChildren } from 'unist-util-modify-children';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import type { RemarkPlugin } from '@astrojs/markdown-remark';

const plugin: RemarkPlugin = (_options) => (tree, file) => {
  const filePath = file.history[0];
  const path = dirname(filePath);

  modifyChildren((node: any, _index, _parent) => {
    if (node?.children) {
      for (var child of node.children) {
        if (child.type == "image" && child.url && !child.url.startsWith("/") && !child.url.startsWith("http")) {
          let url = child.url;
          if (url.indexOf("?") > -1) {
            url = url.substring(0, url.indexOf("?"));
            child.url = url;
          }
          let absPath = resolve(path, url)
          if (!existsSync(absPath)) {
            console.error(`Warning: Broken image link: ${url} in ${filePath}`);
            child.url = `/image-not-found.svg`;
          }
        }
      }
    }
  })(tree as any);
}


export default plugin;
