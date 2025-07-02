export function generateMindARHTML(videoUrl: string, markerUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AR Campaign Experience</title>
    <script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/dist/mindar-image-aframe.prod.js"></script>
    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
        }
        
        #loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            color: white;
        }
        
        #loading.hidden {
            display: none;
        }
        
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        #instructions {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            text-align: center;
            z-index: 100;
            max-width: 90%;
            font-size: 14px;
            backdrop-filter: blur(10px);
        }
        
        #instructions.hidden {
            display: none;
        }
        
        .instruction-text {
            margin: 0;
        }
        
        @media (max-width: 768px) {
            #instructions {
                top: 10px;
                padding: 12px 20px;
                font-size: 13px;
            }
        }
    </style>
</head>
<body>
    <div id="loading">
        <div class="spinner"></div>
        <h2>Loading AR Experience...</h2>
        <p>Please allow camera access when prompted</p>
    </div>
    
    <div id="instructions">
        <p class="instruction-text">🎯 Point your camera at the marker image to see the AR content</p>
    </div>
    
    <a-scene 
        mindar-image="imageTargetSrc: ${markerUrl}; maxTrack: 1; showStats: false;" 
        color-space="sRGB" 
        renderer="colorManagement: true, physicallyCorrectLights"
        vr-mode-ui="enabled: false" 
        device-orientation-permission-ui="enabled: false"
        loading-screen="enabled: false"
    >
        <a-assets>
            <video
                id="ar-video"
                src="${videoUrl}"
                preload="auto"
                loop="true"
                crossorigin="anonymous"
                playsinline
                webkit-playsinline="true"
                muted="true"
            ></video>
        </a-assets>

        <a-camera position="0 0 0" look-controls="enabled: false" cursor="fuse: false; rayOrigin: mouse;" raycaster="far: 10000; objects: .raycastable"></a-camera>

        <a-entity id="ar-target" mindar-image-target="targetIndex: 0">
            <a-video
                src="#ar-video"
                position="0 0 0"
                rotation="-90 0 0"
                width="1.6"
                height="0.9"
                play-on-click
            ></a-video>
            
            <!-- Add subtle glow effect -->
            <a-plane
                position="0 -0.01 0"
                rotation="-90 0 0"
                width="1.8"
                height="1.1"
                material="color: #4F46E5; opacity: 0.1; transparent: true"
                animation="property: material.opacity; to: 0.2; dir: alternate; dur: 2000; loop: true"
            ></a-plane>
        </a-entity>
    </a-scene>

    <script>
        // Handle loading state
        document.addEventListener('DOMContentLoaded', function() {
            const loading = document.getElementById('loading');
            const instructions = document.getElementById('instructions');
            const scene = document.querySelector('a-scene');
            const video = document.getElementById('ar-video');
            
            // Hide loading screen once scene is loaded
            scene.addEventListener('loaded', function() {
                setTimeout(() => {
                    loading.classList.add('hidden');
                }, 1000);
            });
            
            // Handle AR target found/lost
            const arTarget = document.getElementById('ar-target');
            
            arTarget.addEventListener('targetFound', function() {
                console.log('AR target found');
                instructions.classList.add('hidden');
                
                // Play video when target is found
                video.play().catch(e => {
                    console.log('Auto-play prevented:', e);
                    // Add click handler for manual play
                    document.addEventListener('click', function() {
                        video.play();
                    }, { once: true });
                });
            });
            
            arTarget.addEventListener('targetLost', function() {
                console.log('AR target lost');
                instructions.classList.remove('hidden');
                video.pause();
            });
            
            // Handle video loading
            video.addEventListener('loadeddata', function() {
                console.log('Video loaded successfully');
            });
            
            video.addEventListener('error', function(e) {
                console.error('Video loading error:', e);
            });
        });
    </script>
</body>
</html>`
}