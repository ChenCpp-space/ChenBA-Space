// 网站主脚本
class ChenBASpace {
    constructor() {
        this.config = null;
        this.audio = null;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.animationId = null;
        this.isPlaying = false;
        this.isInitialized = false;
        this.isWaveformGlowing = false;
        
        // 波形参数配置
        // 音波高低差参数，范围0-1，默认0.8
        this.waveAmplitude = 1.2;
        // 细分参数，范围128-4096，默认512，控制波形细腻程度
        this.fftSize = 2048;
        // 水平参数，范围0.5-2，默认1，控制波形水平延展效果
        this.waveHorizontalScale = 5;
        // 音乐波线条粗细参数，范围0.5-5，默认1
        this.waveLineWidth = 5;
        
        // 头像音乐条纹参数
        // 细分参数，范围16-128，默认64，控制条纹数量
        this.stripeCount = 64;
        this.stripes = []; // 条纹元素数组
        this.stripeAnalyzer = null; // 用于条纹动画的音频分析器
        this.stripeDataArray = null; // 条纹音频数据
        // 音乐波粗细参数，范围1-5px，默认3px
        this.stripeThickness = 5;
        // 音乐波高低差参数，范围10-80px，默认40px
        this.stripeHeightRange = 80;
        // 音乐波张力参数，范围0.1-1，默认0.8，控制音频数据的平滑度
        this.stripeTension = 0.4;
        
        // 音乐进度条参数
        this.isSeeking = false;
        
        // 背景视频防抖参数
        this.backgroundVideoTimeout = null;
        
        this.init();
    }

    // 初始化网站
    async init() {
        try {
            // 加载配置文件
            await this.loadConfig();
            
            // 初始化DOM事件
            this.initDOMEvents();
            
            // 初始化背景视频循环
            this.initBackgroundLoop();
            
            // 初始化音频
            this.initAudio();
            
            // 初始化波形可视化
            this.initWaveform();
            
            // 初始化头像音乐条纹
            this.initAvatarStripes();
            
            // 更新页面内容
            this.updatePageContent();
            
            // 添加淡入动画
            this.addFadeInAnimations();
            
            this.isInitialized = true;
        } catch (error) {
            console.error('初始化失败:', error);
        }
    }

    // 初始化头像音乐条纹
    initAvatarStripes() {
        const ring = document.querySelector('.profile__avatar-ring');
        if (!ring) return;
        
        // 清除现有条纹
        ring.innerHTML = '';
        this.stripes = [];
        
        // 生成音乐条纹
            for (let i = 0; i < this.stripeCount; i++) {
                const stripe = document.createElement('div');
                stripe.className = 'profile__avatar-stripe';
                
                // 计算条纹角度
                const angle = (i / this.stripeCount) * 360;
                const radius = 90; // 条纹距离中心的半径
                
                // 设置条纹位置和角度
                stripe.style.transform = `translate(-50%, -100%) rotate(${angle}deg) translateY(-${radius}px)`;
                
                // 应用条纹粗细参数
                stripe.style.width = `${this.stripeThickness}px`;
                
                // 随机延迟动画，使条纹效果更自然
                stripe.style.animationDelay = `${(i / this.stripeCount) * 1}s`;
                
                ring.appendChild(stripe);
                this.stripes.push(stripe);
            }
    }

    // 初始化背景视频循环
    initBackgroundLoop() {
        const video = document.querySelector('.background__video');
        if (video) {
            // 只设置一次循环属性和事件监听器
            if (!video.dataset.initialized) {
                // 确保视频循环播放
                video.loop = true;
                
                // 监听ended事件，确保视频结束时重新播放
                video.addEventListener('ended', () => {
                    video.currentTime = 0;
                    video.play().catch(error => {
                        console.error('背景视频循环播放失败:', error);
                    });
                });
                
                // 标记视频已初始化
                video.dataset.initialized = 'true';
            }
            
            // 确保视频正在播放
            if (video.paused) {
                video.play().catch(error => {
                    console.error('背景视频播放失败:', error);
                });
            }
        }
    }

