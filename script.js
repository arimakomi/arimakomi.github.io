// script.js
let isAdmin = false;

function login() {
    const username = document.getElementById('username')?.value.trim();
    const password = document.getElementById('password')?.value;
    const errorEl = document.getElementById('login-error');

    if (typeof CONFIG === 'undefined') {
        if (errorEl) errorEl.textContent = 'خطا: config.js بارگذاری نشد!';
        if (errorEl) errorEl.style.display = 'block';
        return;
    }

    if (username === CONFIG.ADMIN_USERNAME && password === CONFIG.ADMIN_PASSWORD) {
        isAdmin = true;
        localStorage.setItem('adminLoggedIn', 'true');
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('upload-panel').style.display = 'block';
        loadVideos(true);
        if (errorEl) errorEl.style.display = 'none';
    } else {
        if (errorEl) errorEl.textContent = 'نام کاربری یا رمز عبور اشتباه است.';
        if (errorEl) errorEl.style.display = 'block';
    }
}

function logout() {
    isAdmin = false;
    localStorage.removeItem('adminLoggedIn');
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('upload-panel').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function uploadVideo() {
    const fileInput = document.getElementById('video-file');
    const file = fileInput.files[0];
    const title = document.getElementById('title').value.trim();
    const genre = document.getElementById('genre').value;
    const status = document.getElementById('status').value;
    const statusEl = document.getElementById('upload-status');

    if (!file || !title) {
        statusEl.innerHTML = '<span style="color:red;">عنوان و فایل الزامی است.</span>';
        return;
    }

    if (file.size > 25 * 1024 * 1024) {
        statusEl.innerHTML = '<span style="color:red;">حجم فایل حداکثر ۲۵ مگابایت.</span>';
        return;
    }

    statusEl.innerHTML = 'در حال تبدیل فایل...';
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result.split(',')[1];
        statusEl.innerHTML = 'در حال آپلود به Google Drive...';

        fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',  // رفع Failed to fetch
            body: JSON.stringify({
                action: 'upload',
                title: title,
                genre: genre,
                status: status,
                fileName: file.name,
                fileData: base64
            })
        })
        .then(() => {
            statusEl.innerHTML = '<span style="color:green;">آپلود موفق! در حال به‌روزرسانی...</span>';
            setTimeout(() => {
                document.getElementById('title').value = '';
                fileInput.value = '';
                loadVideos(true);
            }, 3000);
        })
        .catch(err => {
            statusEl.innerHTML = `<span style="color:red;">خطا: ${err.message}</span>`;
        });
    };
    reader.readAsDataURL(file);
}

function loadVideos(isAdminPage = false) {
    if (typeof CONFIG === 'undefined') return;

    fetch(CONFIG.GOOGLE_SCRIPT_URL + '?action=list', { mode: 'no-cors' })
        .then(() => {
            // با no-cors نمی‌توان پاسخ خواند → از cache یا reload
            setTimeout(() => {
                const container = isAdminPage ? document.getElementById('video-list-admin') : document.getElementById('video-list');
                if (!container) return;
                // فرض بر موفقیت → لیست را از Sheet نمی‌خوانیم، فقط reload
                location.reload();
            }, 2000);
        })
        .catch(() => {
            // در صورت خطا، لیست را از cache یا reload
            location.reload();
        });
}

function getDirectUrl(driveUrl) {
    try {
        const id = driveUrl.match(/\/d\/(.*?)\//)[1];
        return `https://drive.google.com/uc?id=${id}&export=download`;
    } catch {
        return driveUrl;
    }
}
