export const defaultConfig = {
  name: "YuChuans",
  searchBar: true,
  timeStamp: 0,
  defaultSearchEngine: "baidu",
  groupLinks: [
    {
      "name": "文献检索",
      "links": [
        {
          "title": "Google 学术搜索",
          "url": "https://scholar.google.com/",
          "icon": ""
        },
        {
          "title": "Semantic Scholar | AI-Powered Research Tool",
          "url": "https://www.semanticscholar.org/",
          "icon": ""
        },
        {
          "title": "dblp: computer science bibliography",
          "url": "https://dblp.org/",
          "icon": ""
        },
      ],
      "archive": false
    },
    {
      name: "最近添加",
      links: [
        {
          title: "卖萌屋学术站",
          url: "https://arxiv.xixiaoyao.cn/trend",
          icon: ""
        },
        {
          "title": "Conference Management Toolkit - Login",
          "url": "https://cmt3.research.microsoft.com/Conference/Recent",
          "icon": ""
        }
      ],
      archive: false
    }
  ],
  readList: [
    {
      title: "关于如何使用这个插件需要知道的一些事情",
      url: "https://krance.notion.site/f560f9a308c944519faef3a327acc27b",
      time: Date.parse(new Date())
    }
  ],
  hideCountDown: true,
  hideReadList: false,
  hideLinks: false,
  ddlOption: {},
  simpMode: false,
  simpModeOptions: {
    source: "unsplash-free",
    imageSize: "regular",
    client_id: ""
  },
}

export const searchEngine = {
  baidu: {
    name: "百度",
    url: "https://www.baidu.com/s?wd=",
    des: "百度一下，你就知道",
    keywords: ["百度", "baidu"]
  },
  google: {
    name: "谷歌",
    url: "https://google.com/search?q=",
    des: "Google Everywhere",
    keywords: ["谷歌", "google", "guge"]
  },
  bing: {
    name: "必应",
    url: "https://www.bing.com/search?q=",
    des: "Find Answer",
    keywords: ["必应", "bing", "biying"]
  },
  github: {
    name: "GitHub",
    url: "https://github.com/search?q=",
    des: "Code your world",
    keywords: ["github"]
  },
  dblp: {
    name: "DBLP",
    url: "https://dblp.org/search?q=",
    des: "DataBase systems and Logic Programming",
    keywords: ["dblp", "dplb"]
  },
  weixin: {
    name: "微信公众号",
    url: "https://weixin.sogou.com/weixin?type=2&query=",
    des: "搜索微信公众号",
    keywords: ["微信", "weixin", "wechat", "公众号", "gongzhonghao"]
  },
  zhihu: {
    name: "知乎",
    url: "https://www.zhihu.com/search?type=content&q=",
    des: "人在蒙古，刚下航母",
    keywords: ["知乎", "zhihu"]
  },
  googlescholar: {
    name: "谷歌学术",
    url: "https://scholar.google.com/scholar?q=",
    des: "Google Scholar",
    keywords: ["学术", "xueshu", "scholar"]
  },
  translator: {
    name: "翻译",
    url: "https://www.deepl.com/translator#auto/auto/",
    des: "Deepl",
    keywords: ["翻译", "fanyi", "translator", "trans", "deepl"]
  }
}

// export const apps = {

// }