    // 加载配置文件
    async loadConfig() {
        try {
            const response = await fetch('config.json');
            if (!response.ok) {
                throw new Error('配置文件加载失败');
            }
            this.config = await response.json();
        } catch (error) {
            console.error('加载配置文件失败:', error);
            // 使用默认配置
            this.config = {
                site: { name: 'ChenBA-space' },
                personal: {
                    name: 'ChenBA',
                    hobbies: ['音乐制作', '制作一些C++程序'],
                    bio: '我是一个C++开发者, 也是资深的BA玩家awa, 还是音乐小佬.',
                    links: {
                        github: 'https://github.com/ChenBA/',
                        email: 'ChenBA-Space@qq.com'
                    }
                }
            };
        }
    }

    // 初始化DOM事件
    initDOMEvents() {
        // 播放/暂停按钮事件
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePlay();
            });
        }

        // 音量滑块事件
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                if (this.audio) {
                    this.audio.volume = parseFloat(e.target.value);
                }
            });
        }

        // 进度条事件
        const progressSlider = document.getElementById('progressSlider');
        if (progressSlider) {
            // 进度条拖动开始
            progressSlider.addEventListener('mousedown', () => this.isSeeking = true);
            progressSlider.addEventListener('touchstart', () => this.isSeeking = true);
            
            // 进度条拖动中
            progressSlider.addEventListener('input', (e) => {
                if (this.audio && this.isSeeking) {
                    const progress = parseFloat(e.target.value);
                    this.audio.currentTime = (progress / 100) * this.audio.duration;
                    this.updateCurrentTime();
                }
            });
            
            // 进度条拖动结束
            progressSlider.addEventListener('mouseup', () => {
                this.isSeeking = false;
            });
            progressSlider.addEventListener('touchend', () => {
                this.isSeeking = false;
            });
        }

        // 波形切换按钮事件
        const waveBtn = document.getElementById('waveBtn');
        if (waveBtn) {
            waveBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleWaveform();
            });
        }

        // 只在特定元素上添加音频初始化事件，避免影响背景
        const interactiveElements = document.querySelectorAll('.card, .navbar__link, .profile__link');
        interactiveElements.forEach(element => {
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                this.initAudioOnClick();
                // 确保背景视频继续播放
                this.ensureBackgroundVideoPlaying();
            });
        });

        // 键盘事件初始化音频
        document.addEventListener('keydown', (e) => {
            // 只在特定按键时初始化音频
            if (e.code === 'Space' || e.code === 'Enter') {
                this.initAudioOnClick();
            }
        });

        // 触摸事件初始化音频
        document.addEventListener('touchstart', () => this.initAudioOnClick(), { once: true });

        // 卡片涟漪效果
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                this.createRipple(e, card);
            });
        });
    }

    // 初始化音频（符合自动播放政策）
    initAudioOnClick() {
        // 只在必要时初始化音频上下文，不重复初始化整个网站
        if (this.audio && !this.audioContext) {
            // 确保音频元素已加载
            if (this.audio.readyState < 2) {
                this.audio.addEventListener('canplaythrough', () => {
                    this.setupAudioContext();
                    // 确保背景视频继续播放
                    this.ensureBackgroundVideoPlaying();
                });
                return;
            }

            this.setupAudioContext();
            // 确保背景视频继续播放
            this.ensureBackgroundVideoPlaying();
        }
    }

    // 初始化音频元素
    initAudio() {
        this.audio = new Audio('res/Audio/Phonk-Hina.ogg');
        this.audio.loop = true;
        this.audio.volume = 0.5;
        
        // 设置音量滑块初始值
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.value = 0.5;
        }
        
        // 音频事件监听器
        this.audio.addEventListener('timeupdate', () => {
            this.updateProgress();
        });
        
        this.audio.addEventListener('loadedmetadata', () => {
            this.updateTotalTime();
        });
        
        // 音频结束事件
        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updatePlayButton();
        });
        
        // 音频错误处理
        this.audio.addEventListener('error', (e) => {
            console.error('音频加载失败:', e);
        });
    }

    // 格式化时间（秒 -> mm:ss）
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // 更新当前时间显示
    updateCurrentTime() {
        const currentTimeEl = document.getElementById('currentTime');
        if (currentTimeEl && this.audio) {
            currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    // 更新总时间显示
    updateTotalTime() {
        const totalTimeEl = document.getElementById('totalTime');
        if (totalTimeEl && this.audio) {
            totalTimeEl.textContent = this.formatTime(this.audio.duration);
        }
    }

    // 更新进度条
    updateProgress() {
        if (!this.audio || this.isSeeking) return;
        
        const progressSlider = document.getElementById('progressSlider');
        if (progressSlider) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            progressSlider.value = progress;
        }
        
        this.updateCurrentTime();
    }

    // 设置音频上下文
    setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 主波形分析器
            this.analyser = this.audioContext.createAnalyser();
            
            // 头像条纹分析器
            this.stripeAnalyzer = this.audioContext.createAnalyser();
            
            const source = this.audioContext.createMediaElementSource(this.audio);
            source.connect(this.analyser);
            source.connect(this.stripeAnalyzer);
            this.analyser.connect(this.audioContext.destination);
            
            // 主波形分析器设置
            this.analyser.fftSize = this.fftSize;
            this.analyser.smoothingTimeConstant = 0.2;
            const bufferLength = this.analyser.fftSize;
            this.dataArray = new Uint8Array(bufferLength);
            
            // 头像条纹分析器设置
            this.stripeAnalyzer.fftSize = 128;
            // 使用张力参数控制音频数据的平滑度
            this.stripeAnalyzer.smoothingTimeConstant = this.stripeTension;
            const stripeBufferLength = this.stripeAnalyzer.frequencyBinCount;
            this.stripeDataArray = new Uint8Array(stripeBufferLength);
            
            // 开始绘制波形和更新条纹
            this.drawWaveform();
        } catch (error) {
            console.error('音频上下文设置失败:', error);
        }
    }

    // 初始化波形可视化
    initWaveform() {
        const canvas = document.getElementById('waveformCanvas');
        if (canvas) {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            canvas.getContext('2d').scale(window.devicePixelRatio, window.devicePixelRatio);
        }
        
        // 窗口大小改变时重新调整画布
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    // 调整画布大小
    resizeCanvas() {
        const canvas = document.getElementById('waveformCanvas');
        if (canvas) {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            canvas.getContext('2d').scale(window.devicePixelRatio, window.devicePixelRatio);
        }
    }

    // 绘制波形
    drawWaveform() {
        const canvas = document.getElementById('waveformCanvas');
        if (!canvas || !this.analyser || !this.dataArray) {
            this.animationId = requestAnimationFrame(() => this.drawWaveform());
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        
        // 清除画布
        ctx.clearRect(0, 0, width, height);
        
        // 获取时域数据（波形数据）而不是频域数据，实现水平波形
        this.analyser.getByteTimeDomainData(this.dataArray);
        
        if (this.isWaveformGlowing) {
            // 绘制发光波形效果（图2效果）
            this.drawGlowingWaveform(ctx, width, height);
        } else {
            // 绘制默认波形效果
            this.drawDefaultWaveform(ctx, width, height);
        }
        
        // 更新头像音乐条纹
        this.updateAvatarStripes();
        
        // 继续动画
        this.animationId = requestAnimationFrame(() => this.drawWaveform());
    }

    // 更新头像音乐条纹
    updateAvatarStripes() {
        if (!this.stripeAnalyzer || !this.stripeDataArray || this.stripes.length === 0) {
            return;
        }
        
        // 获取频域数据用于条纹动画
        this.stripeAnalyzer.getByteFrequencyData(this.stripeDataArray);
        
        // 更新每个条纹的高度
            this.stripes.forEach((stripe, index) => {
                // 将条纹索引映射到频域数据索引
                const dataIndex = Math.floor((index / this.stripes.length) * this.stripeDataArray.length);
                const amplitude = this.stripeDataArray[dataIndex] / 255;
                
                // 计算条纹高度，使用高低差参数控制范围
                const minHeight = 10;
                const height = minHeight + (amplitude * this.stripeHeightRange);
                
                // 更新条纹高度
                stripe.style.height = `${height}px`;
                
                // 更新条纹透明度
                stripe.style.opacity = 0.5 + (amplitude * 0.5);
            });
    }

    // 绘制默认波形
    drawDefaultWaveform(ctx, width, height) {
        // 绘制连续波形线，使用线条粗细参数
        ctx.lineWidth = this.waveLineWidth;
        
        // 创建渐变
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#9D4EDD');
        gradient.addColorStop(1, '#7B2CBF');
        
        // 绘制波形路径
        ctx.beginPath();
        // 使用水平参数控制波形水平延展效果
        const sliceWidth = (width / this.dataArray.length) * this.waveHorizontalScale;
        let x = 0;
        
        // 计算垂直居中位置
        const centerY = height / 2;
        
        for (let i = 0; i < this.dataArray.length; i++) {
            // 调整数据范围，使用waveAmplitude参数控制波形高低差
            const v = this.dataArray[i] / 255.0;
            const y = centerY + (v - 0.5) * height * this.waveAmplitude;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        // 绘制波形线
        ctx.strokeStyle = gradient;
        ctx.stroke();
        
        // 填充波形下方区域
        ctx.lineTo(width, centerY);
        ctx.lineTo(0, centerY);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // 绘制发光波形（图2效果）
    drawGlowingWaveform(ctx, width, height) {
        // 绘制发光背景
        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, 'rgba(157, 78, 221, 0.1)');
        bgGradient.addColorStop(1, 'rgba(157, 78, 221, 0.3)');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);
        
        // 绘制波形线，使用线条粗细参数
        ctx.lineWidth = this.waveLineWidth;
        ctx.beginPath();
        
        // 使用水平参数控制波形水平延展效果
        const sliceWidth = (width / this.dataArray.length) * this.waveHorizontalScale;
        let x = 0;
        
        // 计算垂直居中位置
        const centerY = height / 2;
        
        for (let i = 0; i < this.dataArray.length; i++) {
            // 调整数据范围，使用waveAmplitude参数控制波形高低差
            const v = this.dataArray[i] / 255.0;
            const y = centerY + (v - 0.5) * height * this.waveAmplitude;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        // 绘制主波形线
        const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
        lineGradient.addColorStop(0, '#9D4EDD');
        lineGradient.addColorStop(0.5, '#E0AAFF');
        lineGradient.addColorStop(1, '#9D4EDD');
        
        ctx.strokeStyle = lineGradient;
        ctx.stroke();
        
        // 添加发光效果
        ctx.shadowColor = '#9D4EDD';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // 绘制底部发光条
        const glowHeight = height * 0.2;
        const glowGradient = ctx.createLinearGradient(0, height - glowHeight, 0, height);
        glowGradient.addColorStop(0, 'rgba(157, 78, 221, 0.5)');
        glowGradient.addColorStop(1, 'rgba(157, 78, 221, 0.8)');
        
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, height - glowHeight, width, glowHeight);
        
        // 绘制频谱柱
        const barWidth = (width / this.dataArray.length) * (3 * this.waveHorizontalScale);
        x = 0;
        
        for (let i = 0; i < this.dataArray.length; i += 4) {
            // 调整频谱柱高度，使用waveAmplitude参数控制高低差
            const v = this.dataArray[i] / 255.0;
            const barHeight = (v - 0.5) * glowHeight * 2 * this.waveAmplitude;
            
            if (barHeight > 0) {
                const barGradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
                barGradient.addColorStop(0, '#E0AAFF');
                barGradient.addColorStop(1, '#9D4EDD');
                
                ctx.fillStyle = barGradient;
                ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
            }
            
            x += barWidth;
        }
    }

    // 切换播放/暂停
    togglePlay() {
        if (!this.audio) return;
        
        // 如果音频上下文未初始化，先初始化
        if (!this.audioContext) {
            this.setupAudioContext();
        }
        
        if (this.isPlaying) {
            this.audio.pause();
            this.updateAvatarEffect(false);
        } else {
            this.audio.play().catch(error => {
                console.error('播放失败:', error);
                // 尝试恢复音频上下文（针对Chrome等浏览器）
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume().then(() => {
                        this.audio.play().catch(err => console.error('恢复后播放失败:', err));
                    });
                }
            });
            this.updateAvatarEffect(true);
        }
        
        this.isPlaying = !this.isPlaying;
        this.updatePlayButton();
        
        // 确保背景视频继续播放
        this.ensureBackgroundVideoPlaying();
    }
    
    // 确保背景视频继续播放（带防抖）
    ensureBackgroundVideoPlaying() {
        // 防抖处理，避免频繁调用
        if (this.backgroundVideoTimeout) {
            clearTimeout(this.backgroundVideoTimeout);
        }
        
        this.backgroundVideoTimeout = setTimeout(() => {
            const video = document.querySelector('.background__video');
            if (video && video.paused && video.currentTime > 0) {
                // 只在视频已经开始播放过且当前暂停时才尝试恢复
                video.play().catch(error => {
                    console.error('背景视频播放失败:', error);
                });
            }
        }, 100);
    }

    // 切换波形效果
    toggleWaveform() {
        this.isWaveformGlowing = !this.isWaveformGlowing;
        const canvas = document.getElementById('waveformCanvas');
        if (canvas) {
            if (this.isWaveformGlowing) {
                canvas.classList.add('waveform__canvas--glowing');
            } else {
                canvas.classList.remove('waveform__canvas--glowing');
            }
        }
    }

    // 更新头像效果
    updateAvatarEffect(isPlaying) {
        const avatar = document.querySelector('.profile__avatar');
        if (avatar) {
            if (isPlaying) {
                avatar.classList.add('profile__avatar--playing');
            } else {
                avatar.classList.remove('profile__avatar--playing');
            }
        }
    }

    // 更新播放按钮
    updatePlayButton() {
        const playBtn = document.getElementById('playBtn');
        if (!playBtn) return;
        
        const icon = playBtn.querySelector('svg');
        if (this.isPlaying) {
            // 暂停图标
            icon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
        } else {
            // 播放图标
            icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
        }
    }

    // 更新页面内容
    updatePageContent() {
        if (!this.config) return;
        
        // 更新标题
        document.title = this.config.site.name;
        
        // 更新个人信息
        const nameEl = document.getElementById('name');
        const bioEl = document.getElementById('bio');
        const hobbiesEl = document.getElementById('hobbies');
        
        if (nameEl) {
            nameEl.textContent = this.config.personal.name;
        }
        
        if (bioEl) {
            bioEl.textContent = this.config.personal.bio;
        }
        
        if (hobbiesEl) {
            hobbiesEl.innerHTML = this.config.personal.hobbies
                .map(hobby => `<span class="profile__hobby">${hobby}</span>`)
                .join('');
        }
    }

    // 添加淡入动画
    addFadeInAnimations() {
        const elements = document.querySelectorAll('.card, .navbar, .music-controls');
        elements.forEach((element, index) => {
            // 只有在加载完成后才应用淡入动画
            if (element.style.opacity !== '0') {
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
            }
            
            setTimeout(() => {
                element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 300 + (index * 100));
        });
    }

    // 创建涟漪效果
    createRipple(e, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1000;
        `;
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // 清理资源
    cleanup() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.audio) {
            this.audio.pause();
            this.audio = null;
        }
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    // 初始化网站
    window.chenBASpace = new ChenBASpace();
});

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    if (window.chenBASpace) {
        window.chenBASpace.cleanup();
    }
});

// 图片懒加载
const initLazyLoading = () => {
    const images = document.querySelectorAll('img[data-src]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => observer.observe(img));
};

// 初始化懒加载
if ('IntersectionObserver' in window) {
    initLazyLoading();
}

// 性能监控
const initPerformanceMonitoring = () => {
    // 监控首屏加载时间
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const perfData = performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`首屏加载时间: ${loadTime}ms`);
        });
    }
};

initPerformanceMonitoring();