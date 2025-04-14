#!/bin/sh

# 判断src/config目录是否已存在
if [[ -d "src/config" ]]; then
  # 存在，执行git pull
  cd src/config
  git pull
  cd -
else
  # 不存在，执行git clone
  cd src
  git clone https://github.com/JaminQ/my-env.git config
  cd -
fi
