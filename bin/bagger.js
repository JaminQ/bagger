#!/usr/bin/env node

const path = require('path').posix;
const argv = require('minimist')(process.argv.slice(2));
const {
  getVersion,
  readFileSync,
  fixPath,
  getConfig,
  setConfig
} = require('../src/common');
const console = require('../src/console');
const git = require('../src/git');
const bash = require('../src/bash');

const DIRNAME = fixPath(__dirname);

const qinitEnv = {
  CHINESE: !!argv.c, // 是否使用中文
  FROM: 'internal' // 配置来源，默认为内置版本
};
global.qinitEnv = qinitEnv;

if (argv.l) { // 使用本地配置
  if (typeof argv.l === 'boolean') {
    console.error('Need local config dir.');
    return -1;
  } else {
    console.log('使用本地配置');
    qinitEnv.FROM = 'local';
    qinitEnv.localPath = fixPath(argv.l);
  }
}

if (argv.gc) { // 使用git.code配置
  if (typeof argv.gc === 'boolean') {
    console.error('Need private_token.');
    return -1;
  } else {
    console.log('使用git.code配置');
    qinitEnv.FROM = 'git.code';
    qinitEnv.privateToken = argv.gc;
  }
}

if (argv._.length === 0) { // 处理无command的情况
  if (argv.v || argv.version) { // qinit -v 获取版本号
    process.stdout.write(`${getVersion()}\n`);
    return 0;
  } else if (argv.help) {
    process.stdout.write(`${readFileSync(path.join(DIRNAME, `../help${qinitEnv.CHINESE ? '_CN' : ''}.txt`))}\n`);
    return 0;
  } else if (argv.logLevel) { // qinit --logLevel 1 更换log级别
    if (typeof argv.logLevel === 'boolean') {
      process.stdout.write(`Current logLevel is ${getConfig().logLevel}.\n`);
      return 0;
    } else {
      setConfig({
        logLevel: argv.logLevel
      }, () => {
        process.stdout.write(`Change logLevel to ${argv.logLevel}.\n`);
      });
      return 0;
    }
  } else { // qinit 全配置
    argv._.push('all');
  }
}

switch (argv._[0]) {
  case 'git': // 只配置Git
    git(status => {
      status && console.info('qinit git done.');
    });
    break;
  case 'bash': // 只配置bash
    bash(status => {
      status && console.info('qinit bash done.');
    });
    break;
  case 'all': // 全配置
    git(status => {
      bash(status => {
        status && console.info('qinit done.');
      }, status);
    });
    break;
  default:
    console.error('qinit: Incorrect command, maybe you need `qinit --help`.');
}
