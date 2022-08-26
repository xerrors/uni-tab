export const defaultConfig = {
    name: "YuChuans",
    searchBar: true,
    timeStamp: 0,
    defaultSearchEngine: "google",
    groupLinks: [{
        name: "最近添加",
        archive: false,
        links: [{
            title: "卖萌屋学术站",
            url: "https://arxiv.xixiaoyao.cn/trend",
            icon: ""
        }]
    }],
    readList: [{
        title: "关于如何使用这个插件需要知道的一些事情",
        url: "https://krance.notion.site/f560f9a308c944519faef3a327acc27b",
        time: Date.parse(new Date())
    }]
}

export const searchEngine = {
  baidu: {
    name: "百度",
    url: "https://www.baidu.com/s?wd=",
    keywords: ["百度", "baidu"]
  },
  google: {
    name: "谷歌",
    url: "https://google.com/search?q=",
    keywords: ["谷歌", "google", "guge"]
  },
  bing: {
    name: "必应",
    url: "https://www.bing.com/search?q=",
    keywords: ["必应", "bing", "biying"]
  },
  github: {
    name: "GitHub",
    url: "https://github.com/search?q=",
    keywords: ["github"]
  },
  dblp: {
    name: "DBLP",
    url: "https://dblp.org/search?q=",
    keywords: ["dblp", "dplb"]
  },
  weixin: {
    name: "微信公众号",
    url: "https://weixin.sogou.com/weixin?type=2&query=",
    keywords: ["微信", "weixin", "wechat", "公众号", "gongzhonghao"]
  },
  zhihu: {
    name: "知乎",
    url: "https://www.zhihu.com/search?type=content&q=",
    keywords: ["知乎", "zhihu"]
  },
  googlescholar: {
    name: "谷歌学术",
    url: "https://scholar.google.com/scholar?q=",
    keywords: ["学术", "xueshu", "scholar"]
  },
  translator: {
    name: "翻译",
    url: "https://www.deepl.com/translator#auto/auto/",
    keywords: ["翻译", "fanyi", "translator", "trans"]
  }
}

// export const apps = {

// }