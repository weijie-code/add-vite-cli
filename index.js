#!/usr/bin/env node

const fs = require('fs')
const inquirer = require('inquirer')
const shell = require('shelljs');
var path = require("path");
const util = require('util');
const download = require("download-git-repo");
const rimraf = require("rimraf");
// 异步读取写入文件
const readAsync = util.promisify(fs.readFile);
const writeAsync = util.promisify(fs.writeFile);
const renameAsync = util.promisify(fs.rename);


inquirer.prompt([{
  type: 'list',
  name: 'type',
  message: '请选择你的项目类型（虽然目前只有react一种。。）',
  choices: ["React"]
},
{
  type: 'input',
  name: 'isAntd',
  message: '是否使用antd（Y/N）',
  validate: function (val) {
    if ('YyNn'.indexOf(val) > -1) {
      return true
    }
    return '请输入Y/N'
  }
}
]).then((answers) => {
  const dir = path.join(process.cwd(), "vite-project");
  rimraf.sync(dir, {});
  // 下载项目
  download(
    "direct:https://codeload.github.com/weijie-code/react-vite-pro/zip/refs/heads/main",
    dir,
    async function (err) {
      if (err) {
        console.log('出错了：', err);
        return
      }
      // 增加配置文件
      await writeAsync(path.join(process.cwd(), 'viteConfig.ts'), `
// umi配置
export const umiConfig = {
  routes: [{
    path: '/demo',
    component: '@/pages/demo/index',
    routes: [{
      path: '/list',
      component: '@/pages/list/index',
    }, ],
  }, ]
}
// 常用配置
export const viteConfig = {
  
}
        `);
      shell.cd('./vite-project');
      shell.exec('yarn', {}, async () => {
        if (answers.isAntd === 'N' || answers.isAntd === 'n') {
          const fileSrc = path.join(process.cwd(), 'main.tsx');
          let data = await readAsync(fileSrc, 'utf-8');
          let atr = data.replace(`import 'antd/dist/antd.css';`, '');
          await writeAsync(fileSrc, atr);
        }
        // 修改vite源码，支持cssModule
        shell.exec('node initViteCss.ts', {}, async () => {
          console.log('加载完成')
        })
      })
    }
  );
})