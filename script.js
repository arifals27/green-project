let globalDatabase = {};

// Load data on homepage
async function loadData() {
    try {
        const response = await fetch('database.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        // Cache globally for detail page routing
        data.forEach(item => {
            globalDatabase[item.id] = item;
        });

        renderCards(data);
    } catch (error) {
        console.error('Error loading database:', error);
        const container = document.getElementById('cardContainer');
        if (container) {
            container.innerHTML = 
                '<div style="text-align:center; padding: 20px;"><p style="color:red; font-size: 0.9rem;">Gagal memuat data dari database.json.<br>Note: Jika file dijalankan langsung lokal tanpa server (file:///...), URL fetch JSON diblokir browser. Gunakan extension Live Server di VS Code untuk membukanya.</p></div>';
        }
    }
}

// Generate the HTML cards from data
function renderCards(data) {
    const container = document.getElementById('cardContainer');
    if (!container) return; // Not on homepage

    if (data.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding: 40px; color: var(--text-muted);"><i class="fa-solid fa-search" style="font-size: 2rem; margin-bottom: 12px; opacity: 0.5;"></i><br>Tidak ada destinasi wisata yang cocok dengan pencarian Anda.</div>';
        return;
    }

    const html = data.map(item => `
        <article class="ecocard" onclick="openDetail('${item.id}')">
            <div class="card-image-wrapper">
                <img src="${item.image}" alt="${item.name}">
                <span class="badge text-${item.badge.color}"><i class="fa-solid ${item.badge.icon}"></i> ${item.badge.text}</span>
            </div>
            <div class="card-content">
                <h3>${item.name}</h3>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">
                    Credit photo: <a href="${item.credit.url}" target="_blank" style="color: var(--blue-primary); text-decoration: none;">${item.credit.text}</a>
                </p>
                <p class="location" style="line-height: 1.4;"><i class="fa-solid fa-location-dot"></i> ${item.location}</p>
                
                <p style="font-size: 0.85rem; margin-bottom: 16px; color: var(--text-main); display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                    ${item.desc.replace(/<br>/g, ' ')}
                </p>
            </div>
        </article>
    `).join('');

    container.innerHTML = html;
}

// Navigate to detail page
function openDetail(id) {
    window.location.href = `detail.html?id=${id}`;
}

// Initialize detail page logic
async function initDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const content = document.getElementById('detailContent');
    
    let data = globalDatabase[id];
    
    // Fetch if accessed directly / empty global cache
    if (!data) {
        try {
            const response = await fetch('database.json');
            const arrayData = await response.json();
            arrayData.forEach(item => { globalDatabase[item.id] = item; });
            data = globalDatabase[id];
        } catch(error) {
            console.error(error);
        }
    }

    if (!data) {
        content.innerHTML = `<div style="padding: 100px 20px; text-align: center;">
            <h2>Data tidak ditemukan atau error CORS</h2>
            <button onclick="window.location.href='index.html'" class="btn-explore" style="margin-top:20px;">Kembali ke Home</button>
        </div>`;
        return;
    }

    // Generate HTML for Flora Grid
    const floraHtml = `
        <div class="species-badge" style="text-align: center; justify-content: center; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-leaf"></i> Flora</div>
        <div class="species-grid">
            ${data.flora.map(item => `
                <div class="species-card">
                    <img src="${item.image}" alt="${item.latin}">
                    <p>${item.latin}</p>
                </div>
            `).join('')}
        </div>
    `;

    // Generate HTML for Fauna Grid
    const faunaHtml = `
        <div class="species-badge fauna" style="text-align: center; justify-content: center; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-paw"></i> Fauna</div>
        <div class="species-grid">
            ${data.fauna.map(item => `
                <div class="species-card">
                    <img src="${item.image}" alt="${item.latin}">
                    <p>${item.latin}</p>
                </div>
            `).join('')}
        </div>
    `;

    content.innerHTML = `
        <div class="detail-header" style="height: 350px;">
            <img src="${data.image}" alt="${data.name}">
        </div>
        <div class="detail-body" style="margin-top: -40px; box-shadow: 0 -10px 20px rgba(0,0,0,0.1);">
            ${data.credit ? `
            <p style="font-size: 0.75rem; color: #757575; text-align: right; margin-bottom: 8px;">
                Credit photo: <a href="${data.credit.url}" target="_blank" style="color: var(--blue-primary); text-decoration: none;">${data.credit.text}</a>
            </p>
            ` : ''}
            
            <h2 class="detail-title">${data.name}</h2>
            <p class="location" style="margin-bottom: 24px;"><i class="fa-solid fa-location-dot"></i> ${data.location}</p>
            
            <div class="detail-desc" style="font-size: 1rem; line-height: 1.7; white-space: pre-wrap; margin-bottom: 32px;">${data.content}</div>

            ${data.wisdom.image ? `
            <div style="margin-bottom: 16px;">
                <img src="${data.wisdom.image}" alt="${data.wisdom.title}" style="width: 100%; border-radius: 8px; object-fit: cover; max-height: 250px;">
                ${data.wisdom.credit ? `
                <p style="font-size: 0.75rem; color: #757575; text-align: right; margin-top: 4px; margin-bottom: 0;">
                    Credit photo: <a href="${data.wisdom.credit.url}" target="_blank" style="color: #2E8B57; text-decoration: none;">${data.wisdom.credit.text}</a>
                </p>
                ` : ''}
            </div>
            ` : ''}
            
            <div style="font-size: 1rem; line-height: 1.7; white-space: pre-wrap; margin-bottom: 32px;">${data.wisdom.text}</div>

            ${floraHtml}
            
            ${data.rujukan_flora && data.rujukan_flora.length > 0 ? `
            <div style="margin-top: 16px; margin-bottom: 32px;">
                <h4 style="font-size: 0.9rem; margin-bottom: 8px;">Daftar Rujukan Flora:</h4>
                <ol style="font-size: 0.75rem; color: var(--blue-primary); padding-left: 20px; word-break: break-all;">
                    ${data.rujukan_flora.map(link => `<li style="margin-bottom: 4px;"><a href="${link}" target="_blank" style="color: inherit; text-decoration: underline;">${link}</a></li>`).join('')}
                </ol>
            </div>
            ` : ''}

            ${faunaHtml}

            ${data.rujukan_fauna && data.rujukan_fauna.length > 0 ? `
            <div style="margin-top: 16px; margin-bottom: 32px;">
                <h4 style="font-size: 0.9rem; margin-bottom: 8px;">Daftar Rujukan Fauna:</h4>
                <ol style="font-size: 0.75rem; color: var(--blue-primary); padding-left: 20px; word-break: break-all;">
                    ${data.rujukan_fauna.map(link => `<li style="margin-bottom: 4px;"><a href="${link}" target="_blank" style="color: inherit; text-decoration: underline;">${link}</a></li>`).join('')}
                </ol>
            </div>
            ` : ''}

            <h3 class="section-label" style="margin-top: 32px;"><i class="fa-solid fa-map-location-dot text-blue"></i> Lokasi Spesifik</h3>
            <div class="mini-map" style="border-radius: 12px; overflow: hidden; height: 250px; position: relative;">
                ${data.map_url ? `
                <iframe 
                    width="100%" 
                    height="100%" 
                    frameborder="0" 
                    scrolling="no" 
                    marginheight="0" 
                    marginwidth="0" 
                    src="${data.map_url}"
                    style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
                ></iframe>
                ` : `
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Mini Map" style="width: 100%; height: 100%; object-fit: cover;">
                <div class="mini-map-pin" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--red-primary); font-size: 2rem;"><i class="fa-solid fa-location-dot"></i></div>
                `}
            </div>
            
            <div style="height: 40px;"></div>
        </div>
    `;
}

// Initialization Logic
document.addEventListener('DOMContentLoaded', () => {
    // If we are on the homepage (cardContainer exists) -> load data to generate cards
    if (document.getElementById('cardContainer')) {
        loadData();
    }

    // Sidebar Menu Logic
    const openSidebarBtn = document.getElementById('openSidebarBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (openSidebarBtn && sidebarMenu) {
        openSidebarBtn.addEventListener('click', () => {
            sidebarMenu.classList.add('active');
            sidebarOverlay.classList.add('active');
        });

        const closeSidebar = () => {
            sidebarMenu.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        };

        closeSidebarBtn.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
    
    // Search Functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const allData = Object.values(globalDatabase);
            const filteredData = allData.filter(item => {
                const nameMatch = item.name.toLowerCase().includes(searchTerm);
                const locationMatch = item.location.toLowerCase().includes(searchTerm);
                const descMatch = item.desc.toLowerCase().includes(searchTerm);
                return nameMatch || locationMatch || descMatch;
            });
            renderCards(filteredData);
        });
    }

    // Bottom Nav interactivity
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });


});
