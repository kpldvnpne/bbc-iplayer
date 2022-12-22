module.exports = {
  packagerConfig: {
    icon: 'icons/icon'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        setupIcon: 'icons/icon.ico',
        iconUrl: 'https://cdn2.steamgriddb.com/file/sgdb-cdn/icon/44e88d3cdaf008900484f92ba4c6c51b.ico'        
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: 'icons/icon'
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          icon: 'icons/icon'
        }
      },
    },
  ],
};
