const { iconsPlugin, getIconCollections } = require('@egoist/tailwindcss-icons')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      fontFamily: {
        mono: 'var(--font-mono)'
      },
      height: {
        'editor-wrapper': 'var(--editor-wrapper-height)'
      },
      backgroundColor: {
        popover: 'var(--popover-bg)',
        modal: 'var(--modal-bg)',
        'modal-overlay': 'var(--modal-overlay-bg)'
      },
      boxShadow: {
        modal: 'var(--modal-shadow)'
      },
      borderColor: {
        modal: 'var(--modal-border-color)'
      },
      colors: {
        popover: 'var(--popover-fg)'
      }
    }
  },
  plugins: [
    iconsPlugin({
      collections: getIconCollections([
        'mingcute',
        'ri',
        'tabler',
        'material-symbols',
        'lucide',
        'devicon',
        'logos'
      ])
    })
  ]
}
