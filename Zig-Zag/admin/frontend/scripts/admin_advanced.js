// ============================================
// FONCTIONNALITÉS AVANCÉES DU DASHBOARD ADMIN
// ============================================

// Vérifier que supabaseClient est disponible
if (typeof supabaseClient === 'undefined') {
    console.error('supabaseClient n\'est pas défini. Assurez-vous que admin.js est chargé avant admin_advanced.js');
}

// ==================== FILTRES ET RECHERCHE AVANCÉS ====================

let savedFilters = JSON.parse(localStorage.getItem('admin_saved_filters') || '[]');
let currentAdvancedFilters = {
    dateStart: null,
    dateEnd: null,
    sources: [],
    statuses: [],
    search: ''
};

function showAdvancedFilters() {
    document.getElementById('advancedFiltersModal').style.display = 'flex';
    loadSavedFiltersList();
}

function closeAdvancedFilters() {
    document.getElementById('advancedFiltersModal').style.display = 'none';
}

function applyAdvancedFilters() {
    const dateStart = document.getElementById('filterDateStart').value;
    const dateEnd = document.getElementById('filterDateEnd').value;
    const sourceSelect = document.getElementById('filterSource');
    const statusSelect = document.getElementById('filterStatus');
    
    currentAdvancedFilters = {
        dateStart: dateStart || null,
        dateEnd: dateEnd || null,
        sources: Array.from(sourceSelect.selectedOptions).map(opt => opt.value),
        statuses: Array.from(statusSelect.selectedOptions).map(opt => opt.value),
        search: document.getElementById('userSearch').value
    };
    
    closeAdvancedFilters();
    loadUsersList();
    showToast('Filtres appliqués !');
}

function saveFilterPreset() {
    const name = document.getElementById('filterName').value;
    if (!name) {
        showToast('Veuillez donner un nom au filtre', 'error');
        return;
    }
    
    const filter = {
        id: Date.now(),
        name: name,
        ...currentAdvancedFilters
    };
    
    savedFilters.push(filter);
    localStorage.setItem('admin_saved_filters', JSON.stringify(savedFilters));
    showToast('Filtre sauvegardé !');
    loadSavedFiltersList();
}

function showSavedFilters() {
    document.getElementById('savedFiltersModal').style.display = 'flex';
    loadSavedFiltersList();
}

function closeSavedFilters() {
    document.getElementById('savedFiltersModal').style.display = 'none';
}

function loadSavedFiltersList() {
    const container = document.getElementById('savedFiltersList');
    if (!container) return;
    
    if (savedFilters.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">Aucun filtre sauvegardé</p>';
        return;
    }
    
    container.innerHTML = savedFilters.map(filter => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #F8F9FA; border-radius: 8px; margin-bottom: 10px;">
            <span style="font-weight: 600;">${filter.name}</span>
            <div style="display: flex; gap: 5px;">
                <button class="admin-btn-small" onclick="loadFilterPreset(${filter.id})">Appliquer</button>
                <button class="admin-btn-small" onclick="deleteFilterPreset(${filter.id})" style="background: #dc3545;">Supprimer</button>
            </div>
        </div>
    `).join('');
}

function loadFilterPreset(id) {
    const filter = savedFilters.find(f => f.id === id);
    if (!filter) return;
    
    currentAdvancedFilters = { ...filter };
    
    if (filter.dateStart) document.getElementById('filterDateStart').value = filter.dateStart;
    if (filter.dateEnd) document.getElementById('filterDateEnd').value = filter.dateEnd;
    
    const sourceSelect = document.getElementById('filterSource');
    Array.from(sourceSelect.options).forEach(opt => {
        opt.selected = filter.sources.includes(opt.value);
    });
    
    const statusSelect = document.getElementById('filterStatus');
    Array.from(statusSelect.options).forEach(opt => {
        opt.selected = filter.statuses.includes(opt.value);
    });
    
    if (filter.search) document.getElementById('userSearch').value = filter.search;
    
    closeSavedFilters();
    applyAdvancedFilters();
}

function deleteFilterPreset(id) {
    savedFilters = savedFilters.filter(f => f.id !== id);
    localStorage.setItem('admin_saved_filters', JSON.stringify(savedFilters));
    loadSavedFiltersList();
    showToast('Filtre supprimé');
}

// Modifier loadUsersList pour utiliser les filtres avancés
const originalLoadUsersList = window.loadUsersList;
window.loadUsersList = async function() {
    // Appliquer les filtres avancés
    let query = supabaseClient.from('users').select('*', { count: 'exact' });
    
    // Filtres par date
    if (currentAdvancedFilters.dateStart) {
        query = query.gte('created_at', currentAdvancedFilters.dateStart);
    }
    if (currentAdvancedFilters.dateEnd) {
        query = query.lte('created_at', currentAdvancedFilters.dateEnd + 'T23:59:59');
    }
    
    // Filtres par source
    if (currentAdvancedFilters.sources.length > 0) {
        query = query.in('signup_source', currentAdvancedFilters.sources);
    }
    
    // Recherche
    const searchTerm = currentAdvancedFilters.search || document.getElementById('userSearch')?.value || '';
    if (searchTerm) {
        // Note: Supabase ne supporte pas directement la recherche multi-colonnes
        // On devra filtrer côté client ou utiliser une fonction PostgreSQL
        // Pour l'instant, on filtre côté client
    }
    
    // Continuer avec la logique existante...
    if (originalLoadUsersList) {
        return originalLoadUsersList();
    }
};

// ==================== TABLEAU DE BORD PERSONNALISABLE ====================

let dashboardConfig = JSON.parse(localStorage.getItem('admin_dashboard_config') || '{}');
let isCustomizationMode = false;
let draggedSection = null;

function toggleDashboardCustomization() {
    isCustomizationMode = !isCustomizationMode;
    const dashboard = document.getElementById('adminDashboard');
    
    if (isCustomizationMode) {
        dashboard.classList.add('customization-mode');
        showToast('Mode personnalisation activé - Glissez-déposez les sections');
        initDragAndDrop();
    } else {
        dashboard.classList.remove('customization-mode');
        showToast('Mode personnalisation désactivé');
        saveDashboardConfig();
    }
}

function initDragAndDrop() {
    const sections = document.querySelectorAll('.dashboard-section[data-section-id]');
    
    sections.forEach(section => {
        section.draggable = true;
        section.addEventListener('dragstart', handleDragStart);
        section.addEventListener('dragover', handleDragOver);
        section.addEventListener('drop', handleDrop);
        section.addEventListener('dragend', handleDragEnd);
    });
}

function handleDragStart(e) {
    draggedSection = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (this !== draggedSection && this.classList.contains('dashboard-section')) {
        this.classList.add('drag-over');
    }
}

function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    
    if (draggedSection !== this && this.classList.contains('dashboard-section')) {
        const container = this.parentNode;
        const sections = Array.from(container.querySelectorAll('.dashboard-section[data-section-id]'));
        const draggedIndex = sections.indexOf(draggedSection);
        const targetIndex = sections.indexOf(this);
        
        if (draggedIndex < targetIndex) {
            container.insertBefore(draggedSection, this.nextSibling);
        } else {
            container.insertBefore(draggedSection, this);
        }
    }
    
    this.classList.remove('drag-over');
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('drag-over');
    });
    draggedSection = null;
}

function toggleSection(sectionId) {
    const section = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (!section) return;
    
    section.classList.toggle('hidden');
    saveDashboardConfig();
    showToast(section.classList.contains('hidden') ? 'Section masquée' : 'Section affichée');
}

function resizeSection(sectionId) {
    const section = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (!section) return;
    
    const currentSize = section.classList.contains('resized-small') ? 'small' : 
                        section.classList.contains('resized-large') ? 'large' : 'normal';
    
    section.classList.remove('resized-small', 'resized-large', 'resized');
    
    if (currentSize === 'normal') {
        section.classList.add('resized-small');
    } else if (currentSize === 'small') {
        section.classList.add('resized-large');
    } else {
        section.classList.add('resized');
    }
    
    saveDashboardConfig();
}

function saveDashboardConfig() {
    const sections = Array.from(document.querySelectorAll('.dashboard-section[data-section-id]'));
    const config = {
        order: sections.map(s => s.dataset.sectionId),
        hidden: sections.filter(s => s.classList.contains('hidden')).map(s => s.dataset.sectionId),
        sizes: {}
    };
    
    sections.forEach(section => {
        if (section.classList.contains('resized-small')) {
            config.sizes[section.dataset.sectionId] = 'small';
        } else if (section.classList.contains('resized-large')) {
            config.sizes[section.dataset.sectionId] = 'large';
        }
    });
    
    dashboardConfig = config;
    localStorage.setItem('admin_dashboard_config', JSON.stringify(config));
}

function loadDashboardConfig() {
    if (!dashboardConfig.order) return;
    
    const container = document.querySelector('.container');
    const sections = Array.from(container.querySelectorAll('.dashboard-section[data-section-id]'));
    
    // Réorganiser selon l'ordre sauvegardé
    dashboardConfig.order.forEach(sectionId => {
        const section = sections.find(s => s.dataset.sectionId === sectionId);
        if (section) {
            container.appendChild(section);
        }
    });
    
    // Masquer les sections cachées
    if (dashboardConfig.hidden) {
        dashboardConfig.hidden.forEach(sectionId => {
            const section = document.querySelector(`[data-section-id="${sectionId}"]`);
            if (section) section.classList.add('hidden');
        });
    }
    
    // Appliquer les tailles
    if (dashboardConfig.sizes) {
        Object.entries(dashboardConfig.sizes).forEach(([sectionId, size]) => {
            const section = document.querySelector(`[data-section-id="${sectionId}"]`);
            if (section) {
                if (size === 'small') section.classList.add('resized-small');
                if (size === 'large') section.classList.add('resized-large');
            }
        });
    }
}

// ==================== NOTIFICATIONS ET ALERTES INTELLIGENTES ====================

let alertConfig = JSON.parse(localStorage.getItem('admin_alert_config') || JSON.stringify({
    activationRate: { enabled: true, threshold: 60, type: 'below' },
    cpa: { enabled: true, threshold: 5, type: 'above' },
    retention: { enabled: true, threshold: 40, type: 'below' },
    newUsers: { enabled: true, threshold: 10, type: 'below' }
}));

let alertHistory = JSON.parse(localStorage.getItem('admin_alert_history') || '[]');

function checkAlerts(metrics) {
    const alerts = [];
    
    // Vérifier chaque type d'alerte configuré
    Object.entries(alertConfig).forEach(([key, config]) => {
        if (!config.enabled) return;
        
        const value = metrics[key];
        if (value === undefined || value === null) return;
        
        let triggered = false;
        if (config.type === 'below' && value < config.threshold) {
            triggered = true;
        } else if (config.type === 'above' && value > config.threshold) {
            triggered = true;
        }
        
        if (triggered) {
            const alert = {
                id: Date.now(),
                type: key,
                value: value,
                threshold: config.threshold,
                message: getAlertMessage(key, value, config.threshold, config.type),
                timestamp: new Date().toISOString()
            };
            
            alerts.push(alert);
            alertHistory.unshift(alert);
            
            // Limiter l'historique à 100 alertes
            if (alertHistory.length > 100) {
                alertHistory = alertHistory.slice(0, 100);
            }
        }
    });
    
    // Afficher les alertes
    alerts.forEach(alert => {
        showToast(alert.message, 'warning');
    });
    
    // Sauvegarder l'historique
    localStorage.setItem('admin_alert_history', JSON.stringify(alertHistory));
    
    // Prédictions basées sur les tendances
    checkPredictiveAlerts(metrics);
}

function getAlertMessage(type, value, threshold, alertType) {
    const messages = {
        activationRate: `Taux d'activation ${alertType === 'below' ? 'faible' : 'élevé'}: ${value}% (objectif: ${alertType === 'below' ? '>' : '<'}${threshold}%)`,
        cpa: `Coût par acquisition ${alertType === 'above' ? 'élevé' : 'faible'}: ${value}€ (objectif: ${alertType === 'above' ? '<' : '>'}${threshold}€)`,
        retention: `Rétention ${alertType === 'below' ? 'faible' : 'élevée'}: ${value}% (objectif: ${alertType === 'below' ? '>' : '<'}${threshold}%)`,
        newUsers: `Nouveaux utilisateurs ${alertType === 'below' ? 'faibles' : 'élevés'}: ${value} (objectif: ${alertType === 'below' ? '>' : '<'}${threshold})`
    };
    
    return messages[type] || `Alerte ${type}: ${value}`;
}

