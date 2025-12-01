// 资源预加载系统
class ResourcePreloader {
    constructor() {
        this.resources = [];
        this.loadedCount = 0;
        this.totalCount = 0;
        this.onProgressCallback = null;
        this.onCompleteCallback = null;
    }

    // 扫描并收集需要预加载的资源
    scanResources() {
        // 定义需要预加载的资源路径
        this.resources = [
            // 图片资源
            'ChenBA-Space/res/images/hina.jpg',
            
            // 音频资源
            'ChenBA-Space/res/Audio/Phonk-Hina.ogg',
            
            // 视频资源
            'ChenBA-Space/res/Video/Hina.mp4'
        ];
        
        this.totalCount = this.resources.length;
        return this.resources;
    }

    // 预加载单个资源
    preloadResource(src) {
        return new Promise((resolve, reject) => {
            // 对于大型媒体文件，我们只检查它们是否存在而不是完全加载
            if (src.endsWith('.ogg') || src.endsWith('.mp3') || src.endsWith('.wav') || 
                src.endsWith('.mp4') || src.endsWith('.webm')) {
                // 对于音频和视频文件，我们使用XMLHttpRequest检查文件是否存在
                const xhr = new XMLHttpRequest();
                xhr.open('HEAD', src, true);
                xhr.timeout = 10000; // 设置10秒超时
                
                // 添加abort事件处理
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        console.log(`Resource exists: ${src}`);
                        this.onResourceLoaded(src);
                        resolve(src);
                    } else {
                        console.warn(`Resource not found: ${src}`);
                        // 即使文件不存在，我们也认为预加载"完成"，只是文件不存在
                        this.onResourceLoaded(src);
                        resolve(src);
                    }
                };
                
                xhr.onerror = () => {
                    console.warn(`Error checking resource: ${src}`);
                    // 即使检查失败，我们也继续
                    this.onResourceLoaded(src);
                    resolve(src);
                };
                
                xhr.ontimeout = () => {
                    console.warn(`Timeout checking resource: ${src}`);
                    // 即使超时，我们也继续
                    this.onResourceLoaded(src);
                    resolve(src);
                };
                
                xhr.onabort = () => {
                    console.warn(`Abort checking resource: ${src}`);
                    // 即使被中断，我们也继续
                    this.onResourceLoaded(src);
                    resolve(src);
                };
                
                xhr.send();
                return;
            }
            
            // 根据资源类型创建相应的元素
            let element;
            if (src.endsWith('.jpg') || src.endsWith('.png') || src.endsWith('.gif')) {
                element = new Image();
            } else {
                // 对于其他类型资源，使用fetch
                fetch(src)
                    .then(response => {
                        if (response.ok) {
                            this.onResourceLoaded(src);
                            resolve(src);
                        } else {
                            this.onResourceError(src, response.statusText);
                            reject(new Error(`Failed to load resource: ${src}`));
                        }
                    })
                    .catch(error => {
                        this.onResourceError(src, error.message);
                        reject(error);
                    });
                return;
            }

            // 设置资源加载事件
            element.onload = () => {
                this.onResourceLoaded(src);
                resolve(src);
            };

            element.onerror = (error) => {
                this.onResourceError(src, error.message);
                reject(error);
            };

            // 开始加载资源
            element.src = src;
        });
    }

    // 当资源加载完成时调用
    onResourceLoaded(src) {
        this.loadedCount++;
        const progress = (this.loadedCount / this.totalCount) * 100;
        
        if (this.onProgressCallback) {
            this.onProgressCallback(progress, this.loadedCount, this.totalCount, src);
        }
        
        console.log(`Loaded: ${src} (${this.loadedCount}/${this.totalCount})`);
    }

    // 当资源加载出错时调用
    onResourceError(src, error) {
        console.error(`Failed to load: ${src}`, error);
        
        // 即使某个资源加载失败，也继续加载其他资源
        this.loadedCount++;
        const progress = (this.loadedCount / this.totalCount) * 100;
        
        if (this.onProgressCallback) {
            this.onProgressCallback(progress, this.loadedCount, this.totalCount, src);
        }
    }

    // 设置进度回调函数
    onProgress(callback) {
        this.onProgressCallback = callback;
    }

    // 设置完成回调函数
    onComplete(callback) {
        this.onCompleteCallback = callback;
    }

    // 开始预加载所有资源
    async preloadAll() {
        // 如果还没有扫描资源，则先扫描
        if (this.resources.length === 0) {
            this.scanResources();
        }
        
        // 重置计数器
        this.loadedCount = 0;
        
        // 创建所有加载Promise
        const promises = this.resources.map(src => this.preloadResource(src));
        
        try {
            // 等待所有资源加载完成
            await Promise.all(promises);
            
            if (this.onCompleteCallback) {
                this.onCompleteCallback(true);
            }
            
            console.log('All resources preloaded successfully');
            return true;
        } catch (error) {
            console.error('Error preloading resources:', error);
            
            if (this.onCompleteCallback) {
                this.onCompleteCallback(false);
            }
            
            return false;
        }
    }
}

// 更新加载界面进度
function updateLoaderProgress(progress, loaded, total, currentResource) {
    const progressBar = document.querySelector('.loader__progress-bar');
    const progressText = document.querySelector('.loader__progress-text');
    const currentResourceEl = document.querySelector('.loader__current-resource');
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${Math.round(progress)}% (${loaded}/${total})`;
    }
    
    if (currentResourceEl) {
        // 提取文件名显示
        const fileName = currentResource.split('/').pop();
        currentResourceEl.textContent = `正在加载: ${fileName}`;
    }
}

// 隐藏加载界面
function hideLoader() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.animation = 'loaderFadeOut 0.5s ease-in-out forwards';
        
        // 在动画结束后移除加载器
        setTimeout(() => {
            loader.style.display = 'none';
            
            // 显示主内容
            const mainContent = document.querySelector('.main');
            const navbar = document.querySelector('.navbar');
            const musicControls = document.querySelector('.music-controls');
            
            if (mainContent) mainContent.style.opacity = '1';
            if (navbar) navbar.style.opacity = '1';
            if (musicControls) musicControls.style.opacity = '1';
            
            // 触发背景视频播放（在用户交互后）
            if (window.chenBASpace) {
                // 确保背景视频继续播放
                window.chenBASpace.ensureBackgroundVideoPlaying();
            }
        }, 500);
    }
}

// 初始化预加载系统
document.addEventListener('DOMContentLoaded', () => {
    // 创建预加载器实例
    const preloader = new ResourcePreloader();
    
    // 设置进度回调
    preloader.onProgress((progress, loaded, total, currentResource) => {
        updateLoaderProgress(progress, loaded, total, currentResource);
    });
    
    // 设置完成回调
    preloader.onComplete((success) => {
        if (success) {
            console.log('所有资源预加载完成');
            // 隐藏加载界面
            hideLoader();
        } else {
            console.warn('部分资源加载失败，但仍继续显示网站');
            // 即使有错误也隐藏加载界面
            hideLoader();
        }
    });
    
    // 开始预加载
    preloader.preloadAll().catch(error => {
        console.error('预加载过程中出现错误:', error);
        // 出现错误时也隐藏加载界面
        hideLoader();
    });
});