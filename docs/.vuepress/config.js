// .vuepress/config.js
module.exports = {
  title: "《Java 8 函数式编程》中文翻译",
  base: "/doc-java8/",
  themeConfig: {
    repo: "gdut-yy/Java-8-Lambdas-zh",
    repoLabel: "Github",
    docsRepo: "gdut-yy/Java-8-Lambdas-zh",
    docsBranch: "master/docs",
    editLinks: true,
    editLinkText: "帮助我们改善此页面！",
    lastUpdated: "Last Updated",
    sidebarDepth: 2,
    nav: [],
    sidebar: {
      "/": [
        "",
        "preface.md",
        "ch1.md",
        "ch2.md",
        "ch3.md",
        "ch4.md",
        "ch5.md",
        "ch6.md",
        "ch7.md",
        "ch8.md",
        "ch9.md",
        "ch10.md"
      ]
    }
  }
};