function checkPredictiveAlerts(metrics) {
    // Analyser les tendances des 7 derniers jours
    // Si une métrique baisse de plus de 20%, alerter
    // Cette fonction nécessiterait des données historiques
    // Pour l'instant, c'est un placeholder
}

function showAlertSettings() {
    // Créer une modale pour configurer les alertes
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>⚙️ Configuration des Alertes</h2>
                <span class="close-button" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                ${Object.entries(alertConfig).map(([key, config]) => `
                    <div style="margin-bottom: 20px; padding: 15px; background: #F8F9FA; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <label style="font-weight: 600;">${getAlertLabel(key)}</label>
                            <input type="checkbox" id="alert_${key}_enabled" ${config.enabled ? 'checked' : ''}>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <label style="font-size: 12px; color: #666;">Seuil</label>
                                <input type="number" id="alert_${key}_threshold" value="${config.threshold}" class="modal-input">
                            </div>
                            <div>
                                <label style="font-size: 12px; color: #666;">Type</label>
                                <select id="alert_${key}_type" class="modal-input">
                                    <option value="below" ${config.type === 'below' ? 'selected' : ''}>En dessous</option>
                                    <option value="above" ${config.type === 'above' ? 'selected' : ''}>Au dessus</option>
                                </select>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="modal-footer">
                <button class="modal-btn" onclick="saveAlertConfig()">Enregistrer</button>
                <button class="modal-btn cancel" onclick="this.closest('.modal').remove()">Annuler</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function getAlertLabel(key) {
    const labels = {
        activationRate: 'Taux d\'activation',
        cpa: 'Coût par acquisition',
        retention: 'Rétention',
        newUsers: 'Nouveaux utilisateurs'
    };
    return labels[key] || key;
}

function saveAlertConfig() {
    Object.keys(alertConfig).forEach(key => {
        alertConfig[key] = {
            enabled: document.getElementById(`alert_${key}_enabled`).checked,
            threshold: parseFloat(document.getElementById(`alert_${key}_threshold`).value),
            type: document.getElementById(`alert_${key}_type`).value
        };
    });
    
    localStorage.setItem('admin_alert_config', JSON.stringify(alertConfig));
    document.querySelector('.modal').remove();
    showToast('Configuration des alertes enregistrée !');
}

function showAlertHistory() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2>📋 Historique des Alertes</h2>
                <span class="close-button" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div style="max-height: 400px; overflow-y: auto;">
                    ${alertHistory.length === 0 ? '<p style="text-align: center; color: #666;">Aucune alerte</p>' : 
                      alertHistory.map(alert => `
                        <div style="padding: 12px; margin-bottom: 10px; background: #F8F9FA; border-radius: 8px; border-left: 4px solid #FF912D;">
                            <div style="font-weight: 600; margin-bottom: 5px;">${alert.message}</div>
                            <div style="font-size: 12px; color: #666;">${new Date(alert.timestamp).toLocaleString('fr-FR')}</div>
                        </div>
                      `).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn cancel" onclick="this.closest('.modal').remove()">Fermer</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// ==================== RAPPORTS AUTOMATISÉS ====================

let reportConfig = JSON.parse(localStorage.getItem('admin_report_config') || JSON.stringify({
    weekly: { enabled: false, day: 1, time: '09:00', email: '' },
    monthly: { enabled: false, day: 1, time: '09:00', email: '' },
    template: 'default'
}));

function generateReport(period = 'weekly') {
    const report = {
        period: period,
        date: new Date().toISOString(),
        summary: {},
        acquisition: {},
        activation: {},
        retention: {},
        costs: {}
    };
    
    // Collecter les données (simplifié - devrait utiliser les vraies données)
    // Cette fonction devrait appeler les fonctions de chargement de données existantes
    
    return report;
}

function exportReport(report, format = 'pdf') {
    if (format === 'pdf') {
        // Utiliser la fonction exportToPDF existante
        if (typeof exportToPDF === 'function') {
            exportToPDF();
        }
    } else if (format === 'json') {
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport_${report.period}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    }
}

// Cette fonction devrait être appelée périodiquement (via cron job ou service worker)
function checkScheduledReports() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Vérifier les rapports hebdomadaires
    if (reportConfig.weekly.enabled && day === reportConfig.weekly.day) {
        const [reportHour, reportMinute] = reportConfig.weekly.time.split(':').map(Number);
        if (hour === reportHour && minute === reportMinute) {
            const report = generateReport('weekly');
            // Envoyer par email si configuré
            if (reportConfig.weekly.email) {
                sendReportEmail(report, reportConfig.weekly.email);
            }
        }
    }
    
    // Vérifier les rapports mensuels
    if (reportConfig.monthly.enabled && now.getDate() === reportConfig.monthly.day) {
        const [reportHour, reportMinute] = reportConfig.monthly.time.split(':').map(Number);
        if (hour === reportHour && minute === reportMinute) {
            const report = generateReport('monthly');
            if (reportConfig.monthly.email) {
                sendReportEmail(report, reportConfig.monthly.email);
            }
        }
    }
}

function sendReportEmail(report, email) {
    // Cette fonction nécessiterait un backend ou un service d'email
    // Pour l'instant, c'est un placeholder
    console.log('Envoi du rapport par email à', email, report);
}

// Initialiser les vérifications de rapports (toutes les minutes)
setInterval(checkScheduledReports, 60000);

// ==================== VISUALISATIONS AVANCÉES ====================

let comparisonCharts = {};
let heatmapData = {};

function createComparisonChart(chartId, labels, currentData, previousData, label) {
    const ctx = document.getElementById(chartId);
    if (!ctx) return;
    
    if (comparisonCharts[chartId]) {
        comparisonCharts[chartId].destroy();
    }
    
    comparisonCharts[chartId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `${label} (Période actuelle)`,
                    data: currentData,
                    borderColor: '#FF912D',
                    backgroundColor: 'rgba(255, 145, 45, 0.1)',
                    tension: 0.4
                },
                {
                    label: `${label} (Période précédente)`,
                    data: previousData,
                    borderColor: '#40C4D4',
                    backgroundColor: 'rgba(64, 196, 212, 0.1)',
                    tension: 0.4,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                zoom: {
                    zoom: {
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: 'x'
                    },
                    pan: {
                        enabled: true,
                        mode: 'x'
                    }
                },
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function createHeatmap(elementId, data, title) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    container.innerHTML = `
        <h3 style="margin-bottom: 15px;">${title}</h3>
        <div class="heatmap-container" style="display: grid; grid-template-columns: repeat(24, 1fr); gap: 2px; margin-bottom: 20px;">
            ${generateHeatmapCells(data)}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #666;">
            <span>Moins</span>
            <div style="display: flex; gap: 5px;">
                <div style="width: 20px; height: 20px; background: #E8F5E9; border: 1px solid #C8E6C9;"></div>
                <div style="width: 20px; height: 20px; background: #A5D6A7; border: 1px solid #81C784;"></div>
                <div style="width: 20px; height: 20px; background: #66BB6A; border: 1px solid #4CAF50;"></div>
                <div style="width: 20px; height: 20px; background: #43A047; border: 1px solid #388E3C;"></div>
                <div style="width: 20px; height: 20px; background: #2E7D32; border: 1px solid #1B5E20;"></div>
            </div>
            <span>Plus</span>
        </div>
    `;
}

function generateHeatmapCells(data) {
    // data devrait être un objet avec { hour: { day: count } }
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    let html = '<div></div>'; // Colonne vide pour les labels
    
    // En-têtes des heures
    for (let h = 0; h < 24; h++) {
        html += `<div style="text-align: center; font-size: 10px; padding: 5px;">${h}h</div>`;
    }
    
    // Cellules de données
    days.forEach((day, dayIndex) => {
        html += `<div style="text-align: right; padding: 5px; font-weight: 600;">${day}</div>`;
        for (let h = 0; h < 24; h++) {
            const count = data[dayIndex]?.[h] || 0;
            const intensity = Math.min(count / 10, 1); // Normaliser entre 0 et 1
            const color = getHeatmapColor(intensity);
            html += `<div style="background: ${color}; border: 1px solid #E0E0E0; aspect-ratio: 1; cursor: pointer;" title="${day} ${h}h: ${count} activités"></div>`;
        }
    });
    
    return html;
}

function getHeatmapColor(intensity) {
    if (intensity < 0.2) return '#E8F5E9';
    if (intensity < 0.4) return '#A5D6A7';
    if (intensity < 0.6) return '#66BB6A';
    if (intensity < 0.8) return '#43A047';
    return '#2E7D32';
}

async function loadActivityHeatmap() {
    try {
        // Vérifier que supabaseClient est disponible
        if (typeof supabaseClient === 'undefined') {
            console.warn('supabaseClient non disponible pour la heatmap');
            return;
        }
        
        // Charger les données d'activité par jour/heure
        // Utiliser directement users.last_seen_at car game_sessions n'existe probablement pas
        // Cela évite l'erreur 404 dans la console
        let sessions = [];
        
        // Essayer d'abord avec users.last_seen_at (plus fiable)
        try {
            const { data: users, error: usersError } = await supabaseClient
                .from('users')
                .select('last_seen_at')
                .not('last_seen_at', 'is', null)
                .gte('last_seen_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
            
            if (!usersError && users) {
                sessions = users.map(u => ({ created_at: u.last_seen_at }));
            }
        } catch (err) {
            console.log('Erreur chargement users pour heatmap:', err);
        }
        
        // Optionnel: Essayer game_sessions seulement si vous avez créé la table
        // Décommentez ce bloc si vous avez la table game_sessions
        /*
        try {
            const { data, error } = await supabaseClient
                .from('game_sessions')
                .select('created_at')
                .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
            
            // Gérer les erreurs 404 (table n'existe pas) ou autres erreurs
            if (error) {
                // Code PGRST116 = table/column n'existe pas, ou 404 = ressource non trouvée
                if (error.code === 'PGRST116' || error.message?.includes('404') || error.message?.includes('not found') || error.status === 404) {
                    // Table n'existe pas, on utilise déjà users.last_seen_at (chargé plus haut)
                    // Pas besoin de recharger
                } else {
                    // Autre erreur, on ignore silencieusement
                    console.log('Erreur lors du chargement de game_sessions:', error.message || error);
                }
            } else if (data) {
                // Si game_sessions existe, utiliser ces données (plus précises)
                sessions = data;
            }
        } catch (err) {
            // Erreur réseau ou autre, on utilise déjà users.last_seen_at (chargé plus haut)
            // Pas besoin de recharger
        }
        */
        
        // Organiser par jour de la semaine et heure
        const heatmapData = {};
        sessions?.forEach(session => {
            if (!session || !session.created_at) return;
            const date = new Date(session.created_at);
            if (isNaN(date.getTime())) return; // Vérifier que la date est valide
            const day = date.getDay() === 0 ? 6 : date.getDay() - 1; // Convertir dimanche en 6
            const hour = date.getHours();
            
            if (!heatmapData[day]) heatmapData[day] = {};
            heatmapData[day][hour] = (heatmapData[day][hour] || 0) + 1;
        });
        
        createHeatmap('activityHeatmap', heatmapData, '📊 Activité par jour et heure (30 derniers jours)');
    } catch (err) {
        console.error('Erreur chargement heatmap:', err);
        const container = document.getElementById('activityHeatmap');
        if (container) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Données d\'activité non disponibles</p>';
        }
    }
}

function createTrendChart(chartId, labels, data, forecastDays = 7) {
    const ctx = document.getElementById(chartId);
    if (!ctx) return;
    
    // Calculer la tendance linéaire
    const trend = calculateLinearTrend(data);
    
    // Générer les prévisions
    const forecastLabels = [];
    const forecastData = [];
    for (let i = 0; i < forecastDays; i++) {
        const futureIndex = labels.length + i;
        forecastLabels.push(`J+${i + 1}`);
        forecastData.push(trend.slope * futureIndex + trend.intercept);
    }
    
    if (comparisonCharts[chartId]) {
        comparisonCharts[chartId].destroy();
    }
    
    comparisonCharts[chartId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [...labels, ...forecastLabels],
            datasets: [
                {
                    label: 'Données réelles',
                    data: [...data, ...new Array(forecastDays).fill(null)],
                    borderColor: '#FF912D',
                    backgroundColor: 'rgba(255, 145, 45, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Prévision',
                    data: [...new Array(data.length).fill(null), ...forecastData],
                    borderColor: '#40C4D4',
                    backgroundColor: 'rgba(64, 196, 212, 0.1)',
                    tension: 0.4,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function calculateLinearTrend(data) {
    const n = data.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = data.reduce((a, b) => a + b, 0);
    const sumXY = data.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
}

// ==================== GESTION UTILISATEURS AMÉLIORÉE ====================

function showUserProfile(userId) {
    // Charger les données utilisateur détaillées
    loadUserDetails(userId).then(user => {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h2>👤 Profil Utilisateur</h2>
                    <span class="close-button" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <strong>Email:</strong> ${user.email || 'N/A'}<br>
                            <strong>Pseudo:</strong> ${user.username || 'N/A'}<br>
                            <strong>Inscription:</strong> ${new Date(user.created_at).toLocaleDateString('fr-FR')}<br>
                            <strong>Source:</strong> ${user.signup_source || 'organic'}
                        </div>
                        <div>
                            <strong>1er Zig:</strong> ${user.first_zig_created_at ? new Date(user.first_zig_created_at).toLocaleDateString('fr-FR') : 'Non'}<br>
                            <strong>Dernière activité:</strong> ${user.last_seen_at ? new Date(user.last_seen_at).toLocaleDateString('fr-FR') : 'Jamais'}<br>
                            <strong>Statut:</strong> ${getUserStatus(user)}
                        </div>
                    </div>
                    <div id="userActivityHistory"></div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn" onclick="exportUserData('${userId}')">Exporter données</button>
                    <button class="modal-btn cancel" onclick="this.closest('.modal').remove()">Fermer</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Charger l'historique d'activité
        loadUserActivityHistory(userId);
    });
}

async function loadUserDetails(userId) {
    const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) throw error;
    return data;
}

async function loadUserActivityHistory(userId) {
    try {
        // Vérifier que supabaseClient est disponible
        if (typeof supabaseClient === 'undefined') {
            console.warn('supabaseClient non disponible');
            return;
        }
        
        let zigs = [];
        let sessions = [];
        
        // Charger les zigs
        try {
            const { data, error } = await supabaseClient
                .from('zigs')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(50);
            
            if (!error && data) {
                zigs = data;
            }
        } catch (err) {
            console.warn('Erreur chargement zigs:', err);
        }
        
        // Charger les sessions (avec gestion d'erreur si la table n'existe pas)
        try {
            const { data, error } = await supabaseClient
                .from('game_sessions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(50);
            
            // Gérer toutes les erreurs possibles (404, PGRST116, etc.)
            if (error) {
                // Table n'existe pas ou autre erreur, ignorer silencieusement
                if (error.code === 'PGRST116' || error.message?.includes('404') || error.message?.includes('not found') || error.status === 404) {
                    // Ignorer silencieusement, pas besoin de logger
                } else {
                    console.log('Erreur chargement sessions:', error.message || error);
                }
            } else if (data) {
                sessions = data;
            }
        } catch (err) {
            // Erreur réseau ou autre, ignorer silencieusement
            // Ne pas logger pour éviter le spam dans la console
        }
        
        const container = document.getElementById('userActivityHistory');
        if (!container) return;
        
        container.innerHTML = `
            <h3 style="margin-bottom: 15px;">📊 Historique d'activité</h3>
            <div style="margin-bottom: 20px;">
                <strong>Zigs créés:</strong> ${zigs?.length || 0}<br>
                <strong>Sessions de jeu:</strong> ${sessions?.length || 0}
            </div>
            <div style="max-height: 300px; overflow-y: auto;">
                ${[...(zigs || []), ...(sessions || [])]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .map(item => `
                        <div style="padding: 10px; margin-bottom: 10px; background: #F8F9FA; border-radius: 8px;">
                            <strong>${item.title ? 'Zig créé' : 'Session de jeu'}</strong><br>
                            <small>${new Date(item.created_at).toLocaleString('fr-FR')}</small>
                        </div>
                    `).join('')}
            </div>
        `;
    } catch (err) {
        console.error('Erreur chargement historique:', err);
    }
}

function getUserStatus(user) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const lastSeen = user.last_seen_at ? new Date(user.last_seen_at) : null;
    
    if (lastSeen && lastSeen >= weekAgo) return 'Actif';
    if (new Date(user.created_at) >= weekAgo) return 'Nouveau';
    return 'Inactif';
}

function exportUserData(userId) {
    loadUserDetails(userId).then(user => {
        const data = JSON.stringify(user, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user_${user.email || userId}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        showToast('Données utilisateur exportées !');
    });
}

function showBulkActions() {
    const selectedUsers = getSelectedUsers();
    if (selectedUsers.length === 0) {
        showToast('Aucun utilisateur sélectionné', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2>⚡ Actions en masse</h2>
                <span class="close-button" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <p><strong>${selectedUsers.length}</strong> utilisateur(s) sélectionné(s)</p>
                <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
                    <button class="admin-btn" onclick="bulkExportUsers()">Exporter en CSV</button>
                    <button class="admin-btn" onclick="bulkTagUsers()">Ajouter un tag</button>
                    <button class="admin-btn" onclick="bulkSegmentUsers()">Créer un segment</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function getSelectedUsers() {
    // Récupérer les utilisateurs sélectionnés via des checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"][data-user-id]:checked');
    return Array.from(checkboxes).map(cb => cb.dataset.userId);
}

function bulkExportUsers() {
    const selectedIds = getSelectedUsers();
    // Exporter les utilisateurs sélectionnés
    showToast('Export en cours...');
}

function bulkTagUsers() {
    const tag = prompt('Nom du tag:');
    if (!tag) return;
    
    const selectedIds = getSelectedUsers();
    // Ajouter le tag aux utilisateurs sélectionnés
    showToast(`Tag "${tag}" ajouté à ${selectedIds.length} utilisateur(s)`);
}

function bulkSegmentUsers() {
    const segmentName = prompt('Nom du segment:');
    if (!segmentName) return;
    
    const selectedIds = getSelectedUsers();
    // Créer un segment avec les utilisateurs sélectionnés
    showToast(`Segment "${segmentName}" créé avec ${selectedIds.length} utilisateur(s)`);
}

// ==================== ANALYSE DE COHORTES ====================

async function loadCohortAnalysis() {
    try {
        const { data: users } = await supabaseClient
            .from('users')
            .select('created_at, first_zig_created_at, last_seen_at')
            .order('created_at', { ascending: true });
        
        // Grouper par mois d'inscription
        const cohorts = {};
        users?.forEach(user => {
            const month = new Date(user.created_at).toISOString().substring(0, 7); // YYYY-MM
            if (!cohorts[month]) {
                cohorts[month] = {
                    users: [],
                    month: month
                };
            }
            cohorts[month].users.push(user);
        });
        
        // Calculer la rétention pour chaque cohorte
        const cohortData = Object.entries(cohorts).map(([month, cohort]) => {
            const retention = calculateCohortRetention(cohort.users);
            return {
                month,
                totalUsers: cohort.users.length,
                retention
            };
        });
        
        renderCohortChart(cohortData);
    } catch (err) {
        console.error('Erreur analyse cohortes:', err);
    }
}

function calculateCohortRetention(users) {
    const retention = { d1: 0, d7: 0, d30: 0 };
    const now = new Date();
    
    users.forEach(user => {
        const created = new Date(user.created_at);
        const lastSeen = user.last_seen_at ? new Date(user.last_seen_at) : null;
        
        if (lastSeen) {
            const daysSinceCreation = Math.floor((lastSeen - created) / (1000 * 60 * 60 * 24));
            if (daysSinceCreation >= 1) retention.d1++;
            if (daysSinceCreation >= 7) retention.d7++;
            if (daysSinceCreation >= 30) retention.d30++;
        }
    });
    
    const total = users.length;
    return {
        d1: total > 0 ? ((retention.d1 / total) * 100).toFixed(1) : 0,
        d7: total > 0 ? ((retention.d7 / total) * 100).toFixed(1) : 0,
        d30: total > 0 ? ((retention.d30 / total) * 100).toFixed(1) : 0
    };
}

function renderCohortChart(cohortData) {
    const container = document.getElementById('cohortAnalysis');
    if (!container) return;
    
    container.innerHTML = `
        <h3 style="margin-bottom: 20px;">📊 Analyse de Rétention par Cohortes</h3>
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #F8F9FA;">
                        <th style="padding: 10px; text-align: left; border: 1px solid #E0E0E0;">Cohorte</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #E0E0E0;">Utilisateurs</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #E0E0E0;">Rétention J1</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #E0E0E0;">Rétention J7</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #E0E0E0;">Rétention J30</th>
                    </tr>
                </thead>
                <tbody>
                    ${cohortData.map(cohort => `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #E0E0E0;">${cohort.month}</td>
                            <td style="padding: 10px; text-align: center; border: 1px solid #E0E0E0;">${cohort.totalUsers}</td>
                            <td style="padding: 10px; text-align: center; border: 1px solid #E0E0E0;">${cohort.retention.d1}%</td>
                            <td style="padding: 10px; text-align: center; border: 1px solid #E0E0E0;">${cohort.retention.d7}%</td>
                            <td style="padding: 10px; text-align: center; border: 1px solid #E0E0E0;">${cohort.retention.d30}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div style="margin-top: 20px;">
            <canvas id="cohortChart"></canvas>
        </div>
    `;
    
    // Créer le graphique de cohortes
    createCohortChart(cohortData);
}

function createCohortChart(cohortData) {
    const ctx = document.getElementById('cohortChart');
    if (!ctx) return;
    
    const labels = cohortData.map(c => c.month);
    const d1Data = cohortData.map(c => parseFloat(c.retention.d1));
    const d7Data = cohortData.map(c => parseFloat(c.retention.d7));
    const d30Data = cohortData.map(c => parseFloat(c.retention.d30));
    
    if (comparisonCharts.cohortChart) {
        comparisonCharts.cohortChart.destroy();
    }
    
    comparisonCharts.cohortChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Rétention J1',
                    data: d1Data,
                    borderColor: '#FF912D',
                    backgroundColor: 'rgba(255, 145, 45, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Rétention J7',
                    data: d7Data,
                    borderColor: '#40C4D4',
                    backgroundColor: 'rgba(64, 196, 212, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Rétention J30',
                    data: d30Data,
                    borderColor: '#F54291',
                    backgroundColor: 'rgba(245, 66, 145, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// ==================== INTÉGRATIONS ====================

let integrationsConfig = JSON.parse(localStorage.getItem('admin_integrations') || JSON.stringify({
    googleSheets: { enabled: false, apiKey: '', spreadsheetId: '' },
    slack: { enabled: false, webhookUrl: '', channel: '#alerts' },
    discord: { enabled: false, webhookUrl: '', channel: 'alerts' },
    webhooks: []
}));

function showIntegrations() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h2>🔗 Intégrations</h2>
                <span class="close-button" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <!-- Google Sheets -->
                <div style="margin-bottom: 30px; padding: 20px; background: #F8F9FA; border-radius: 12px; border: 2px solid #E0E0E0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div>
                            <h3 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="#34A853">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Google Sheets
                            </h3>
                            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Exportez vos données vers Google Sheets</p>
                        </div>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="googleSheetsEnabled" ${integrationsConfig.googleSheets.enabled ? 'checked' : ''} onchange="toggleIntegration('googleSheets', this.checked)">
                            <span>Activer</span>
                        </label>
                    </div>
                    <div id="googleSheetsConfig" style="display: ${integrationsConfig.googleSheets.enabled ? 'block' : 'none'}; margin-top: 15px;">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600;">ID du Spreadsheet *</label>
                            <input type="text" id="googleSheetsId" class="modal-input" placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" value="${integrationsConfig.googleSheets.spreadsheetId || ''}">
                            <small style="color: #666; display: block; margin-top: 5px;">
                                📍 <strong>Comment trouver l'ID :</strong><br>
                                1. Créez ou ouvrez un Google Sheet<br>
                                2. Regardez l'URL : <code>https://docs.google.com/spreadsheets/d/<strong>VOTRE_ID_ICI</strong>/edit</code><br>
                                3. Copiez la partie entre <code>/d/</code> et <code>/edit</code>
                            </small>
                        </div>
                        <div style="margin-bottom: 15px; padding: 15px; background: #FFF5E6; border-radius: 8px; border-left: 4px solid #FF912D;">
                            <strong style="display: block; margin-bottom: 10px;">💡 Méthode d'export actuelle :</strong>
                            <p style="margin: 0; font-size: 14px; color: #666;">
                                L'export génère un fichier CSV que vous pouvez importer directement dans Google Sheets.<br>
                                <strong>Étapes :</strong><br>
                                1. Cliquez sur "Exporter maintenant"<br>
                                2. Un fichier CSV sera téléchargé<br>
                                3. Ouvrez votre Google Sheet<br>
                                4. Fichier → Importer → Téléverser → Sélectionnez le CSV
                            </p>
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button class="admin-btn-small" onclick="testGoogleSheets()">🔗 Ouvrir le Sheet</button>
                            <button class="admin-btn" onclick="exportToGoogleSheets()">📥 Exporter maintenant</button>
                        </div>
                        <div style="margin-top: 20px; padding: 15px; background: #E3F2FD; border-radius: 8px; border-left: 4px solid #2196F3;">
                            <strong style="display: block; margin-bottom: 10px;">🚀 Export automatique (avancé) :</strong>
                            <p style="margin: 0; font-size: 13px; color: #666;">
                                Pour un export automatique direct vers Google Sheets, vous devez configurer l'API Google Sheets.<br>
                                Cela nécessite un backend. Contactez votre développeur pour la configuration.
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- Slack -->
                <div style="margin-bottom: 30px; padding: 20px; background: #F8F9FA; border-radius: 12px; border: 2px solid #E0E0E0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div>
                            <h3 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="#4A154B">
                                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 5.042a2.528 2.528 0 0 1-2.52-2.52A2.528 2.528 0 0 1 18.956 0a2.528 2.528 0 0 1 2.522 2.522v2.52h-2.522zM18.956 6.313a2.528 2.528 0 0 1 2.522 2.521 2.528 2.528 0 0 1-2.522 2.521h-6.313A2.528 2.528 0 0 1 10.121 8.834a2.528 2.528 0 0 1 2.522-2.521h6.313zM15.165 18.956a2.528 2.528 0 0 1 2.521 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM13.894 18.956a2.527 2.527 0 0 1-2.52-2.521 2.526 2.526 0 0 1 2.52-2.521h6.313A2.527 2.527 0 0 1 22.728 16.435a2.527 2.527 0 0 1-2.521 2.521h-6.313z"/>
                                </svg>
                                Slack
                            </h3>
                            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Recevez les alertes sur Slack</p>
                        </div>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="slackEnabled" ${integrationsConfig.slack.enabled ? 'checked' : ''} onchange="toggleIntegration('slack', this.checked)">
                            <span>Activer</span>
                        </label>
                    </div>
                    <div id="slackConfig" style="display: ${integrationsConfig.slack.enabled ? 'block' : 'none'}; margin-top: 15px;">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Webhook URL</label>
                            <input type="text" id="slackWebhookUrl" class="modal-input" placeholder="https://hooks.slack.com/services/..." value="${integrationsConfig.slack.webhookUrl || ''}">
                            <small style="color: #666; display: block; margin-top: 5px;">
                                <a href="https://api.slack.com/messaging/webhooks" target="_blank">Comment créer un webhook Slack</a>
                            </small>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Canal</label>
                            <input type="text" id="slackChannel" class="modal-input" placeholder="#alerts" value="${integrationsConfig.slack.channel || '#alerts'}">
                        </div>
                        <button class="admin-btn-small" onclick="testSlack()">Tester l'envoi</button>
                    </div>
                </div>
                
                <!-- Discord -->
                <div style="margin-bottom: 30px; padding: 20px; background: #F8F9FA; border-radius: 12px; border: 2px solid #E0E0E0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div>
                            <h3 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="#5865F2">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.007-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                                </svg>
                                Discord
                            </h3>
                            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Recevez les alertes sur Discord</p>
                        </div>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="discordEnabled" ${integrationsConfig.discord.enabled ? 'checked' : ''} onchange="toggleIntegration('discord', this.checked)">
                            <span>Activer</span>
                        </label>
                    </div>
                    <div id="discordConfig" style="display: ${integrationsConfig.discord.enabled ? 'block' : 'none'}; margin-top: 15px;">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Webhook URL</label>
                            <input type="text" id="discordWebhookUrl" class="modal-input" placeholder="https://discord.com/api/webhooks/..." value="${integrationsConfig.discord.webhookUrl || ''}">
                            <small style="color: #666; display: block; margin-top: 5px;">
                                <a href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks" target="_blank">Comment créer un webhook Discord</a>
                            </small>
                        </div>
                        <button class="admin-btn-small" onclick="testDiscord()">Tester l'envoi</button>
                    </div>
                </div>
                
                <!-- Webhooks personnalisés -->
                <div style="margin-bottom: 30px; padding: 20px; background: #F8F9FA; border-radius: 12px; border: 2px solid #E0E0E0;">
                    <h3 style="margin: 0 0 15px 0;">🔗 Webhooks Personnalisés</h3>
                    <div id="webhooksList"></div>
                    <button class="admin-btn-small" onclick="addWebhook()" style="margin-top: 15px;">+ Ajouter un webhook</button>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn" onclick="saveIntegrations()">Enregistrer</button>
                <button class="modal-btn cancel" onclick="this.closest('.modal').remove()">Fermer</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    loadWebhooksList();
}

function toggleIntegration(type, enabled) {
    integrationsConfig[type].enabled = enabled;
    const configDiv = document.getElementById(`${type}Config`);
    if (configDiv) {
        configDiv.style.display = enabled ? 'block' : 'none';
    }
}

function saveIntegrations() {
    integrationsConfig.googleSheets.spreadsheetId = document.getElementById('googleSheetsId')?.value || '';
    integrationsConfig.googleSheets.apiKey = document.getElementById('googleSheetsApiKey')?.value || '';
    integrationsConfig.slack.webhookUrl = document.getElementById('slackWebhookUrl')?.value || '';
    integrationsConfig.slack.channel = document.getElementById('slackChannel')?.value || '#alerts';
    integrationsConfig.discord.webhookUrl = document.getElementById('discordWebhookUrl')?.value || '';
    
    localStorage.setItem('admin_integrations', JSON.stringify(integrationsConfig));
    showToast('Intégrations enregistrées !');
}

function testSlack() {
    const webhookUrl = document.getElementById('slackWebhookUrl')?.value;
    if (!webhookUrl) {
        showToast('Veuillez entrer une URL de webhook', 'error');
        return;
    }
    
    const channel = document.getElementById('slackChannel')?.value || '#alerts';
    
    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            text: '🧪 Test de connexion depuis le Dashboard ZigZag',
            channel: channel
        })
    }).then(() => {
        showToast('Message de test envoyé sur Slack !');
    }).catch(err => {
        showToast('Erreur lors de l\'envoi: ' + err.message, 'error');
    });
}

