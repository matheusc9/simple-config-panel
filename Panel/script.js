const container = document.getElementById("configs");
const login = document.getElementById("login");
const msg = document.getElementById("msg");
const filterInput = document.getElementById("filter");
const expandBtn = document.getElementById("toggleExpand");
const controls = document.getElementById("controls");
const headerBtn = document.getElementById('signBtn');

const API_URL = 'https://api.npoint.io/1c0a2946f8a9343b85e2';

let softwares = [];
let activeKey = null;
let isExpanded = false;

// INICIALIZAÇÃO
function init() {
  showContent(false);

  // ADD hotkey
  login.addEventListener('keydown', (kEvent) => {
    if(kEvent.key == 'Enter') {
      checkKey();
    }
  });

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      softwares = data[0].softwares || [];

      const savedKey = localStorage.getItem("access_key");
      if (savedKey && isKeyValid(savedKey)) {
        activeKey = savedKey;
        msg.innerText = "Autenticado!";
        showContent(true);
        renderSoftwares();
      }
    })
    .catch(err => {
      console.error("Erro ao carregar dados:", err);
      container.innerHTML = '<p>Erro ao carregar dados 😢</p>';
    });
}

init();

// CHECA SE A CHAVE É VÁLIDA
function isKeyValid(key) {
  return softwares.some(software => software.keys && software.keys.includes(key));
}

// VERIFICA CHAVE DE ACESSO
function checkKey() {
  const inputKey = document.getElementById("pass").value.trim();

  if (!inputKey) {
    msg.innerText = "Digite a chave.";
    msg.style.color = "maroon";
    return;
  }

  if (isKeyValid(inputKey)) {
    msg.innerText = "Chave válida!";
    msg.style.color = "green";
    activeKey = inputKey;
    localStorage.setItem("access_key", inputKey);
    showContent(true);
    renderSoftwares();
  } else {
    msg.innerText = "Chave inválida!";
    msg.style.color = "maroon";
    localStorage.removeItem("access_key");
    showContent(false);
    // limpa o input e da foco :)
    document.querySelector('#pass').value = "";
    document.querySelector('#pass').focus();
  }
}

// MOSTRA OU ESCONDE INTERFACE
function showContent(show) {
  login.style.display = show ? "none" : "block";
  container.style.display = show ? "block" : "none";
  controls.style.display = show ? "block" : "none";
  headerBtn.innerHTML = show ? "Sair" : "Entrar";
}

// SAIR
function signOut() {
  localStorage.removeItem("access_key");
  activeKey = null;
  container.innerHTML = "";
  msg.innerText = "";
  showContent(false);
}

function enableCopyOnClick() {
  document.querySelectorAll('#configs li').forEach(li => {
    li.style.cursor = "pointer";
    li.addEventListener('click', () => {
      const originalText = li.textContent;
      navigator.clipboard.writeText(originalText).then(() => {
        li.textContent = 'Copiado!';
        setTimeout(() => {
          li.textContent = originalText;
        }, 1000);
      });
    });
  });
}

// RENDERIZA SOFTWARES DA CHAVE
function renderSoftwares() {
  container.innerHTML = '';
  const filter = filterInput?.value?.toLowerCase() || "";

  softwares.forEach(software => {
    if (!software.keys?.includes(activeKey)) return;
    if (!software.software.toLowerCase().includes(filter)) return;

    const softwareBox = createDetails(software.software);

    software.categorias.forEach(categoria => {
      const catBox = createDetails(categoria.categoria);
      catBox.classList.add("categoria");
      if (categoria.classe) catBox.classList.add(categoria.classe);

      const list = document.createElement("ul");
      categoria.itens.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });

      catBox.appendChild(list);
      softwareBox.appendChild(catBox);
    });

    container.appendChild(softwareBox);
  });
  enableCopyOnClick();
}

// CRIA <details>
function createDetails(title) {
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = title;
  details.appendChild(summary);
  return details;
}

// FILTRO
function filterSoftwares() {
  renderSoftwares();
}

// EXPANDIR/RECOLHER
function toggleExpandAll() {
  const allDetails = document.querySelectorAll("#configs details");
  isExpanded = !isExpanded;
  allDetails.forEach(d => d.open = isExpanded);
  expandBtn.textContent = isExpanded ? "Recolher Tudo" : "Expandir Tudo";
}
