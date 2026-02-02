---
layout:     post
title:      Jenkins构建Android系统
subtitle:   Build great things at any scale
date:       2022-10-11
author:     LXG
header-img: img/post-bg-alibaba.jpg
catalog: true
tags:
    - Tool
---

[www.jenkins.io](https://www.jenkins.io/zh/)

[ubuntu 安装Jenkins](https://cloud.tencent.com/developer/article/1593371)

[JenKins 界面菜单详细介绍和相关状态图例](https://zinyan.com/?p=197)

## 简介

Jenkins是开源CI&CD软件领导者， 提供超过1000个插件来支持构建、部署、自动化， 满足任何项目的需要。

CI(Continuous integration)翻译为：持续集成，是一种软件开发时间。持续集成强调开发人员提交了新代码之后，立刻进行构建、（单元）测试。根据测试结果，我们可以确定新代码和原有代码能否正确地集成在一起。

具体的流程如图：

![jenkins_ci](/images/tools/jenkins/jenkins_ci.png)

CD(Continuous Delivery)翻译为：持续交付，是在持续集成的基础上，将集成后的代码部署到更贴近真实运行环境(类生产环境)中。比如我们完成单元测试后，可以把代码部署到连接数据库的Staging环境中更多的测试。
如果代码没有问题，可以继续手动部署到生产环境。

![jenkins_cd](/images/tools/jenkins/jenkins_cd.png)

## ubuntu 安装 Jenkins

环境要求：1GB+可用内存，50 GB+ 可用磁盘空间

**安装LTS稳定版本**

```txt

sudo apt-get install -y openjdk-8-jdk

wget -q -O - https://pkg.jenkins.io/debian/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb http://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt-get update
sudo apt-get install jenkins-2.346.3

```

1. 启动jenkins命令：sudo systemctl start jenkins
2. 验证jenkins是否启动成功: sudo systemctl status jenkins
3. 访问jenkins: http://192.168.0.28:8080/
4. 解锁jenkins: sudo cat /var/lib/jenkins/secrets/initialAdminPassword
5. 创建管理员用户，并设置密码

**重启jenkins**

方式一： sudo systemctl restart jenkins
方式二： http://192.168.0.28:8080/restart

## 远程编译服务器配置

管理Jenkins->Manage nodes and clouds->新建节点

## 创建job

新建Item->Freestyle Project->项目配置








