// 音乐播放器类
class MusicPlayer {
    constructor() {
        // 播放器状态
        this.isPlaying = false;
        this.currentSongIndex = 0;
        this.songs = [];
        this.audio = new Audio();
        this.isDragging = false;
        
        // DOM元素
        this.elements = {
            playBtn: document.getElementById('playBtn'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            progress: document.getElementById('progress'),
            progressBar: document.querySelector('.progress-bar'),
            progressHandle: document.getElementById('progressHandle'),
            currentTime: document.getElementById('currentTime'),
            totalTime: document.getElementById('totalTime'),
            currentSongName: document.getElementById('currentSongName'),
            currentSongArtist: document.getElementById('currentSongArtist'),
            songList: document.getElementById('songList')
        };
        
        // 初始化播放器
        this.init();
    }
    
    // 初始化播放器
    init() {
        // 加载歌曲列表
        this.loadSongs();
        
        // 绑定事件
        this.bindEvents();
        
        // 渲染歌曲列表
        this.renderSongList();
    }
    
    // 加载歌曲列表
    loadSongs() {
        // 从dashboard.js获取歌曲列表
        this.songs = getMusicFiles();
    }
    
    // 绑定事件
    bindEvents() {
        // 播放/暂停按钮
        this.elements.playBtn.addEventListener('click', () => this.togglePlay());
        
        // 上一首按钮
        this.elements.prevBtn.addEventListener('click', () => this.prevSong());
        
        // 下一首按钮
        this.elements.nextBtn.addEventListener('click', () => this.nextSong());
        
        // 音频事件
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.nextSong());
        this.audio.addEventListener('loadedmetadata', () => this.updateTotalTime());
        
        // 进度条事件
        this.elements.progressBar.addEventListener('click', (e) => this.setProgress(e));
        
        // 进度条拖动事件
        this.elements.progressHandle.addEventListener('mousedown', () => this.startDrag());
        document.addEventListener('mousemove', (e) => this.onDrag(e));
        document.addEventListener('mouseup', () => this.endDrag());
        
        // 触摸事件（移动端支持）
        this.elements.progressHandle.addEventListener('touchstart', (e) => {
            this.startDrag();
            e.preventDefault();
        });
        document.addEventListener('touchmove', (e) => {
            this.onDrag(e.touches[0]);
            e.preventDefault();
        });
        document.addEventListener('touchend', () => this.endDrag());
    }
    
    // 渲染歌曲列表
    renderSongList() {
        this.elements.songList.innerHTML = '';
        
        this.songs.forEach((song, index) => {
            const songItem = document.createElement('div');
            songItem.className = 'song-item';
            songItem.innerHTML = `
                <div class="song-item-info">
                    <span class="song-item-name">${song.name}</span>
                </div>
                <span class="song-item-duration">${song.duration}</span>
            `;
            
            // 设置当前播放歌曲样式
            if (index === this.currentSongIndex) {
                songItem.classList.add('active');
            }
            
            // 点击播放歌曲
            songItem.addEventListener('click', () => this.playSong(index));
            
            this.elements.songList.appendChild(songItem);
        });
    }
    
    // 播放指定歌曲
    playSong(index) {
        if (index < 0 || index >= this.songs.length) return;
        
        // 更新当前歌曲索引
        this.currentSongIndex = index;
        
        // 重置播放器状态
        this.audio.currentTime = 0;
        
        // 使用实际音频文件路径
        this.audio.src = this.songs[index].file;
        
        // 更新当前歌曲信息
        this.updateSongInfo();
        
        // 播放歌曲
        this.play();
        
        // 更新歌曲列表样式
        this.updateSongListStyle();
    }
    