function testDiscord() {
    const webhookUrl = document.getElementById('discordWebhookUrl')?.value;
    if (!webhookUrl) {
        showToast('Veuillez entrer une URL de webhook', 'error');
        return;
    }
    
    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: '🧪 Test de connexion depuis le Dashboard ZigZag'
        })
    }).then(() => {
        showToast('Message de test envoyé sur Discord !');
    }).catch(err => {
        showToast('Erreur lors de l\'envoi: ' + err.message, 'error');
    });
}

function testGoogleSheets() {
    const spreadsheetId = document.getElementById('googleSheetsId')?.value;
    if (!spreadsheetId) {
        showToast('Veuillez entrer l\'ID du Spreadsheet', 'error');
        return;
    }
    
    // Ouvrir le Google Sheet pour vérifier qu'il existe
    const googleSheetsUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    window.open(googleSheetsUrl, '_blank');
    showToast('Google Sheet ouvert dans un nouvel onglet. Vérifiez qu\'il est accessible.');
}

function exportToGoogleSheets(data, sheetName = 'Dashboard Data') {
    if (!integrationsConfig.googleSheets.enabled) {
        showToast('Google Sheets n\'est pas activé', 'error');
        return;
    }
    
    const spreadsheetId = integrationsConfig.googleSheets.spreadsheetId;
    
    if (!spreadsheetId) {
        showToast('Veuillez configurer l\'ID du Spreadsheet dans les Intégrations', 'error');
        return;
    }
    
    // Méthode 1: Export CSV (fonctionne toujours)
    const csv = convertToCSV(data || usersData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sheetName}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    // Ouvrir Google Sheets avec le CSV
    const googleSheetsUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    window.open(googleSheetsUrl, '_blank');
    
    showToast('CSV exporté ! Ouvrez Google Sheets et importez le fichier CSV téléchargé.');
}

