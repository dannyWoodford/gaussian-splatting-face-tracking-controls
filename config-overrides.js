// config-overrides.js
const { override, addWebpackModuleRule } = require('customize-cra')

module.exports = override(
	addWebpackModuleRule({
		test: /\.glsl$/,
		use: 'raw-loader',
	})
)
