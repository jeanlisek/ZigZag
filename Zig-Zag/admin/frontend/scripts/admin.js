// Configuration Supabase
const SUPABASE_URL = "https://tihrltssmpxpreadpzqm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaHJsdHNzbXB4cHJlYWRwenFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjEwNDksImV4cCI6MjA3OTczNzA0OX0.lXbPKA8tYj7o582onzj8c9y1vhkdXrk5SN8WmIahJpY";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variables globales pour le dashboard
let currentPeriod = 30; // jours par défaut
let customPeriodStart = null;
let customPeriodEnd = null;
let comparePeriod = false;
let lastUpdateTime = null;
let retryCount = 0;
const MAX_RETRIES = 3;
let realtimeSubscription = null;

// Variables pour la liste des utilisateurs
let usersPage = 1;
const USERS_PER_PAGE = 20;
let usersTotal = 0;
let usersData = [];
let currentSort = { field: 'created_at', order: 'desc' };
let searchTimeout = null;

// Cache pour les données
let dataCache = {};
const CACHE_DURATION = 30000; // 30 secondes

// Configuration Admin (à définir dans les variables d'environnement ou remplacer ici)
// En production, utilisez des variables d'environnement ou un fichier de config sécurisé
const ADMIN_CREDENTIALS = {
    username: "admin", // À changer avec VITE_ADMIN_USERNAME
    password: "zigzag2025" // À changer avec VITE_ADMIN_PASSWORD
};

// Gestion de l'authentification
const ADMIN_SESSION_KEY = "admin_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 heures

function initAdminAuth() {
    const session = getAdminSession();
    if (session && !isSessionExpired(session)) {
        showDashboard();
        loadDashboardData();
    } else {
        showLogin();
        clearAdminSession();
    }
}

function getAdminSession() {
    const sessionStr = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!sessionStr) return null;
    try {
        return JSON.parse(sessionStr);
    } catch {
        return null;
    }
}

function setAdminSession() {
    const session = {
        authenticated: true,
        timestamp: Date.now()
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

function clearAdminSession() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
}

function isSessionExpired(session) {
    return Date.now() - session.timestamp > SESSION_DURATION;
}

function showLogin() {
    document.getElementById("adminLogin").style.display = "flex";
    document.getElementById("adminDashboard").classList.remove("active");
}

function showDashboard() {
    document.getElementById("adminLogin").style.display = "none";
    document.getElementById("adminDashboard").classList.add("active");
    initRealtimeSubscriptions();
    
    // Refresh automatique toutes les 60 secondes
    if (!window.refreshInterval) {
        window.refreshInterval = setInterval(() => {
            loadDashboardData();
        }, 60000);
    }
}

function adminLogout() {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
        cleanupRealtimeSubscriptions();
        if (window.refreshInterval) {
            clearInterval(window.refreshInterval);
            window.refreshInterval = null;
        }
        clearAdminSession();
        showLogin();
        document.getElementById("adminLoginForm").reset();
        document.getElementById("adminError").textContent = "";
    }
}

// Gestion du formulaire de login
document.getElementById("adminLoginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("adminUsername").value.trim();
    const password = document.getElementById("adminPassword").value;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        setAdminSession();
        showDashboard();
        loadDashboardData();
        document.getElementById("adminError").textContent = "";
    } else {
        document.getElementById("adminError").textContent = "Identifiant ou mot de passe incorrect";
    }
});

// Fonction pour afficher les toasts
function showToast(message, type = "success") {
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    Object.assign(container.style, {
        position: "fixed",
        top: "80px",
        right: "24px",
        left: "auto",
        bottom: "auto",
        zIndex: "9999",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
    });

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
        <div class="toast-success-accent"></div>
        <div>
            <strong>${type === "success" ? "Succès" : "Erreur"}</strong><br>
            <span>${message}</span>
        </div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
        if (container && !container.hasChildNodes() && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }, 3600);
}

// ==================== GESTION DES COÛTS ====================
document.getElementById("costForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const date = document.getElementById("costDate").value;
    const instagram = parseFloat(document.getElementById("costInstagram").value) || 0;
    const tiktok = parseFloat(document.getElementById("costTikTok").value) || 0;
    const linkedin = parseFloat(document.getElementById("costLinkedIn").value) || 0;
    const notes = document.getElementById("costNotes").value.trim();

    const costTotal = instagram + tiktok + linkedin;

    try {
        const { error } = await supabaseClient
            .from("daily_costs")
            .upsert({
                date,
                cost_total: costTotal,
                cost_instagram: instagram,
                cost_tiktok: tiktok,
                cost_linkedin: linkedin,
                notes: notes || null
            }, {
                onConflict: "date"
            });

        if (error) throw error;

        showToast("Coûts enregistrés avec succès !");
        document.getElementById("costForm").reset();
        
        // Recharger le graphique des coûts
        loadCostsChart();
    } catch (err) {
        console.error("Erreur lors de l'enregistrement des coûts:", err);
        showToast("Erreur lors de l'enregistrement des coûts", "error");
    }
});

// ==================== GESTION DE LA CHECKLIST ====================
let currentWeekStart = null;

function getCurrentWeekStart() {
    if (currentWeekStart) return currentWeekStart;
    
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Lundi
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
}

async function loadChecklist() {
    const weekStart = currentWeekStart || getCurrentWeekStart();
    const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

    // Mettre à jour l'affichage de la semaine
    updateWeekDisplay();

    try {
        const { data: checklistData, error } = await supabaseClient
            .from("weekly_checklist")
            .select("*")
            .eq("week_start", weekStart)
            .order("created_at", { ascending: true });

        if (error) throw error;

        // Organiser les tâches par jour
        const tasksByDay = {};
        days.forEach(day => {
            tasksByDay[day] = checklistData?.filter(item => item.day === day) || [];
        });

        // Rendre les checklists pour chaque jour
        days.forEach(day => {
            const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
            const container = document.getElementById(`checklist${dayCapitalized}`);
            if (!container) {
                console.warn(`Container non trouvé pour ${day} (checklist${dayCapitalized})`);
                return;
            }
            container.innerHTML = "";

            const tasks = tasksByDay[day] || [];

            // Afficher les tâches existantes
            tasks.forEach((taskItem) => {
                const item = createChecklistItem(taskItem.task, taskItem.completed, taskItem.id, day, weekStart);
                container.appendChild(item);
            });

            // Bouton pour ajouter une nouvelle tâche
            const addButton = document.createElement("button");
            addButton.className = "checklist-add-btn";
            addButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Ajouter une tâche
            `;
            addButton.addEventListener("click", () => addNewTask(day, weekStart, container, addButton));
            container.appendChild(addButton);
        });
    } catch (err) {
        console.error("Erreur lors du chargement de la checklist:", err);
    }
}

function createChecklistItem(taskText, isCompleted, taskId, day, weekStart) {
    const item = document.createElement("div");
    item.className = `checklist-item ${isCompleted ? "completed" : ""}`;
    item.dataset.taskId = taskId;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `task_${taskId}`;
    checkbox.checked = isCompleted || false;

    const label = document.createElement("label");
    label.htmlFor = `task_${taskId}`;
    label.contentEditable = true;
    label.textContent = taskText;
    label.addEventListener("blur", async (e) => {
        const newText = e.target.textContent.trim();
        if (newText && newText !== taskText) {
            await updateTask(taskId, newText, day, weekStart);
        } else if (!newText) {
            e.target.textContent = taskText; // Restaurer si vide
        }
    });
    label.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.target.blur();
        }
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "checklist-delete-btn";
    deleteBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    `;
    deleteBtn.addEventListener("click", () => deleteTask(taskId, item));

    checkbox.addEventListener("change", async (e) => {
        const completed = e.target.checked;
        item.classList.toggle("completed", completed);
        await toggleTaskCompletion(taskId, completed);
    });

    item.appendChild(checkbox);
    item.appendChild(label);
    item.appendChild(deleteBtn);

    return item;
}

async function addNewTask(day, weekStart, container, addButton) {
    const taskText = prompt(`Ajouter une nouvelle tâche pour ${day}:`);
    if (!taskText || !taskText.trim()) return;

    try {
        // Vérifier si la tâche existe déjà
        const { data: existing } = await supabaseClient
            .from("weekly_checklist")
            .select("id")
            .eq("week_start", weekStart)
            .eq("day", day)
            .eq("task", taskText.trim())
            .single();

        if (existing) {
            showToast("Cette tâche existe déjà pour ce jour", "error");
            return;
        }

        const { data, error } = await supabaseClient
            .from("weekly_checklist")
            .insert({
                week_start: weekStart,
                day: day,
                task: taskText.trim(),
                completed: false
            })
            .select()
            .single();

        if (error) {
            if (error.code === "23505") {
                showToast("Cette tâche existe déjà pour ce jour", "error");
            } else {
                throw error;
            }
            return;
        }

        // Insérer la nouvelle tâche avant le bouton "Ajouter"
        const newItem = createChecklistItem(data.task, false, data.id, day, weekStart);
        container.insertBefore(newItem, addButton);
        showToast("Tâche ajoutée avec succès !");
    } catch (err) {
        if (err.code !== "PGRST116") { // PGRST116 = no rows (normal si pas de doublon)
            console.error("Erreur lors de l'ajout de la tâche:", err);
            showToast("Erreur lors de l'ajout de la tâche", "error");
        }
    }
}

async function updateTask(taskId, newText, day, weekStart) {
    try {
        // Vérifier si une tâche avec ce texte existe déjà pour ce jour
        const { data: existing, error: checkError } = await supabaseClient
            .from("weekly_checklist")
            .select("id")
            .eq("week_start", weekStart)
            .eq("day", day)
            .eq("task", newText)
            .neq("id", taskId)
            .single();

        if (existing) {
            showToast("Une tâche avec ce texte existe déjà pour ce jour", "error");
            return;
        }

        const { error } = await supabaseClient
            .from("weekly_checklist")
            .update({ task: newText })
            .eq("id", taskId);

        if (error) {
            // Si erreur de contrainte unique, c'est qu'une tâche similaire existe
            if (error.code === "23505") {
                showToast("Une tâche similaire existe déjà pour ce jour", "error");
            } else {
                throw error;
            }
            return;
        }

        showToast("Tâche mise à jour !");
    } catch (err) {
        if (err.code !== "PGRST116") { // PGRST116 = no rows returned (normal si pas de doublon)
            console.error("Erreur lors de la mise à jour:", err);
            showToast("Erreur lors de la mise à jour", "error");
        }
    }
}

async function toggleTaskCompletion(taskId, completed) {
    try {
        const { error } = await supabaseClient
            .from("weekly_checklist")
            .update({
                completed: completed,
                completed_at: completed ? new Date().toISOString() : null
            })
            .eq("id", taskId);

        if (error) throw error;
    } catch (err) {
        console.error("Erreur lors de la mise à jour du statut:", err);
    }
}

async function deleteTask(taskId, itemElement) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) return;

    try {
        const { error } = await supabaseClient
            .from("weekly_checklist")
            .delete()
            .eq("id", taskId);

        if (error) throw error;

        itemElement.remove();
        showToast("Tâche supprimée !");
    } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        showToast("Erreur lors de la suppression", "error");
    }
}

