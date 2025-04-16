const fs = require('fs');
const path = require('path').posix;
const childProcess = require('child_process');
const axios = require('axios');

// const console = require('./console');

const CONFIG = './config.json';

const getVersion = () => require('../package.json').version;

const readFileSync = file => fs.readFileSync(file, {
  encoding: 'utf8'
});

const fixPath = path => {
  return path.replace(/\\/g, '/').replace(/^~/, process.env.HOME);
};

const getUserName = () => {
  return process.env.USER || process.env.USERNAME;
};

const fixUserName = str => {
  return str.replace(/\$\{USERNAME\}/g, getUserName());
};

const getConfigFile = (file, callback) => {
  const qinitEnv = global.qinitEnv;
  switch (qinitEnv.FROM) {
    case 'local': // 使用本地配置
      if (fs.existsSync(qinitEnv.localPath)) {
        if (fs.statSync(qinitEnv.localPath).isDirectory()) {
          file = path.join(fixPath(process.cwd()), qinitEnv.localPath, file);
          if (fs.existsSync(file)) {
            typeof callback === 'function' && callback(file);
          } else {
            console.error(`No such file "${file}"`);
            typeof callback === 'function' && callback(null);
          }
        } else {
          console.error(`The path is not a directory "${qinitEnv.localPath}"`);
          typeof callback === 'function' && callback(null);
        }
      } else { // 路径不存在
        console.error(`No such directory "${qinitEnv.localPath}"`);
        typeof callback === 'function' && callback(null);
      }
      break;
    // case 'github': // 使用github配置
    //   axios.get('', {
    //     params: {
    //       filepath: file,
    //       private_token: qinitEnv.privateToken
    //     }
    //   }).then(res => {
    //     if (res.status === 200) {
    //       typeof callback === 'function' && callback(res.data, true);
    //     } else {
    //       console.error('Wrong private_token.');
    //       typeof callback === 'function' && callback(null);
    //     }
    //   });
    //   break;
    case 'internal': // 使用内置配置
      typeof callback === 'function' && callback(path.join(fixPath(__dirname), 'config', file));
      break;
    default:
      console.error('qinit run error.');
      typeof callback === 'function' && callback(null);
  }
};

const getConfig = () => require(CONFIG);

const setConfig = (config, callback) => {
  fs.writeFile(path.join(fixPath(__dirname), CONFIG), JSON.stringify(Object.assign(getConfig(), config)), err => {
    if (err) throw err;

    typeof callback === 'function' && callback();
  });
};

const spawn = command => { // 简单封装spawn
  let file = '';
  let args = [];
  if (process.platform === 'win32') {
    file = process.env.comspec || 'cmd.exe';
    args = ['/s', '/c', command];
  } else {
    file = '/bin/sh';
    args = ['-c', command];
  }

  const spawnProcess = childProcess.spawn(file, args, {
    cwd: path.join(__dirname.replace(/\\/g, '/'), '../'),
    env: {
      PROJECT: process.cwd().replace(/\\/g, '/') // 运行命令时的当前路径
    }
  });

  spawnProcess.stdout.on('data', data => {
    process.stdout.write(`${data}`);
  });

  spawnProcess.stderr.on('data', data => {
    process.stdout.write(`${data}`);
  });

  spawnProcess.on('error', err => {
    process.stdout.write(`${err}`);
  });

  return spawnProcess;
};

module.exports = {
  getVersion,
  readFileSync,
  fixPath,
  getUserName,
  fixUserName,
  getConfigFile,
  getConfig,
  setConfig,
  spawn
};
