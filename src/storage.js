/* ==========================================================================
   STORAGE & TEMPLATES MANAGER
   ========================================================================== */

window.StorageManager = (() => {
  const STORAGE_KEY = 'codeland_projects';

  // 1. Starter Templates
  const templates = {
    blank: {
      title: 'Новий проект',
      html: `<!-- Твій HTML код тут! -->\n<h1>Мій новий проект</h1>\n<p>Почни створювати свій сайт прямо зараз!</p>`,
      css: `/* Твої стилі CSS тут! */\nbody {\n  font-family: 'Outfit', sans-serif;\n  background-color: #0f172a;\n  color: #f8fafc;\n  text-align: center;\n  padding-top: 50px;\n}\n\nh1 {\n  color: #8257e5;\n}`,
      js: `// Твій JavaScript код тут!\nconsole.log("Привіт з порожнього проекту!");`
    },
    helloworld: {
      title: 'Привіт, Світ!',
      html: `<!-- Привіт, Світ! -->\n<div class="card">\n  <h1>Привіт, Світ! 👋</h1>\n  <p>Це моя перша власна веб-сторінка, створена в КодЛенд.</p>\n  <p id="time-text">Завантажуємо час...</p>\n</div>`,
      css: `/* Стилі для сторінки */\nbody {\n  background: linear-gradient(135deg, #0a0b10, #181a26);\n  color: #f8fafc;\n  font-family: 'Outfit', sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  margin: 0;\n}\n\n.card {\n  background: rgba(255, 255, 255, 0.05);\n  backdrop-filter: blur(10px);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  padding: 40px;\n  border-radius: 16px;\n  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);\n  text-align: center;\n  max-width: 400px;\n  animation: slideIn 0.8s ease-out;\n}\n\nh1 {\n  margin-top: 0;\n  color: #00d2ff;\n  font-size: 2.2rem;\n}\n\np {\n  color: #a6accd;\n  line-height: 1.6;\n}\n\n#time-text {\n  color: #ffd600;\n  font-weight: 500;\n  margin-top: 20px;\n}\n\n@keyframes slideIn {\n  from {\n    opacity: 0;\n    transform: translateY(20px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}`,
      js: `// Скрипт показує поточний час на сторінці\nfunction updateTime() {\n  const el = document.getElementById("time-text");\n  const now = new Date();\n  \n  const timeString = now.toLocaleTimeString('uk-UA');\n  const dateString = now.toLocaleDateString('uk-UA');\n  \n  el.textContent = "Сьогодні: " + dateString + " о " + timeString;\n}\n\nupdateTime();\n// Оновлюємо кожну секунду\nsetInterval(updateTime, 1000);\n\nconsole.log("Сторінка 'Привіт, Світ!' успішно запущена!");`
    },
    counter: {
      title: 'Клікер-лічильник',
      html: `<!-- Простий лічильник на кліки -->\n<div class="counter-container">\n  <h2>Інтерактивний Лічильник 🚀</h2>\n  <div class="count-display" id="count-number">0</div>\n  <div class="btn-group">\n    <button id="btn-minus" class="counter-btn">-</button>\n    <button id="btn-reset" class="counter-btn reset">Скинути</button>\n    <button id="btn-plus" class="counter-btn">+</button>\n  </div>\n</div>`,
      css: `/* Стилі лічильника */\nbody {\n  background-color: #0f172a;\n  color: white;\n  font-family: 'Outfit', sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  margin: 0;\n}\n\n.counter-container {\n  background: #1e293b;\n  border-radius: 24px;\n  padding: 40px;\n  text-align: center;\n  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);\n  border: 1px solid #334155;\n}\n\nh2 {\n  margin: 0 0 10px 0;\n  font-size: 1.5rem;\n}\n\n.count-display {\n  font-size: 6rem;\n  font-weight: 700;\n  margin: 20px 0;\n  color: #00e676;\n  text-shadow: 0 0 20px rgba(0, 230, 118, 0.3);\n  transition: transform 0.1s ease;\n}\n\n.count-display.active {\n  transform: scale(1.1);\n}\n\n.btn-group {\n  display: flex;\n  gap: 12px;\n}\n\n.counter-btn {\n  font-size: 1.5rem;\n  padding: 10px 24px;\n  border-radius: 12px;\n  border: none;\n  cursor: pointer;\n  background: #8257e5;\n  color: white;\n  font-weight: bold;\n  transition: all 0.2s;\n  outline: none;\n}\n\n.counter-btn:hover {\n  background: #9672eb;\n  transform: translateY(-2px);\n}\n\n.counter-btn:active {\n  transform: translateY(0);\n}\n\n.counter-btn.reset {\n  background: #475569;\n  font-size: 1rem;\n}\n\n.counter-btn.reset:hover {\n  background: #64748b;\n}`,
      js: `// Змінна для збереження рахунку\nlet count = 0;\n\n// Отримуємо елементи зі сторінки\nconst countNum = document.getElementById("count-number");\nconst btnPlus = document.getElementById("btn-plus");\nconst btnMinus = document.getElementById("btn-minus");\nconst btnReset = document.getElementById("btn-reset");\n\n// Функція оновлення з ефектом збільшення\nfunction updateDisplay() {\n  countNum.textContent = count;\n  countNum.classList.add("active");\n  setTimeout(() => countNum.classList.remove("active"), 100);\n}\n\n// Додаємо слухачі подій для кнопок\nbtnPlus.addEventListener("click", () => {\n  count = count + 1;\n  updateDisplay();\n  console.log("Додано 1. Поточний рахунок:", count);\n});\n\nbtnMinus.addEventListener("click", () => {\n  count = count - 1;\n  updateDisplay();\n  console.log("Віднято 1. Поточний рахунок:", count);\n});\n\nbtnReset.addEventListener("click", () => {\n  count = 0;\n  updateDisplay();\n  console.log("Лічильник скинуто на 0");\n});`
    },
    canvas: {
      title: 'Стрибучий М\'ячик',
      html: `<!-- Полотно для малювання Canvas -->\n<div class="container">\n  <h3>М'ячик-стрибунець 🎨</h3>\n  <canvas id="myCanvas" width="500" height="300"></canvas>\n  <p>Клацни по екрану, щоб прискорити м'ячик!</p>\n</div>`,
      css: `/* Стилізація сторінки Canvas */\nbody {\n  background-color: #0b0c10;\n  color: #ffffff;\n  font-family: 'Outfit', sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  margin: 0;\n}\n\n.container {\n  text-align: center;\n}\n\nh3 {\n  margin: 0 0 15px 0;\n}\n\ncanvas {\n  background-color: #1f2833;\n  border: 3px solid #8257e5;\n  border-radius: 16px;\n  box-shadow: 0 10px 25px rgba(130, 87, 229, 0.3);\n  cursor: pointer;\n}\n\np {\n  color: #66fcf1;\n  margin-top: 15px;\n  font-size: 0.9rem;\n  font-weight: 500;\n}`,
      js: `// Створення та запуск анімації на Canvas\nconst canvas = document.getElementById("myCanvas");\nconst ctx = canvas.getContext("2d");\n\nlet x = canvas.width / 2;\nlet y = canvas.height / 2;\nlet dx = 3;\nlet dy = -3;\nconst ballRadius = 16;\nlet ballColor = "#66fcf1";\n\n// Малюємо м'ячик\nfunction drawBall() {\n  ctx.beginPath();\n  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);\n  ctx.fillStyle = ballColor;\n  ctx.fill();\n  ctx.closePath();\n}\n\n// Головний цикл анімації\nfunction draw() {\n  // Очищаємо canvas\n  ctx.clearRect(0, 0, canvas.width, canvas.height);\n  \n  drawBall();\n\n  // Відбивання ліво/право\n  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {\n    dx = -dx;\n    changeColor();\n  }\n  \n  // Відбивання верх/низ\n  if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {\n    dy = -dy;\n    changeColor();\n  }\n\n  x += dx;\n  y += dy;\n  \n  // Зациклюємо анімацію\n  requestAnimationFrame(draw);\n}\n\n// Випадкова зміна кольору\nfunction changeColor() {\n  const colors = ["#66fcf1", "#8257e5", "#ffd600", "#ff5722", "#00e676"];\n  ballColor = colors[Math.floor(Math.random() * colors.length)];\n  console.log("Бум! Зміна кольору м'ячика на:", ballColor);\n}\n\n// Прискорення при кліку\ncanvas.addEventListener("click", () => {\n  dx = dx * 1.2;\n  dy = dy * 1.2;\n  console.log("Вау! Прискорення! Швидкість по X:", dx.toFixed(2), "по Y:", dy.toFixed(2));\n});\n\n// Запускаємо процес\ndraw();`
    }
  };

  // 2. Load all projects from LocalStorage
  function getAllProjects() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      console.error("Помилка читання проектів з LocalStorage:", e);
      return [];
    }
  }

  // 3. Save all projects to LocalStorage
  function saveAllProjects(projects) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error("Помилка запису проектів до LocalStorage:", e);
      alert("Не вдалося зберегти зміни! Можливо, вичерпано пам'ять браузера.");
    }
  }

  // 4. Create new project
  function createProject(templateType) {
    const template = templates[templateType] || templates.blank;
    const projects = getAllProjects();
    
    const newProj = {
      id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: template.title,
      html: template.html,
      css: template.css,
      js: template.js,
      lastModified: Date.now()
    };
    
    projects.push(newProj);
    saveAllProjects(projects);
    return newProj;
  }

  // 5. Get project by ID
  function getProject(id) {
    const projects = getAllProjects();
    return projects.find(p => p.id === id) || null;
  }

  // 6. Update project code/details
  function updateProject(id, updates) {
    const projects = getAllProjects();
    const idx = projects.findIndex(p => p.id === id);
    if (idx === -1) return false;
    
    projects[idx] = {
      ...projects[idx],
      ...updates,
      lastModified: Date.now()
    };
    
    saveAllProjects(projects);
    return true;
  }

  // 7. Delete project
  function deleteProject(id) {
    const projects = getAllProjects();
    const filtered = projects.filter(p => p.id !== id);
    saveAllProjects(filtered);
  }

  // 8. Duplicate project
  function duplicateProject(id) {
    const projects = getAllProjects();
    const orig = projects.find(p => p.id === id);
    if (!orig) return null;
    
    const copy = {
      ...orig,
      id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: orig.title + ' — Копія',
      lastModified: Date.now()
    };
    
    projects.push(copy);
    saveAllProjects(projects);
    return copy;
  }

  // 9. Export project to ZIP
  function exportProjectToZip(project) {
    if (!window.JSZip) {
      alert("Помилка: Бібліотека JSZip не завантажена. Перевірте з'єднання з інтернетом.");
      return;
    }
    
    const zip = new JSZip();
    
    // Inject stylesheet and script references into HTML
    let compiledHtml = project.html;
    
    // Check if the stylesheet link exists, if not, add it
    if (!compiledHtml.includes('style.css')) {
      const headCloseIndex = compiledHtml.toLowerCase().indexOf('</head>');
      if (headCloseIndex !== -1) {
        compiledHtml = compiledHtml.slice(0, headCloseIndex) + 
                       '\n  <link rel="stylesheet" href="style.css">\n' + 
                       compiledHtml.slice(headCloseIndex);
      } else {
        compiledHtml = '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n' + 
                       compiledHtml + 
                       '\n</body>\n</html>';
      }
    }
    
    // Check if script.js link exists, if not, add it before body close
    if (!compiledHtml.includes('script.js')) {
      const bodyCloseIndex = compiledHtml.toLowerCase().indexOf('</body>');
      if (bodyCloseIndex !== -1) {
        compiledHtml = compiledHtml.slice(0, bodyCloseIndex) + 
                       '\n  <script src="script.js" defer></script>\n' + 
                       compiledHtml.slice(bodyCloseIndex);
      } else {
        compiledHtml = compiledHtml + '\n<script src="script.js" defer></script>';
      }
    }

    zip.file("index.html", compiledHtml);
    zip.file("style.css", project.css);
    zip.file("script.js", project.js);

    zip.generateAsync({ type: "blob" }).then((content) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      
      // Clean up title for filename
      const safeTitle = project.title.replace(/[^a-z0-9а-яієїґ\s-_]/gi, '').trim() || 'project';
      link.download = `${safeTitle}.zip`;
      link.click();
      
      // Free memory
      setTimeout(() => URL.revokeObjectURL(link.href), 10000);
    }).catch(err => {
      console.error("Помилка генерації ZIP-файлу:", err);
      alert("Не вдалося створити ZIP архів.");
    });
  }

  // 10. Export project as raw JSON file
  function exportProjectToJson(project) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const link = document.createElement("a");
    
    const safeTitle = project.title.replace(/[^a-z0-9а-яієїґ\s-_]/gi, '').trim() || 'project';
    link.href = dataStr;
    link.download = `${safeTitle}.json`;
    link.click();
  }

  // 11. Import project from JSON file
  function importProjectFromJsonFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        
        // Validation
        if (!imported.html || !imported.title) {
          alert("Невірний формат файлу. Файл повинен бути експортованим проектом КодЛенд.");
          return;
        }

        const projects = getAllProjects();
        const newProj = {
          id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          title: imported.title + ' (Імпортований)',
          html: imported.html,
          css: imported.css || '',
          js: imported.js || '',
          lastModified: Date.now()
        };

        projects.push(newProj);
        saveAllProjects(projects);
        
        if (callback) callback(newProj);
      } catch (err) {
        console.error("Помилка імпортування JSON:", err);
        alert("Помилка при читанні файлу JSON. Можливо, файл пошкоджений.");
      }
    };
    reader.readAsText(file);
  }

  return {
    createProject,
    getAllProjects,
    getProject,
    updateProject,
    deleteProject,
    duplicateProject,
    exportProjectToZip,
    exportProjectToJson,
    importProjectFromJsonFile
  };
})();
