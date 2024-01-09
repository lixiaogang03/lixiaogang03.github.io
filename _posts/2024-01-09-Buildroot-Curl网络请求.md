---
layout:     post
title:      Buildroot Curl 网络请求
subtitle:   T113 C
date:       2023-01-09
author:     LXG
header-img: img/post-bg-os-metro.jpg
catalog: true
tags:
    - t113
---

## curl 编译

```sh

# 1. 克隆curl的GitHub仓库
git clone https://github.com/curl/curl.git

# 2. 进入到curl源代码目录
cd curl

# 3. 配置编译选项
#   - 如果你想编译动态库（默认通常会生成），只需运行configure脚本。
#   - 如果你的系统支持，你可以添加特定的后端（比如OpenSSL、NSS等）以支持HTTPS。
#   - 根据你的环境和需求调整选项
./configure --prefix=/usr/local          # 安装路径
             --with-ssl                 # 使用OpenSSL作为SSL后端（大多数情况下需要）
             --without-libidn2         # 如果不需要libidn2库可以禁用
             --enable-shared           # 编译共享库（动态库）

# 4. 编译源码
make

# 5. （可选）运行测试套件确保一切正常
make test

# 6. 安装编译好的curl库和命令行工具到指定目录
sudo make install

```

## libcurl库引用

```txt

-rw-rw-r-- 1 lxg lxg 2342120  1月  6 16:04 libcrypto.so.1.1
-rw-rw-r-- 1 lxg lxg  402128  1月  9 14:03 libcurl.so
lrwxrwxrwx 1 lxg lxg      16  1月  9 15:03 libgmp.so.10 -> libgmp.so.10.3.2
-rw-rw-r-- 1 lxg lxg  330484  1月  9 14:59 libgmp.so.10.3.2
lrwxrwxrwx 1 lxg lxg      20  1月  9 15:01 libgnutls.so.30 -> libgnutls.so.30.23.1
-rw-rw-r-- 1 lxg lxg 1562588  1月  9 14:57 libgnutls.so.30.23.1
lrwxrwxrwx 1 lxg lxg      17  1月  9 15:02 libhogweed.so.4 -> libhogweed.so.4.5
-rw-rw-r-- 1 lxg lxg  182464  1月  9 14:59 libhogweed.so.4.5
lrwxrwxrwx 1 lxg lxg      16  1月  9 15:02 libnettle.so.6 -> libnettle.so.6.5
-rw-rw-r-- 1 lxg lxg  198676  1月  9 14:59 libnettle.so.6.5
-rw-rw-r-- 1 lxg lxg   96216  1月  9 14:54 librtmp.so.1
-rw-rw-r-- 1 lxg lxg  500268  1月  6 16:02 libssl.so.1.1
lrwxrwxrwx 1 lxg lxg      17  1月  9 15:05 libtasn1.so.6 -> libtasn1.so.6.5.5
-rw-rw-r-- 1 lxg lxg   54828  1月  9 15:04 libtasn1.so.6.5.5
-rw-rw-r-- 1 lxg lxg  128296  1月  9 14:54 libz.so.1

```

## 实现post请求

```c

#include <stdio.h>
#include <string.h>
#include <curl/curl.h>


size_t WriteCallback(void *contents, size_t size, size_t nmemb, void *userp)
{
    size_t totalSize = size * nmemb;
    printf("%.*s", (int)totalSize, (char*)contents); // 打印接收到的响应内容
    return totalSize; // 返回实际写入的数据量
}

int main()
{
    CURL *curl;
    CURLcode res;
    char post_fields[1024] = "device_id=Q1SAMK4100000121&chip_id=0c7719510147054c"; // POST数据
    const char *post_url = "https://tiangong-dev.wif.ink/device/device/getInfo";

    curl_global_init(CURL_GLOBAL_DEFAULT);

    curl = curl_easy_init();
    if (curl) {
        curl_easy_setopt(curl, CURLOPT_URL, post_url);
        curl_easy_setopt(curl, CURLOPT_POST, 1L); // 设置为POST请求

        // 设置POST数据
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, post_fields);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, (long)strlen(post_fields));

        // 可以设置HTTP头信息，例如Content-Type
        struct curl_slist *headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/x-www-form-urlencoded");
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        // 设置写回调函数以接收并打印响应数据
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);

        // 启用详细的调试信息输出
        curl_easy_setopt(curl, CURLOPT_VERBOSE, 1L);

        curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L); // 禁止验证远程服务器的SSL证书
        //curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 0L); // 可能需要禁止主机名验证，但可能不安全

        res = curl_easy_perform(curl);

        if (res != CURLE_OK) {
            fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
        }
        // 清理HTTP头列表
        //curl_slist_free_all(headers);

        curl_easy_cleanup(curl);
    }

    curl_global_cleanup();

    return 0;
}

```

## JSON 解析开源库

[cJSON](https://github.com/DaveGamble/cJSON)

轻量级，使用简单，适合嵌入式设备

[json-c](https://github.com/json-c/json-c)

功能齐全，能解析复杂json数据

## CJSON 用法

```c

#include "cjson/cJSON.h"

size_t WriteCallback(void *contents, size_t size, size_t nmemb, void *userp)
{
    size_t totalSize = size * nmemb;
    printf("%.*s", (int)totalSize, (char*)contents); // 打印接收到的响应内容

    cJSON *root, *data, *item;

    root = cJSON_Parse(contents);
    if (root == NULL) {
        // 错误处理：打印错误信息并返回
        fprintf(stderr, "Error before: %s\n", cJSON_GetErrorPtr());
        return 1;
    }

    // 解析JSON数据
    int status = cJSON_GetObjectItem(root, "status")->valueint;
    cJSON *msg = cJSON_GetObjectItem(root, "msg");
    data = cJSON_GetObjectItem(root, "data");

    // 获取data中的各个字段
    cJSON *alias = cJSON_GetObjectItem(data, "alias");
    cJSON *active_time = cJSON_GetObjectItem(data, "active_time");
    char *register_code = cJSON_GetObjectItem(data, "register_code")->valuestring;
    int inner_status = cJSON_GetObjectItem(data, "status")->valueint;
    char *mqtt_user_name = cJSON_GetObjectItem(data, "mqtt_user_name")->valuestring;
    char *mqtt_psw = cJSON_GetObjectItem(data, "mqtt_psw")->valuestring;
    char *mqtt_host = cJSON_GetObjectItem(data, "mqtt_host")->valuestring;
    char *mqtt_port = cJSON_GetObjectItem(data, "mqtt_port")->valuestring;

    // 打印或处理解析出的数据
    char *json_string = cJSON_Print(root);
    if (json_string != NULL) {
        printf("%s\n", json_string);
        cJSON_free(json_string);  // 释放打印生成的字符串
    }

    cJSON_Delete(root); // 清理内存

    return totalSize; // 返回实际写入的数据量
}

```
















