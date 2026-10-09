/*!
 * blog-features.js
 * Custom blog features: search overlay / code block enhancement / post like / back-to-top
 * Extracted from _includes/footer.html inline scripts for browser caching.
 * Depends on: simple-jekyll-search.min.js (SimpleJekyllSearch)
 */
(function () {
    'use strict';

    var CONFIG = window.__BLOG__ || { baseurl: '', version: '' };

    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    /* ===== Search 搜索功能 ===== */
    ready(function () {
        var searchIcon = document.getElementById('search-icon');
        var searchOverlay = document.getElementById('search-overlay');
        var searchClose = document.getElementById('search-close');
        var searchInput = document.getElementById('search-input');
        var resultsContainer = document.getElementById('results-container');

        if (!searchIcon || !searchOverlay || !searchClose || !searchInput || !resultsContainer) return;

        // 初始化搜索
        SimpleJekyllSearch({
            searchInput: searchInput,
            resultsContainer: resultsContainer,
            json: CONFIG.baseurl + '/search.json?v=' + CONFIG.version,
            searchResultTemplate: '<div class="search-result"><a href="{url}"><div class="search-result-title">{title}</div><div class="search-result-date"><i class="fa fa-calendar"></i> {date}</div><div class="search-result-tags"><i class="fa fa-tags"></i> {tags}</div></a></div>',
            noResultsText: '<div class="search-no-results"><i class="fa fa-search"></i><p>没有找到相关文章</p><p>试试其他关键词吧</p></div>',
            limit: 100,
            fuzzy: false,
            exclude: ['url', 'date'],
            sortMiddleware: function () {
                return 0;
            }
        });

        function openSearch() {
            searchOverlay.style.display = 'flex';
            searchInput.focus();
            document.body.style.overflow = 'hidden';
        }

        function closeSearch() {
            searchOverlay.style.display = 'none';
            searchInput.value = '';
            resultsContainer.innerHTML = '';
            document.body.style.overflow = 'auto';
        }

        // 打开搜索
        searchIcon.addEventListener('click', function (e) {
            e.preventDefault();
            openSearch();
        });

        // 关闭搜索
        searchClose.addEventListener('click', closeSearch);

        // 点击背景关闭
        searchOverlay.addEventListener('click', function (e) {
            if (e.target === searchOverlay) {
                closeSearch();
            }
        });

        // ESC键关闭
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && searchOverlay.style.display === 'flex') {
                closeSearch();
            }
        });

        // 快捷键 Ctrl+K 或 Cmd+K 打开搜索
        document.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                openSearch();
            }
        });
    });

    /* ===== 代码块优化（语言标识 + 复制按钮） ===== */
    ready(function () {
        // 语言映射表
        var languageMap = {
            'language-javascript': 'JavaScript',
            'language-js': 'JavaScript',
            'language-typescript': 'TypeScript',
            'language-ts': 'TypeScript',
            'language-python': 'Python',
            'language-py': 'Python',
            'language-java': 'Java',
            'language-c': 'C',
            'language-cpp': 'C++',
            'language-csharp': 'C#',
            'language-php': 'PHP',
            'language-ruby': 'Ruby',
            'language-go': 'Go',
            'language-rust': 'Rust',
            'language-swift': 'Swift',
            'language-kotlin': 'Kotlin',
            'language-html': 'HTML',
            'language-xml': 'XML',
            'language-css': 'CSS',
            'language-scss': 'SCSS',
            'language-sass': 'Sass',
            'language-less': 'Less',
            'language-json': 'JSON',
            'language-yaml': 'YAML',
            'language-yml': 'YAML',
            'language-markdown': 'Markdown',
            'language-md': 'Markdown',
            'language-bash': 'Bash',
            'language-sh': 'Shell',
            'language-shell': 'Shell',
            'language-sql': 'SQL',
            'language-r': 'R',
            'language-matlab': 'MATLAB',
            'language-diff': 'Diff',
            'language-plaintext': 'Text',
            'language-text': 'Text'
        };

        // 查找所有代码块
        var codeBlocks = document.querySelectorAll('pre > code, div.highlight > pre');

        codeBlocks.forEach(function (codeBlock, index) {
            // 获取父元素
            var pre = codeBlock.tagName === 'PRE' ? codeBlock : codeBlock.parentElement;

            // 如果已经被包装过，跳过
            if (pre.parentElement.classList.contains('code-block-wrapper')) {
                return;
            }

            // 识别语言
            var language = 'Code';
            var codeElement = pre.querySelector('code') || codeBlock;

            if (codeElement.className) {
                var classes = codeElement.className.split(' ');
                for (var j = 0; j < classes.length; j++) {
                    var cls = classes[j];
                    if (languageMap[cls]) {
                        language = languageMap[cls];
                        break;
                    }
                    // 尝试匹配 highlight-source-xxx 格式
                    if (cls.indexOf('highlight-source-') === 0) {
                        language = cls.replace('highlight-source-', '').toUpperCase();
                        break;
                    }
                }
            }

            // 创建包装容器
            var wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';

            // 创建头部
            var header = document.createElement('div');
            header.className = 'code-block-header';

            // 创建语言标识
            var langLabel = document.createElement('div');
            langLabel.className = 'code-language';
            langLabel.innerHTML = '<i class="fa fa-code"></i>' + language;

            // 创建复制按钮
            var copyButton = document.createElement('button');
            copyButton.className = 'copy-code-button';
            copyButton.innerHTML = '<i class="fa fa-copy"></i><span>复制代码</span>';
            copyButton.setAttribute('data-index', index);

            // 添加复制功能
            copyButton.addEventListener('click', function () {
                var code = codeElement.innerText || codeElement.textContent;

                // 使用现代 Clipboard API
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(code).then(function () {
                        showCopySuccess(copyButton);
                    }).catch(function (err) {
                        console.error('复制失败:', err);
                        fallbackCopy(code, copyButton);
                    });
                } else {
                    // 降级方案
                    fallbackCopy(code, copyButton);
                }
            });

            // 组装元素
            header.appendChild(langLabel);
            header.appendChild(copyButton);

            // 在原位置插入包装容器
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(header);
            wrapper.appendChild(pre);
        });

        // 显示复制成功状态
        function showCopySuccess(button) {
            var originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fa fa-check"></i><span>已复制!</span>';
            button.classList.add('copied');

            setTimeout(function () {
                button.innerHTML = originalHTML;
                button.classList.remove('copied');
            }, 2000);
        }

        // 降级复制方案
        function fallbackCopy(text, button) {
            var textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();

            try {
                var successful = document.execCommand('copy');
                if (successful) {
                    showCopySuccess(button);
                } else {
                    alert('复制失败，请手动复制');
                }
            } catch (err) {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制');
            }

            document.body.removeChild(textarea);
        }
    });

    /* ===== 点赞功能 ===== */
    ready(function () {
        var likeButton = document.getElementById('like-button');
        var likeCount = document.getElementById('like-count');

        if (!likeButton || !likeCount) return;

        // 全局计数服务 (countapi: hit +1 / get 读取, 无需注册)
        var API_BASE = 'https://countapi.mileshilliard.com/api/v1';
        var REQUEST_TIMEOUT = 8000;                           // 该服务偶发无响应, 不设超时会让按钮永久卡在加载态
        var postUrl = likeButton.getAttribute('data-post-url');
        var likeKey = 'post_like_' + postUrl;                 // 本机是否已点赞
        var legacyCountKey = 'post_like_count_' + postUrl;    // 旧版本本地计数(清理用)
        var cachedCountKey = 'post_like_cached_' + postUrl;   // 最近一次全局计数(离线兜底显示)
        var apiKey = 'lxgblog_like_' + hashKey(postUrl);
        var likePending = false;
        var shownCount = null;                                // 当前显示的数字, 未知时为 null
        var countSettled = false;                             // 是否已拿到服务端权威数字
        var likeText = likeButton.querySelector('.like-text');

        // djb2 哈希: 把文章 URL 转为 URL 安全的唯一 key
        function hashKey(str) {
            var h = 5381, i = str.length;
            while (i) { h = (h * 33) ^ str.charCodeAt(--i); }
            return (h >>> 0).toString(36);
        }

        // 带超时的请求: fetch 自身无超时, 服务不响应时会一直挂起
        function apiFetch(path) {
            var controller = typeof AbortController === 'function' ? new AbortController() : null;
            var timer = setTimeout(function () { if (controller) controller.abort(); }, REQUEST_TIMEOUT);
            return fetch(API_BASE + path, {
                cache: 'no-store',
                signal: controller ? controller.signal : undefined
            }).then(function (r) {
                if (!r.ok) {
                    var err = new Error('HTTP ' + r.status);
                    err.status = r.status;
                    throw err;
                }
                return r.json();
            }).finally(function () { clearTimeout(timer); });
        }

        // 超时的请求可能已在服务端计数, 重试会重复计数, 故只对明确的失败重试
        function apiFetchRetry(path, retriesLeft) {
            return apiFetch(path).catch(function (err) {
                if (err && err.name === 'AbortError') throw err;
                if (retriesLeft <= 0) throw err;
                return new Promise(function (resolve) { setTimeout(resolve, 600); })
                    .then(function () { return apiFetchRetry(path, retriesLeft - 1); });
            });
        }

        function setCount(n, opts) {
            shownCount = n;
            likeCount.textContent = n;
            if (opts && opts.optimistic) return;   // 乐观 +1 不写缓存, 避免下次访问显示未确认的数字
            try { localStorage.setItem(cachedCountKey, String(n)); } catch (e) { /* ignore */ }
        }

        function setLikedVisual(liked) {
            if (liked) {
                likeButton.classList.add('liked');
            } else {
                likeButton.classList.remove('liked');
            }
            if (likeText) likeText.textContent = liked ? '已喜欢' : '喜欢';
        }

        function markLiked() {
            try { localStorage.setItem(likeKey, 'true'); } catch (e) { /* ignore */ }
            setLikedVisual(true);
        }

        function playLikeAnimation() {
            likeButton.classList.add('animating');
            likeCount.classList.add('increment');
            createFloatingHearts();
            setTimeout(function () {
                likeButton.classList.remove('animating');
                likeCount.classList.remove('increment');
            }, 500);
        }

        // 读取服务端权威计数
        function loadCount() {
            return apiFetchRetry('/get/' + apiKey, 2)
                .then(function (data) {
                    if (data && data.value !== undefined) {
                        setCount(parseInt(data.value, 10) || 0);
                        countSettled = true;
                    }
                })
                .catch(function () { /* 服务不可用: 保留缓存值/占位符 */ });
        }

        // 初始化点赞状态
        function initLikeStatus() {
            // 检查用户是否已点赞
            if (localStorage.getItem(likeKey) === 'true') setLikedVisual(true);

            // 有本机缓存就先显示, 没有则显示占位符: 凭空显示 0 会让同一个数字
            // 在不同浏览器/新访客眼里不一致
            var cached = localStorage.getItem(cachedCountKey);
            if (cached === null) {
                likeCount.textContent = '–';
            } else {
                setCount(parseInt(cached, 10) || 0);
            }

            // 清理旧版本遗留的本地计数
            try { localStorage.removeItem(legacyCountKey); } catch (e) { /* ignore */ }

            loadCount();

            // 读取失败(服务偶发不可用)时, 回到页面再补一次, 避免数字长期停在旧值
            document.addEventListener('visibilitychange', function () {
                if (!document.hidden && !countSettled) loadCount();
            });
        }

        // 点赞功能（单向: 全局计数 +1, 点过赞后不可取消, 保证全局计数准确）
        likeButton.addEventListener('click', function () {
            if (localStorage.getItem(likeKey) === 'true') {
                // 已点过赞: 仅重播心跳动画
                likeButton.classList.remove('liked');
                void likeButton.offsetWidth;
                likeButton.classList.add('liked');
                return;
            }

            if (likePending) return;
            likePending = true;
            likeButton.classList.add('loading');

            // 接口通常要 1~4 秒才返回, 先给出乐观反馈, 失败再回滚
            var baseCount = shownCount;
            setLikedVisual(true);
            if (baseCount !== null) setCount(baseCount + 1, { optimistic: true });
            playLikeAnimation();

            apiFetchRetry('/hit/' + apiKey, 1)
                .then(function (data) {
                    // 使用服务端返回的最新全局计数
                    var value = parseInt(data && data.value, 10);
                    setCount(isNaN(value) ? (baseCount === null ? 0 : baseCount + 1) : value);
                    markLiked();
                })
                .catch(function (err) {
                    // 计数失败: 回滚乐观状态, 不标记已点赞, 允许稍后重试
                    console.error('点赞失败:', err);
                    setLikedVisual(false);
                    if (baseCount !== null) setCount(baseCount);
                    if (likeText) {
                        likeText.textContent = '网络异常, 请重试';
                        setTimeout(function () {
                            if (!likeButton.classList.contains('liked')) likeText.textContent = '喜欢';
                        }, 2500);
                    }
                })
                .finally(function () {
                    likePending = false;
                    likeButton.classList.remove('loading');
                });
        });

        // 创建飘心动画
        function createFloatingHearts() {
            var hearts = ['❤️', '💖', '💕', '💗', '💓'];
            for (var i = 0; i < 5; i++) {
                setTimeout(function () {
                    var heart = document.createElement('div');
                    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
                    heart.style.position = 'fixed';
                    heart.style.fontSize = '24px';
                    heart.style.pointerEvents = 'none';
                    heart.style.zIndex = '9999';

                    var buttonRect = likeButton.getBoundingClientRect();
                    heart.style.left = (buttonRect.left + buttonRect.width / 2 - 12 + (Math.random() - 0.5) * 40) + 'px';
                    heart.style.top = (buttonRect.top + buttonRect.height / 2 - 12) + 'px';

                    document.body.appendChild(heart);

                    // 动画
                    var duration = 1500 + Math.random() * 500;
                    var distance = 80 + Math.random() * 40;
                    var angle = (Math.random() - 0.5) * 60;

                    heart.animate([
                        {
                            transform: 'translateY(0) translateX(0) rotate(0deg) scale(1)',
                            opacity: 1
                        },
                        {
                            transform: 'translateY(-' + distance + 'px) translateX(' + angle + 'px) rotate(' + (angle * 2) + 'deg) scale(1.5)',
                            opacity: 0
                        }
                    ], {
                        duration: duration,
                        easing: 'ease-out'
                    });

                    // 移除元素
                    setTimeout(function () {
                        document.body.removeChild(heart);
                    }, duration);
                }, i * 100);
            }
        }

        // 双击点赞（额外的交互方式）
        var postContainer = document.querySelector('.post-container');
        if (postContainer) {
            var lastTap = 0;
            postContainer.addEventListener('dblclick', function (e) {
                var currentTime = new Date().getTime();
                var tapLength = currentTime - lastTap;

                if (tapLength < 500 && tapLength > 0) {
                    e.preventDefault();
                    if (localStorage.getItem(likeKey) !== 'true') {
                        likeButton.click();
                    }
                }
                lastTap = currentTime;
            });
        }

        // 初始化
        initLikeStatus();
    });

    /* ===== 返回顶部按钮功能 ===== */
    ready(function () {
        var backToTopBtn = document.getElementById('back-to-top');

        if (!backToTopBtn) return;

        // 监听滚动事件
        var scrollTimeout;
        window.addEventListener('scroll', function () {
            // 防抖优化
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function () {
                if (window.pageYOffset > 300) {
                    backToTopBtn.classList.add('show');
                } else {
                    backToTopBtn.classList.remove('show');
                }

                // 更新进度环（可选）
                var scrollPercentage = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                backToTopBtn.style.setProperty('--scroll-percentage', scrollPercentage + '%');
            }, 100);
        });

        // 点击返回顶部
        backToTopBtn.addEventListener('click', function () {
            // 平滑滚动到顶部
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            // 添加点击动画
            backToTopBtn.style.transform = 'scale(0.9)';
            setTimeout(function () {
                backToTopBtn.style.transform = '';
            }, 150);
        });

        // 双击快速回顶
        var lastClickTime = 0;
        backToTopBtn.addEventListener('click', function () {
            var currentTime = new Date().getTime();
            var timeDiff = currentTime - lastClickTime;

            if (timeDiff < 500 && timeDiff > 0) {
                // 双击快速回顶（无动画）
                window.scrollTo({
                    top: 0,
                    behavior: 'auto'
                });
            }

            lastClickTime = currentTime;
        });
    });
})();
