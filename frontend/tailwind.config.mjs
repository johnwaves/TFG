/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
	},
	plugins: [
		require('daisyui'),
	],

	daisyui: {
		themes: [
			{
				forest: {
					...require("daisyui/src/theming/themes")["forest"],
					"base-100": "#E5E5E5",
				},
				
			}
		],
	}
}
