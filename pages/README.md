## Quick Start

1. 切换到 `pages` 目录下，依次运行 `npm install`、`npm run dev`；
2. 如果是 `Windows` 系统，请删除 `pages/src/content/posts` 文件，新建 `pages/src/content/posts/` 文件夹，并将 `sources` 文件夹下的所有内容复制到新建的 `pages/src/content/posts/` 文件夹内。【注意，请不要把这处修改推送到远程仓库中】
3. 打开 `http://localhost:4321/` 网址即可在本地预览网页内容。

## 页面组织介绍（重要的部分）
1. Card内容的排序逻辑：`pages/src/utils/getSortedPosts.ts`下的`getSortedPosts`函数；

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

> **_Note!_** For `Docker` commands we must have it [installed](https://docs.docker.com/engine/install/) in your machine.

| Command                              | Action                                                                                                                           |
| :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `npm install`                        | Installs dependencies                                                                                                            |
| `npm run dev`                        | Starts local dev server at `localhost:4321`                                                                                      |
| `npm run build`                      | Build your production site to `./dist/`                                                                                          |
| `npm run preview`                    | Preview your build locally, before deploying                                                                                     |
| `npm run format:check`               | Check code format with Prettier                                                                                                  |
| `npm run format`                     | Format codes with Prettier                                                                                                       |
| `npm run sync`                       | Generates TypeScript types for all Astro modules. [Learn more](https://docs.astro.build/en/reference/cli-reference/#astro-sync). |
| `npm run cz`                         | Commit code changes with commitizen                                                                                              |
| `npm run lint`                       | Lint with ESLint                                                                                                                 |
| `docker compose up -d`               | Run AstroPaper on docker, You can access with the same hostname and port informed on `dev` command.                              |
| `docker compose run app npm install` | You can run any command above into the docker container.                                                                         |
