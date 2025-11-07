let isAdmin = false;

function login() {
  const username = document.getElementById('username')?.value.trim();
  const password = document.getElementById('password')?.value;
  const errorEl = document.getElementById('login-error');

  if (username === CONFIG.ADMIN_USERNAME && password === CONFIG.ADMIN_PASSWORD) {
    isAdmin = true;
    localStorage.setItem('adminLoggedIn', 'true');
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('upload-panel').style.display = 'block';
    loadVideos(true);
    if (errorEl) errorEl.style.display = 'none';
  } else {
    errorEl.textContent = 'نام کاربری یا رمز عبور اشتباه است.';
    errorEl.style.display = 'block';
  }
}

function logout() {
  isAdmin = false;
  localStorage.removeItem('adminLoggedIn');
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('upload-panel').style.display = 'none';
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

  statusEl.innerHTML = 'در حال آماده‌سازی...';
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result.split(',')[1];
    statusEl.innerHTML = 'در حال آپلود...';

    fetch(CONFIG.WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upload',
        title,
        genre,
        status,
        fileName: file.name,
        fileData: base64
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        statusEl.innerHTML = '<span style="color:green;">✅ آپلود موفق!</span>';
        fileInput.value = '';
        document.getElementById('title').value = '';
        loadVideos(true);
      } else {
        statusEl.innerHTML = `<span style="color:red;">خطا: ${data.error}</span>`;
      }
    })
    .catch(err => {
      statusEl.innerHTML = `<span style="color:red;">خطا در ارتباط: ${err.message}</span>`;
    });
  };
  reader.readAsDataURL(file);
}

function loadVideos(isAdminPage = false) {
  fetch(CONFIG.WORKER_URL + '?action=list')
    .then(res => res.json())
    .then(videos => {
      const container = isAdminPage ? document.getElementById('video-list-admin') : document.getElementById('video-list');
      if (!container) return;
      container.innerHTML = '';
      videos.filter(v => v.status === 'active' || isAdminPage).forEach(video => {
        const fullUrl = CONFIG.WORKER_URL + video.url;
        const div = document.createElement('div');
        div.className = 'video-item';
        div.innerHTML = `
          <h3>${video.title} <small>(${video.genre})</small></h3>
          ${isAdminPage ? `<p>وضعیت: ${video.status}</p>` : ''}
          <video controls style="width:100%;max-width:600px;">
            <source src="${fullUrl}" type="video/mp4">
          </video>
        `;
        container.appendChild(div);
      });
    })
    .catch(err => console.error('خطا در بارگذاری:', err));
}
