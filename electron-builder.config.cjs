// @ts-check

/** @type {import('electron-builder').Configuration} */
const config = {
  appId: 'co.umida.querybase',
  productName: 'QueryBase',
  directories: {
    buildResources: 'build'
  },
  removePackageKeywords: true,
  removePackageScripts: true,
  files: [
    '**/*',
    '!**/.vscode/*',
    '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme,LICENSE}',
    '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples,.circleci}',
    '!**/node_modules/*.d.ts',
    '!**/node_modules/.bin',
    '!scripts/*',
    '!src/*',
    '!*.{js,ts,cjs,mjs}',
    '!electron.vite.config.{js,ts,mjs,cjs}',
    '!{.eslintignore,.eslintrc.js,.prettierignore,.prettierrc.yaml,dev-app-update.yml,CHANGELOG.md,README.md}',
    '!{.env,.env.*,.npmrc,pnpm-lock.yaml}',
    '!{tsconfig.json,tsconfig.node.json,tsconfig.web.json}',
    '!*.db',
    '!temp/**',
    'migrations/**',
    '!resources/*/*',
    'resources/${platform}/*'
  ],
  asarUnpack: ['resources/**'],
  win: {
    executableName: 'querybase'
  },
  nsis: {
    artifactName: '${productName}-${version}-setup.${ext}',
    shortcutName: '${productName}',
    uninstallDisplayName: '${productName}',
    createDesktopShortcut: 'always'
  },
  mac: {
    artifactName: '${productName}-${version}-${arch}.${ext}',
    entitlementsInherit: 'build/entitlements.mac.plist',
    extendInfo: [
      {
        NSCameraUsageDescription: "Application requests access to the device's camera."
      },
      {
        NSMicrophoneUsageDescription: "Application requests access to the device's microphone."
      },
      {
        NSDocumentsFolderUsageDescription:
          "Application requests access to the user's Documents folder."
      },
      {
        NSDownloadsFolderUsageDescription:
          "Application requests access to the user's Downloads folder."
      }
    ],
    notarize: {
      teamId: 'GJE9R5VE87'
    }
  },
  dmg: {
    artifactName: '${productName}-${version}-${arch}.${ext}'
  },
  linux: {
    target: ['AppImage', 'snap', 'deb'],
    maintainer: 'electronjs.org',
    category: 'Utility'
  },
  appImage: {
    artifactName: '${name}-${version}.${ext}'
  },
  npmRebuild: true,
  publish: {
    provider: 'github',
    owner: 'egoist',
    repo: 'querybase'
  }
}

module.exports = config
