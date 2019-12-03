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

1. 注册
2. 登录
3. 购票
4. 开奖
5. 兑奖
6. 信息修改(充值，改密码)
7. 查询历史信息(彩民，已售出彩票，已开奖记录，奖池金额，统计汇总信息…)

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

## main.c

```c

/*********************************************************************
*程序功能 :  彩票信息管理系统
*作者：lxg
*源程序名：main.c
*创建日期：2014-4-21
*最后更新日期：2014-4-27
**********************************************************************/
//文件包含
#include "../include/menu.h"


//主函数
int main(int argc,char ** argv)
{
	//定义变量并初始化

	//算法
	sys_login();
	//输出结果

	return 0;	
}


```

## menu

### menu.h

```h

/**********************************************************************
*程序功能：各级菜单函数
*作者：lxg
*源程序名：menu.h
*创建日期：2014-4-21
*最后更新日期：2014-4-27
***********************************************************************/
#ifndef MENU_H
#define MENU_H
//文件包含
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "../include/fun.h"


//函数声明金额
void sys_login();  //一级菜单

void admin_login(); //管理员登陆->二级菜单

void user_login(); //彩民登陆->二级菜单

void admin_view();//管理员登陆->查看信息->三级菜单

void admin_update();//管理员登陆->修改信息->三级菜单

void admin_delate();//管理员登陆->删除信息->三级菜单

void admin_view_lottery();//管理员登陆->查看信息->彩票信息->四级菜单

void admin_view_user();//管理员登陆->查看信息->彩民信息->四级菜单

void admin_view_buy();//管理员登陆->查看信息->购票信息->四级菜单

#endif

```

### menu.c

