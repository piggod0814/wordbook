# 背单词本 · 前端

Vue 3 + Vite + Vant 4 的移动端背单词应用，数据来自 Spring Boot 后端。
后端仓库：[piggod0814/wordbook-backend](https://github.com/piggod0814/wordbook-backend)

## 功能

- **背单词**：卡片式，记得 / 不记得 / 上一个 / 下一个 / 展开例句 / 加入笔记 / 标记已掌握
- **进度落库**：每张卡的「记得 / 不记得」直接存进数据库，换设备或清缓存后接着背
- **笔记本**：搜索、排序、删除笔记；「已掌握」页签里可以点「移回背单词」
- **添加单词**：校验非空、大小写不敏感去重，直接写入后端

## 技术栈

| 组件 | 说明 |
|---|---|
| Vue 3 | 选项式 API（`data` / `methods` / `computed`），未用 TypeScript |
| Vite | 开发服务器与打包 |
| Vant 4 | 移动端 UI 组件库 |
| Vue Router 4 | hash 模式路由 |

## 本地开发

```bash
npm install
npm run dev
```

打开 `http://localhost:5173`。

**前提：后端必须同时运行在 8080 端口**（见后端仓库的 README），否则页面会因为拿不到数据而显示为空。

### 关于 API 请求

`vite.config.js` 里配了代理：

```js
server: {
  proxy: {
    '/api': { target: 'http://127.0.0.1:8080', changeOrigin: true }
  }
}
```

所以代码里一律写 `fetch('/api/words')` 这样的相对路径。浏览器全程只跟 5173 通信，
由 Vite 转发给 8080，跨域问题从源头消失，后端不需要写 `@CrossOrigin`。

> 改了 `vite.config.js` **必须重启 dev server**（`Ctrl+C` 再 `npm run dev`），
> 它不会热更新。只改 `src/` 下的文件才会自动刷新。

## 打包部署

```bash
npm run build
```

把生成的 `dist/` 里的所有文件拷到后端项目的 `src/main/resources/static/`，
重启后端，访问 `http://127.0.0.1:8080/` 即可。

打包后前端不再是独立进程，而是变成后端的一部分，因此：

- 只需要暴露一个端口
- **没有跨域**
- 路由必须用 **hash 模式**（`/#/notes`）。`history` 模式下 `/notes` 在磁盘上没有对应文件，
  刷新会 404；hash 的部分浏览器不会发给服务器，所以怎么刷新都对

### 开发模式 vs 部署模式

| | 命令 | 端口 | 前端在哪 |
|---|---|---|---|
| 开发 | `npm run dev` | 5173 | 独立进程，热更新 |
| 部署 | `npm run build` + 拷进 static | 8080 | 后端的一部分 |

改了前端想在 8080 上看到效果，**必须重新 build 并重新拷文件**，否则跑的还是上次那份。

## 目录结构

```
src/
├── main.js                入口
├── App.vue                根组件：底部导航 + 启动时加载数据
├── router/index.js        路由表（hash 模式）
├── store.js               全局状态（reactive）+ 与后端通信的函数
├── components/
│   ├── WordCard.vue       单词卡片
│   └── AddWordForm.vue    添加单词表单（子组件，通过 emit 交给父组件处理）
├── views/
│   ├── WordPage.vue       背单词页
│   ├── NotesPage.vue      笔记本页（含「已掌握」页签）
│   └── AddWordPage.vue    添加单词页
└── data/words.js          离线兜底词库（后端不可用时使用）
```
