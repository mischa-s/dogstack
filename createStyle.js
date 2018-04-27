const getDefaultExport = require('./lib/getDefaultExport')

const PropTypes = require('prop-types')
const { createRenderer } = require('fela')
const { Provider: FelaProvider, ThemeProvider: FelaThemeProvider } = require('react-fela')
const h = require('react-hyperscript')
const MuiThemeProvider = getDefaultExport(require('material-ui/styles/MuiThemeProvider'))
const getMuiTheme = getDefaultExport(require('material-ui/styles/getMuiTheme'))

// TODO publish preset `fela-preset-dogstack`
// plugins and enhancers from https://github.com/cloudflare/cf-ui/blob/master/packages/cf-style-provider/src/index.js#L40

const fallbackValue = getDefaultExport(require('fela-plugin-fallback-value'))
const lvha = getDefaultExport(require('fela-plugin-lvha'))
const validator = getDefaultExport(require('fela-plugin-validator'))
const beautifier = getDefaultExport(require('fela-beautifier'))
const monolithic = getDefaultExport(require('fela-monolithic'))
const prefixer = getDefaultExport(require('fela-plugin-prefixer'))

module.exports = {
  createStyleRenderer,
  StyleProvider
}

function createStyleRenderer (options) {
  const {
    plugins: userPlugins = [],
    enhancers: userEnhancers = [],
    setup = noop,
    prod = process.env.NODE_ENV === 'production',
    dev = !prod,
    selectorPrefix
  } = options

  // plugin order matters!
  //   https://github.com/rofrischmann/fela/blob/master/docs/advanced/Plugins.md#order-matters

  var defaultPlugins = []
  var defaultEnhancers = []

  if (dev) {
    defaultPlugins = [lvha(), fallbackValue(), validator()]
    defaultEnhancers = [beautifier(), monolithic()]
  }

  if (prod) {
    defaultPlugins = [lvha(), prefixer(), fallbackValue()]
  }

  const plugins = [...defaultPlugins, ...userPlugins]
  const enhancers = [...defaultEnhancers, ...userEnhancers]

  const renderer = createRenderer({
    plugins,
    enhancers,
    selectorPrefix
  })

  setup(renderer)

  return renderer
}

function StyleProvider (options) {
  const {
    renderer,
    theme,
    children
  } = options

  const muiTheme = themeToMuiTheme(theme)

  return (
    h(FelaProvider, {
      renderer
    }, [
      h(FelaThemeProvider, {
        theme
      }, [
        h(MuiThemeProvider, {
          muiTheme
        }, children)
      ])
    ])
  )
}

StyleProvider.defaultProps = {
  theme: {}
}
StyleProvider.propTypes = {
  renderer: PropTypes.object,
  theme: PropTypes.object,
  children: PropTypes.node.isRequired
}

function noop () {}

function themeToMuiTheme (theme) {
  return getMuiTheme({
    fontFamily: theme.fontFamily,
    palette: {
      primary1Color: theme.colors.primary1,
      primary2Color: theme.colors.primary2,
      primary3Color: theme.colors.primary3,
      accent1Color: theme.colors.accent1,
      accent2Color: theme.colors.accent2,
      accent3Color: theme.colors.accent3,
      textColor: theme.colors.text,
      alternateTextColor: theme.colors.alternateText,
      canvasColor: theme.colors.canvas,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.shadow
    }
  })
}