```c

/*******************************************************************************
*程序功能：实现各级菜单的显示
*作者：lxg
*源程序名：menu.c
*创建日期：2014-4-21
*最后更新日期：2014-4-22
********************************************************************************/
//文件包含
#include "../include/menu.h"

//全局变量
ADMIN admin = {"admin","admin",10000};
PROFIT profit = {0,"\0",0,0,"\0"};
UNODE *uhead = NULL;
WNODE *whead = NULL;
TNODE *thead = NULL;

/***************************************************************************
 *一级菜单（管理员登陆、用户登陆、用户注册、退出）
 ***************************************************************************/
void sys_login()
{
	//管理员信息加载
	load_admin_txt(&admin);
	//用户信息链
	uhead = (UNODE *)malloc(sizeof(UNODE));
	if(uhead == NULL)
		return;
	memset(uhead,0,sizeof(UNODE)); //初始化函数
	load_user_txt(uhead);//装载用户信息

	//已开奖信息链
	whead = (WNODE *) malloc(sizeof(WNODE));
	if (whead == NULL)
		return;
	memset(whead, 0, sizeof(WNODE)); //初始化函数
	load_winner_txt(whead);

	//已购彩票信息链
	thead = (TNODE *) malloc(sizeof(TNODE));
	if (thead == NULL)
		return;
	memset(thead, 0, sizeof(TNODE)); //初始化函数
	load_ticket_txt(thead);

	int cho = -1;//用户选项
	do
	{
		cho = -1;//每次循环重置选项
		system("cat menudisplay/main_menu.txt");

		printf(">>>>请输入选项:");
		scanf("%d",&cho);		
		//吸收输入缓存
		while(getchar()!='\n')
			;
		switch(cho)
		{
			case 1://管理员登录
				admin_check_login(&admin);
				break;
			case 2://彩民登录
				user_check_login(uhead);
				break;
			case 3://用户注册->功能函数
				f_usr_regist(uhead);
				break;
			case 0://退出;
				break;
			default:
				printf("输入错误,请重新输入\n");
				break;
		}
	}while(cho != 0);
	//保存管理员信息到文件
	save_admin_txt(&admin);
	save_user_txt(uhead);
	save_winner_txt(whead);
	save_ticket_txt(thead);
	//释放堆内存
	free_all_usr(uhead);
	free_all_ticket(thead);
	free_all_winner(whead);
}


/*************************************************************************************
 *管理员登陆->二级菜单（1、摇号并开奖 2、查看信息 3、修改信息、4、删除信息 0、返回上一级）
 *************************************************************************************/
void admin_login()
{
	
	int cho = -1;//用户选项
	do
	{
		cho = -1;//每次循环重置选项
		system("cat menudisplay/menu_two_admin.txt");
		printf(">>>>请输入选项:");
		scanf("%d",&cho);		
		//吸收输入缓存
		while(getchar()!='\n')
			;
		switch(cho)
		{
			case 1://摇号与开奖功能函数
				f_winner(whead,thead,uhead);
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 2:
				admin_view();
				break;
			case 3:
				admin_update();
				break;
			case 4:
				admin_delate();
				break;
			case 0:
				break;
			default:
				printf("输入错误,请重新输入\n");
				break;
		}	
	}while(cho != 0);
}

/*********************************************************************************
 *彩民登陆->二级菜单（1、购票 2、查看个人信息3、查看购票信息 4、修改密码 5、追加金额 0、退出）
 *********************************************************************************/
void user_login(UNODE *user)
{
	f_winner_notice(user,thead,whead);
	printf(">>>>>按回车键继续:");
	while(getchar()!='\n')
			;
	int cho = -1;//用户选项
	do
	{
		cho = -1;//每次循环重置选项
		system("cat menudisplay/menu_two_user.txt");
		
		printf(">>>>请输入选项:");
		scanf("%d",&cho);		
		//吸收输入缓存
		while(getchar()!='\n')
			;
		switch(cho)
		{
			case 1:		//购票功能函数
				buy_ticket(thead,user,whead);
				break;
			case 2:
				f_search_usr(user);
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 3:
				f_search_ticket(thead,user);
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 4:
				f_update_usrpwd(user);
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 5:
				f_usr_add_money(user);
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 0:
				break;
			default:
				printf("输入错误,请重新输入\n");
				break;
		}	
	}while(cho != 0);
}


/***********************************************************************************
 *管理员登陆->查看信息->三级菜单（1、管理员信息 4、彩票信息 3、彩民信息 2、开奖信息
 *				5、营收信息 0、返回上一级
 ***********************************************************************************/
void admin_view()
{
	int cho = -1;//用户选项
	do
	{
		cho = -1;//每次循环重置选项
		system("cat menudisplay/menu_three_admin.txt");

		printf(">>>>请输入选项:");
		scanf("%d",&cho);		
		//吸收输入缓存
		while(getchar()!='\n')
			;
		switch(cho)
		{
			case 1:		//管理员信息显示函数
				f_view_admin(&admin);
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 2:
				admin_view_lottery();
				break;
			case 3:
				admin_view_user();
				break;
			case 4:
				admin_view_buy();
				break;
			case 5:		//营收功能函数
				printf("期号\t类型\t发生\t奖池\t备注\n");
				system("cat ticketfile/profit.txt");
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 0:
				return;
			default:
				printf("输入错误,请重新输入\n");
				break;
		}	
	}while(cho != 0);
}


/************************************************************************************************
 *管理员登陆->修改信息->三级菜单（1、修改管理员密码 2、修改彩民密码 3、追加奖池金额 0、返回上一级
 ************************************************************************************************/
void admin_update()
{
	int cho = -1;//用户选项
	do
	{
		cho = -1;//每次循环重置选项
		system("cat menudisplay/menu_three_admin2.txt");

		printf(">>>>请输入选项:");
		scanf("%d",&cho);		
		//吸收输入缓存
		while(getchar()!='\n')
			;
		switch(cho)
		{
			case 1:
				f_update_adminpwd(&admin);
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 2:
				f_admin_update_usrpwd(uhead);
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 3:
				f_admin_add_money(&admin);
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 0:
				return;
			default:
				printf("输入错误,请重新输入\n");
				break;
		}	
	}while(cho != 0);
}


/********************************************************************************************
 *管理员登陆->删除信息->三级菜单（1、按用户名删除注册用户（判断余额） 2、按用户名删除购票信息 
				3、根据期号删除购票信息 0、返回上一级）
 ********************************************************************************************/
void admin_delate()
{
	int cho = -1;//用户选项
	do
	{
		cho = -1;//每次循环重置选项
		system("cat menudisplay/menu_three_admin3.txt");
		printf(">>>>请输入选项:");
		scanf("%d",&cho);		
		//吸收输入缓存
		while(getchar()!='\n')
			;
		switch(cho)
		{
			case 1:
				f_delete_usr(uhead);
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 2:
				f_delete_ticket_usr(thead);
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 3:
				f_delete_ticket_timeid(thead);
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 0:
				return;
			default:
				printf("输入错误,请重新输入\n");
				break;
		}	
	}while(cho != 0);
}

/***************************************************************************************
 *管理员登陆->查看信息->开奖彩票信息->四级菜单（1、按期号排序显示开奖信息 2、按期号查询开奖信息 3、返回）
 ***************************************************************************************/
void admin_view_lottery()
{
	int cho = -1;//用户选项
	do
	{
		cho = -1;//每次循环重置选项
		system("cat menudisplay/menu_four_admin1.txt");

		printf(">>>>请输入选项:");
		scanf("%d",&cho);		
		//吸收输入缓存
		while(getchar()!='\n')
			;
		switch(cho)
		{
			case 1:
				print_winner_all(whead);
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 2:
				f_search_timeid_win(whead);
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 0:
				return;
			default:
				printf("输入错误,请重新输入\n");
				break;
		}	
	}while(cho != 0);
}

/***********************************************************************************************
 *管理员登陆->查看信息->彩民信息->四级菜单（1、按用户名排序显示彩民信息2、按余额排序显示彩民信息 
					3、查询某一彩民的信息 0、返回）
 ***********************************************************************************************/
void admin_view_user()
{
	int cho = -1;//用户选项
	do
	{
		cho = -1;//每次循环重置选项
		system("cat menudisplay/menu_four_admin2.txt");
		printf(">>>>请输入选项:");
		scanf("%d",&cho);		
		//吸收输入缓存
		while(getchar()!='\n')
			;
		switch(cho)
		{
			case 1:
				usr_name_sort(uhead);//内部存储排序
				print_user_all(uhead);
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 2:
				usr_money_sort(uhead);//按余额排序
				print_user_all(uhead);
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 3:
				search_usrname_one(uhead);
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 0:
				return;
			default:
				printf("输入错误,请重新输入\n");
				break;
		}	
	}while(cho != 0);
}


/*******************************************************************************
 *管理员登陆->查看信息->购票信息->四级菜单（1、按中奖金额排序显示
		2、按账户名排序显示 3、按用户名查询 4、按期号查询 0、返回）
 ********************************************************************************/
void admin_view_buy()
{
	int cho = -1;//用户选项
	do
	{
		cho = -1;//每次循环重置选项
		system("cat menudisplay/menu_four_admin3.txt");
		printf(">>>>请输入选项:");
		scanf("%d",&cho);		
		//吸收输入缓存
		while(getchar()!='\n')
			;
		switch(cho)
		{
			case 1:
				get_money_sort(thead);//根据中奖金额排序
				print_ticket_all(thead);//显示到屏幕
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 2:
				ticket_name_sort(thead);
				print_ticket_all(thead);//显示到屏幕
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 3:
				search_usrall_ticket(thead);
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 4:
				search_timeid_all(thead);
				printf(">>>>>按回车键退出:");
				while(getchar()!='\n')
					;
				break;
			case 0:
				return;
			default:
				printf("输入错误,请重新输入\n");
				break;
		}	
	}while(cho != 0);
}

```





