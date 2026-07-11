/// <reference types="vitest/config" />
import path from 'path';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    return {
        plugins: [
            tanstackRouter({
                target: 'react',
                autoCodeSplitting: true,
            }),
            react(),
            babel({
                presets: [reactCompilerPreset()],
            }),
            tailwindcss(),
            visualizer({
                filename: './tmp/bundle-visualizer.html',
                gzipSize: true,
                brotliSize: true,
            }),
            createHtmlPlugin({
                minify: true,
                template: 'index.html',
                inject: {
                    data: {
                        injectScript:
                            mode === 'scan'
                                ? `<script
                                    crossOrigin="anonymous"
                                    src="//unpkg.com/react-scan/dist/auto.global.js"
                                  ></script>`
                                : '',
                    },
                },
            }),
        ],
        build: {
            target: 'baseline-widely-available',
            chunkSizeWarningLimit: 500,
            rolldownOptions: {
                output: {
                    codeSplitting: {
                        groups: [
                            {
                                name: 'vendor-react',
                                test: /[\\/]node_modules[\\/](react|react-dom|scheduler|use-sync-external-store)[\\/]/,
                                priority: 50,
                            },
                            {
                                name: 'vendor-tanstack',
                                test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
                                priority: 40,
                            },
                            {
                                name: 'vendor-zod',
                                test: /[\\/]node_modules[\\/]zod[\\/]/,
                                priority: 30,
                            },
                        ],
                    },
                },
            },
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        // Extra free PORTS if you need them (9199, 9889, 9521, 9836, 9713, 9407, 9491)
        server: {
            port: 9777,
        },
        preview: {
            port: 9111,
        },
        test: {
            environment: 'node',
            globals: false,
        },
    };
});
