# bagger

同步终端环境，支持内置配置、本地配置以及git.code托管配置。

## 配置方式

- 使用内置配置（**默认方式**），配置内容详见[my-env](https://github.com/JaminQ/my-env)；
- 使用本地配置文件，[配置方式](#使用本地配置)；
- 将配置托管在git.code上并使用（**推荐**），[配置方式](#使用托管配置推荐)。

## 用法

全局安装使用

```shell
npm install -g bagger
bagger
source ~/.bash_profile # 或重新登录后生效
```

或下载后直接用node运行

```shell
git clone https://github.com/JaminQ/bagger.git
cd bagger
npm install
node bin/bagger
source ~/.bash_profile # 或重新登录后生效
```

## 配置文件

- Git配置 - [git.json](https://github.com/JaminQ/my-env/blob/master/git.json)
- bash配置 - [bash.sh](https://github.com/JaminQ/my-env/blob/master/bash.sh)

## 如何修改内置配置

内置配置托管在我自己的[qinit_config](https://github.com/JaminQ/my-env/blob/master/git.json)上。

## 使用本地配置

1. 新建目录`local-config-path`；
1. 在该目录下放置这些[配置文件](#配置文件)；
1. 运行命令。

```shell
qinit -l local-config-path # -l修饰符表示使用本地配置
```

## 使用托管配置（**推荐**）

1. 在你的帐号下[新建一个Repo](https://github.com/new)并使用`qinit_config`做命名；
1. 在该Repo里放置这些[配置文件](#配置文件)；
1. 在[此处](#待补充)获取你的`private_token`；
1. 运行命令。

```shell
qinit --gc your-private_token # --gc修饰符表示使用github配置
```
