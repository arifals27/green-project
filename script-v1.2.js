let globalDatabase = {};

// Load data on homepage
async function loadData() {
    try {
        const response = await fetch('database-v1.2.json');
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
                <img src="${item.image}" alt="${item.name}" loading="lazy">
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
            const response = await fetch('database-v1.2.json');
            const arrayData = await response.json();
            arrayData.forEach(item => { globalDatabase[item.id] = item; });
            data = globalDatabase[id];
        } catch(error) {
            console.error(error);
        }
    }

    if (!data) {
        content.innerHTML = `<div style="padding: 100px 20px; text-align: center;">
            <h2>Data belum ditambahkan.</h2>
            <button onclick="window.location.href='index.html'" class="btn-explore" style="margin-top:20px;">Kembali ke Home</button>
        </div>`;
        return;
    }
document.title = data.name + " - EcoMap Malang Raya";
    // Generate HTML for Flora Grid
    const floraHtml = `
        <div class="species-badge" style="text-align: center; justify-content: center; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-leaf"></i> Flora</div>
        <div class="species-grid">
            ${data.flora.map(item => `
                <div class="species-card">
                    <img src="${item.image}" alt="${item.latin}" loading="lazy" onclick="openLightbox(this.src)" style="cursor: pointer;">
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
                    <img src="${item.image}" alt="${item.latin}" loading="lazy" onclick="openLightbox(this.src)" style="cursor: pointer;">
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

            ${data.fun_fact ? `
            <div class="highlight-box gradient-bg" style="margin-bottom: 32px; cursor: pointer; transition: all 0.3s ease; box-shadow: var(--shadow-md);" onmouseover="this.style.boxShadow='var(--shadow-lg)'; this.style.transform='translateY(-4px)';" onmouseout="this.style.boxShadow='var(--shadow-md)'; this.style.transform='translateY(0)';">
                <div class="icon-pulse">
                    <i class="fa-solid fa-lightbulb"></i>
                </div>
                <div class="highlight-info">
                    <h4 style="color: white; margin-bottom: 6px;">Fakta Menarik</h4>
                    <p style="color: rgba(255,255,255,0.95); font-size: 0.9rem;">${data.fun_fact}</p>
                </div>
            </div>
            ` : ''}

            ${data.wisdom.image ? `
            <div style="margin-bottom: 16px;">
                <img src="${data.wisdom.image}" alt="${data.wisdom.title}" loading="lazy" onclick="openLightbox(this.src)" style="width: 100%; border-radius: 8px; object-fit: cover; max-height: 250px; cursor: pointer;">
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

// Lightbox Logic
window.openLightbox = function(src) {
    let lightbox = document.getElementById('lightbox-modal');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'lightbox-modal';
        lightbox.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; display:flex; justify-content:center; align-items:center; opacity:0; transition:opacity 0.3s ease; padding: 20px;';
        lightbox.innerHTML = `
            <span style="position:absolute; top:20px; right:20px; color:white; font-size:2.5rem; cursor:pointer; line-height: 1;" onclick="closeLightbox()">&times;</span>
            <img id="lightbox-img" src="" style="max-width:100%; max-height:90vh; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.5); transform:scale(0.8); transition:transform 0.3s ease; object-fit:contain;">
        `;
        lightbox.onclick = function(e) {
            if (e.target === lightbox) closeLightbox();
        };
        document.body.appendChild(lightbox);
    }
    const img = document.getElementById('lightbox-img');
    img.src = src;
    
    lightbox.style.display = 'flex';
    setTimeout(() => {
        lightbox.style.opacity = '1';
        img.style.transform = 'scale(1)';
    }, 10);
};

window.closeLightbox = function() {
    const lightbox = document.getElementById('lightbox-modal');
    if (lightbox) {
        lightbox.style.opacity = '0';
        document.getElementById('lightbox-img').style.transform = 'scale(0.8)';
        setTimeout(() => {
            lightbox.style.display = 'none';
        }, 300);
    }
};