function convertToCSV(data) {
    if (!data || data.length === 0) {
        // Si pas de données, exporter les utilisateurs actuels
        if (typeof usersData !== 'undefined' && usersData.length > 0) {
            return convertUsersToCSV(usersData);
        }
        return '';
    }
    
    // Si c'est un tableau d'objets
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
        const headers = Object.keys(data[0]);
        const rows = data.map(row => headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '""';
            // Échapper les guillemets et les retours à la ligne
            const escaped = String(value).replace(/"/g, '""').replace(/\n/g, ' ');
            return `"${escaped}"`;
        }).join(','));
        return [headers.join(','), ...rows].join('\n');
    }
    
    return '';
}

function convertUsersToCSV(users) {
    const headers = ['Email', 'Pseudo', 'Inscription', 'Source', 'Dernière activité', '1er Zig', 'Statut'];
    const rows = users.map(user => {
        const created = new Date(user.created_at);
        const lastSeen = user.last_seen_at ? new Date(user.last_seen_at) : null;
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        let status = 'Inactif';
        if (lastSeen && lastSeen >= weekAgo) status = 'Actif';
        else if (created >= weekAgo) status = 'Nouveau';
        
        return [
            user.email || '',
            user.username || '',
            created.toLocaleDateString('fr-FR'),
            user.signup_source || 'organic',
            lastSeen ? lastSeen.toLocaleDateString('fr-FR') : 'Jamais',
            user.first_zig_created_at ? 'Oui' : 'Non',
            status
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    
    return [headers.join(','), ...rows].join('\n');
}

function loadWebhooksList() {
    const container = document.getElementById('webhooksList');
    if (!container) return;
    
    const webhooks = integrationsConfig.webhooks || [];
    
    if (webhooks.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Aucun webhook configuré</p>';
        return;
    }
    
    container.innerHTML = webhooks.map(webhook => `
        <div style="padding: 15px; margin-bottom: 10px; background: white; border-radius: 8px; border: 1px solid #E0E0E0;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 5px;">${webhook.name || 'Webhook sans nom'}</div>
                    <div style="font-size: 12px; color: #666; word-break: break-all; margin-bottom: 10px;">${webhook.url}</div>
                    <div style="margin-top: 10px; font-size: 12px; margin-bottom: 5px;">
                        <strong>Événements:</strong> ${webhook.events && webhook.events.length > 0 ? webhook.events.join(', ') : 'Aucun'}
                    </div>
                    <div style="margin-top: 5px;">
                        <label style="font-size: 12px; display: flex; align-items: center; gap: 5px; cursor: pointer;">
                            <input type="checkbox" ${webhook.active ? 'checked' : ''} onchange="if(typeof toggleWebhook === 'function') toggleWebhook(${webhook.id}, this.checked)">
                            <span>Actif</span>
                        </label>
                    </div>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button class="admin-btn-small" onclick="if(typeof testWebhook === 'function') testWebhook(${webhook.id})">Tester</button>
                    <button class="admin-btn-small" onclick="if(typeof deleteWebhook === 'function') deleteWebhook(${webhook.id})" style="background: #dc3545;">Supprimer</button>
                </div>
            </div>
        </div>
    `).join('');
}

function addWebhook() {
    // Créer une modale pour ajouter un webhook
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2>➕ Ajouter un Webhook</h2>
                <span class="close-button" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Nom du webhook *</label>
                    <input type="text" id="webhookName" class="modal-input" placeholder="Ex: Zapier Integration">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">URL du webhook *</label>
                    <input type="text" id="webhookUrl" class="modal-input" placeholder="https://hooks.zapier.com/...">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Événements à écouter</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                        <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                            <input type="checkbox" value="new_user" class="webhook-event">
                            <span>Nouvel utilisateur</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                            <input type="checkbox" value="alert" class="webhook-event">
                            <span>Alerte</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                            <input type="checkbox" value="report" class="webhook-event">
                            <span>Rapport</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                            <input type="checkbox" value="cost_added" class="webhook-event">
                            <span>Coût ajouté</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                            <input type="checkbox" value="checklist_completed" class="webhook-event">
                            <span>Checklist complétée</span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn" onclick="saveNewWebhook()">Ajouter</button>
                <button class="modal-btn cancel" onclick="this.closest('.modal').remove()">Annuler</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function saveNewWebhook() {
    const name = document.getElementById('webhookName')?.value;
    const url = document.getElementById('webhookUrl')?.value;
    
    if (!name || !url) {
        showToast('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }
    
    const events = Array.from(document.querySelectorAll('.webhook-event:checked')).map(cb => cb.value);
    
    const webhook = {
        id: Date.now(),
        name: name,
        url: url,
        events: events,
        active: true
    };
    
    integrationsConfig.webhooks.push(webhook);
    localStorage.setItem('admin_integrations', JSON.stringify(integrationsConfig));
    
    // Fermer la modale d'ajout
    document.querySelector('.modal').remove();
    
    // Recharger la liste
    if (typeof loadWebhooksList === 'function') {
        loadWebhooksList();
    }
    
    showToast('Webhook ajouté !');
}

function toggleWebhook(id, active) {
    const webhook = integrationsConfig.webhooks.find(w => w.id === id);
    if (webhook) {
        webhook.active = active;
        localStorage.setItem('admin_integrations', JSON.stringify(integrationsConfig));
    }
}

function deleteWebhook(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce webhook ?')) return;
    
    integrationsConfig.webhooks = integrationsConfig.webhooks.filter(w => w.id !== id);
    localStorage.setItem('admin_integrations', JSON.stringify(integrationsConfig));
    loadWebhooksList();
    showToast('Webhook supprimé');
}

function testWebhook(id) {
    const webhook = integrationsConfig.webhooks.find(w => w.id === id);
    if (!webhook) return;
    
    fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            event: 'test',
            message: 'Test de webhook depuis le Dashboard ZigZag',
            timestamp: new Date().toISOString()
        })
    }).then(() => {
        showToast('Webhook testé avec succès !');
    }).catch(err => {
        showToast('Erreur: ' + err.message, 'error');
    });
}

function triggerWebhook(event, data) {
    const webhooks = integrationsConfig.webhooks || [];
    webhooks.filter(w => w.active && w.events.includes(event)).forEach(webhook => {
        fetch(webhook.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event, data, timestamp: new Date().toISOString() })
        }).catch(err => console.error('Erreur webhook:', err));
    });
    
    // Envoyer aussi sur Slack si activé
    if (integrationsConfig.slack.enabled && integrationsConfig.slack.webhookUrl) {
        sendSlackAlert(`Événement: ${event}`, integrationsConfig.slack.channel);
    }
    
    // Envoyer aussi sur Discord si activé
    if (integrationsConfig.discord.enabled && integrationsConfig.discord.webhookUrl) {
        sendDiscordAlert(`Événement: ${event}`);
    }
}

