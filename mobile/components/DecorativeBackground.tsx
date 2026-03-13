import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * TRUE WEB-PARITY BACKGROUND "MEMPOOL" (HTML5 Canvas injected via WebView)
 * Mirrors MempoolBackground.tsx exactly by running the identical Web JS Engine Math:
 * - 16px squares, 2px gap (18px step)
 * - HSL(160-200, 80%, 55%) color range
 * - Pulse animation running on Web Thread maintaining 60 FPS
 */
export const DecorativeBackground = React.memo(() => {
    // The exact Javascript from `MempoolBackground.tsx` injected into HTML format
    const mempoolHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <style>
                html, body { 
                    margin: 0; padding: 0; width: 100%; height: 100%; 
                    background-color: #07080E; overflow: hidden;
                }
                canvas { display: block; width: 100vw; height: 100vh; }
            </style>
        </head>
        <body>
            <canvas id="mempoolCanvas"></canvas>
            <script>
                const canvas = document.getElementById("mempoolCanvas");
                const ctx = canvas.getContext("2d");
                
                let blocks = [];
                let w = 0, h = 0;

                function init() {
                    const dpr = Math.min(window.devicePixelRatio || 1, 2);
                    w = window.innerWidth;
                    h = window.innerHeight;
                    
                    canvas.width = w * dpr;
                    canvas.height = h * dpr;
                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

                    const gap = 2;
                    const cellSize = 16;
                    const step = cellSize + gap;
                    const cols = Math.ceil(w / step) + 1;
                    const rows = Math.ceil(h / step) + 1;
                    
                    blocks = [];
                    for (let r = 0; r < rows; r++) {
                        for (let c = 0; c < cols; c++) {
                            blocks.push({
                                x: c * step,
                                y: r * step,
                                size: cellSize,
                                opacity: 0.02 + Math.random() * 0.09,
                                targetOpacity: 0.02 + Math.random() * 0.09,
                                hue: 160 + Math.random() * 40,
                            });
                        }
                    }
                }

                init();
                window.addEventListener('resize', init);

                setInterval(() => {
                    const count = Math.floor(blocks.length * 0.05);
                    for (let i = 0; i < count; i++) {
                        const idx = Math.floor(Math.random() * blocks.length);
                        blocks[idx].targetOpacity = 0.12 + Math.random() * 0.28;
                    }
                    for (let i = 0; i < blocks.length; i++) {
                        if (Math.random() > 0.85) {
                            blocks[i].targetOpacity = 0.015 + Math.random() * 0.06;
                        }
                    }
                }, 1200);

                function draw() {
                    ctx.clearRect(0, 0, w, h);
                    for (const b of blocks) {
                        b.opacity += (b.targetOpacity - b.opacity) * 0.05;
                        ctx.fillStyle = \`hsla(\${b.hue}, 80%, 55%, \${b.opacity})\`;
                        ctx.fillRect(b.x, b.y, b.size, b.size);
                    }
                    requestAnimationFrame(draw);
                }
                
                requestAnimationFrame(draw);
            </script>
        </body>
        </html>
    `;

    return (
        <View style={s.container} pointerEvents="none">
            {/* The WebView provides the exact 1:1 Canvas execution without crippling React Native Native UI */}
            <WebView
                originWhitelist={['*']}
                source={{ html: mempoolHTML }}
                style={s.webview}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                bounces={false}
                androidLayerType="hardware"
            />

            {/* Bottom fade overlay just like before to guarantee tab bar reading */}
            <LinearGradient
                colors={['transparent', 'rgba(7, 8, 14, 0.84)', '#07080E']}
                locations={[0, 0.6, 1]}
                style={s.bottomFade}
            />
        </View>
    );
});

const s = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#07080E',
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    bottomFade: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 160,
    },
});