// ==================== DASHBOARD DATA ====================
let charts = {};

// Fonction avec retry automatique
async function loadWithRetry(loadFunction, functionName) {
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            await loadFunction();
            retryCount = 0;
            return;
        } catch (err) {
            console.error(`Erreur ${functionName} (tentative ${i + 1}/${MAX_RETRIES}):`, err);
            if (i < MAX_RETRIES - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Délai exponentiel
            } else {
                console.error(`Échec après ${MAX_RETRIES} tentatives pour ${functionName}`);
            }
        }
    }
}

async function loadDashboardData() {
    const startTime = Date.now();
    
    await Promise.all([
        loadWithRetry(loadSummaryData, "Summary"),
        loadWithRetry(() => loadAcquisitionData(currentPeriod, customPeriodStart, customPeriodEnd, comparePeriod), "Acquisition"),
        loadWithRetry(() => loadActivationData(), "Activation"),
        loadWithRetry(() => loadRetentionData(), "Retention"),
        loadWithRetry(() => loadViralData(), "Viral"),
        loadWithRetry(() => loadEngagementData(), "Engagement"),
        loadWithRetry(() => loadUsersList(), "Users"),
        loadWithRetry(() => loadChecklist(), "Checklist"),
        loadWithRetry(() => loadCostsChart(), "CostsChart"),
        loadWithRetry(() => loadSourceStats(), "SourceStats")
    ]);

    lastUpdateTime = new Date();
    updateLastUpdateDisplay();
    
    const loadTime = Date.now() - startTime;
    console.log(`Dashboard chargé en ${loadTime}ms`);
}

// Fonction de refresh manuel
function manualRefresh() {
    const refreshBtn = document.querySelector(".admin-refresh-btn");
    if (refreshBtn) {
        refreshBtn.style.opacity = "0.6";
        refreshBtn.disabled = true;
    }
    
    loadDashboardData().finally(() => {
        if (refreshBtn) {
            refreshBtn.style.opacity = "1";
            refreshBtn.disabled = false;
        }
        showToast("Données actualisées !");
    });
}

// Mise à jour de l'affichage de la dernière mise à jour
function updateLastUpdateDisplay() {
    const lastUpdateEl = document.getElementById("lastUpdate");
    if (lastUpdateEl && lastUpdateTime) {
        const timeStr = lastUpdateTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        lastUpdateEl.textContent = `Dernière mise à jour: ${timeStr}`;
    }
}

// Initialisation des subscriptions temps réel
function initRealtimeSubscriptions() {
    // Subscription pour nouvelles inscriptions
    realtimeSubscription = supabaseClient
        .channel('users-changes')
        .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'users' },
            (payload) => {
                console.log('Nouvelle inscription détectée:', payload);
                showToast("Nouvelle inscription !", "success");
                // Recharger les données après un court délai
                setTimeout(() => {
                    loadSummaryData();
                    loadAcquisitionData(currentPeriod, customPeriodStart, customPeriodEnd, comparePeriod);
                }, 1000);
            }
        )
        .subscribe();
}

// Nettoyage des subscriptions
function cleanupRealtimeSubscriptions() {
    if (realtimeSubscription) {
        supabaseClient.removeChannel(realtimeSubscription);
        realtimeSubscription = null;
    }
}