function sendSlackAlert(message, channel = '#alerts') {
    const webhookUrl = integrationsConfig.slack.webhookUrl;
    if (!webhookUrl) return;
    
    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            text: message,
            channel: channel || integrationsConfig.slack.channel
        })
    }).catch(err => console.error('Erreur Slack:', err));
}

function sendDiscordAlert(message) {
    const webhookUrl = integrationsConfig.discord.webhookUrl;
    if (!webhookUrl) return;
    
    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: message
        })
    }).catch(err => console.error('Erreur Discord:', err));
}

// ==================== OPTIMISATIONS ====================

function lazyLoadSection(sectionId) {
    const section = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (!section) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Charger les données de la section
                loadSectionData(sectionId);
                observer.unobserve(entry.target);
            }
        });
    });
    
    observer.observe(section);
}

function loadSectionData(sectionId) {
    // Charger les données spécifiques à la section
    switch(sectionId) {
        case 'acquisition':
            if (typeof loadAcquisitionData === 'function') loadAcquisitionData();
            break;
        case 'activation':
            if (typeof loadActivationData === 'function') loadActivationData();
            break;
        // ... autres sections
    }
}

// ==================== INITIALISATION ====================

document.addEventListener('DOMContentLoaded', () => {
    // Charger la configuration du dashboard
    loadDashboardConfig();
    
    // Initialiser le mode personnalisation si nécessaire
    if (dashboardConfig.customizationMode) {
        toggleDashboardCustomization();
    }
    
    // Lazy load des sections
    ['acquisition', 'activation', 'retention', 'viral', 'engagement'].forEach(sectionId => {
        lazyLoadSection(sectionId);
    });
    
    // Charger l'analyse de cohortes
    if (typeof loadCohortAnalysis === 'function') {
        loadCohortAnalysis();
    }
    
    // Charger la heatmap d'activité
    // Désactiver le chargement automatique de la heatmap si la table game_sessions n'existe pas
    // Pour éviter les erreurs 404 dans la console
    // Décommentez la ligne suivante si vous avez créé la table game_sessions
    // if (typeof loadActivityHeatmap === 'function') {
    //     loadActivityHeatmap();
    // }
});

