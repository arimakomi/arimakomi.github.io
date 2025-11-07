// script.js
let isAdmin = false;

function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if (user === CONFIG.ADMIN_USERNAME && pass === CONFIG.ADMIN_PASSWORD) {
        isAdmin = true;
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('upload-panel').style.display = 'block';
        loadVideos(true);
    } else {
        alert('نام کاربری یا رمز عبور اشتباه است!');
    }
}

function logout() {
    isAdmin = false;
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('upload-panel').style.display = 'none';
}

function checkLogin() {
    if (window.location.href.includes('admin.html') && !isAdmin) {
        // فقط فرم ورود نشان داده شود
    }
}

function uploadVideo() {
    const file = document.getElementById('video-file').files[0];
    const title = document.getElementById('title').value;
    const genre = document.getElementById('genre').value;
    const status = document.getElementById('status').value;
    const statusEl = document.getElementById('upload-status');

    if (!file || !title) {
        statusEl.innerHTML = '<span style="color:red;">عنوان و فایل الزامی است.</span>';
        return;
    }

    statusEl.innerHTML = 'در حال آپلود...';
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result.split(',')[1];

        fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'upload',
                title: title,
                genre: genre,
                status: status,
                fileName: file.name,
                fileData: base64
            })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                statusEl.innerHTML = '<span style="color:green;">آپلود موفق!</span>';
                loadVideos(true);
            } else {
                statusEl.innerHTML = '<span style="color:red;">خطا: ' + data.error + '</span>';
            }
        });
    };
    reader.readAsDataURL(file);
}

function loadVideos(isAdminPage = false) {
    fetch(CONFIG.GOOGLE_SCRIPT_URL + '?action=list')
        .then(r => r.json())
        .then(videos => {
            const container = isAdminPage ? document.getElementById('video-list-admin') : document.getElementById('video-list');
            container.innerHTML = '';

            videos
                .filter(v => v.status === 'active' || isAdminPage)
                .forEach(video => {
                    const div = document.createElement('div');
                    div.className = 'video-item';
                    div.innerHTML = `
                        <h3>${video.title} <small>(${video.genre})</small></h3>
                        ${isAdminPage ? `<p>وضعیت: ${video.status === 'active' ? 'فعال' : 'غیرفعال'}</p>` : ''}
                        <video controls>
                            <source src="${video.url}" type="video/mp4">
                            مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                        </video>
                    `;
                    container.appendChild(div);
                });
        });
}
