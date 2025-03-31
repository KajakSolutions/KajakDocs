export default {
  title: 'KajakEngine Docs',
  description: 'Documentation for the KajakEngine game framework',
  themeConfig: {
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Main Page', link: '/' },
          { text: 'Getting Started', link: '/getting-started' }
        ]
      },
      {
        text: 'Kajak Engine',
        items: [
          {
            text: 'Introduction',
            items: [
              { text: 'Getting Started', link: '/getting-started-engine' },
            ]
          },
          {
            text: 'Our Engine',
            items: [
              { text: 'Core Components', link: '/engine/core-components' },
              { text: 'Core Functions', link: '/engine/kajak-engine' },
              { text: 'Advanced Features', link: '/engine/adv-feature' }]
          },
          {
            text: 'Core Concepts',
            items: [
              { text: 'Engine Overview', link: '/engine/engine-overview' },
              {
                text: 'Game Objects', link: '/engine/game-objects',
                text: 'Game Objects',
                items: [
                  {text: 'PhysicObject', items: [
                      {text: 'CarObject', link: '/engine/game-objects-car' },
                      {text: 'CheckpointObject', link: '/engine/game-objects-checkpoint' },
                      {text: 'MapObject', link: '/engine/game-objects-map' },
                      {text: 'TreeObject', link: '/engine/game-objects-tree' },
                      {text: 'NitroBonus', link: '/engine/game-objects-nitro' },
                      {text: 'MovingBarrier', link: '/engine/game-objects-barrier' },
                    ]
                  },
                ]
              },
              { text: 'Physics', link: '/engine/physics' }
            ]
          }
        ]
      },
      {
        text: 'Kajak Racing',
        items: [
          {
            text: 'Getting Started', link: '/getting-started-racing'
          }
        ]
      }
    ]
  }
}