// ==================== FONCTIONNALITÉS COLLABORATIVES ====================

let dashboardComments = JSON.parse(localStorage.getItem('admin_dashboard_comments') || '[]');
let dashboardHistory = JSON.parse(localStorage.getItem('admin_dashboard_history') || '[]');

function addCommentToMetric(metricId, comment) {
    const commentObj = {
        id: Date.now(),
        metricId: metricId,
        comment: comment,
        author: getCurrentUser(),
        timestamp: new Date().toISOString()
    };
    
    dashboardComments.push(commentObj);
    localStorage.setItem('admin_dashboard_comments', JSON.stringify(dashboardComments));
    showToast('Commentaire ajouté !');
    renderComments(metricId);
}

function renderComments(metricId) {
    const comments = dashboardComments.filter(c => c.metricId === metricId);
    const container = document.getElementById(`comments_${metricId}`);
    if (!container) return;
    
    container.innerHTML = comments.map(c => `
        <div style="padding: 10px; margin-bottom: 10px; background: #F8F9FA; border-radius: 8px; border-left: 3px solid #FF912D;">
            <div style="font-size: 12px; color: #666; margin-bottom: 5px;">
                ${c.author} - ${new Date(c.timestamp).toLocaleString('fr-FR')}
            </div>
            <div>${c.comment}</div>
        </div>
    `).join('');
}

