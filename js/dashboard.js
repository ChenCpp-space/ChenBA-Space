// 页面加载动画
window.addEventListener('load', function() {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 1000);
});

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查用户登录状态
    checkLoginStatus();
    
    // 加载个人信息
    loadUserInfo();
    
    // 加载个人主页信息
    loadProfileInfo();
    
    // 退出登录事件监听
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // 用户管理链接点击事件
    document.getElementById('adminLink').addEventListener('click', function(e) {
        e.preventDefault();
        // 这里可以跳转到用户管理页面
        alert('用户管理功能开发中...');
    });
});

// 检查用户登录状态
function checkLoginStatus() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        // 用户未登录，跳转到登录页面
        window.location.href = 'index.html';
    }
}

// 加载用户信息
function loadUserInfo() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // 显示root用户管理入口
    if (currentUser.isRoot) {
        document.getElementById('adminLink').style.display = 'inline-block';
    }
    
    // 更新分享密钥信息
    document.getElementById('shareTitle').textContent = currentUser.shareKey.title;
    document.getElementById('shareKeyText').textContent = currentUser.shareKey.key;
    document.getElementById('footerShareKey').textContent = currentUser.shareKey.key;
    document.getElementById('userTitle').textContent = currentUser.title;
}

// 加载个人主页信息
function loadProfileInfo() {
    // 模拟从my_config.json读取数据（实际应使用fetch或XHR）
    const profileData = {
        "name": "ChenBA",
        "description": "一个初中生, 喜欢写代码awa, 爱听歌OAO, 会做歌(一点QAQ), 爱玩蔚蓝档案(Hina厨)awa"
    };
    
    // 更新个人信息
    document.getElementById('profileName').textContent = profileData.name;
    document.getElementById('profileDesc').textContent = profileData.description;
}

// 复制分享密钥
function copyShareKey() {
    const shareKey = document.getElementById('shareKeyText').textContent;
    
    // 创建临时input元素
    const tempInput = document.createElement('input');
    tempInput.value = shareKey;
    document.body.appendChild(tempInput);
    
    // 选择并复制
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // 兼容移动端
    
    try {
        document.execCommand('copy');
        // 显示复制成功提示
        showCopySuccess();
    } catch (err) {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
    }
    
    // 移除临时元素
    document.body.removeChild(tempInput);
}

// 显示复制成功提示
function showCopySuccess() {
    const copyBtn = document.querySelector('.copy-btn');
    const originalText = copyBtn.textContent;
    
    // 更新按钮文本
    copyBtn.textContent = '已复制！';
    copyBtn.style.background = 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)';
    
    // 恢复原始文本
    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }, 2000);
}

// 退出登录
function logout() {
    // 清除本地存储的用户信息
    localStorage.removeItem('currentUser');
    
    // 跳转到登录页面
    window.location.href = 'index.html';
}

// 获取实际音乐文件列表（从/res/video/读取）
function getMusicFiles() {
    // 实际音乐文件数据
    const musicFiles = [
        { "name": "Phonk-Hina-awa", "duration": "3:20", "file": "/res/video/Phonk-Hina-awa.ogg" },
        { "name": "Phonk-Hina-awa-notA", "duration": "3:20", "file": "/res/video/Phonk-Hina-awa-notA.ogg" },
        { "name": "Phonk-Hina-awa-notAB", "duration": "3:20", "file": "/res/video/Phonk-Hina-awa-notAB.ogg" },
        { "name": "Phonk-Hina-awa-notB", "duration": "3:20", "file": "/res/video/Phonk-Hina-awa-notB.ogg" }
    ];
    
    return musicFiles;
}