let isAdmin = false;

function login() {
    const username = document.getElementById('username')?.value.trim();
    const password = document.getElementById('password')?.value;
    const errorEl = document.getElementById('login-error');

    if (!CONFIG) {
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
        statusEl.innerHTML = '<span style="color:red;">حجم فایل حداکثر ۲۵ مگابایت است.</span>';
        return;
    }

    statusEl.innerHTML = 'در حال تبدیل فایل...';
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result.split(',')[1];
        statusEl.innerHTML = 'در حال آپلود...';

        fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'upload',
                title: title,
                genre: genre,
                status: status,
                fileName: file.name,
                fileData: base64
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                statusEl.innerHTML = '<span style="color:green;">✅ آپلود موفق!</span>';
                document.getElementById('title').value = '';
                fileInput.value = '';
                loadVideos(true);
            } else {
                statusEl.innerHTML = `<span style="color:red;">❌ خطا: ${data.error}</span>`;
            }
        })
        .catch(err => {
            statusEl.innerHTML = `<span style="color:red;">❌ خطا در ارتباط: ${err.message}</span>`;
        });
    };
    reader.readAsDataURL(file);
}

function loadVideos(isAdminPage = false) {
    fetch(CONFIG.GOOGLE_SCRIPT_URL + '?action=list')
        .then(res => res.json())
        .then(videos => {
            const container = isAdminPage ? document.getElementById('video-list-admin') : document.getElementById('video-list');
            if (!container) return;
            container.innerHTML = '';

            videos
                .filter(v => v.status === 'active' || isAdminPage)
                .forEach((video, index) => {
                    const directUrl = getDirectUrl(video.url);
                    const div = document.createElement('div');
                    div.className = 'video-item';
                    div.innerHTML = `
                        <h3>${video.title} <small>(${video.genre})</small></h3>
                        ${isAdminPage ? `<p>وضعیت: ${video.status === 'active' ? 'فعال' : 'غیرفعال'}</p>` : ''}
                        <video controls style="width:100%; max-width:600px; border-radius:10px; margin-top:10px;">
                            <source src="${directUrl}" type="video/mp4">
                        </video>
                    `;
                    container.appendChild(div);
                    setTimeout(() => div.classList.add('show'), index * 100);
                });
        })
        .catch(err => console.error('خطا در بارگذاری ویدیوها:', err));
}

function getDirectUrl(driveUrl) {
    try {
        const id = driveUrl.match(/\/d\/(.*?)\//)[1];
        return `https://drive.google.com/uc?id=${id}&export=download`;
    } catch {
        return driveUrl;
    }
}

window.onload = () => {
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        isAdmin = true;
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('upload-panel').style.display = 'block';
        loadVideos(true);
    } else {
        loadVideos(false);
    }
};
