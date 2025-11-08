
// Verifica se estamos na página de login para adicionar o listener
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
  
    const loginButton = this.querySelector('.btn-login');
    const buttonText = loginButton.querySelector('.btn-text');
    const spinner = loginButton.querySelector('.spinner');
    const errorMessageElement = document.getElementById("errorMessage");
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
  
    // Limpa erros e inicia o carregamento
    errorMessageElement.textContent = "";
    loginButton.classList.add('loading');
    loginButton.disabled = true;

    const emailCorreto = "Lucasgm123@gmail.com";
    const senhaCorreta = "123456";
  
    // Simula uma requisição de rede (2 segundos)
    setTimeout(() => {
      if (!email || !senha) {
        errorMessageElement.textContent = "Por favor, preencha todos os campos!";
      } else if (email === emailCorreto && senha === senhaCorreta) {
        localStorage.setItem("logado", "true");
        window.location.href = "dashboard.html";
        return; // Evita que o código abaixo seja executado
      } else {
        errorMessageElement.textContent = "Email ou senha incorretos!";
      }

      // Para o carregamento em caso de erro
      loginButton.classList.remove('loading');
      loginButton.disabled = false;

    }, 2000);
  });
}

// Verifica se estamos na página do dashboard para executar o código correspondente
if (window.location.pathname.includes("dashboard.html")) {
  const logado = localStorage.getItem("logado");
  if (logado !== "true") {
    window.location.href = "index.html"; 
  }

  // Carrega as estatísticas do dashboard
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const livros = JSON.parse(localStorage.getItem('livros')) || [];
  const emprestimos = JSON.parse(localStorage.getItem('emprestimos')) || [];

  document.getElementById('totalUsuarios').textContent = usuarios.length;
  document.getElementById('totalLivros').textContent = livros.length;
  document.getElementById('emprestimosAtivos').textContent = emprestimos.filter(e => e.status === 'Emprestado').length;
}

// Adiciona funcionalidade de logout a todas as páginas que têm o botão
if (document.getElementById("logoutBtn")) {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("logado");
    window.location.href = "index.html";
  });
}

// Verifica se estamos na página de usuários para executar o código correspondente
if (document.getElementById('usuarioForm')) {
  const form = document.getElementById('usuarioForm');
  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

  // Função para salvar usuários no localStorage
  function salvarUsuarios() {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
  }

  // Função para gerar ID
  function gerarId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Função para listar
  async function listarUsuarios() {
    const tabela = document.getElementById('tabelaUsuarios');
    tabela.innerHTML = '';

    usuarios.forEach(u => {
      tabela.innerHTML += `
        <tr>
          <td>${u.id}</td>
          <td>${u.nomeCompleto}</td>
          <td>${u.email}</td>
          <td>${u.telefone}</td>
          <td>${u.endereco}</td>
          <td>
            <button class="btn-secondary" onclick="editarUsuario('${u.id}')">Editar</button>
            <button class="btn-delete" onclick="excluirUsuario('${u.id}')">Excluir</button>
          </td>
        </tr>
      `;
    });
  }

  // Função para editar
  window.editarUsuario = function(id) {
    const usuario = usuarios.find(u => u.id === id);
    document.getElementById('usuarioId').value = id;
    document.getElementById('nomeCompleto').value = usuario.nomeCompleto;
    document.getElementById('email').value = usuario.email;
    document.getElementById('telefone').value = usuario.telefone;
    document.getElementById('endereco').value = usuario.endereco;
  }

  // Função para excluir
  window.excluirUsuario = async function(id) {
    if (confirm('Deseja realmente excluir este usuário?')) {
      usuarios = usuarios.filter(u => u.id !== id);
      salvarUsuarios();
      listarUsuarios();
    }
  }

  // Captura do formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('usuarioId').value;
    const nomeCompleto = document.getElementById('nomeCompleto').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const endereco = document.getElementById('endereco').value;

    if (id) {
      // Editar
      const index = usuarios.findIndex(u => u.id === id);
      usuarios[index] = { id, nomeCompleto, email, telefone, endereco };
    } else {
      // Incluir
      const novoUsuario = { id: gerarId(), nomeCompleto, email, telefone, endereco, senha: "senha_padrao_temporaria" };
      usuarios.push(novoUsuario);
    }

    salvarUsuarios();
    form.reset();
    document.getElementById('usuarioId').value = '';
    listarUsuarios();
  });

  // Carregar usuários ao abrir a página
  listarUsuarios();
}

