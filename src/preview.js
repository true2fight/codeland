/* ==========================================================================
   LIVE PREVIEW & CONSOLE REDIRECT
   ========================================================================== */

window.PreviewManager = (() => {
  let iframe = null;
  let consoleLogsContainer = null;
  let currentBlobUrl = null;
  let hasLogs = false;

  // 1. Script to inject inside the iframe to intercept console.log & global errors
  const INJECTED_CONSOLE_SCRIPT = `
    <script>
      (function() {
        const _log = console.log;
        const _warn = console.warn;
        const _error = console.error;
        const _clear = console.clear;

        function serializeArg(arg) {
          if (arg === null) return 'null';
          if (arg === undefined) return 'undefined';
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg);
            } catch (e) {
              return Object.prototype.toString.call(arg);
            }
          }
          return String(arg);
        }

        function sendToParent(type, args) {
          const message = Array.from(args).map(serializeArg).join(' ');
          window.parent.postMessage({
            source: 'codeland-console',
            type: type,
            content: message
          }, '*');
        }

        console.log = function() {
          sendToParent('log', arguments);
          _log.apply(console, arguments);
        };

        console.warn = function() {
          sendToParent('warn', arguments);
          _warn.apply(console, arguments);
        };

        console.error = function() {
          sendToParent('error', arguments);
          _error.apply(console, arguments);
        };

        console.clear = function() {
          window.parent.postMessage({
            source: 'codeland-console',
            type: 'clear'
          }, '*');
          _clear.apply(console);
        };

        // Catch runtime JavaScript errors in the iframe
        window.addEventListener('error', function(e) {
          window.parent.postMessage({
            source: 'codeland-console',
            type: 'error',
            content: e.message + ' (рядок ' + (e.lineno - 51) + ')' // Adjust for injected code line offset
          }, '*');
        });

        // Catch unhandled Promise rejections
        window.addEventListener('unhandledrejection', function(e) {
          window.parent.postMessage({
            source: 'codeland-console',
            type: 'error',
            content: 'Помилка Promise: ' + e.reason
          }, '*');
        });
      })();
    </script>
  `;

  // 2. Initialize Preview and message listeners
  function init() {
    iframe = document.getElementById('preview-iframe');
    consoleLogsContainer = document.getElementById('console-logs');
    
    // Register message receiver from the sandboxed iframe
    window.addEventListener('message', handleConsoleMessage);
    
    // Clear Console Button
    document.getElementById('clear-console-btn').addEventListener('click', clearConsole);
  }

  // 3. Process incoming messages from the iframe console
  function handleConsoleMessage(event) {
    const data = event.data;
    if (!data || data.source !== 'codeland-console') return;

    if (data.type === 'clear') {
      clearConsole();
      return;
    }

    addConsoleLog(data.type, data.content);
  }

  // 4. Update the iframe content dynamically
  function update(htmlCode, cssCode, jsCode) {
    if (!iframe) return;

    // Revoke previous URL to release memory
    if (currentBlobUrl) {
      URL.revokeObjectURL(currentBlobUrl);
    }

    // Process and assemble the code
    let compiledSource = '';
    
    // Check if the HTML code has <html>, <head> or <body> tags
    // If not, we wrap it properly.
    const hasHtmlTag = htmlCode.toLowerCase().includes('<html');
    const hasHeadTag = htmlCode.toLowerCase().includes('<head');
    const hasBodyTag = htmlCode.toLowerCase().includes('<body');

    let bodyContent = htmlCode;
    let headContent = '';

    if (hasHtmlTag || hasHeadTag || hasBodyTag) {
      // Injected script goes at the very beginning of the HTML/head
      compiledSource = htmlCode;
      
      // Inject Console Overrider at the top of <head>
      const headIndex = compiledSource.toLowerCase().indexOf('<head>');
      if (headIndex !== -1) {
        compiledSource = compiledSource.slice(0, headIndex + 6) + 
                         INJECTED_CONSOLE_SCRIPT + 
                         compiledSource.slice(headIndex + 6);
      } else {
        // No head but has html or body, inject at top of document
        compiledSource = INJECTED_CONSOLE_SCRIPT + compiledSource;
      }
      
      // Inject CSS
      const headCloseIndex = compiledSource.toLowerCase().indexOf('</head>');
      const styleBlock = `\n<style>\n${cssCode}\n</style>\n`;
      if (headCloseIndex !== -1) {
        compiledSource = compiledSource.slice(0, headCloseIndex) + 
                         styleBlock + 
                         compiledSource.slice(headCloseIndex);
      } else {
        compiledSource = styleBlock + compiledSource;
      }

      // Inject JS
      const bodyCloseIndex = compiledSource.toLowerCase().indexOf('</body>');
      const scriptBlock = `\n<script>\n${jsCode}\n</script>\n`;
      if (bodyCloseIndex !== -1) {
        compiledSource = compiledSource.slice(0, bodyCloseIndex) + 
                         scriptBlock + 
                         compiledSource.slice(bodyCloseIndex);
      } else {
        compiledSource = compiledSource + scriptBlock;
      }
    } else {
      // Standard wrapper if user enters raw HTML fragments
      compiledSource = `
        <!DOCTYPE html>
        <html lang="uk">
        <head>
          <meta charset="UTF-8">
          ${INJECTED_CONSOLE_SCRIPT}
          <style>
            ${cssCode}
          </style>
        </head>
        <body>
          ${htmlCode}
          <script>
            // Wrap in try-catch to report load-time script syntax/parse errors
            try {
              ${jsCode}
            } catch(err) {
              console.error(err.message);
            }
          </script>
        </body>
        </html>
      `;
    }

    // Create Blob and load into Iframe
    const blob = new Blob([compiledSource], { type: 'text/html' });
    currentBlobUrl = URL.createObjectURL(blob);
    iframe.src = currentBlobUrl;
  }

  // 5. Add a row to our console UI panel
  function addConsoleLog(type, content) {
    if (!consoleLogsContainer) return;

    // Remove placeholder if this is the first log
    if (!hasLogs) {
      consoleLogsContainer.innerHTML = '';
      hasLogs = true;
    }

    const row = document.createElement('div');
    row.className = `console-row ${type}`;

    // Timestamp
    const now = new Date();
    const timeStr = now.toLocaleTimeString('uk-UA', { hour12: false }) + '.' + String(now.getMilliseconds()).padStart(3, '0');
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'console-row-time';
    timeSpan.textContent = timeStr;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'console-row-content';
    contentDiv.textContent = content;

    row.appendChild(timeSpan);
    row.appendChild(contentDiv);
    consoleLogsContainer.appendChild(row);

    // Auto scroll to bottom
    consoleLogsContainer.scrollTop = consoleLogsContainer.scrollHeight;
  }

  // 6. Clear Console
  function clearConsole() {
    if (!consoleLogsContainer) return;
    consoleLogsContainer.innerHTML = `<div class="console-placeholder">Консоль очищено. Твої console.log() з'являться тут!</div>`;
    hasLogs = false;
  }

  return {
    init,
    update,
    clearConsole
  };
})();
