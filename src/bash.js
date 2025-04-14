const fs = require('fs');
const path = require('path').posix;
const {
  getVersion,
  readFileSync,
  fixPath,
  fixUserName,
  getConfigFile
} = require('./common');
const console = require('./console');

// ENV
const HOME = fixPath(process.env.HOME);
const VERSION = getVersion();
const BASHPROFILE = path.join(HOME, '.bash_profile');
const QINITCONFIG = path.join(HOME, '.qinit_config');

// HELPERS
const getConfigData = (bashFile, isData) => {
  // 获取配置脚本
  let config = fixUserName(isData ? bashFile : readFileSync(bashFile));

  // 处理不同系统下的换行问题
  config = config.replace(/\r\n/g, '\n'); // 先把Windows下的换行符变成\n
  let enterChar = ''; // 使用的换行符
  switch (process.platform) {
    case 'win32': // Windows，使用\r\n做换行符
      enterChar = '\r\n';
      break;
    case 'darwin': // Mac，使用\r做换行符
      enterChar = '\r';
      break;
    case 'linux': // Unix，使用\n做换行符
    default: // 其余情况也用\n做换行符
      enterChar = '\n';
  }
  config = config.replace(/\r|\n/g, enterChar);

  if (global.qinitEnv.FROM === 'internal') {
    return `# v${VERSION}${enterChar}${enterChar}${config}`; // 使用内置配置，打上版本号
  } else {
    return config; // 使用非内置配置，不需要打版本号
  }
};
const getVersionArr = version => version.split('.').map(v => v * 1);
const isLatestVersion = version => {
  const version1 = getVersionArr(version); // 当前版本
  const version2 = getVersionArr(VERSION); // 最新版本

  for (let i = 0, len = 3; i < len; i++) { // 判断版本
    if (version1[i] < version2[i]) return false;
  }

  return true;
};

const bash = (callback, status = true) => {
  if (!status) {
    done(callback, status);
    return;
  }

  let data = '. ~/.qinit_config';

  // 如果已存在~/.bash_profile文件，判断是否需要追加配置
  if (fs.existsSync(BASHPROFILE)) {
    const bashProfileData = readFileSync(BASHPROFILE); // 读取内容

    if (bashProfileData.length && bashProfileData.indexOf(data) === -1) { // 未添加配置
      data = `${bashProfileData}\n${data}`; // 追加配置
    }
  }

  // 写入~/.bash_profile
  fs.writeFile(BASHPROFILE, data, err => {
    if (err) throw err;

    // 如果已存在~/.qinit_config文件且使用内置配置，根据版本判断是否需要更新
    if (global.qinitEnv.FROM === 'internal' && fs.existsSync(QINITCONFIG)) {
      const qinitConfigData = readFileSync(QINITCONFIG); // 读取内容
      const matchResult = qinitConfigData.match(/^# v(\d+\.\d+\.\d+)/); // 匹配版本号

      if (matchResult !== null && isLatestVersion(matchResult[1])) { // 是最新版本，无须处理
        done(callback, status);
        return;
      }
    }

    getConfigFile('bash.sh', (bashFile, isData) => { // 获取配置路径
      if (bashFile === null) { // 配置获取失败
        done(callback, false);
      } else {
        // 写入~/.qinit_config
        fs.writeFile(QINITCONFIG, getConfigData(bashFile, isData), err => {
          if (err) throw err;

          done(callback, status);
        });
      }
    });
  });
};

const done = (callback, status) => {
  typeof callback === 'function' && callback(status);
};

module.exports = bash;
