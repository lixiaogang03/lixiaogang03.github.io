---
layout:     post
title:      Ubuntu2204 编译OpenHarmony
subtitle:   触觉智能 rk3566 OpenHarmony3.2
date:       2024-01-03
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - openharmony
---

## 触觉智能

[Purple Pi OH](http://www.industio.cn/product-item-37.html)

## 编译报错-1

```txt

mock_stub_an.cpp:16:10: fatal error: 'cstdint' file not found

```

**解决方案**

sudo apt install llvm clang libstdc++-12-dev

## 编译报错-2

```txt

[OHOS ERROR] ../../arkcompiler/runtime_core/platforms/unix/libpandabase/futex/mutex.h:252:40: error: implicit instantiation of undefined template 'std::array<unsigned int, 1>'

```

**解决方案**

```c

// mutex.h

#include <array>

```

## 编译报错-3

```txt

[OHOS ERROR] ../../third_party/protobuf/src/google/protobuf/reflection.h:396:19: error: 'iterator<std::forward_iterator_tag, google::protobuf::Message>' is deprecated [-Werror,-Wdeprecated-declarations]

```

**解决方案**

```diff

diff --git a/third_party/protobuf/src/google/protobuf/reflection.h b/third_party/protobuf/src/google/protobuf/reflection.h
index af8eb00ef8..0e69476d2c 100644
--- a/third_party/protobuf/src/google/protobuf/reflection.h
+++ b/third_party/protobuf/src/google/protobuf/reflection.h
@@ -392,8 +392,8 @@ class PROTOBUF_EXPORT RepeatedFieldAccessor {
 
 // Implement (Mutable)RepeatedFieldRef::iterator
 template <typename T>
-class RepeatedFieldRefIterator
-    : public std::iterator<std::forward_iterator_tag, T> {
+class RepeatedFieldRefIterator {
+//    : public std::iterator<std::forward_iterator_tag, T> {
   typedef typename RefTypeTraits<T>::AccessorValueType AccessorValueType;
   typedef typename RefTypeTraits<T>::IteratorValueType IteratorValueType;
   typedef typename RefTypeTraits<T>::IteratorPointerType IteratorPointerType;

```

## 编译报错-4

```txt

[OHOS ERROR] ../../developtools/hiperf/src/callstack.cpp:621:30: error: expected namespace name
[OHOS ERROR]         using namespace std::rel_ops; // enable complement comparing operators

```

**修改方案**

修改方案不一定合适，只是解决编译问题

```diff
diff --git a/developtools/hiperf/src/callstack.cpp b/developtools/hiperf/src/callstack.cpp
index 9b8fc67602..4dc13bb754 100644
--- a/developtools/hiperf/src/callstack.cpp
+++ b/developtools/hiperf/src/callstack.cpp
@@ -618,7 +618,7 @@ size_t CallStack::ExpandCallStack(pid_t tid, std::vector<CallFrame> &callFrames,
         HashList<uint64_t, std::vector<CallFrame>> &cachedCallFrames = cachedCallFramesMap_[tid];
         HLOGV("find call stack frames in cache size %zu", cachedCallFrames.size());
         // compare
-        using namespace std::rel_ops; // enable complement comparing operators
+        //using namespace std::rel_ops; // enable complement comparing operators
         for (auto itr = cachedCallFrames.begin(); itr < cachedCallFrames.end(); ++itr) {
             // each cached callstack
             /*

```


