    // 播放/暂停切换
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    // 播放歌曲
    play() {
        if (this.songs.length === 0) return;
        
        // 实际播放
        this.audio.play()
            .then(() => {
                this.isPlaying = true;
                this.elements.playBtn.textContent = '⏸️';
                
                // 添加播放动画效果
                this.elements.playBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.elements.playBtn.style.transform = 'scale(1)';
                }, 100);
            })
            .catch(error => {
                console.error('播放失败:', error);
                this.isPlaying = false;
                this.elements.playBtn.textContent = '▶️';
                // 播放失败时继续模拟播放
                this.simulatePlayProgress();
            });
    }
    
    // 暂停歌曲
    pause() {
        // 实际暂停
        this.audio.pause();
        this.isPlaying = false;
        this.elements.playBtn.textContent = '▶️';
        
        // 添加暂停动画效果
        this.elements.playBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.elements.playBtn.style.transform = 'scale(1)';
        }, 100);
        
        // 停止模拟进度更新
        this.stopSimulateProgress();
    }
    
    // 上一首
    prevSong() {
        let index = this.currentSongIndex - 1;
        if (index < 0) {
            index = this.songs.length - 1;
        }
        this.playSong(index);
    }
    
    // 下一首
    nextSong() {
        let index = this.currentSongIndex + 1;
        if (index >= this.songs.length) {
            index = 0;
        }
        this.playSong(index);
    }
    
    // 更新歌曲信息
    updateSongInfo() {
        const currentSong = this.songs[this.currentSongIndex];
        if (!currentSong) return;
        
        this.elements.currentSongName.textContent = currentSong.name;
        this.elements.currentSongArtist.textContent = '未知艺术家';
    }
    
    // 更新进度条
    updateProgress() {
        if (this.isDragging) return;
        
        const duration = this.audio.duration || 0;
        const currentTime = this.audio.currentTime || 0;
        const progressPercent = (currentTime / duration) * 100;
        
        this.elements.progress.style.width = `${progressPercent}%`;
        this.elements.progressHandle.style.right = `${100 - progressPercent}%`;
        
        // 更新当前时间
        this.elements.currentTime.textContent = this.formatTime(currentTime);
    }
    
    // 更新总时间
    updateTotalTime() {
        this.elements.totalTime.textContent = this.formatTime(this.audio.duration);
    }
    
    // 设置进度
    setProgress(e) {
        const rect = this.elements.progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const progressPercent = (clickX / width) * 100;
        
        // 设置音频进度
        this.audio.currentTime = (progressPercent / 100) * this.audio.duration;
        
        // 更新进度条
        this.elements.progress.style.width = `${progressPercent}%`;
        this.elements.progressHandle.style.right = `${100 - progressPercent}%`;
    }
    
    // 开始拖动
    startDrag() {
        this.isDragging = true;
        this.elements.progressHandle.style.transform = 'translateY(-50%) scale(1.5)';
        this.elements.progressHandle.style.zIndex = '10';
        document.body.style.userSelect = 'none';
        // 添加视觉反馈
        this.elements.progressBar.style.cursor = 'grabbing';
    }
    
    // 拖动中
    onDrag(e) {
        if (!this.isDragging) return;
        
        const rect = this.elements.progressBar.getBoundingClientRect();
        let clientX = e.clientX || e.touches[0].clientX;
        
        // 限制拖动范围
        const minX = rect.left;
        const maxX = rect.right;
        clientX = Math.max(minX, Math.min(maxX, clientX));
        
        const clickX = clientX - minX;
        const width = rect.width;
        const progressPercent = (clickX / width) * 100;
        
        // 更新进度条
        this.elements.progress.style.width = `${progressPercent}%`;
        this.elements.progressHandle.style.right = `${100 - progressPercent}%`;
        
        // 实时更新当前时间显示（拖动时）
        if (this.audio.duration) {
            const newTime = (progressPercent / 100) * this.audio.duration;
            this.elements.currentTime.textContent = this.formatTime(newTime);
        }
    }
    
    // 结束拖动
    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.elements.progressHandle.style.transform = 'translateY(-50%) scale(1)';
        this.elements.progressHandle.style.zIndex = '';
        document.body.style.userSelect = '';
        this.elements.progressBar.style.cursor = 'pointer';
        
        // 设置音频进度
        const progressWidth = this.elements.progress.style.width;
        const progressPercent = parseFloat(progressWidth) || 0;
        
        if (this.audio.duration) {
            const newTime = (progressPercent / 100) * this.audio.duration;
            this.audio.currentTime = newTime;
        }
    }
    
    // 更新歌曲列表样式
    updateSongListStyle() {
        // 移除所有歌曲的active类
        document.querySelectorAll('.song-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 为当前歌曲添加active类
        const currentSongItem = this.elements.songList.children[this.currentSongIndex];
        if (currentSongItem) {
            currentSongItem.classList.add('active');
            
            // 滚动到当前歌曲
            currentSongItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    // 格式化时间
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // 模拟播放进度（用于演示）
    simulatePlayProgress() {
        let simulatedTime = 0;
        const duration = 200; // 模拟歌曲时长200秒
        
        this.elements.totalTime.textContent = this.formatTime(duration);
        
        const updateSimulatedProgress = () => {
            if (!this.isPlaying) return;
            
            simulatedTime += 0.5;
            if (simulatedTime >= duration) {
                simulatedTime = 0;
                this.nextSong();
                return;
            }
            
            const progressPercent = (simulatedTime / duration) * 100;
            this.elements.progress.style.width = `${progressPercent}%`;
            this.elements.progressHandle.style.right = `${100 - progressPercent}%`;
            this.elements.currentTime.textContent = this.formatTime(simulatedTime);
            
            setTimeout(updateSimulatedProgress, 500);
        };
        
        updateSimulatedProgress();
    }
    
    // 停止模拟进度
    stopSimulateProgress() {
        // 停止模拟进度更新
    }
}

// 页面加载完成后初始化播放器
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保dashboard.js已加载完成
    setTimeout(() => {
        new MusicPlayer();
    }, 100);
});