// ==================== ACQUISITION ====================
async function loadAcquisitionData(period = 30, customStart = null, customEnd = null, compare = false) {
    try {
        // Calculer la période
        const periodStart = customStart 
            ? new Date(customStart)
            : new Date(Date.now() - period * 24 * 60 * 60 * 1000);
        
        const periodEnd = customEnd ? new Date(customEnd) : new Date();

        let { data: users, error: usersError } = await supabaseClient
            .from("users")
            .select("created_at, signup_source")
            .gte("created_at", periodStart.toISOString())
            .lte("created_at", periodEnd.toISOString())
            .order("created_at", { ascending: true });

        if (usersError) {
            // Si la colonne signup_source n'existe pas, réessayer sans elle
            if (usersError.code === "42703" && usersError.message?.includes("signup_source")) {
                console.warn("Colonne signup_source manquante, récupération sans cette colonne...");
                const { data: usersFallback, error: fallbackError } = await supabaseClient
                    .from("users")
                    .select("created_at")
                    .gte("created_at", thirtyDaysAgo.toISOString())
                    .order("created_at", { ascending: true });
                if (fallbackError) throw fallbackError;
                // Ajouter signup_source par défaut
                users = usersFallback?.map(u => ({ ...u, signup_source: "organic" })) || [];
            } else {
                throw usersError;
            }
        }

        // Récupérer les coûts
        const { data: costs, error: costsError } = await supabaseClient
            .from("daily_costs")
            .select("*")
            .gte("date", periodStart.toISOString().split('T')[0])
            .lte("date", periodEnd.toISOString().split('T')[0])
            .order("date", { ascending: true });

        if (costsError) console.warn("Erreur coûts:", costsError);

        // Calculer les KPIs
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const todayUsers = users?.filter(u => {
            const userDate = new Date(u.created_at);
            userDate.setHours(0, 0, 0, 0);
            return userDate.getTime() === today.getTime();
        }).length || 0;

        const monthUsers = users?.length || 0;

        const totalCost = costs?.reduce((sum, c) => sum + (c.cost_total || 0), 0) || 0;
        const cpa = monthUsers > 0 ? (totalCost / monthUsers).toFixed(2) : 0;

        // Comparaison avec période précédente
        let comparison = null;
        if (compare) {
            const daysDiff = Math.ceil((periodEnd - periodStart) / (1000 * 60 * 60 * 24));
            const prevPeriodStart = new Date(periodStart);
            prevPeriodStart.setDate(prevPeriodStart.getDate() - daysDiff);
            const prevPeriodEnd = new Date(periodStart);
            
            const { data: prevUsers } = await supabaseClient
                .from("users")
                .select("created_at")
                .gte("created_at", prevPeriodStart.toISOString())
                .lt("created_at", prevPeriodEnd.toISOString());
            
            const prevTotal = prevUsers?.length || 0;
            const change = prevTotal > 0 ? (((monthUsers - prevTotal) / prevTotal) * 100).toFixed(1) : 0;
            comparison = { total: prevTotal, change: parseFloat(change) };
        }

        // Afficher les KPIs
        document.getElementById("acquisitionKPIs").innerHTML = `
            <div class="kpi-card">
                <div class="kpi-label">Inscriptions aujourd'hui</div>
                <div class="kpi-value">${todayUsers}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Total cette période</div>
                <div class="kpi-value">${monthUsers}</div>
                ${comparison ? `<div class="kpi-change">${comparison.change >= 0 ? '+' : ''}${comparison.change}% vs période précédente</div>` : ''}
            </div>
            <div class="kpi-card ${cpa > 5 ? 'warning' : 'success'}">
                <div class="kpi-label">Coût par acquisition</div>
                <div class="kpi-value">${cpa}€</div>
            </div>
        `;

        // Graphique évolution inscriptions
        const dailyData = {};
        users?.forEach(user => {
            const date = new Date(user.created_at).toISOString().split('T')[0];
            dailyData[date] = (dailyData[date] || 0) + 1;
        });

        const labels = [];
        const data = [];
        const currentDate = new Date(periodStart);
        while (currentDate <= periodEnd) {
            const dateStr = currentDate.toISOString().split('T')[0];
            labels.push(currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }));
            data.push(dailyData[dateStr] || 0);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (charts.acquisition) charts.acquisition.destroy();
        charts.acquisition = new Chart(document.getElementById("acquisitionChart"), {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Inscriptions",
                    data: data,
                    borderColor: "#FF912D",
                    backgroundColor: "rgba(255, 145, 45, 0.1)",
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // Graphique sources
        const sources = {};
        users?.forEach(user => {
            const source = user.signup_source || "organic";
            sources[source] = (sources[source] || 0) + 1;
        });

        if (charts.sources) charts.sources.destroy();
        charts.sources = new Chart(document.getElementById("sourcesChart"), {
            type: "bar",
            data: {
                labels: Object.keys(sources),
                datasets: [{
                    label: "Inscriptions",
                    data: Object.values(sources),
                    backgroundColor: ["#40C4D4", "#F54291", "#FF912D", "#8A3AAA"]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });

        document.getElementById("acquisitionLoading").style.display = "none";
        document.getElementById("acquisitionContent").style.display = "block";
    } catch (err) {
        console.error("Erreur acquisition:", err);
        document.getElementById("acquisitionLoading").textContent = "Erreur lors du chargement des données";
    }
}

// ==================== ACTIVATION ====================
async function loadActivationData() {
    try {
        let { data: users, error } = await supabaseClient
            .from("users")
            .select("first_zig_created_at, first_game_played_at, created_at");

        if (error) {
            // Si les colonnes n'existent pas, réessayer avec seulement created_at
            if (error.code === "42703") {
                console.warn("Colonnes d'activation manquantes, récupération des données de base...");
                const { data: usersFallback, error: fallbackError } = await supabaseClient
                    .from("users")
                    .select("created_at");
                if (fallbackError) throw fallbackError;
                // Ajouter les colonnes manquantes avec null
                users = usersFallback?.map(u => ({ 
                    ...u, 
                    first_zig_created_at: null, 
                    first_game_played_at: null 
                })) || [];
            } else {
                throw error;
            }
        }

        const totalUsers = users?.length || 0;
        const usersWithZig = users?.filter(u => u.first_zig_created_at).length || 0;
        const usersWithGame = users?.filter(u => u.first_game_played_at).length || 0;

        const activationRate = totalUsers > 0 ? ((usersWithZig / totalUsers) * 100).toFixed(1) : 0;
        const gameRate = totalUsers > 0 ? ((usersWithGame / totalUsers) * 100).toFixed(1) : 0;

        // Temps moyen avant 1er Zig
        let avgTimeToZig = 0;
        const timesToZig = users
            ?.filter(u => u.first_zig_created_at && u.created_at)
            .map(u => {
                const created = new Date(u.created_at);
                const firstZig = new Date(u.first_zig_created_at);
                return (firstZig - created) / (1000 * 60 * 60); // heures
            }) || [];
        if (timesToZig.length > 0) {
            avgTimeToZig = (timesToZig.reduce((a, b) => a + b, 0) / timesToZig.length).toFixed(1);
        }

        document.getElementById("activationKPIs").innerHTML = `
            <div class="kpi-card ${activationRate >= 60 ? 'success' : 'warning'}">
                <div class="kpi-label">% Création 1er Zig</div>
                <div class="kpi-value">${activationRate}%</div>
                <div class="kpi-change">Objectif: >60%</div>
            </div>
            <div class="kpi-card ${gameRate >= 40 ? 'success' : 'warning'}">
                <div class="kpi-label">% Tour joué</div>
                <div class="kpi-value">${gameRate}%</div>
                <div class="kpi-change">Objectif: >40%</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Temps moyen avant 1er Zig</div>
                <div class="kpi-value">${avgTimeToZig}h</div>
            </div>
        `;

        // Funnel
        const funnelData = [totalUsers, usersWithZig, usersWithGame];
        if (charts.activation) charts.activation.destroy();
        charts.activation = new Chart(document.getElementById("activationChart"), {
            type: "bar",
            data: {
                labels: ["Inscription", "1er Zig créé", "1er Tour joué"],
                datasets: [{
                    label: "Utilisateurs",
                    data: funnelData,
                    backgroundColor: ["#40C4D4", "#FF912D", "#F54291"]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                indexAxis: "y"
            }
        });

        document.getElementById("activationLoading").style.display = "none";
        document.getElementById("activationContent").style.display = "block";
    } catch (err) {
        console.error("Erreur activation:", err);
        document.getElementById("activationLoading").textContent = "Erreur lors du chargement des données";
    }
}

// ==================== RÉTENTION ====================
async function loadRetentionData() {
    try {
        let { data: users, error } = await supabaseClient
            .from("users")
            .select("created_at, last_seen_at");

        if (error) {
            // Si la colonne last_seen_at n'existe pas, réessayer sans elle
            if (error.code === "42703" && error.message?.includes("last_seen_at")) {
                console.warn("Colonne last_seen_at manquante, récupération sans cette colonne...");
                const { data: usersFallback, error: fallbackError } = await supabaseClient
                    .from("users")
                    .select("created_at");
                if (fallbackError) throw fallbackError;
                // Ajouter last_seen_at avec null
                users = usersFallback?.map(u => ({ ...u, last_seen_at: null })) || [];
            } else {
                throw error;
            }
        }

        // Calculer les cohortes
        const cohorts = {};
        users?.forEach(user => {
            const created = new Date(user.created_at);
            const cohortKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
            if (!cohorts[cohortKey]) {
                cohorts[cohortKey] = { total: 0, j1: 0, j7: 0, j30: 0 };
            }
            cohorts[cohortKey].total++;

            if (user.last_seen_at) {
                const lastSeen = new Date(user.last_seen_at);
                const daysDiff = Math.floor((lastSeen - created) / (1000 * 60 * 60 * 24));
                if (daysDiff >= 1) cohorts[cohortKey].j1++;
                if (daysDiff >= 7) cohorts[cohortKey].j7++;
                if (daysDiff >= 30) cohorts[cohortKey].j30++;
            }
        });

        // Calculer les moyennes
        const retentionJ1 = Object.values(cohorts).reduce((sum, c) => sum + (c.j1 / c.total), 0) / Object.keys(cohorts).length * 100;
        const retentionJ7 = Object.values(cohorts).reduce((sum, c) => sum + (c.j7 / c.total), 0) / Object.keys(cohorts).length * 100;
        const retentionJ30 = Object.values(cohorts).reduce((sum, c) => sum + (c.j30 / c.total), 0) / Object.keys(cohorts).length * 100;

        // Sessions moyennes (approximation basée sur last_seen_at)
        const activeUsers = users?.filter(u => u.last_seen_at).length || 0;
        const avgSessions = activeUsers > 0 ? (activeUsers / (users?.length || 1)).toFixed(2) : 0;

        document.getElementById("retentionKPIs").innerHTML = `
            <div class="kpi-card">
                <div class="kpi-label">Rétention J1</div>
                <div class="kpi-value">${retentionJ1.toFixed(1)}%</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Rétention J7</div>
                <div class="kpi-value">${retentionJ7.toFixed(1)}%</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Rétention J30</div>
                <div class="kpi-value">${retentionJ30.toFixed(1)}%</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Sessions moyennes/user</div>
                <div class="kpi-value">${avgSessions}</div>
            </div>
        `;

        // Graphique courbe de rétention
        const retentionLabels = ["J1", "J7", "J14", "J30"];
        const retentionData = [retentionJ1, retentionJ7, retentionJ7 * 0.9, retentionJ30]; // Approximation J14

        if (charts.retention) charts.retention.destroy();
        charts.retention = new Chart(document.getElementById("retentionChart"), {
            type: "line",
            data: {
                labels: retentionLabels,
                datasets: [{
                    label: "Rétention (%)",
                    data: retentionData,
                    borderColor: "#40C4D4",
                    backgroundColor: "rgba(64, 196, 212, 0.1)",
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });

        document.getElementById("retentionLoading").style.display = "none";
        document.getElementById("retentionContent").style.display = "block";
    } catch (err) {
        console.error("Erreur rétention:", err);
        document.getElementById("retentionLoading").textContent = "Erreur lors du chargement des données";
    }
}

// ==================== VIRAL ====================
async function loadViralData() {
    try {
        // Ces données nécessiteraient des tables supplémentaires (invitations, partages)
        // Pour l'instant, on affiche des placeholders
        document.getElementById("viralKPIs").innerHTML = `
            <div class="kpi-card">
                <div class="kpi-label">K-factor</div>
                <div class="kpi-value">-</div>
                <div class="kpi-change">À implémenter</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Invitations/user</div>
                <div class="kpi-value">-</div>
                <div class="kpi-change">À implémenter</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Taux de partage</div>
                <div class="kpi-value">-</div>
                <div class="kpi-change">À implémenter</div>
            </div>
        `;

        document.getElementById("viralLoading").style.display = "none";
        document.getElementById("viralContent").style.display = "block";
    } catch (err) {
        console.error("Erreur viral:", err);
        document.getElementById("viralLoading").textContent = "Erreur lors du chargement des données";
    }
}

// ==================== ENGAGEMENT ====================
async function loadEngagementData() {
    try {
        let { data: users, error } = await supabaseClient
            .from("users")
            .select("last_seen_at, created_at");

        if (error) {
            // Si la colonne last_seen_at n'existe pas, réessayer sans elle
            if (error.code === "42703" && error.message?.includes("last_seen_at")) {
                console.warn("Colonne last_seen_at manquante, récupération sans cette colonne...");
                const { data: usersFallback, error: fallbackError } = await supabaseClient
                    .from("users")
                    .select("created_at");
                if (fallbackError) throw fallbackError;
                // Ajouter last_seen_at avec null
                users = usersFallback?.map(u => ({ ...u, last_seen_at: null })) || [];
            } else {
                throw error;
            }
        }

        // Utilisateurs actifs aujourd'hui
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activeToday = users?.filter(u => {
            if (!u.last_seen_at) return false;
            const lastSeen = new Date(u.last_seen_at);
            lastSeen.setHours(0, 0, 0, 0);
            return lastSeen.getTime() === today.getTime();
        }).length || 0;

        // Utilisateurs actifs cette semaine
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const activeWeek = users?.filter(u => {
            if (!u.last_seen_at) return false;
            const lastSeen = new Date(u.last_seen_at);
            return lastSeen >= weekAgo;
        }).length || 0;

        // Taux d'engagement (utilisateurs actifs / total)
        const totalUsers = users?.length || 0;
        const engagementRate = totalUsers > 0 ? ((activeWeek / totalUsers) * 100).toFixed(1) : 0;

        document.getElementById("engagementKPIs").innerHTML = `
            <div class="kpi-card">
                <div class="kpi-label">Actifs aujourd'hui</div>
                <div class="kpi-value">${activeToday}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Actifs cette semaine</div>
                <div class="kpi-value">${activeWeek}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Taux d'engagement</div>
                <div class="kpi-value">${engagementRate}%</div>
            </div>
        `;

        // Graphique évolution engagement (7 derniers jours)
        const dailyActive = {};
        users?.forEach(user => {
            if (user.last_seen_at) {
                const date = new Date(user.last_seen_at).toISOString().split('T')[0];
                dailyActive[date] = (dailyActive[date] || 0) + 1;
            }
        });

        const labels = [];
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            labels.push(date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }));
            data.push(dailyActive[dateStr] || 0);
        }

        if (charts.engagement) charts.engagement.destroy();
        charts.engagement = new Chart(document.getElementById("engagementChart"), {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Utilisateurs actifs",
                    data: data,
                    borderColor: "#F54291",
                    backgroundColor: "rgba(245, 66, 145, 0.1)",
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });

        document.getElementById("engagementLoading").style.display = "none";
        document.getElementById("engagementContent").style.display = "block";
    } catch (err) {
        console.error("Erreur engagement:", err);
        document.getElementById("engagementLoading").textContent = "Erreur lors du chargement des données";
    }
}

// ==================== NOUVELLES FONCTIONNALITÉS ====================

// Gestion des filtres de période
function initPeriodFilters() {
    const periodSelect = document.getElementById("periodSelect");
    const customPeriodDiv = document.getElementById("customPeriod");
    const compareCheckbox = document.getElementById("comparePeriod");

    if (periodSelect) {
        periodSelect.addEventListener("change", (e) => {
            if (e.target.value === "custom") {
                customPeriodDiv.style.display = "flex";
            } else {
                customPeriodDiv.style.display = "none";
                currentPeriod = parseInt(e.target.value);
                customPeriodStart = null;
                customPeriodEnd = null;
                loadDashboardData();
            }
        });
    }

    if (compareCheckbox) {
        compareCheckbox.addEventListener("change", (e) => {
            comparePeriod = e.target.checked;
            loadDashboardData();
        });
    }
}

function applyCustomPeriod() {
    const start = document.getElementById("periodStart").value;
    const end = document.getElementById("periodEnd").value;
    
    if (!start || !end) {
        showToast("Veuillez sélectionner une date de début et de fin", "error");
        return;
    }
    
    if (new Date(start) > new Date(end)) {
        showToast("La date de début doit être antérieure à la date de fin", "error");
        return;
    }
    
    customPeriodStart = start;
    customPeriodEnd = end;
    currentPeriod = null;
    loadDashboardData();
}

// Vue d'ensemble
async function loadSummaryData() {
    try {
        const periodDays = currentPeriod || Math.ceil((new Date(customPeriodEnd) - new Date(customPeriodStart)) / (1000 * 60 * 60 * 24));
        const periodStart = currentPeriod 
            ? new Date(Date.now() - currentPeriod * 24 * 60 * 60 * 1000)
            : new Date(customPeriodStart);
        
        const { data: users, error: usersError } = await supabaseClient
            .from("users")
            .select("created_at, signup_source, first_zig_created_at, first_game_played_at, last_seen_at")
            .gte("created_at", periodStart.toISOString())
            .order("created_at", { ascending: false });

        if (usersError && usersError.code !== "42703") throw usersError;

        const { data: costs } = await supabaseClient
            .from("daily_costs")
            .select("*")
            .gte("date", periodStart.toISOString().split('T')[0])
            .order("date", { ascending: true });

        const totalUsers = users?.length || 0;
        const activeUsers = users?.filter(u => {
            if (!u.last_seen_at) return false;
            const lastSeen = new Date(u.last_seen_at);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return lastSeen >= weekAgo;
        }).length || 0;
        
        const activatedUsers = users?.filter(u => u.first_zig_created_at).length || 0;
        const activationRate = totalUsers > 0 ? ((activatedUsers / totalUsers) * 100).toFixed(1) : 0;
        
        const totalCost = costs?.reduce((sum, c) => sum + (c.cost_total || 0), 0) || 0;
        const cpa = totalUsers > 0 ? (totalCost / totalUsers).toFixed(2) : 0;

        let comparison = null;
        if (comparePeriod) {
            const prevPeriodStart = new Date(periodStart);
            prevPeriodStart.setDate(prevPeriodStart.getDate() - periodDays);
            const prevPeriodEnd = new Date(periodStart);
            
            const { data: prevUsers } = await supabaseClient
                .from("users")
                .select("created_at")
                .gte("created_at", prevPeriodStart.toISOString())
                .lt("created_at", prevPeriodEnd.toISOString());
            
            const prevTotal = prevUsers?.length || 0;
            const change = prevTotal > 0 ? (((totalUsers - prevTotal) / prevTotal) * 100).toFixed(1) : 0;
            comparison = { total: prevTotal, change: parseFloat(change) };
        }

        document.getElementById("summaryKPIs").innerHTML = `
            <div class="kpi-card">
                <div class="kpi-label">Total utilisateurs</div>
                <div class="kpi-value">${totalUsers}</div>
                ${comparison ? `<div class="kpi-change">${comparison.change >= 0 ? '+' : ''}${comparison.change}% vs période précédente</div>` : ''}
            </div>
            <div class="kpi-card success">
                <div class="kpi-label">Utilisateurs actifs (7j)</div>
                <div class="kpi-value">${activeUsers}</div>
            </div>
            <div class="kpi-card ${activationRate >= 60 ? 'success' : 'warning'}">
                <div class="kpi-label">Taux d'activation</div>
                <div class="kpi-value">${activationRate}%</div>
                <div class="kpi-change">Objectif: >60%</div>
            </div>
            <div class="kpi-card ${cpa > 5 ? 'warning' : 'success'}">
                <div class="kpi-label">Coût par acquisition</div>
                <div class="kpi-value">${cpa}€</div>
            </div>
        `;

        checkAlerts(activationRate, cpa, totalUsers);
        
        // Déclencher les webhooks pour nouveaux utilisateurs si nécessaire
        if (typeof triggerWebhook === 'function' && totalUsers > 0) {
            triggerWebhook('new_user', { count: totalUsers, period: currentPeriod });
        }

        document.getElementById("summaryLoading").style.display = "none";
        document.getElementById("summaryContent").style.display = "block";
    } catch (err) {
        console.error("Erreur summary:", err);
        document.getElementById("summaryLoading").textContent = "Erreur lors du chargement des données";
    }
}

function checkAlerts(activationRate, cpa, totalUsers) {
    // Ne pas afficher d'alertes si aucune donnée
    if (totalUsers === 0) {
        return; // Pas d'alerte si pas d'utilisateurs
    }
    
    // Ne pas alerter si le taux est 0% mais qu'il n'y a qu'un seul utilisateur (données insuffisantes)
    if (totalUsers < 5 && parseFloat(activationRate) === 0) {
        return; // Pas assez de données pour tirer des conclusions
    }
    
    // Alerter seulement si le taux est vraiment problématique (inférieur à 60% ET qu'on a assez de données)
    if (totalUsers >= 5 && parseFloat(activationRate) < 60) {
        showToast(`Taux d'activation faible: ${activationRate}% (objectif: >60%)`, "warning");
    }
    
    // Alerter sur le CPA seulement si on a des coûts ET des utilisateurs
    if (parseFloat(cpa) > 0 && parseFloat(cpa) > 5) {
        showToast(`Coût par acquisition élevé: ${cpa}€`, "warning");
    }
}

// Liste utilisateurs améliorée avec pagination, recherche, tri
async function loadUsersList(resetPage = false) {
    if (resetPage) usersPage = 1;
    
    const filter = document.getElementById("userFilter")?.value || "all";
    const sourceFilter = document.getElementById("userSourceFilter")?.value || "all";
    const searchTerm = document.getElementById("userSearch")?.value.trim() || "";
    const sortOption = document.getElementById("userSort")?.value || "created_desc";
    
    try {
        // Construire la requête avec filtres
        let query = supabaseClient.from("users").select("id, email, username, created_at, signup_source, first_zig_created_at, last_seen_at", { count: 'exact' });
        
        // Filtre statut
        if (filter === "active") {
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            query = query.gte("last_seen_at", weekAgo.toISOString());
        } else if (filter === "inactive") {
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            query = query.or(`last_seen_at.is.null,last_seen_at.lt.${weekAgo.toISOString()}`);
        } else if (filter === "new") {
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            query = query.gte("created_at", weekAgo.toISOString());
        }
        
        // Filtre source
        if (sourceFilter !== "all") {
            query = query.eq("signup_source", sourceFilter);
        }
        
        // Recherche
        if (searchTerm) {
            query = query.or(`email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`);
        }
        
        // Tri
        const [field, order] = sortOption.split('_');
        const ascending = order === 'asc';
        query = query.order(field === 'email' ? 'email' : field === 'username' ? 'username' : field === 'created_at' ? 'created_at' : 'last_seen_at', { ascending });
        
        // Pagination
        const from = (usersPage - 1) * USERS_PER_PAGE;
        const to = from + USERS_PER_PAGE - 1;
        query = query.range(from, to);
        
        const { data: users, error, count } = await query;
        
        if (error) throw error;
        
        usersData = users || [];
        usersTotal = count || 0;
        
        // Afficher les utilisateurs
        const tbody = document.getElementById("usersTableBody");
        if (tbody) {
            tbody.innerHTML = usersData.map(user => {
                const created = new Date(user.created_at);
                const lastSeen = user.last_seen_at ? new Date(user.last_seen_at) : null;
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                
                // Checkbox pour sélection multiple
                const checkbox = `<td><input type="checkbox" data-user-id="${user.id}" onchange="updateSelectedUsers()"></td>`;
                
                let status = "inactive";
                let statusText = "Inactif";
                if (lastSeen && lastSeen >= weekAgo) {
                    status = "active";
                    statusText = "Actif";
                } else if (created >= weekAgo) {
                    status = "new";
                    statusText = "Nouveau";
                }
                
                return `
                    <tr>
                        <td><input type="checkbox" data-user-id="${user.id}" onchange="if(typeof updateSelectedUsers === 'function') updateSelectedUsers()"></td>
                        <td style="cursor: pointer;" onclick="if(typeof showUserProfile === 'function') showUserProfile('${user.id}')">${user.email || '-'}</td>
                        <td>${user.username || '-'}</td>
                        <td>${created.toLocaleDateString('fr-FR')}</td>
                        <td>${user.signup_source || 'organic'}</td>
                        <td>${lastSeen ? lastSeen.toLocaleDateString('fr-FR') : 'Jamais'}</td>
                        <td>${user.first_zig_created_at ? '✓' : '✗'}</td>
                        <td><span class="user-status ${status}">${statusText}</span></td>
                    </tr>
                `;
            }).join('') || '<tr><td colspan="8">Aucun utilisateur trouvé</td></tr>';
        }
        
        // Mettre à jour les infos de pagination
        updateUsersPagination();
        
        document.getElementById("usersLoading").style.display = "none";
        document.getElementById("usersContent").style.display = "block";
    } catch (err) {
        console.error("Erreur chargement utilisateurs:", err);
        document.getElementById("usersLoading").textContent = "Erreur lors du chargement des utilisateurs";
    }
}

function updateUsersPagination() {
    const totalPages = Math.ceil(usersTotal / USERS_PER_PAGE);
    const countEl = document.getElementById("usersCount");
    const pageInfoEl = document.getElementById("usersPageInfo");
    const prevBtn = document.getElementById("prevPageBtn");
    const nextBtn = document.getElementById("nextPageBtn");
    const pageNumbersEl = document.getElementById("pageNumbers");
    
    if (countEl) countEl.textContent = `${usersTotal} utilisateurs`;
    if (pageInfoEl) pageInfoEl.textContent = `Page ${usersPage} / ${totalPages || 1}`;
    
    if (prevBtn) prevBtn.disabled = usersPage <= 1;
    if (nextBtn) nextBtn.disabled = usersPage >= totalPages;
    
    if (pageNumbersEl) {
        let pages = [];
        const maxVisible = 5;
        let start = Math.max(1, usersPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
        
        for (let i = start; i <= end; i++) {
            pages.push(`<button class="admin-btn-small ${i === usersPage ? 'active' : ''}" onclick="goToUsersPage(${i})" style="min-width: 35px;">${i}</button>`);
        }
        pageNumbersEl.innerHTML = pages.join('');
    }
}

function changeUsersPage(direction) {
    const totalPages = Math.ceil(usersTotal / USERS_PER_PAGE);
    const newPage = usersPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        usersPage = newPage;
        loadUsersList();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function goToUsersPage(page) {
    usersPage = page;
    loadUsersList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function sortUsers(field) {
    const currentField = currentSort.field;
    const currentOrder = currentSort.order;
    
    if (field === currentField) {
        currentSort.order = currentOrder === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field;
        currentSort.order = 'desc';
    }
    
    const sortSelect = document.getElementById("userSort");
    if (sortSelect) {
        sortSelect.value = `${currentSort.field}_${currentSort.order}`;
    }
    
    loadUsersList();
}

function debounceSearch() {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        loadUsersList(true);
    }, 500);
}

function exportUsersCSV() {
    if (usersData.length === 0) {
        showToast("Aucune donnée à exporter", "error");
        return;
    }
    
    const headers = ["Email", "Pseudo", "Inscription", "Source", "Dernière activité", "1er Zig", "Statut"];
    const csvRows = [headers.join(",")];
    
    usersData.forEach(user => {
        const created = new Date(user.created_at);
        const lastSeen = user.last_seen_at ? new Date(user.last_seen_at) : null;
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        let status = "Inactif";
        if (lastSeen && lastSeen >= weekAgo) status = "Actif";
        else if (created >= weekAgo) status = "Nouveau";
        
        const row = [
            user.email || '',
            user.username || '',
            created.toLocaleDateString('fr-FR'),
            user.signup_source || 'organic',
            lastSeen ? lastSeen.toLocaleDateString('fr-FR') : 'Jamais',
            user.first_zig_created_at ? 'Oui' : 'Non',
            status
        ];
        csvRows.push(row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    });
    
    const csv = csvRows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("Export CSV réussi !");
}

function exportUsersJSON() {
    if (usersData.length === 0) {
        showToast("Aucune donnée à exporter", "error");
        return;
    }
    
    const json = JSON.stringify(usersData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `utilisateurs_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("Export JSON réussi !");
}

function exportCustomData() {
    const columns = prompt("Colonnes à exporter (séparées par des virgules):\nEmail, Pseudo, Inscription, Source, Dernière activité, 1er Zig, Statut");
    if (!columns) return;
    
    const selectedCols = columns.split(',').map(c => c.trim());
    const headers = ["Email", "Pseudo", "Inscription", "Source", "Dernière activité", "1er Zig", "Statut"];
    const validCols = selectedCols.filter(c => headers.includes(c));
    
    if (validCols.length === 0) {
        showToast("Aucune colonne valide sélectionnée", "error");
        return;
    }
    
    const csvRows = [validCols.join(",")];
    
    usersData.forEach(user => {
        const created = new Date(user.created_at);
        const lastSeen = user.last_seen_at ? new Date(user.last_seen_at) : null;
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        let status = "Inactif";
        if (lastSeen && lastSeen >= weekAgo) status = "Actif";
        else if (created >= weekAgo) status = "Nouveau";
        
        const data = {
            "Email": user.email || '',
            "Pseudo": user.username || '',
            "Inscription": created.toLocaleDateString('fr-FR'),
            "Source": user.signup_source || 'organic',
            "Dernière activité": lastSeen ? lastSeen.toLocaleDateString('fr-FR') : 'Jamais',
            "1er Zig": user.first_zig_created_at ? 'Oui' : 'Non',
            "Statut": status
        };
        
        const row = validCols.map(col => `"${String(data[col] || '').replace(/"/g, '""')}"`);
        csvRows.push(row.join(","));
    });
    
    const csv = csvRows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `utilisateurs_personnalise_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("Export personnalisé réussi !");
}

function showExportMenu() {
    const menu = document.getElementById("exportMenu");
    if (menu) {
        const rect = event.target.getBoundingClientRect();
        menu.style.display = menu.style.display === "none" ? "block" : "none";
        menu.style.top = `${rect.bottom + 5}px`;
        menu.style.left = `${rect.left}px`;
    }
}

// Fermer le menu export si on clique ailleurs
document.addEventListener('click', (e) => {
    const menu = document.getElementById("exportMenu");
    const btn = event.target.closest('[onclick="showExportMenu()"]');
    if (menu && !menu.contains(e.target) && !btn) {
        menu.style.display = "none";
    }
});

async function exportToPDF() {
    if (typeof window.jspdf === 'undefined') {
        showToast("Bibliothèque PDF non chargée", "error");
        return;
    }
    
    showToast("Génération du PDF en cours...");
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        doc.setFontSize(20);
        doc.text('Dashboard Admin Zigzag', 20, 20);
        
        doc.setFontSize(12);
        doc.text(`Rapport généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 30);
        
        doc.setFontSize(16);
        doc.text('Vue d\'ensemble', 20, 45);
        
        const summaryKPIs = document.getElementById("summaryKPIs");
        if (summaryKPIs) {
            doc.setFontSize(12);
            let yPos = 55;
            summaryKPIs.querySelectorAll(".kpi-card").forEach((card) => {
                const label = card.querySelector(".kpi-label")?.textContent || '';
                const value = card.querySelector(".kpi-value")?.textContent || '';
                doc.text(`${label}: ${value}`, 20, yPos);
                yPos += 10;
            });
        }
        
        doc.save(`dashboard_zigzag_${new Date().toISOString().split('T')[0]}.pdf`);
        showToast("PDF généré avec succès !");
    } catch (err) {
        console.error("Erreur génération PDF:", err);
        showToast("Erreur lors de la génération du PDF", "error");
    }
}

// Variable pour empêcher les appels multiples
let isChangingWeek = false;
let weekPickerCurrentMonth = new Date();
let weekPickerSelectedDate = null;

// ==================== NOUVEAU SYSTÈME DE SÉLECTION DE SEMAINE ====================

function showWeekPicker() {
    const modal = document.getElementById("weekPickerModal");
    if (modal) {
        modal.style.display = "flex";
        weekPickerCurrentMonth = new Date();
        weekPickerSelectedDate = null;
        renderWeekPicker();
    }
}

function closeWeekPicker() {
    const modal = document.getElementById("weekPickerModal");
    if (modal) {
        modal.style.display = "none";
    }
}

function changeWeekPickerMonth(offset) {
    weekPickerCurrentMonth.setMonth(weekPickerCurrentMonth.getMonth() + offset);
    renderWeekPicker();
}

function renderWeekPicker() {
    const calendar = document.getElementById("weekPickerCalendar");
    const monthDisplay = document.getElementById("weekPickerMonth");
    if (!calendar || !monthDisplay) return;

    const year = weekPickerCurrentMonth.getFullYear();
    const month = weekPickerCurrentMonth.getMonth();
    
    // Afficher le mois et l'année
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
                        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    monthDisplay.textContent = `${monthNames[month]} ${year}`;

    // Calculer le premier jour du mois et le nombre de jours
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay() || 7; // Convertir dimanche (0) en 7

    // En-têtes des jours
    const dayHeaders = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    
    calendar.innerHTML = "";
    
    // Ajouter les en-têtes
    dayHeaders.forEach(header => {
        const headerEl = document.createElement("div");
        headerEl.className = "week-picker-day-header";
        headerEl.textContent = header;
        calendar.appendChild(headerEl);
    });

    // Ajouter les jours du mois précédent (pour compléter la première semaine)
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    for (let i = startDay - 1; i > 0; i--) {
        const day = prevMonthLastDay - i + 1;
        const date = new Date(prevYear, prevMonth, day);
        const dayEl = createWeekPickerDay(date, true);
        calendar.appendChild(dayEl);
    }

    // Ajouter les jours du mois actuel
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isToday = date.getTime() === today.getTime();
        const dayEl = createWeekPickerDay(date, false, isToday);
        calendar.appendChild(dayEl);
    }

    // Ajouter les jours du mois suivant (pour compléter la dernière semaine)
    const daysToAdd = 42 - (startDay - 1 + daysInMonth); // 42 = 6 semaines * 7 jours
    for (let day = 1; day <= daysToAdd; day++) {
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        const date = new Date(nextYear, nextMonth, day);
        const dayEl = createWeekPickerDay(date, true);
        calendar.appendChild(dayEl);
    }

    // Afficher la semaine sélectionnée si applicable
    updateWeekPickerInfo();
}

function createWeekPickerDay(date, isOtherMonth, isToday = false) {
    const dayEl = document.createElement("div");
    dayEl.className = "week-picker-day";
    dayEl.textContent = date.getDate();
    
    if (isOtherMonth) {
        dayEl.classList.add("other-month");
    }
    
    if (isToday) {
        dayEl.classList.add("today");
    }
    
    // Vérifier si ce jour est dans la semaine sélectionnée
    if (weekPickerSelectedDate) {
        const selectedWeekStart = getWeekStart(weekPickerSelectedDate);
        const selectedWeekEnd = new Date(selectedWeekStart);
        selectedWeekEnd.setDate(selectedWeekEnd.getDate() + 6);
        
        if (date >= selectedWeekStart && date <= selectedWeekEnd) {
            dayEl.classList.add("selected");
            if (date.getTime() === selectedWeekStart.getTime()) {
                dayEl.classList.add("week-start");
            }
            if (date.getTime() === selectedWeekEnd.getTime()) {
                dayEl.classList.add("week-end");
            }
        }
    }
    
    dayEl.addEventListener("click", () => {
        if (!isOtherMonth) {
            weekPickerSelectedDate = new Date(date);
            renderWeekPicker(); // Re-render pour mettre à jour la sélection
        }
    });
    
    return dayEl;
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay() || 7;
    const diff = d.getDate() - day + 1; // Lundi
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
}

function updateWeekPickerInfo() {
    if (!weekPickerSelectedDate) {
        // Si aucune sélection, utiliser la semaine actuelle
        weekPickerSelectedDate = new Date();
    }
    
    const weekStart = getWeekStart(weekPickerSelectedDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekStartStr = weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    const weekEndStr = weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Mettre à jour l'affichage dans le header
    const weekDisplay = document.getElementById("weekDisplay");
    if (weekDisplay) {
        weekDisplay.textContent = `${weekStartStr} - ${weekEndStr}`;
    }
}

function selectWeekFromPicker() {
    if (!weekPickerSelectedDate) {
        weekPickerSelectedDate = new Date();
    }
    
    const weekStart = getWeekStart(weekPickerSelectedDate);
    currentWeekStart = weekStart.toISOString().split('T')[0];
    
    // Mettre à jour l'affichage
    updateWeekDisplay();
    
    // Charger la checklist
    loadChecklist();
    
    // Fermer le modal
    closeWeekPicker();
    
    showToast(`Semaine du ${weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} sélectionnée`);
}

function goToCurrentWeek() {
    currentWeekStart = getCurrentWeekStart();
    updateWeekDisplay();
    loadChecklist();
    showToast("Retour à la semaine actuelle");
}

function updateWeekDisplay() {
    if (!currentWeekStart) {
        currentWeekStart = getCurrentWeekStart();
    }
    
    const weekStart = new Date(currentWeekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekStartStr = weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    const weekEndStr = weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const weekDisplay = document.getElementById("weekDisplay");
    if (weekDisplay) {
        weekDisplay.textContent = `${weekStartStr} - ${weekEndStr}`;
    }
}

// Ancienne fonction changeWeek (conservée pour compatibilité mais non utilisée)
function changeWeek(offset) {
    const weekInput = document.getElementById("weekSelector");
    if (!weekInput) return;
    
    // Empêcher les clics multiples rapides
    if (isChangingWeek) {
        console.log("Changement de semaine déjà en cours, ignoré");
        return;
    }
    isChangingWeek = true;
    
    let currentDate;
    
    // Si la valeur existe et est valide, l'utiliser
    if (weekInput.value && weekInput.value.match(/^\d{4}-W\d{2}$/)) {
        try {
            const [year, week] = weekInput.value.split('-W').map(Number);
            
            // Vérifier que les valeurs sont valides
            if (isNaN(year) || isNaN(week) || week < 1 || week > 53 || year < 2000 || year > 2100) {
                throw new Error("Valeurs invalides");
            }
            
            // Calculer le lundi de cette semaine ISO
            const jan4 = new Date(year, 0, 4);
            const jan4Day = jan4.getDay() || 7;
            const week1Monday = new Date(year, 0, 4 - jan4Day + 1);
            const weekStart = new Date(week1Monday);
            weekStart.setDate(week1Monday.getDate() + (week - 1) * 7);
            
            currentDate = weekStart;
            console.log("Semaine actuelle:", { year, week, weekStart: currentDate.toISOString().split('T')[0] });
        } catch (err) {
            console.error("Erreur parsing semaine:", err);
            currentDate = new Date();
        }
    } else {
        currentDate = new Date();
    }
    
    // Ajouter/soustraire exactement 7 jours (une semaine)
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (offset * 7));
    console.log("Nouvelle date après offset:", newDate.toISOString().split('T')[0], "offset:", offset);
    
    // Calculer l'année et la semaine ISO de la nouvelle date
    const newYear = newDate.getFullYear();
    const newWeek = getWeekNumber(newDate);
    
    console.log("Calcul semaine:", { newYear, newWeek, newDate: newDate.toISOString().split('T')[0] });
    
    // Vérifier que le calcul est valide
    if (isNaN(newYear) || isNaN(newWeek) || newWeek < 1) {
        console.error("Erreur calcul semaine:", { newYear, newWeek, newDate });
        const today = new Date();
        const fallbackYear = today.getFullYear();
        const fallbackWeek = getWeekNumber(today);
        if (!isNaN(fallbackWeek) && fallbackWeek >= 1) {
            weekInput.value = `${fallbackYear}-W${String(fallbackWeek).padStart(2, '0')}`;
        }
    } else {
        // Déterminer l'année correcte pour la semaine calculée
        // getWeekNumber retourne toujours la semaine pour l'année de la date donnée
        // Mais il faut vérifier si on est vraiment dans cette année ou dans l'année suivante/précédente
        let finalYear = newYear;
        let finalWeek = newWeek;
        
        // Vérifier si on est dans l'année suivante (fin décembre -> janvier)
        const nextYearJan4 = new Date(newYear + 1, 0, 4);
        const nextYearJan4Day = nextYearJan4.getDay() || 7;
        const nextYearWeek1Monday = new Date(newYear + 1, 0, 4 - nextYearJan4Day + 1);
        
        if (newDate >= nextYearWeek1Monday) {
            // On est dans l'année suivante
            finalYear = newYear + 1;
            finalWeek = 1;
        } else {
            // Vérifier si on est dans l'année précédente (début janvier)
            const jan4 = new Date(newYear, 0, 4);
            const jan4Day = jan4.getDay() || 7;
            const week1Monday = new Date(newYear, 0, 4 - jan4Day + 1);
            
            if (newDate < week1Monday) {
                // On est dans l'année précédente
                finalYear = newYear - 1;
                // Recalculer la semaine pour l'année précédente
                const prevJan4 = new Date(finalYear, 0, 4);
                const prevJan4Day = prevJan4.getDay() || 7;
                const prevWeek1Monday = new Date(finalYear, 0, 4 - prevJan4Day + 1);
                const dayOfWeek = newDate.getDay() || 7;
                const weekMonday = new Date(newDate);
                weekMonday.setDate(newDate.getDate() - dayOfWeek + 1);
                const diffDays = Math.floor((weekMonday - prevWeek1Monday) / (1000 * 60 * 60 * 24));
                finalWeek = Math.floor(diffDays / 7) + 1;
                if (finalWeek < 1) finalWeek = 52;
                if (finalWeek > 53) finalWeek = 53;
            } else if (newWeek > 53) {
                // Limiter à 53 maximum
                finalWeek = 53;
            }
        }
        
        console.log("Valeurs finales:", { finalYear, finalWeek, newDate: newDate.toISOString().split('T')[0] });
        weekInput.value = `${finalYear}-W${String(finalWeek).padStart(2, '0')}`;
    }
    
    // Réactiver après le chargement
    setTimeout(() => {
        isChangingWeek = false;
    }, 1000);
    
    // Charger la checklist pour cette semaine
    loadChecklistForWeek();
}

function getWeekNumber(date) {
    try {
        if (!date || isNaN(date.getTime())) {
            console.error("Date invalide pour getWeekNumber:", date);
            return 1;
        }
        
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const year = d.getFullYear();
        
        // Le 4 janvier est toujours dans la semaine 1
        const jan4 = new Date(year, 0, 4);
        const jan4Day = jan4.getDay() || 7;
        const week1Monday = new Date(year, 0, 4 - jan4Day + 1);
        
        // Calculer le lundi de la semaine de la date donnée
        const dayOfWeek = d.getDay() || 7;
        const weekMonday = new Date(d);
        weekMonday.setDate(d.getDate() - dayOfWeek + 1);
        weekMonday.setHours(0, 0, 0, 0);
        
        // Calculer le nombre de semaines depuis le lundi de la semaine 1
        const diffTime = weekMonday - week1Monday;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        let week = Math.floor(diffDays / 7) + 1;
        
        // Si la semaine est négative, on est dans l'année précédente
        if (week < 1) {
            const prevYear = year - 1;
            const prevJan4 = new Date(prevYear, 0, 4);
            const prevJan4Day = prevJan4.getDay() || 7;
            const prevWeek1Monday = new Date(prevYear, 0, 4 - prevJan4Day + 1);
            const prevDiffTime = weekMonday - prevWeek1Monday;
            const prevDiffDays = Math.floor(prevDiffTime / (1000 * 60 * 60 * 24));
            week = Math.floor(prevDiffDays / 7) + 1;
            if (week < 1) week = 52; // Fallback
            return week;
        }
        
        // Si la semaine est > 52, vérifier si on est dans l'année suivante
        if (week > 52) {
            const nextYear = year + 1;
            const nextJan4 = new Date(nextYear, 0, 4);
            const nextJan4Day = nextJan4.getDay() || 7;
            const nextWeek1Monday = new Date(nextYear, 0, 4 - nextJan4Day + 1);
            
            if (weekMonday >= nextWeek1Monday) {
                // On est dans l'année suivante, semaine 1
                return 1;
            }
            // Sinon, on est dans la semaine 53 de l'année actuelle (certaines années ont 53 semaines)
            return week <= 53 ? week : 53;
        }
        
        return week;
    } catch (err) {
        console.error("Erreur dans getWeekNumber:", err);
        return 1;
    }
}

function loadChecklistForWeek() {
    const weekInput = document.getElementById("weekSelector");
    if (!weekInput || !weekInput.value || !weekInput.value.match(/^\d{4}-W\d{2}$/)) {
        // Si pas de valeur valide, utiliser la semaine actuelle
        currentWeekStart = getCurrentWeekStart();
        // Mettre à jour l'input avec la semaine actuelle
        if (weekInput) {
            const today = new Date();
            const year = today.getFullYear();
            const week = getWeekNumber(today);
            weekInput.value = `${year}-W${String(week).padStart(2, '0')}`;
        }
        loadChecklist();
        return;
    }
    
    // Parser la valeur de la semaine ISO (format: YYYY-Www)
    const [year, week] = weekInput.value.split('-W').map(Number);
    
    if (isNaN(year) || isNaN(week) || week < 1 || week > 53) {
        // Valeur invalide, utiliser la semaine actuelle
        currentWeekStart = getCurrentWeekStart();
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentWeek = getWeekNumber(today);
        weekInput.value = `${currentYear}-W${String(currentWeek).padStart(2, '0')}`;
        loadChecklist();
        return;
    }
    
    // Calculer le lundi de la semaine ISO
    // Le 4 janvier est toujours dans la semaine 1
    const jan4 = new Date(year, 0, 4);
    const jan4Day = jan4.getDay() || 7; // Convertir dimanche (0) en 7
    // Le lundi de la semaine 1
    const week1Monday = new Date(year, 0, 4 - jan4Day + 1);
    // Ajouter (week - 1) semaines
    const weekStart = new Date(week1Monday);
    weekStart.setDate(week1Monday.getDate() + (week - 1) * 7);
    
    // S'assurer que la date est valide
    if (isNaN(weekStart.getTime())) {
        console.error("Date de semaine invalide calculée");
        currentWeekStart = getCurrentWeekStart();
    } else {
        currentWeekStart = weekStart.toISOString().split('T')[0];
    }
    
    console.log("Chargement checklist pour semaine:", currentWeekStart, "valeur input:", weekInput.value);
    
    // Forcer le rechargement en vidant les containers
    const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    days.forEach(day => {
        const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
        const container = document.getElementById(`checklist${dayCapitalized}`);
        if (container) {
            container.innerHTML = '<div style="padding: 10px; text-align: center; color: #999;">Chargement...</div>';
        }
    });
    
    loadChecklist();
}

// ==================== MODE SOMBRE ====================
function toggleDarkMode() {
    const container = document.querySelector(".admin-container");
    const isDark = container.classList.toggle("dark-mode");
    localStorage.setItem("admin_dark_mode", isDark);
    showToast(isDark ? "Mode sombre activé" : "Mode clair activé");
}

function initDarkMode() {
    const saved = localStorage.getItem("admin_dark_mode");
    if (saved === "true") {
        document.querySelector(".admin-container")?.classList.add("dark-mode");
    }
}

// ==================== GRAPHIQUE DES COÛTS ====================
async function loadCostsChart() {
    try {
        const periodDays = currentPeriod || Math.ceil((new Date(customPeriodEnd) - new Date(customPeriodStart)) / (1000 * 60 * 60 * 24));
        const periodStart = currentPeriod 
            ? new Date(Date.now() - currentPeriod * 24 * 60 * 60 * 1000)
            : new Date(customPeriodStart);
        const periodEnd = customPeriodEnd ? new Date(customPeriodEnd) : new Date();

        const { data: costs, error } = await supabaseClient
            .from("daily_costs")
            .select("*")
            .gte("date", periodStart.toISOString().split('T')[0])
            .lte("date", periodEnd.toISOString().split('T')[0])
            .order("date", { ascending: true });

        if (error) throw error;

        const labels = [];
        const instagramData = [];
        const tiktokData = [];
        const linkedinData = [];
        const totalData = [];

        const costsByDate = {};
        costs?.forEach(c => {
            costsByDate[c.date] = c;
        });

        const currentDate = new Date(periodStart);
        while (currentDate <= periodEnd) {
            const dateStr = currentDate.toISOString().split('T')[0];
            labels.push(currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }));
            
            const cost = costsByDate[dateStr];
            instagramData.push(cost?.cost_instagram || 0);
            tiktokData.push(cost?.cost_tiktok || 0);
            linkedinData.push(cost?.cost_linkedin || 0);
            totalData.push(cost?.cost_total || 0);
            
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (charts.costs) charts.costs.destroy();
        charts.costs = new Chart(document.getElementById("costsChart"), {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Instagram",
                        data: instagramData,
                        borderColor: "#E4405F",
                        backgroundColor: "rgba(228, 64, 95, 0.1)",
                        tension: 0.4
                    },
                    {
                        label: "TikTok",
                        data: tiktokData,
                        borderColor: "#000000",
                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                        tension: 0.4
                    },
                    {
                        label: "LinkedIn",
                        data: linkedinData,
                        borderColor: "#0077B5",
                        backgroundColor: "rgba(0, 119, 181, 0.1)",
                        tension: 0.4
                    },
                    {
                        label: "Total",
                        data: totalData,
                        borderColor: "#FF912D",
                        backgroundColor: "rgba(255, 145, 45, 0.1)",
                        tension: 0.4,
                        borderWidth: 2
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
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (err) {
        console.error("Erreur chargement graphique coûts:", err);
    }
}

// ==================== STATISTIQUES PAR SOURCE ====================
async function loadSourceStats() {
    try {
        const periodDays = currentPeriod || Math.ceil((new Date(customPeriodEnd) - new Date(customPeriodStart)) / (1000 * 60 * 60 * 24));
        const periodStart = currentPeriod 
            ? new Date(Date.now() - currentPeriod * 24 * 60 * 60 * 1000)
            : new Date(customPeriodStart);

        const { data: users, error } = await supabaseClient
            .from("users")
            .select("signup_source, first_zig_created_at, created_at")
            .gte("created_at", periodStart.toISOString());

        if (error && error.code !== "42703") throw error;

        const { data: costs } = await supabaseClient
            .from("daily_costs")
            .select("*")
            .gte("date", periodStart.toISOString().split('T')[0]);

        const sources = ['instagram', 'tiktok', 'linkedin', 'organic'];
        const stats = {};

        sources.forEach(source => {
            const sourceUsers = users?.filter(u => (u.signup_source || 'organic') === source) || [];
            const total = sourceUsers.length;
            const activated = sourceUsers.filter(u => u.first_zig_created_at).length;
            const activationRate = total > 0 ? ((activated / total) * 100).toFixed(1) : 0;
            
            const sourceCosts = costs?.filter(c => {
                if (source === 'instagram') return c.cost_instagram > 0;
                if (source === 'tiktok') return c.cost_tiktok > 0;
                if (source === 'linkedin') return c.cost_linkedin > 0;
                return false;
            }) || [];
            
            const totalCost = sourceCosts.reduce((sum, c) => {
                if (source === 'instagram') return sum + (c.cost_instagram || 0);
                if (source === 'tiktok') return sum + (c.cost_tiktok || 0);
                if (source === 'linkedin') return sum + (c.cost_linkedin || 0);
                return sum;
            }, 0);
            
            const cpa = total > 0 ? (totalCost / total).toFixed(2) : 0;
            
            stats[source] = { total, activated, activationRate, totalCost, cpa };
        });

        const statsHTML = sources.map(source => {
            const s = stats[source];
            const sourceName = source.charAt(0).toUpperCase() + source.slice(1);
            return `
                <div class="kpi-card">
                    <div class="kpi-label">${sourceName}</div>
                    <div class="kpi-value">${s.total}</div>
                    <div class="kpi-change">Activation: ${s.activationRate}%</div>
                    ${s.totalCost > 0 ? `<div class="kpi-change">CPA: ${s.cpa}€</div>` : ''}
                </div>
            `;
        }).join('');

        document.getElementById("sourceStats").innerHTML = statsHTML;
    } catch (err) {
        console.error("Erreur stats par source:", err);
    }
}

// ==================== SAUVEGARDE DES PRÉFÉRENCES ====================
function saveSettings() {
    const defaultPeriod = document.getElementById("defaultPeriod")?.value;
    const autoRefresh = document.getElementById("autoRefresh")?.checked;
    
    localStorage.setItem("admin_default_period", defaultPeriod);
    localStorage.setItem("admin_auto_refresh", autoRefresh);
    
    if (defaultPeriod) {
        currentPeriod = parseInt(defaultPeriod);
        document.getElementById("periodSelect").value = defaultPeriod;
    }
    
    showToast("Préférences enregistrées !");
    closeSettings();
}

function loadSettings() {
    const defaultPeriod = localStorage.getItem("admin_default_period");
    const autoRefresh = localStorage.getItem("admin_auto_refresh");
    
    if (defaultPeriod) {
        currentPeriod = parseInt(defaultPeriod);
        const periodSelect = document.getElementById("periodSelect");
        if (periodSelect) periodSelect.value = defaultPeriod;
    }
    
    if (autoRefresh !== null) {
        const autoRefreshCheck = document.getElementById("autoRefresh");
        if (autoRefreshCheck) autoRefreshCheck.checked = autoRefresh === "true";
    }
}

function showSettings() {
    document.getElementById("settingsModal").style.display = "flex";
    loadSettings();
}

function closeSettings() {
    document.getElementById("settingsModal").style.display = "none";
}

function showChangePassword() {
    document.getElementById("passwordModal").style.display = "flex";
    document.getElementById("changePasswordForm").reset();
    document.getElementById("passwordError").textContent = "";
}

function closePasswordModal() {
    document.getElementById("passwordModal").style.display = "none";
}

document.getElementById("changePasswordForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmNewPassword").value;
    
    if (newPassword !== confirmPassword) {
        document.getElementById("passwordError").textContent = "Les mots de passe ne correspondent pas";
        return;
    }
    
    if (oldPassword !== ADMIN_CREDENTIALS.password) {
        document.getElementById("passwordError").textContent = "Ancien mot de passe incorrect";
        return;
    }
    
    // En production, cela devrait être géré côté serveur
    ADMIN_CREDENTIALS.password = newPassword;
    localStorage.setItem("admin_password_hash", btoa(newPassword)); // Simple encoding, pas sécurisé
    
    showToast("Mot de passe changé avec succès !");
    closePasswordModal();
});

// ==================== RACCOURCIS CLAVIER ====================
document.addEventListener("keydown", (e) => {
    // R pour refresh
    if (e.key === "r" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        manualRefresh();
    }
    
    // Échap pour fermer les modales
    if (e.key === "Escape") {
        closeSettings();
        closePasswordModal();
        const exportMenu = document.getElementById("exportMenu");
        if (exportMenu) exportMenu.style.display = "none";
    }
    
    // ? pour l'aide
    if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        showHelp();
    }
});

function showHelp() {
    alert(`Raccourcis clavier:
- Ctrl/Cmd + R : Actualiser les données
- Échap : Fermer les modales
- ? : Afficher cette aide`);
}

// ==================== CACHE ET PERFORMANCE ====================
function getCachedData(key) {
    const cached = dataCache[key];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
}

function setCachedData(key, data) {
    dataCache[key] = {
        data,
        timestamp: Date.now()
    };
}

// ==================== TIMEOUT DE SESSION ====================
function initSessionTimeout() {
    const WARNING_TIME = 5 * 60 * 1000; // 5 minutes avant expiration
    const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 heures
    
    setInterval(() => {
        const session = getAdminSession();
        if (session) {
            const timeLeft = SESSION_DURATION - (Date.now() - session.timestamp);
            if (timeLeft < WARNING_TIME && timeLeft > 0) {
                if (confirm(`Votre session expire dans ${Math.ceil(timeLeft / 60000)} minutes. Voulez-vous rester connecté ?`)) {
                    setAdminSession(); // Renouveler la session
                }
            } else if (timeLeft <= 0) {
                adminLogout();
                showToast("Session expirée", "error");
            }
        }
    }, 60000); // Vérifier toutes les minutes
}

// ==================== AMÉLIORATION SECTION VIRAL ====================
async function loadViralData() {
    try {
        // Pour l'instant, on garde les placeholders mais on peut ajouter des calculs basés sur les données disponibles
        const { data: users } = await supabaseClient
            .from("users")
            .select("created_at, signup_source")
            .order("created_at", { ascending: false })
            .limit(100);

        // Calculs approximatifs basés sur les sources
        const totalUsers = users?.length || 0;
        const organicUsers = users?.filter(u => (u.signup_source || 'organic') === 'organic').length || 0;
        const referredUsers = totalUsers - organicUsers;
        
        // K-factor approximatif (basé sur le ratio)
        const kFactor = totalUsers > 0 ? ((referredUsers / totalUsers) * 100).toFixed(1) : 0;

        document.getElementById("viralKPIs").innerHTML = `
            <div class="kpi-card">
                <div class="kpi-label">K-factor</div>
                <div class="kpi-value">${kFactor}%</div>
                <div class="kpi-change">Ratio utilisateurs référencés</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Utilisateurs référencés</div>
                <div class="kpi-value">${referredUsers}</div>
                <div class="kpi-change">Sur ${totalUsers} total</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Taux de partage</div>
                <div class="kpi-value">-</div>
                <div class="kpi-change">À implémenter avec données partages</div>
            </div>
        `;

        document.getElementById("viralLoading").style.display = "none";
        document.getElementById("viralContent").style.display = "block";
    } catch (err) {
        console.error("Erreur viral:", err);
        document.getElementById("viralLoading").textContent = "Erreur lors du chargement des données";
    }
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    // Définir la date par défaut à aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById("costDate");
    if (dateInput) {
        dateInput.value = today;
    }
    
    initAdminAuth();
    initPeriodFilters();
    initDarkMode();
    loadSettings();
    initSessionTimeout();
    
    // Initialiser l'affichage de la semaine actuelle
    currentWeekStart = getCurrentWeekStart();
    updateWeekDisplay();
    
    // Fermer les modales en cliquant à l'extérieur
    window.onclick = function(event) {
        const settingsModal = document.getElementById("settingsModal");
        const passwordModal = document.getElementById("passwordModal");
        const weekPickerModal = document.getElementById("weekPickerModal");
        
        if (event.target === settingsModal) {
            closeSettings();
        }
        if (event.target === passwordModal) {
            closePasswordModal();
        }
        if (event.target === weekPickerModal) {
            closeWeekPicker();
        }
    }
    
    // Initialiser les subscriptions temps réel après connexion
    const session = getAdminSession();
    if (session && !isSessionExpired(session)) {
        initRealtimeSubscriptions();
        
        // Refresh automatique si activé
        const autoRefresh = localStorage.getItem("admin_auto_refresh");
        if (autoRefresh !== "false") {
            setInterval(() => {
                loadDashboardData();
            }, 60000);
        }
    }
    
    // Fermer les modales en cliquant à l'extérieur
    window.onclick = function(event) {
        const settingsModal = document.getElementById("settingsModal");
        const passwordModal = document.getElementById("passwordModal");
        if (event.target === settingsModal) {
            closeSettings();
        }
        if (event.target === passwordModal) {
            closePasswordModal();
        }
    }
});

