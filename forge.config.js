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
        iconUrl: 'https://play-lh.googleusercontent.com/-jCY-l3RicXFIAJCfNNeJmuRiebUbZNSyYfk3jUYqq1n6mMoqNSM6dJjIOuHs8HjbA'        
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