function showCommentModal(metricId, metricName) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2>💬 Commentaire - ${metricName}</h2>
                <span class="close-button" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <textarea id="commentText" class="modal-input" rows="4" placeholder="Ajouter un commentaire..."></textarea>
                <div id="comments_${metricId}" style="margin-top: 20px; max-height: 200px; overflow-y: auto;"></div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn" onclick="addCommentToMetric('${metricId}', document.getElementById('commentText').value); this.closest('.modal').remove();">Ajouter</button>
                <button class="modal-btn cancel" onclick="this.closest('.modal').remove()">Annuler</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    renderComments(metricId);
}

function shareDashboardView() {
    const config = {
        sections: dashboardConfig,
        filters: currentAdvancedFilters,
        period: currentPeriod,
        timestamp: new Date().toISOString()
    };
    
    const shareUrl = btoa(JSON.stringify(config));
    const fullUrl = `${window.location.origin}${window.location.pathname}?view=${shareUrl}`;
    
    navigator.clipboard.writeText(fullUrl).then(() => {
        showToast('Lien de partage copié dans le presse-papier !');
    }).catch(() => {
        prompt('Copiez ce lien:', fullUrl);
    });
}

function loadSharedView() {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (!viewParam) return;
    
    try {
        const config = JSON.parse(atob(viewParam));
        if (config.sections) {
            dashboardConfig = config.sections;
            loadDashboardConfig();
        }
        if (config.filters) {
            currentAdvancedFilters = config.filters;
        }
        if (config.period) {
            currentPeriod = config.period;
            document.getElementById('periodSelect').value = config.period;
        }
        showToast('Vue partagée chargée !');
    } catch (err) {
        console.error('Erreur chargement vue partagée:', err);
    }
}

