/**
 * Releases
 */
const LatestSemver = require('latest-semver')
const releases = require('./public/releases.json')
const latestVersion = LatestSemver(releases)

/**
 * Product data
 */
const productData = require("./site-config/product-info")


/**
 * Sidebar navigation structure
 */
const sidebarNav = require("./site-config/sidebar-nav")

/**
 * Install methods route builder
 */
const releaseArray = require("./site-config/install-route-builder")

/**
 * Site Configuration
 */
module.exports = {
  // theme configuration
  themeConfig: {
    domain: productData.hostname,
    latestVer: latestVersion,
    twitter: productData.twitter,
    author: productData.author,
    repo: productData.repo,
    repoButtonLabel: productData.repoButtonLabel,
    cliNamespace: productData.cliNamespace,
    logo: productData.logo,
    slackInvite: productData.slackInviteURL,
    slackChannel: productData.slackChannelURL,
    docsDir: "docs",
    editLinks: false,
    search: true,
    searchMaxSuggestions: 10,
    algolia: {
      apiKey: "",
      indexName: ""
    },
    sidebar: sidebarNav,
    sidebarDepth: 2,
    displayAllHeaders: true,
    // main navigation
    nav: [
      { text: "Documentation", link: "/docs/" },
      { text: "Community", link: "/community/" },
      // { text: "Use Cases", link: "/use-cases/" },
      { text: "Request Demo", link: "/request-demo/" },
      { text: "Install", link: "/install/" }
    ]
  },
  title: productData.title,
  description: productData.description,
  host: "localhost",
  head: [
    // favicons, touch icons, web app stuff
    [ "link", { rel: "icon", href: `${productData.hostname}/images/favicon-64px.png` } ],
    [ "link", { rel: "apple-touch-icon", "sizes": "180x180", href: `${productData.hostname}/images/apple-touch-icon.png` } ],
    [ "link", { rel: "manifest", href: `${productData.hostname}/site.webmanifest` } ],
    [ "meta", { name: "msapplication-TileColor", content: "#ffffff" } ],
    [ "meta", { name: "theme-color", content: "#ffffff" } ],
    // web fonts
    [
      "link", {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css?family=Roboto+Mono|Roboto:400,500,700"
      }
    ]
  ],
  // version release navigation
  additionalPages: [
    releaseArray
  ],
  // plugin settings, build process, etc.
  markdown: {
    lineNumbers: true,
    extendMarkdown: md => {
      // include files in markdown
      md.use(require("markdown-it-include"), "./docs/.partials/")

      // this replaces %%v%% with the latest version on strings but 
      // not within links. using the token within a link
      // causes RouterLink to throw a 'malformed URI' error
      md.use(require("markdown-it-for-inline"), 'version_replace', 'text', (tokens, idx) => {
        tokens[idx].content = tokens[idx].content.replace(/%%v%%/g, latestVersion)
      })
    }
  },
  plugins: {
    "clean-urls": {
      normalSuffix: "/",
      indexSuffix: "/"
    },
    sitemap: {
      hostname: productData.hostname
    },
    "@vuepress/google-analytics": {
      ga: productData.gaCode
    },
    seo: {
      customMeta: (add, context) => {
        const { $site, $page } = context

        // the full absolute URL for the OpenGraph image
        const ogImagePath = `${productData.hostname}${productData.ogImage}`

        add("twitter:image", ogImagePath)
        add("twitter:description", productData.description)
        add("og:image", ogImagePath)
        add("og:image:width", 800)
        add("og:image:height", 533)
      }
    }
  },
  postcss: {
    plugins: [
      require("tailwindcss"),
      require("autoprefixer")({
        grid: true
      })
    ]
  },
  // this is covered in the VuePress documentation
  // but it doesn't seem to work. Left here in case
  // that changes.
  extraWatchFiles: [
    "/docs/.partials/*",
    "/site-config/product-info.js",
    "/site-config/sidebar-nav.js",
    "/public/install-methods.json",
    "/public/releases.json"
  ],
  evergreen: false,
  chainWebpack: (config, isServer) => {
    const jsRule = config.module.rule("js")
    jsRule
      .use("babel-loader")
      .loader("babel-loader")
      .options({
        presets: [
          [
            "@babel/preset-env",
            {
              useBuiltIns: "usage",
              corejs: 3,
              targets: {
                ie: 11,
                browsers: "last 2 versions"
              }
            }
          ]
        ]
      })
  }
};
