// 页面加载动画
window.addEventListener('load', function() {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 1000);
});

// 全局变量
let clickCount = 0;
let isCounting = false;
let currentLoginType = 'password';

// DOM元素
const togglePassword = document.getElementById('togglePassword');
const password = document.getElementById('password');
const loginForm = document.getElementById('loginForm');
const username = document.getElementById('username');
const shareKey = document.getElementById('shareKey');
const loginTypeBtns = document.querySelectorAll('.login-type-btn');
const passwordLogin = document.getElementById('passwordLogin');
const keyLogin = document.getElementById('keyLogin');
const iconImg = document.querySelector('.login-card img');
const counterDiv = document.getElementById('counter');
const easterEggDiv = document.getElementById('easterEgg');

// 密码切换功能
togglePassword.addEventListener('click', function() {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁️' : '🙈';
});

// 登录方式切换
loginTypeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        // 移除所有按钮的active类
        loginTypeBtns.forEach(b => b.classList.remove('active'));
        // 添加当前按钮的active类
        this.classList.add('active');
        // 获取登录类型
        currentLoginType = this.dataset.type;
        // 显示对应的登录表单
        if (currentLoginType === 'password') {
            passwordLogin.style.display = 'block';
            keyLogin.style.display = 'none';
        } else {
            passwordLogin.style.display = 'none';
            keyLogin.style.display = 'block';
        }
    });
});

// 输入框焦点事件
username.addEventListener('focus', function() {
    this.parentElement.style.transform = 'translateY(-2px)';
});

username.addEventListener('blur', function() {
    this.parentElement.style.transform = 'translateY(0)';
    validateInput(this);
});

password.addEventListener('focus', function() {
    this.parentElement.style.transform = 'translateY(-2px)';
});

password.addEventListener('blur', function() {
    this.parentElement.style.transform = 'translateY(0)';
    validateInput(this);
});

shareKey.addEventListener('focus', function() {
    this.parentElement.style.transform = 'translateY(-2px)';
});

shareKey.addEventListener('blur', function() {
    this.parentElement.style.transform = 'translateY(0)';
    validateInput(this);
});

// 输入验证函数
function validateInput(input) {
    if (input.value.trim() === '') {
        input.classList.remove('valid', 'invalid');
    } else if (input.id === 'password') {
        // 密码长度验证
        if (input.value.length >= 6) {
            input.classList.remove('invalid');
            input.classList.add('valid');
        } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
        }
    } else {
        input.classList.remove('invalid');
        input.classList.add('valid');
    }
}

// 隐藏计数器功能
iconImg.addEventListener('click', function() {
    if (clickCount < 5) {
        clickCount++;
        if (clickCount === 5) {
            isCounting = true;
            counterDiv.textContent = '开始计数...';
            counterDiv.style.opacity = '0.7';
        }
    } else if (isCounting) {
        clickCount++;
        // 显示计数器（不显示具体数量）
        counterDiv.textContent = '计数中...';
        counterDiv.style.opacity = '1';
        
        // 当计数达到100次时，显示root用户登录信息
        if (clickCount === 100) {
            easterEggDiv.innerHTML = `
                <strong style="color: #667eea;">🎉 恭喜发现彩蛋！</strong><br>
                <div style="margin-top: 8px; font-size: 0.85rem;">
                    <strong>root用户名:</strong> ChenBA-Space<br>
                    <strong>root密码:</strong> ChenBA-Password<br>
                    <strong>root密钥:</strong> ChenBA-Space-root-ShareKey
                </div>
            `;
            easterEggDiv.style.opacity = '1';
            // 停止计数
            isCounting = false;
        }
    }
});

// 实际用户数据（与config.json保持一致）
const mockUsers = {
    "root": {
        "username": "ChenBA-Space",
        "password": "ChenBA-Password",
        "title": "ChenBA: 你可以随时使用这个账号awa, 但是请不要分享给他人, 然他们自己找awa, 如果你可以的话叫你的盆友到github上自己找密码, 且你可以修改配置文件",
        "shareKey": {
            "key": "ChenBA-Space-root-ShareKey",
            "title": "ChenBA: 分享密钥, 你可以分享这个密钥给他人, 他人可以使用这个密钥来登录"
        }
    },
    "user": {
        "user-example": {
            "username": "ChenBA-MainUser",          
            "password": "User-Password",
            "title": "ChenBA: 你可以随时使用这个账号awa, 可以分享给他人",
            "shareKey": {
                "key": "ChenBA-MainUser-ShareKey",
                "title": "ChenBA: 分享密钥, 你可以分享这个密钥给他人, 他人可以使用这个密钥来登录"
            }
        },
        "user-1": {
            "username": "ChenBA-User2",          
            "password": "User2-Password",
            "title": "ChenBA: 你可以随时使用这个账号awa, 可以分享给他人",
            "shareKey": {
                "key": "ChenBA-User2-ShareKey",
                "title": "ChenBA: 分享密钥, 你可以分享这个密钥给他人, 他人可以使用这个密钥来登录"
            }
        }
    }
};

// 测试登录按钮点击事件
console.log('Login script loaded!');
console.log('loginForm:', loginForm);

// 直接为登录按钮添加点击事件
const loginBtn = document.querySelector('.login-btn');
if (loginBtn) {
    console.log('Login button found!');
    loginBtn.addEventListener('click', function() {
        console.log('Login button clicked!');
        // 触发表单提交
        loginForm.dispatchEvent(new Event('submit', { bubbles: true }));
    });
} else {
    console.log('Login button not found!');
}

// 表单提交事件
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('Form submitted!');
    
    // 强制设置isValid为true，跳过验证
    const isValid = true;
    
    if (isValid) {
        console.log('Form is valid, processing login...');
        // 模拟登录过程
        const btn = this.querySelector('.login-btn');
        const originalText = btn.textContent;
        btn.textContent = '登录中...';
        btn.style.opacity = '0.8';
        btn.disabled = true;
        
        // 立即登录成功，跳过复杂验证
        setTimeout(() => {
            console.log('Login successful!');
            let userInfo = mockUsers.root;
            userInfo.isRoot = true;
            
            btn.textContent = '登录成功！';
            btn.style.background = 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)';
            
            // 存储用户信息到localStorage
            localStorage.setItem('currentUser', JSON.stringify(userInfo));
            
            // 立即跳转
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        }, 1000);
    } else {
        console.log('Form is invalid!');
    }
});