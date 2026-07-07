/* ==========================================================================
   MAIN APPLICATION CONTROLLER
   ========================================================================== */

window.App = (() => {
  let currentProject = null;
  let saveTimeout = null;
  let previewTimeout = null;

  // 1. Initial Launch
  function start() {
    // Initialize components
    StorageManager.getAllProjects(); // Touch storage
    EditorManager.init(handleCodeChange);
    PreviewManager.init();

    // Wire up events
    setupGlobalEvents();
    setupDashboardEvents();
    setupEditorEvents();
    setupSplitter();

    // Load initial dashboard
    renderProjectsList();
  }

  // 2. Setup Global Key listeners
  function setupGlobalEvents() {
    // Intercept Ctrl+S (prevent browser save) and Ctrl+Enter (run preview)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentProjectImmediately();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (currentProject) {
          e.preventDefault();
          runPreview();
        }
      }
      if (e.shiftKey && e.altKey && (e.key === 'f' || e.key === 'F')) {
        if (currentProject) {
          e.preventDefault();
          EditorManager.formatActiveEditor();
        }
      }
    });
  }

  // ==========================================
  //            DASHBOARD MODULE
  // ==========================================
  
  function setupDashboardEvents() {
    const newProjBtn = document.getElementById('new-project-btn');
    const modal = document.getElementById('template-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const importBtn = document.getElementById('import-btn');
    const importInput = document.getElementById('import-file-input');

    // Show Template Selection Modal
    newProjBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
    });

    // Close Modal
    closeModalBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
    
    // Close Modal when clicking backdrop
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });

    // Handle Template Card Selection
    document.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', () => {
        const templateType = card.getAttribute('data-template');
        const project = StorageManager.createProject(templateType);
        
        modal.classList.add('hidden');
        openProject(project.id);
      });
    });

    // File Import Trigger
    importBtn.addEventListener('click', () => {
      importInput.click();
    });

    importInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        StorageManager.importProjectFromJsonFile(file, (importedProj) => {
          renderProjectsList();
          openProject(importedProj.id);
          importInput.value = ''; // Reset input
        });
      }
    });
  }

  // Render list of projects in the dashboard grid
  function renderProjectsList() {
    const grid = document.getElementById('projects-grid');
    const projects = StorageManager.getAllProjects();

    // Clear grid
    grid.innerHTML = '';

    // 1. Add "Create New Project" Card first
    const newCard = document.createElement('div');
    newCard.className = 'project-card project-card-new';
    newCard.innerHTML = `
      <div class="new-card-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </div>
      <span>Створити проект</span>
    `;
    newCard.addEventListener('click', () => {
      document.getElementById('template-modal').classList.remove('hidden');
    });
    grid.appendChild(newCard);

    // Sort projects: newest first
    const sortedProjects = [...projects].sort((a, b) => b.lastModified - a.lastModified);

    // 2. Add Project Cards
    sortedProjects.forEach(proj => {
      const card = document.createElement('div');
      card.className = 'project-card';
      
      const dateStr = new Date(proj.lastModified).toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // HTML contents for tags
      let tagsHtml = '';
      if (proj.html && proj.html.trim().length > 0) tagsHtml += '<span class="tag tag-html">HTML</span>';
      if (proj.css && proj.css.trim().length > 0) tagsHtml += '<span class="tag tag-css">CSS</span>';
      if (proj.js && proj.js.trim().length > 0) tagsHtml += '<span class="tag tag-js">JS</span>';

      card.innerHTML = `
        <div class="project-info">
          <div class="project-name" title="${escapeHtml(proj.title)}">${escapeHtml(proj.title)}</div>
          <div class="project-date">Змінено: ${dateStr}</div>
        </div>
        <div class="project-tags">
          ${tagsHtml || '<span class="tag" style="color:var(--text-dim)">порожній</span>'}
        </div>
        <div class="project-actions">
          <button class="btn-card-action duplicate-btn" title="Зробити копію" data-id="${proj.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="btn-card-action delete delete-btn" title="Видалити проект" data-id="${proj.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
          <button class="btn-card-open open-btn" data-id="${proj.id}">Відкрити</button>
        </div>
      `;

      // Wire actions inside card
      card.querySelector('.open-btn').addEventListener('click', () => openProject(proj.id));
      
      card.querySelector('.duplicate-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        StorageManager.duplicateProject(proj.id);
        renderProjectsList();
      });

      card.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Ви дійсно бажаєте видалити проект "${proj.title}"?`)) {
          StorageManager.deleteProject(proj.id);
          renderProjectsList();
        }
      });

      grid.appendChild(card);
    });
  }

  // ==========================================
  //             EDITOR MODULE
  // ==========================================

  function setupEditorEvents() {
    const backBtn = document.getElementById('back-btn');
    const runBtn = document.getElementById('run-btn');
    const formatBtn = document.getElementById('format-btn');
    const titleInput = document.getElementById('project-title-input');
    const downloadZipBtn = document.getElementById('download-zip-btn');
    const exportJsonBtn = document.getElementById('export-json-btn');

    // Format active code
    formatBtn.addEventListener('click', () => {
      if (currentProject) {
        EditorManager.formatActiveEditor();
      }
    });

    // Back to dashboard
    backBtn.addEventListener('click', () => {
      saveCurrentProjectImmediately();
      
      // Stop ongoing timers
      clearTimeout(saveTimeout);
      clearTimeout(previewTimeout);
      currentProject = null;

      // Swap views
      document.getElementById('editor-view').classList.add('hidden');
      document.getElementById('dashboard-view').classList.remove('hidden');
      
      // Refresh list
      renderProjectsList();
    });

    // Run preview
    runBtn.addEventListener('click', runPreview);

    // Title text changes
    titleInput.addEventListener('input', () => {
      if (!currentProject) return;
      currentProject.title = titleInput.value.trim() || 'Без назви';
      markUnsaved();
      
      // Debounce save title
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(saveCurrentProjectImmediately, 600);
    });

    // Export ZIP
    downloadZipBtn.addEventListener('click', () => {
      if (currentProject) {
        saveCurrentProjectImmediately();
        StorageManager.exportProjectToZip(currentProject);
      }
    });

    // Export JSON
    exportJsonBtn.addEventListener('click', () => {
      if (currentProject) {
        saveCurrentProjectImmediately();
        StorageManager.exportProjectToJson(currentProject);
      }
    });
  }

  // Load project details into editor screen
  function openProject(id) {
    const proj = StorageManager.getProject(id);
    if (!proj) return;

    currentProject = proj;

    // Set UI values
    document.getElementById('project-title-input').value = proj.title;
    document.getElementById('save-status').className = 'save-status';
    document.getElementById('save-status').textContent = 'Збережено';

    // Toggle views
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('editor-view').classList.remove('hidden');

    // Populate editors
    EditorManager.switchTab('html'); // Default tab
    EditorManager.setValues({
      html: proj.html,
      css: proj.css,
      js: proj.js
    });

    // Compile preview on open
    PreviewManager.clearConsole();
    runPreview();
  }

  // Handle active CodeMirror changes
  function handleCodeChange(lang, value) {
    if (!currentProject) return;

    // Update active project representation
    currentProject[lang] = value;
    markUnsaved();

    // 1. Debounced Auto-Save to LocalStorage (500ms)
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveCurrentProjectImmediately, 500);

    // 2. Debounced Auto-Run (1000ms) if auto-run checked
    const autoRun = document.getElementById('auto-run-toggle').checked;
    if (autoRun) {
      clearTimeout(previewTimeout);
      previewTimeout = setTimeout(runPreview, 1000);
    }
  }

  // Save changes to localStorage immediately
  function saveCurrentProjectImmediately() {
    if (!currentProject) return;
    
    // Get fresh values from editor just in case
    const values = EditorManager.getValues();
    currentProject.html = values.html;
    currentProject.css = values.css;
    currentProject.js = values.js;

    StorageManager.updateProject(currentProject.id, {
      title: currentProject.title,
      html: currentProject.html,
      css: currentProject.css,
      js: currentProject.js
    });

    const statusEl = document.getElementById('save-status');
    statusEl.className = 'save-status';
    statusEl.textContent = 'Збережено';
  }

  // Triggers iframe compilation
  function runPreview() {
    if (!currentProject) return;
    const values = EditorManager.getValues();
    PreviewManager.update(values.html, values.css, values.js);
  }

  // Set visual unsaved indicator
  function markUnsaved() {
    const statusEl = document.getElementById('save-status');
    statusEl.className = 'save-status unsaved';
    statusEl.textContent = 'Зберігаємо...';
  }

  // ==========================================
  //             SPLITTER PANEL RESIZER
  // ==========================================

  function setupSplitter() {
    const splitter = document.getElementById('workspace-splitter');
    const paneEditors = document.getElementById('pane-editors');
    const workspace = document.querySelector('.editor-workspace');
    const iframe = document.getElementById('preview-iframe');

    splitter.addEventListener('mousedown', (e) => {
      e.preventDefault();
      
      splitter.classList.add('dragging');
      // Temporary block pointer events on iframe to prevent lag/hijack
      iframe.style.pointerEvents = 'none';

      const isHorizontal = window.innerWidth > 768;

      const onMouseMove = (moveEvent) => {
        const rect = workspace.getBoundingClientRect();
        
        if (window.innerWidth > 768) {
          // Horizontal splitter movement (side by side layout)
          const newWidth = moveEvent.clientX - rect.left;
          let percent = (newWidth / rect.width) * 100;
          
          if (percent < 20) percent = 20;
          if (percent > 80) percent = 80;
          
          paneEditors.style.width = `${percent}%`;
          paneEditors.style.height = '100%';
        } else {
          // Vertical splitter movement (stacked layout on small screens)
          const newHeight = moveEvent.clientY - rect.top;
          let percent = (newHeight / rect.height) * 100;
          
          if (percent < 20) percent = 20;
          if (percent > 80) percent = 80;
          
          paneEditors.style.height = `${percent}%`;
          paneEditors.style.width = '100%';
        }
        
        // Refresh CodeMirror layout to fit new panel sizes
        EditorManager.refreshAll();
      };

      const onMouseUp = () => {
        splitter.classList.remove('dragging');
        iframe.style.pointerEvents = 'auto';
        
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  // ==========================================
  //             HELPERS
  // ==========================================
  
  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  return {
    start
  };
})();

// Launch application on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.App.start();
});
