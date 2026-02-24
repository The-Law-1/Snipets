import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

export default () => {
	return defineConfig({
		base: "/Snipets/",

		plugins: [vue(), tailwindcss()],
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)) // Alias for src folder
			}
		},
		server: {
			port: 3000
		}
	});
};
