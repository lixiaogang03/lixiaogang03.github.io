---
layout:     post
title:      Iotek TicketSystem
subtitle:   2014 Iotek 练习项目--彩票管理系统
date:       2019-12-03
author:     LXG
header-img: img/post-bg-coffee.jpeg
catalog: true
tags:
    - iotek
---

## 需求

1.注册
2.登录
3.购票
4.开奖*
5.兑奖
5.信息修改(充值，改密码)
6.查询历史信息(彩民，已售出彩票，已开奖记录，奖池金额，统计汇总信息…)

## makefile

```makefile

CC:=gcc
CFLAGS:=-Include
CFLAGS+=-c
TARGET:=bin/ticket
DEPEND:=obj/main.o
DEPEND+=obj/menu.o
DEPEND+=obj/fun.o
DEPEND+=obj/file_deal.o
DEPEND+=obj/link_user.o
DEPEND+=obj/link_ticket.o
DEPEND+=obj/link_winner.o

$(TARGET):$(DEPEND)
	$(CC) -o $@ $^
obj/main.o:src/main.c
	$(CC) -o $@ $(CFLAGS) $^
obj/menu.o:src/menu.c
	$(CC) -o $@ $(CFLAGS) $^	
obj/fun.o:src/fun.c
	$(CC) -o $@ $(CFLAGS) $^
obj/file_deal.o:src/file_deal.c
	$(CC) -o $@ $(CFLAGS) $^
obj/link_user.o:src/link_user.c
	$(CC) -o $@ $(CFLAGS) $^
obj/link_ticket.o:src/link_ticket.c
	$(CC) -o $@ $(CFLAGS) $^
obj/link_winner.o:src/link_winner.c
	$(CC) -o $@ $(CFLAGS) $^

.PHONY:clean
clean:
	rm -fr $(DEPEND)

```