// Verifica se estamos na página de livros para executar o código correspondente
if (document.getElementById('livroForm')) {
  const form = document.getElementById('livroForm');
  let livros = JSON.parse(localStorage.getItem('livros')) || [];

  // Função para salvar livros no localStorage
  function salvarLivros() {
    localStorage.setItem('livros', JSON.stringify(livros));
  }

  // Função para gerar ID
  function gerarId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Função para listar
  async function listarLivros() {
    const tabela = document.getElementById('tabelaLivros');
    tabela.innerHTML = '';

    livros.forEach(l => {
      tabela.innerHTML += `
        <tr>
          <td>${l.id}</td>
          <td>${l.titulo}</td>
          <td>${l.autor}</td>
          <td>${l.editora}</td>
          <td>${l.anoPublicacao}</td>
          <td>${l.genero}</td>
          <td>
            <button class="btn-secondary" onclick="editarLivro('${l.id}')">Editar</button>
            <button class="btn-delete" onclick="excluirLivro('${l.id}')">Excluir</button>
          </td>
        </tr>
      `;
    });
  }

  // Função para editar
  window.editarLivro = function(id) {
    const livro = livros.find(l => l.id === id);
    document.getElementById('livroId').value = id;
    document.getElementById('titulo').value = livro.titulo;
    document.getElementById('autor').value = livro.autor;
    document.getElementById('editora').value = livro.editora;
    document.getElementById('anoPublicacao').value = livro.anoPublicacao;
    document.getElementById('genero').value = livro.genero;
  }

  // Função para excluir
  window.excluirLivro = async function(id) {
    if (confirm('Deseja realmente excluir este livro?')) {
      livros = livros.filter(l => l.id !== id);
      salvarLivros();
      listarLivros();
    }
  }

  // Captura do formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('livroId').value;
    const titulo = document.getElementById('titulo').value;
    const autor = document.getElementById('autor').value;
    const editora = document.getElementById('editora').value;
    const anoPublicacao = document.getElementById('anoPublicacao').value;
    const genero = document.getElementById('genero').value;

    if (anoPublicacao < 0 || anoPublicacao > 2025) {
      alert("O ano de publicação deve estar entre 0 e 2025.");
      return;
    }

    if (id) {
      // Editar
      const index = livros.findIndex(l => l.id === id);
      livros[index] = { id, titulo, autor, editora, anoPublicacao, genero };
    } else {
      // Incluir
      const novoLivro = { id: gerarId(), titulo, autor, editora, anoPublicacao, genero };
      livros.push(novoLivro);
    }

    salvarLivros();
    form.reset();
    document.getElementById('livroId').value = '';
    listarLivros();
  });

  // Carregar livros ao abrir a página
  listarLivros();
}

// Verifica se estamos na página de empréstimos
if (document.getElementById('emprestimoForm')) {
  const form = document.getElementById('emprestimoForm');
  let emprestimos = JSON.parse(localStorage.getItem('emprestimos')) || [];

  // Função para salvar empréstimos no localStorage
  function salvarEmprestimos() {
    localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
  }

  // Função para gerar ID
  function gerarId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Popula o select de usuários
  async function carregarUsuarios() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const select = document.getElementById('usuarioSelect');
    select.innerHTML = '<option value="">Selecione um usuário</option>';
    usuarios.forEach(u => {
      select.innerHTML += `<option value="${u.id}">${u.nomeCompleto}</option>`;
    });
  }

  // Popula o select de livros
  async function carregarLivros() {
    const livros = JSON.parse(localStorage.getItem('livros')) || [];
    const livrosEmprestadosIds = emprestimos.filter(e => e.status === 'Emprestado').map(e => e.livroId);
    const select = document.getElementById('livroSelect');
    select.innerHTML = '<option value="">Selecione um livro</option>';
    livros.forEach(l => {
      if (!livrosEmprestadosIds.includes(l.id)) {
        select.innerHTML += `<option value="${l.id}">${l.titulo}</option>`;
      }
    });
  }

  // Formata a data para YYYY-MM-DD
  function formatarData(data) {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  }

  // Lista todos os empréstimos
  async function listarEmprestimos() {
    const todosUsuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const todosLivros = JSON.parse(localStorage.getItem('livros')) || [];
    const tabela = document.getElementById('tabelaEmprestimos');
    tabela.innerHTML = '';

    emprestimos.forEach(e => {
      const usuario = todosUsuarios.find(u => u.id === e.usuarioId) || { nomeCompleto: 'N/A' };
      const livro = todosLivros.find(l => l.id === e.livroId) || { titulo: 'N/A' };

      tabela.innerHTML += `
        <tr>
          <td>${usuario.nomeCompleto}</td>
          <td>${livro.titulo}</td>
          <td>${formatarData(e.dataEmprestimo)}</td>
          <td><span class="status ${e.status.toLowerCase()}">${e.status}</span></td>
          <td>
            ${e.status === 'Emprestado' ? `<button class="btn-finish" onclick="finalizarEmprestimo('${e.id}')">Finalizar</button>` : '<span class="action-placeholder"></span>'}
            <button class="btn-delete" onclick="excluirEmprestimo('${e.id}')">Excluir</button>
          </td>
        </tr>
      `;
    });
  }

  // Marca um empréstimo como "Devolvido"
  window.finalizarEmprestimo = async function(id) {
    if (confirm('Deseja marcar este livro como devolvido?')) {
      const index = emprestimos.findIndex(e => e.id === id);
      emprestimos[index].status = 'Devolvido';
      salvarEmprestimos();
      listarEmprestimos();
      carregarLivros(); // Recarrega os livros para disponibilizar o devolvido
    }
  }

  // Exclui um registro de empréstimo
  window.excluirEmprestimo = async function(id) {
    if (confirm('Deseja realmente excluir este registro do histórico? Esta ação não pode ser desfeita.')) {
      emprestimos = emprestimos.filter(e => e.id !== id);
      salvarEmprestimos();
      listarEmprestimos();
      carregarLivros(); // Recarrega a lista de livros para garantir consistência
    }
  }

  // Listener do formulário para criar novos empréstimos
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emprestimo = {
      id: gerarId(),
      usuarioId: document.getElementById('usuarioSelect').value,
      livroId: document.getElementById('livroSelect').value,
      dataEmprestimo: document.getElementById('dataEmprestimo').value,
      status: document.getElementById('status').value,
    };

    emprestimos.push(emprestimo);
    salvarEmprestimos();
    
    form.reset();
    document.getElementById('status').value = 'Emprestado'; // Reseta para o padrão
    document.getElementById('dataEmprestimo').valueAsDate = new Date();
    listarEmprestimos();
    carregarLivros(); // Recarrega a lista de livros disponíveis
  });

  // Carregamento inicial
  carregarUsuarios();
  carregarLivros();
  listarEmprestimos();
  document.getElementById('dataEmprestimo').valueAsDate = new Date(); // Define a data de hoje como padrão
}
