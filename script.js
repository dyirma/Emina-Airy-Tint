const STORAGE_KEY = 'emina_reviews';
const THEME_KEY = 'emina_theme';
const body = document.getElementById('body');
const themeToggle = document.getElementById('theme-toggle');
const reviewList = document.getElementById('review-list');
const testimonialForm = document.getElementById('testimonial-form');
const editTestiForm = document.getElementById('editTestiForm');
// Pastikan modal diinisialisasi setelah DOM dimuat
let editModal; 
const messageArea = document.getElementById('message-area');

// --- PWA Registration ---
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js', { scope: '/' })
            .then(() => console.log('Service Worker Registered successfully.'))
            .catch(err => console.log('Service Worker Registration Failed:', err));
    }
}

// --- Theme Toggling Logic ---
function applyTheme(theme) {
    if (theme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        body.classList.remove('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
    const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
}

// --- Testimonial CRUD Logic ---

// Helper untuk menampilkan pesan notifikasi
function showMessage(message, type = 'success') {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show custom-card" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    const alertElement = document.createElement('div');
    alertElement.innerHTML = alertHtml;
    messageArea.appendChild(alertElement.firstChild);

    setTimeout(() => {
        const bsAlert = bootstrap.Alert.getOrCreateInstance(alertElement.firstChild);
        bsAlert.close();
    }, 3000);
}

// Load testimonials from localStorage
function loadTestimonials() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [
        // Default reviews
        { id: 1, name: "Siti K.", comment: "Suka banget! Gelnya ringan, pas nge-blur jadi natural. Ga bikin bibir kering!", rating: 5 },
        { id: 2, name: "Gen Z Tester", comment: "Packaging Muzik Tiger-nya gemes banget! Bisa dijadiin gantungan tas, super on-the-go.", rating: 4 },
        { id: 3, name: "Dewi P.", comment: "Warnanya cakep-cakep, cocok buat daily. Tahan lama walau dipakai makan ringan.", rating: 5 }
    ];
}

// Save testimonials to localStorage
function saveTestimonials(testimonials) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testimonials));
}

// Render star rating
function renderRating(rating) {
    const fullStar = '<i class="fas fa-star text-warning"></i>';
    const emptyStar = '<i class="far fa-star text-warning"></i>';
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += (i <= rating) ? fullStar : emptyStar;
    }
    return stars;
}

// Render all testimonials to the DOM
function renderTestimonials() {
    const testimonials = loadTestimonials();
    reviewList.innerHTML = '';
    
    if (testimonials.length === 0) {
        reviewList.innerHTML = '<p class="text-center text-muted mt-5">Belum ada ulasan. Jadilah yang pertama!</p>';
        return;
    }

    testimonials.forEach(testi => {
        const ratingHtml = renderRating(testi.rating);
        const testiElement = document.createElement('div');
        testiElement.classList.add('custom-card', 'p-3', 'mb-3', 'testimonial-card');
        testiElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <h6 class="fw-bold mb-0 text-primary-emina">${testi.name}</h6>
                    <small class="text-muted">${ratingHtml}</small>
                </div>
                <div class="d-flex">
                    <button class="btn btn-sm btn-outline-secondary me-2" onclick="handleEdit(${testi.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="handleDelete(${testi.id})">
                        <i class="fas fa-trash-alt"></i> Hapus
                    </button>
                </div>
            </div>
            <p class="mb-0">${testi.comment}</p>
        `;
        reviewList.appendChild(testiElement);
    });
}

// Create (Add) testimonial
testimonialForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('reviewerName').value;
    const comment = document.getElementById('reviewComment').value;
    const rating = parseInt(document.getElementById('reviewRating').value);

    const testimonials = loadTestimonials();
    const newId = testimonials.length > 0 ? Math.max(...testimonials.map(t => t.id)) + 1 : 1;
    
    const newTesti = {
        id: newId,
        name: name,
        comment: comment,
        rating: rating
    };

    testimonials.push(newTesti);
    saveTestimonials(testimonials);
    renderTestimonials();
    testimonialForm.reset();
    showMessage('Testimoni berhasil ditambahkan! Terima kasih.');
});

// Update (Edit) handler
window.handleEdit = function(id) {
    const testimonials = loadTestimonials();
    const testi = testimonials.find(t => t.id === id);
    
    if (testi) {
        document.getElementById('editId').value = testi.id;
        document.getElementById('editNama').value = testi.name;
        document.getElementById('editKomentar').value = testi.comment;
        document.getElementById('editRating').value = testi.rating;
        editModal.show();
    } else {
        showMessage('Ulasan tidak ditemukan.', 'danger');
    }
}

editTestiForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('editId').value);
    const newName = document.getElementById('editNama').value;
    const newComment = document.getElementById('editKomentar').value;
    const newRating = parseInt(document.getElementById('editRating').value);

    let testimonials = loadTestimonials();
    const index = testimonials.findIndex(t => t.id === id);

    if (index !== -1) {
        testimonials[index].name = newName;
        testimonials[index].comment = newComment;
        testimonials[index].rating = newRating;
        saveTestimonials(testimonials);
        renderTestimonials();
        editModal.hide();
        showMessage('Testimoni berhasil diperbarui!');
    } else {
        showMessage('Gagal memperbarui ulasan.', 'danger');
    }
});

// Delete handler
window.handleDelete = function(id) {
    let testimonials = loadTestimonials();
    const newTestimonials = testimonials.filter(t => t.id !== id);
    
    saveTestimonials(newTestimonials);
    renderTestimonials();
    showMessage('Testimoni berhasil dihapus.');
}

// --- Product Slider Logic ---
let currentIndex = 0;
const slider = document.getElementById('productSlider');
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;

function updateSlider() {
    // Calculate translation distance
    const offset = -currentIndex * 100;
    slider.style.transform = `translateX(${offset}%)`;
}

window.moveSlider = function(direction) {
    currentIndex += direction;

    // Handle wrapping (looping)
    if (currentIndex >= totalSlides) {
        currentIndex = 0;
    } else if (currentIndex < 0) {
        currentIndex = totalSlides - 1;
    }
    updateSlider();
}

// Auto-slide feature
let slideInterval;

function startSlider() {
    slideInterval = setInterval(() => moveSlider(1), 5000);
}

function stopSlider() {
    clearInterval(slideInterval);
}


// Initial setup on load
document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi modal setelah DOM siap
    editModal = new bootstrap.Modal(document.getElementById('editModal'));

    // Apply theme on load
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(savedTheme);
    themeToggle.addEventListener('click', toggleTheme);
    
    // Render testimonials
    renderTestimonials();
    
    // Start slider and events
    if (slider) {
        startSlider();
        slider.parentElement.addEventListener('mouseenter', stopSlider);
        slider.parentElement.addEventListener('mouseleave', startSlider);
    }
    
    // Register PWA service worker
    registerServiceWorker();
});