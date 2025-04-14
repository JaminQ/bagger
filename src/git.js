const gitconfig = require('gitconfig');
const {
  fixUserName,
  getConfigFile
} = require('./common');
const console = require('./console');

const location = 'global';

const git = (callback, status = true) => {
  if (!status) {
    done(callback, status);
    return;
  }

  getConfigFile('git.json', (gitFile, isData) => { // 获取配置路径
    if (gitFile === null) { // 配置获取失败
      done(callback, false);
    } else {
      // 获取配置JSON
      let config = {};
      if (isData) {
        config = gitFile;
      } else {
        try {
          config = require(gitFile);
        } catch (e) {
          console.error('There are some error with git.json, please check it.');
          done(callback, false);
          return;
        }
      }

      // 处理username
      Object.keys(config).forEach(key => {
        typeof config[key] === 'string' && (config[key] = fixUserName(config[key]));
      });

      // 设置.gitconfig
      gitconfig.set(config, {
        location
      }).then(() => {
        done(callback, status);
      });
    }
  });
};

const done = (callback, status) => {
  typeof callback === 'function' && callback(status);
};

module.exports = git;
