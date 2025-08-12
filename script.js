import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const sections = document.querySelectorAll('.section');
const menuCards = document.querySelectorAll('.card');
const toast = document.getElementById('toast');

const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const usuarioLogadoSpan = document.getElementById('usuarioLogado');

const senhaInput = document.getElementById('senhaLogin');
const toggleSenhaBtn = document.getElementById('toggleSenha');

// Navegação do menu
menuCards.forEach(card => {
  card.addEventListener('click', () => {
    sections.forEach(sec => sec.classList.add('hidden'));
    document.getElementById(card.dataset.section).classList.remove('hidden');
  });
});

// Toast helper
function showToast(msg) {
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => toast.style.display = 'none', 3000);
}

// Mostrar/Ocultar modal de login
function showLoginModal() {
  loginModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function hideLoginModal() {
  loginModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

// Verifica estado do login
onAuthStateChanged(auth, user => {
  if (user) {
    usuarioLogadoSpan.textContent = user.email;
    hideLoginModal();
    carregarLivros();
  } else {
    usuarioLogadoSpan.textContent = '';
    showLoginModal();
    // Esconder seções para não mostrar antes do login
    sections.forEach(sec => sec.classList.add('hidden'));
  }
});

// Login via formulário
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('emailLogin').value.trim();
  const senha = senhaInput.value.trim();

  if (!email || !senha) {
    showToast('Preencha email e senha.');
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    showToast('Logado com sucesso!');
    loginForm.reset();
  } catch (error) {
    showToast('Erro no login: ' + error.message);
  }
});

// Toggle mostrar/ocultar senha
toggleSenhaBtn.addEventListener('click', () => {
  const tipo = senhaInput.type === 'password' ? 'text' : 'password';
  senhaInput.type = tipo;
  toggleSenhaBtn.textContent = tipo === 'password' ? 'Mostrar Senha' : 'Ocultar Senha';
});

// Logout
logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  showToast('Deslogado!');
  // Esconder seções após logout
  sections.forEach(sec => sec.classList.add('hidden'));
});

// Função para carregar livros do Firestore
async function carregarLivros() {
  const livros = [];
  try {
    const snapshot = await getDocs(collection(db, 'livros'));
    snapshot.forEach(docSnap => livros.push({ id: docSnap.id, ...docSnap.data() }));
    livros.sort((a, b) => a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }));

    renderTabela(livros, 'livrosCadastrados', false);
    renderTabela(livros, 'listaRemover', true);

    // Exibir a seção "verLivros" após carregar (opcional)
    sections.forEach(sec => sec.classList.add('hidden'));
    document.getElementById('verLivros').classList.remove('hidden');

  } catch (error) {
    showToast('Erro ao carregar livros: ' + error.message);
  }
}

// Renderizar tabela de livros
function renderTabela(livros, idTabela, comAcoes) {
  const tbody = document.getElementById(idTabela);
  tbody.innerHTML = '';
  livros.forEach(livro => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${livro.nome}</td>
      <td>${livro.autor}</td>
      <td>${livro.mesAno || ''}</td>
      ${comAcoes ? `<td><button class="btn btn-danger" data-id="${livro.id}">Remover</button></td>` : ''}
    `;
    tbody.appendChild(tr);
  });

  if (comAcoes) {
    tbody.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Tem certeza que deseja remover este livro?')) {
          try {
            await deleteDoc(doc(db, 'livros', btn.dataset.id));
            showToast('Livro removido!');
            carregarLivros();
          } catch (error) {
            showToast('Erro ao remover: ' + error.message);
          }
        }
      });
    });
  }
}

// Cadastrar livro
document.getElementById('cadastroLivroForm').addEventListener('submit', async e => {
  e.preventDefault();
  const nome = document.getElementById('nomeLivro').value.trim();
  const autor = document.getElementById('autorLivro').value.trim();
  const mesAno = document.getElementById('mesAnoLivro').value.trim();

  if (!nome || !autor || !mesAno) {
    showToast('Preencha todos os campos.');
    return;
  }

  try {
    // Evitar duplicatas
    const q = query(collection(db, 'livros'), where('nome', '==', nome), where('autor', '==', autor));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      showToast('Livro já cadastrado.');
      return;
    }

    await addDoc(collection(db, 'livros'), { nome, autor, mesAno });
    showToast('Livro cadastrado!');
    e.target.reset();
    carregarLivros();
  } catch (error) {
    showToast('Erro ao cadastrar: ' + error.message);
  }
});

// ====== ABRIR SELETOR DE MÊS/ANO AUTOMATICAMENTE ======
const mesAnoInput = document.getElementById('mesAnoLivro');

mesAnoInput.addEventListener('focus', () => {
  if (mesAnoInput.showPicker) {
    mesAnoInput.showPicker(); // Força abrir o calendário no Chrome/Edge compatíveis
  }
});

// Filtros
document.getElementById('filtroLivros').addEventListener('input', e => filtrarTabela('livrosCadastrados', e.target.value));
document.getElementById('filtroRemover').addEventListener('input', e => filtrarTabela('listaRemover', e.target.value));

function filtrarTabela(idTabela, filtro) {
  const rows = document.getElementById(idTabela).querySelectorAll('tr');
  rows.forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(filtro.toLowerCase()) ? '' : 'none';
  });
}
