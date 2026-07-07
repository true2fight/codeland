/* ==========================================================================
   CODEMIRROR EDITOR CONTROLLER
   ========================================================================== */

window.EditorManager = (() => {
  let editors = {
    html: null,
    css: null,
    js: null
  };
  
  let changeCallback = null;
  let activeLang = 'html';

  // 1. Initialize CodeMirror editors
  function init(onChange) {
    changeCallback = onChange;
    
    const editorConfig = {
      lineNumbers: true,
      theme: 'material-ocean',
      autoCloseBrackets: true,
      matchBrackets: true,
      tabSize: 2,
      lineWrapping: true,
      extraKeys: {
        "Ctrl-Space": "autocomplete"
      }
    };

    // HTML Editor
    editors.html = CodeMirror.fromTextArea(document.getElementById('editor-html'), {
      ...editorConfig,
      mode: 'htmlmixed'
    });

    // CSS Editor
    editors.css = CodeMirror.fromTextArea(document.getElementById('editor-css'), {
      ...editorConfig,
      mode: 'css'
    });

    // JS Editor
    editors.js = CodeMirror.fromTextArea(document.getElementById('editor-js'), {
      ...editorConfig,
      mode: 'javascript'
    });

    // Bind change events to the editors
    Object.keys(editors).forEach(lang => {
      editors[lang].on('change', () => {
        if (changeCallback) {
          changeCallback(lang, editors[lang].getValue());
        }
      });
    });

    // Bind Tab Switching Events
    setupTabListeners();
  }

  // 2. Tab switching logic
  function setupTabListeners() {
    const tabs = document.querySelectorAll('.editor-tabs .tab-btn');
    const wrappers = document.querySelectorAll('.editor-containers .editor-wrapper');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const lang = tab.getAttribute('data-lang');
        switchTab(lang);
      });
    });
  }

  function switchTab(lang) {
    activeLang = lang;
    
    // Toggle active tab buttons
    document.querySelectorAll('.editor-tabs .tab-btn').forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Toggle active wrapper containers
    document.querySelectorAll('.editor-containers .editor-wrapper').forEach(wrap => {
      if (wrap.id === `wrapper-${lang}`) {
        wrap.classList.add('active');
      } else {
        wrap.classList.remove('active');
      }
    });

    // CRITICAL: CodeMirror refresh is required when a hidden container is shown
    setTimeout(() => {
      if (editors[lang]) {
        editors[lang].refresh();
        editors[lang].focus();
      }
    }, 50);
  }

  // 3. Set editor values
  function setValues(values) {
    if (editors.html) editors.html.setValue(values.html || '');
    if (editors.css) editors.css.setValue(values.css || '');
    if (editors.js) editors.js.setValue(values.js || '');

    // Refresh active editor
    setTimeout(() => {
      if (editors[activeLang]) {
        editors[activeLang].refresh();
      }
    }, 50);
  }

  // 4. Get editor values
  function getValues() {
    return {
      html: editors.html ? editors.html.getValue() : '',
      css: editors.css ? editors.css.getValue() : '',
      js: editors.js ? editors.js.getValue() : ''
    };
  }

  // 5. Force refresh all editors
  function refreshAll() {
    Object.keys(editors).forEach(lang => {
      if (editors[lang]) editors[lang].refresh();
    });
  }

  return {
    init,
    setValues,
    getValues,
    switchTab,
    refreshAll,
    getActiveLang: () => activeLang
  };
})();