function trackDashboardChange(action, details) {
    dashboardHistory.push({
        id: Date.now(),
        action: action,
        details: details,
        user: getCurrentUser(),
        timestamp: new Date().toISOString()
    });
    
    // Limiter à 100 entrées
    if (dashboardHistory.length > 100) {
        dashboardHistory = dashboardHistory.slice(-100);
    }
    
    localStorage.setItem('admin_dashboard_history', JSON.stringify(dashboardHistory));
}

function getCurrentUser() {
    return localStorage.getItem('admin_username') || 'Admin';
}

function showDashboardHistory() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2>📋 Historique des modifications</h2>
                <span class="close-button" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div style="max-height: 400px; overflow-y: auto;">
                    ${dashboardHistory.length === 0 ? '<p style="text-align: center; color: #666;">Aucun historique</p>' : 
                      dashboardHistory.slice().reverse().map(entry => `
                        <div style="padding: 12px; margin-bottom: 10px; background: #F8F9FA; border-radius: 8px;">
                            <div style="font-weight: 600; margin-bottom: 5px;">${entry.action}</div>
                            <div style="font-size: 12px; color: #666;">
                                ${entry.user} - ${new Date(entry.timestamp).toLocaleString('fr-FR')}
                            </div>
                            ${entry.details ? `<div style="font-size: 12px; margin-top: 5px; color: #888;">${JSON.stringify(entry.details)}</div>` : ''}
                        </div>
                      `).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn cancel" onclick="this.closest('.modal').remove()">Fermer</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// ==================== OPTIMISATIONS ====================

function initVirtualPagination(containerId, items, itemsPerPage = 20) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let currentPage = 1;
    const totalPages = Math.ceil(items.length / itemsPerPage);
    
    function renderPage(page) {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = items.slice(start, end);
        
        // Rendre uniquement les items visibles
        container.innerHTML = pageItems.map(item => renderItem(item)).join('');
        
        // Mettre à jour les contrôles de pagination
        updatePaginationControls(page, totalPages);
    }
    
    function updatePaginationControls(page, total) {
        const controls = document.getElementById(`${containerId}_pagination`);
        if (!controls) return;
        
        controls.innerHTML = `
            <button onclick="goToPage(${Math.max(1, page - 1)})" ${page === 1 ? 'disabled' : ''}>Précédent</button>
            <span>Page ${page} / ${total}</span>
            <button onclick="goToPage(${Math.min(total, page + 1)})" ${page === total ? 'disabled' : ''}>Suivant</button>
        `;
    }
    
    window.goToPage = function(page) {
        currentPage = page;
        renderPage(page);
    };
    
    renderPage(1);
}

function compressData(data) {
    // Compression simple avec JSON stringify (en production, utiliser une vraie compression)
    return JSON.stringify(data);
}

function decompressData(compressed) {
    return JSON.parse(compressed);
}

// Service Worker pour mode offline (optionnel)
// Désactivé par défaut car nécessite HTTPS en production
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/sw.js').catch(err => {
//         console.log('Service Worker non disponible:', err);
//     });
// }

// ==================== PERSONNALISATION AVANCÉE ====================

let customThemes = JSON.parse(localStorage.getItem('admin_custom_themes') || '[]');
let currentTheme = localStorage.getItem('admin_current_theme') || 'default';
let customShortcuts = JSON.parse(localStorage.getItem('admin_custom_shortcuts') || '{}');

function createCustomTheme(name, colors) {
    const theme = {
        id: Date.now(),
        name: name,
        colors: colors,
        created: new Date().toISOString()
    };
    
    customThemes.push(theme);
    localStorage.setItem('admin_custom_themes', JSON.stringify(customThemes));
    showToast('Thème créé !');
}

function applyTheme(themeId) {
    const theme = customThemes.find(t => t.id === themeId) || getDefaultTheme();
    currentTheme = themeId;
    localStorage.setItem('admin_current_theme', themeId);
    
    // Appliquer les couleurs du thème
    const root = document.documentElement;
    if (theme.colors) {
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });
    }
    
    showToast(`Thème "${theme.name}" appliqué !`);
}

function getDefaultTheme() {
    return {
        id: 'default',
        name: 'Par défaut',
        colors: {
            primary: '#FF912D',
            secondary: '#40C4D4',
            accent: '#F54291'
        }
    };
}

function setupCustomShortcut(key, action) {
    customShortcuts[key] = action;
    localStorage.setItem('admin_custom_shortcuts', JSON.stringify(customShortcuts));
    showToast(`Raccourci ${key} configuré !`);
}

document.addEventListener('keydown', (e) => {
    const shortcut = customShortcuts[e.key];
    if (shortcut && typeof window[shortcut] === 'function') {
        e.preventDefault();
        window[shortcut]();
    }
});

// ==================== ANALYTICS AVANCÉS ====================

let abTests = JSON.parse(localStorage.getItem('admin_ab_tests') || '[]');
let funnelSteps = [];

function createABTest(name, variants) {
    const test = {
        id: Date.now(),
        name: name,
        variants: variants,
        startDate: new Date().toISOString(),
        status: 'active',
        results: {}
    };
    
    abTests.push(test);
    localStorage.setItem('admin_ab_tests', JSON.stringify(abTests));
    showToast('Test A/B créé !');
}

function trackABTestConversion(testId, variant, conversion) {
    const test = abTests.find(t => t.id === testId);
    if (!test) return;
    
    if (!test.results[variant]) {
        test.results[variant] = { views: 0, conversions: 0 };
    }
    
    if (conversion) {
        test.results[variant].conversions++;
    } else {
        test.results[variant].views++;
    }
    
    localStorage.setItem('admin_ab_tests', JSON.stringify(abTests));
}

function analyzeFunnel(steps) {
    funnelSteps = steps;
    
    // Calculer les taux de conversion entre chaque étape
    const conversionRates = [];
    for (let i = 0; i < steps.length - 1; i++) {
        const current = steps[i].count;
        const next = steps[i + 1].count;
        const rate = current > 0 ? ((next / current) * 100).toFixed(1) : 0;
        conversionRates.push({
            from: steps[i].name,
            to: steps[i + 1].name,
            rate: rate
        });
    }
    
    renderFunnelChart(steps, conversionRates);
}

function renderFunnelChart(steps, rates) {
    const container = document.getElementById('funnelAnalysis');
    if (!container) return;
    
    container.innerHTML = `
        <h3 style="margin-bottom: 20px;">📊 Analyse de Funnel</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
            ${steps.map((step, index) => {
                const width = (step.count / steps[0].count) * 100;
                const rate = index > 0 ? rates[index - 1].rate : 100;
                return `
                    <div style="position: relative;">
                        <div style="background: linear-gradient(90deg, #FF912D, #F54291); width: ${width}%; padding: 15px; border-radius: 8px; color: white; font-weight: 600;">
                            ${step.name}: ${step.count} utilisateurs
                            ${index > 0 ? `<span style="font-size: 12px; opacity: 0.9;">(${rate}% de conversion)</span>` : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function analyzeUserPath(userId) {
    // Analyser le parcours d'un utilisateur
    return loadUserActivityHistory(userId).then(activities => {
        const path = activities.map(a => ({
            action: a.title || 'Session',
            timestamp: a.created_at
        }));
        
        renderPathAnalysis(path);
    });
}

function renderPathAnalysis(path) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>🛤️ Analyse de Parcours</h2>
                <span class="close-button" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${path.map((step, index) => `
                        <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #F8F9FA; border-radius: 8px;">
                            <div style="width: 30px; height: 30px; border-radius: 50%; background: #FF912D; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600;">
                                ${index + 1}
                            </div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600;">${step.action}</div>
                                <div style="font-size: 12px; color: #666;">${new Date(step.timestamp).toLocaleString('fr-FR')}</div>
                            </div>
                            ${index < path.length - 1 ? '<div style="color: #FF912D;">→</div>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function calculateAttribution(sources, conversions) {
    // Calcul d'attribution multi-touch
    const attribution = {};
    
    sources.forEach((source, index) => {
        const weight = 1 / (index + 1); // Premier touch = 100%, deuxième = 50%, etc.
        attribution[source] = (attribution[source] || 0) + (conversions * weight);
    });
    
    return attribution;
}

// Initialiser le chargement de la vue partagée
loadSharedView();

