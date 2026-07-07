import type { Plugin } from 'vitepress'; // Corrected import for general Vite plugin

// 自定义 Vite 插件
export default function conditionalCompilerAliasPlugin(): Plugin {
  const VUE_COMPILER_SFC = 'vue/compiler-sfc';
  // 这是我们通过 pnpm 别名安装的 vue@3.2.37
  const TARGET_COMPILER_FOR_VUE2_REPL = 'vue-for-vue2-repl';

  return {
    name: 'vite-plugin-conditional-vue2-repl-compiler-alias',
    enforce: 'pre', // Ensure this plugin runs before others, especially Vite's own alias plugin
    async resolveId(source, importer, options) {
      // Keep this log for debugging!
      // console.log('[MyPlugin] resolveId:', { source, importer, isVueCompilerSfc: source === VUE_COMPILER_SFC });
      if (source === VUE_COMPILER_SFC) {

        // Adjust this condition based on your console.log output for the importer path.
        // It needs to accurately identify imports originating from within the vue2-repl package.
        // The path in the error: node_modules/.pnpm/vue2-repl@0.2.1.../node_modules/vue2-repl/dist/vue2-repl.mjs
        if (importer && importer.includes('vue2-repl/')) { // This might need to be more specific, e.g., check for '.pnpm' and the full package name if necessary
          console.log(`[MyPlugin] Matched vue2-repl for importer: ${importer}. Attempting to alias to ${TARGET_COMPILER_FOR_VUE2_REPL}`);
          try {
            const resolved = await this.resolve(
              TARGET_COMPILER_FOR_VUE2_REPL,
              importer,
              { skipSelf: true, custom: { ...options.custom, isPluginResolve: true } } // Added isPluginResolve for clarity, may not be strictly needed by Vite
            );

            if (resolved) {
              console.log(`[MyPlugin] Conditionally resolving '${source}' for '${importer}' to '${resolved.id}'`);
              return resolved.id; // Return the path to vue@3.2.37 compiler
            } else {
              console.error(`[MyPlugin] Failed to resolve target '${TARGET_COMPILER_FOR_VUE2_REPL}'. Check pnpm alias and package installation.`);
            }
          } catch (e) {
            console.error(`[MyPlugin] Error during custom resolution for ${TARGET_COMPILER_FOR_VUE2_REPL}:`, e);
          }
        }
      }
      // For all other cases, return null to let Vite use default resolution
      return null;
    }
  };
}