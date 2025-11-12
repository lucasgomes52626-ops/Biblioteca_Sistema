// LOGIN DO SISTEMA
// Identifica se o elemento id "loginform" existe
if (document.getElementById("loginForm")) {
  // Captura o envio do formulario
  document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    // Coleta os dados e elementos
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
    // Define as credenciais pré-definidas
    const emailCorreto = "Lucasgm123@gmail.com";
    const senhaCorreta = "123456";
  
    // Simula um tempo resposta
    setTimeout(() => {
    // Valida as credenciais
      if (!email || !senha) {
        errorMessageElement.textContent = "Por favor, preencha todos os campos!";
      } else if (email === emailCorreto && senha === senhaCorreta) {
        localStorage.setItem("logado", "true");
        window.location.href = "dashboard.html";
        return;
      } else {
        errorMessageElement.textContent = "Email ou senha incorretos!";
      }

      // Finaliza o carregamento
      loginButton.classList.remove('loading');
      loginButton.disabled = false;

    }, 2000);
  });
}
// DASHBOARD DO SISTEMA
// detecta a página dashboard
if (window.location.pathname.includes("dashboard.html")) {
  // verifica o login
  const logado = localStorage.getItem("logado");
  if (logado !== "true") {
    window.location.href = "index.html"; 
  }

  // Carrega todos os dados do localStorage, onde são armazenados pelos CRUDs de cada módulo
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const livros = JSON.parse(localStorage.getItem('livros')) || [];
  const emprestimos = JSON.parse(localStorage.getItem('emprestimos')) || [];

  // estatisticas
  document.getElementById('totalUsuarios').textContent = usuarios.length;
  document.getElementById('totalLivros').textContent = livros.length;
  const emprestimosAtivos = emprestimos.filter(e => e.status === 'Emprestado').length;
  document.getElementById('emprestimosAtivos').textContent = emprestimosAtivos;

  // Calcula devoluções no mês atual
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const devolucoesMes = emprestimos.filter(e => {
    const dataEmprestimo = new Date(e.dataEmprestimo); // Assumindo que a data de devolução é próxima à do empréstimo para o filtro do mês
    return e.status === 'Devolvido' && dataEmprestimo.getMonth() === mesAtual && dataEmprestimo.getFullYear() === anoAtual;
  }).length;
  document.getElementById('devolucoesMes').textContent = devolucoesMes;

  // atividade recente
  const tabelaAtividade = document.getElementById('tabelaAtividadeRecente');
  // Ordena os empréstimos por data (mais recentes primeiro) e pega os últimos 5
  const emprestimosRecentes = [...emprestimos]
    .sort((a, b) => new Date(b.dataEmprestimo) - new Date(a.dataEmprestimo))
    .slice(0, 5);
  // depois cria as linhas da tabela
  if (emprestimosRecentes.length === 0) {
    tabelaAtividade.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhuma atividade registrada ainda.</td></tr>';
  } else {
    emprestimosRecentes.forEach(e => {
      const usuario = usuarios.find(u => u.id == e.usuarioId) || { nomeCompleto: 'N/A' };
      const livro = livros.find(l => l.id == e.livroId) || { titulo: 'N/A' };
      
      const dataFormatada = e.dataEmprestimo 
        ? new Date(e.dataEmprestimo).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) 
        : 'N/A';

      tabelaAtividade.innerHTML += `
        <tr>
          <td>${usuario.nomeCompleto}</td>
          <td>${livro.titulo}</td>
          <td>${dataFormatada}</td>
          <td><span class="status ${e.status.toLowerCase()}">${e.status}</span></td>
        </tr>
      `;
    });
  }
}

// Adiciona funcionalidade de logout a todas as páginas que têm o botão
if (document.getElementById("logoutBtn")) {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("logado");
    window.location.href = "index.html";
  });
}

// USUARIOS
// detecta a página usuarios
if (document.getElementById('usuarioForm')) {
  const form = document.getElementById('usuarioForm');
  const buscaInput = document.getElementById('buscaUsuario');
  const formTitle = document.getElementById('formTitle');
  const btnSalvar = document.getElementById('btnSalvar');
  const contadorUsuarios = document.getElementById('contadorUsuarios');
  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

  // Função para salvar usuários no localStorage
  function salvarUsuarios() {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
  }

  // Função para gerar novo ID
  function gerarNovoId() {
    if (usuarios.length === 0) {
      return 1;
    }
    // Encontra o maior ID existente e adiciona 1
    return Math.max(...usuarios.map(u => u.id)) + 1;
  }

  // Função para listar
  async function listarUsuarios(filtro = '') {
    const tabela = document.getElementById('tabelaUsuarios');
    tabela.innerHTML = '';

    const usuariosFiltrados = usuarios.filter(u => 
      u.nomeCompleto.toLowerCase().includes(filtro.toLowerCase())
    );

    contadorUsuarios.textContent = `${usuariosFiltrados.length} usuários cadastrados`;

    if (usuariosFiltrados.length === 0) {
      tabela.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum usuário encontrado.</td></tr>';
    } else {
      usuariosFiltrados.forEach(u => {
      tabela.innerHTML += `
        <tr>
          <td>${u.id}</td>
          <td>${u.nomeCompleto}</td>
          <td>${u.email}</td>
          <td>${u.telefone}</td>
          <td>${u.endereco}</td>
          <td>
            <button class="btn-secondary" onclick="editarUsuario('${u.id}')" title="Editar"><span class="icon">✏️</span></button>
            <button class="btn-delete" onclick="excluirUsuario('${u.id}')" title="Excluir"><span class="icon">🗑️</span></button>
          </td>
        </tr>
      `;
      });
    }
  }

  // Função para editar
  window.editarUsuario = function(id) {
    const usuario = usuarios.find(u => u.id == id); 
    document.getElementById('usuarioId').value = id;
    document.getElementById('nomeCompleto').value = usuario.nomeCompleto;
    document.getElementById('email').value = usuario.email;
    document.getElementById('telefone').value = usuario.telefone;
    document.getElementById('endereco').value = usuario.endereco;

    // Atualiza para modo de edição
    formTitle.textContent = 'Editando Usuário';
    btnSalvar.textContent = 'Atualizar';
    document.getElementById('btnCancelar').style.display = 'inline-block';
  }

  // Função para limpar o formulário e voltar ao modo de adição
  function resetarFormulario() {
    form.reset();
    document.getElementById('usuarioId').value = '';
    formTitle.textContent = 'Adicionar Usuário';
    btnSalvar.textContent = 'Salvar';
    document.getElementById('btnCancelar').style.display = 'none';
    document.getElementById('nomeCompleto').focus();
    limparErros();
  }

  // Função para excluir
  window.excluirUsuario = async function(id) {
    if (confirm('Deseja realmente excluir este usuário?')) {
      const idNumerico = parseInt(id, 10);
      usuarios = usuarios.filter(u => u.id != idNumerico); // Usar != para ser menos estrito
      salvarUsuarios();
      listarUsuarios(buscaInput.value);
    }
  }

  // VALIDAÇÃO E MÁSCARA
  const nomeInput = document.getElementById('nomeCompleto');
  const emailInput = document.getElementById('email');
  const telefoneInput = document.getElementById('telefone');
  const enderecoInput = document.getElementById('endereco');

  function validarFormulario() {
    let isValid = true;
    limparErros();
    // nome deve ter no minimo 3 caracteres
    if (nomeInput.value.trim().length < 3) {
      document.getElementById('nomeError').textContent = 'O nome deve ter no mínimo 3 caracteres.';
      nomeInput.classList.add('invalid');
      isValid = false;
    }
    // email deve ter formato valido
    if (!/^\S+@\S+\.\S+$/.test(emailInput.value)) {
      document.getElementById('emailError').textContent = 'Por favor, insira um email válido.';
      emailInput.classList.add('invalid');
      isValid = false;
    }
    // telefone deve ter no minimo 15 caracteres
    if (telefoneInput.value.length < 15) {
      document.getElementById('telefoneError').textContent = 'O telefone deve estar completo.';
      telefoneInput.classList.add('invalid');
      isValid = false;
    }
    // endereço não pode estar vazio
    if (enderecoInput.value.trim() === '') {
      document.getElementById('enderecoError').textContent = 'O endereço é obrigatório.';
      enderecoInput.classList.add('invalid');
      isValid = false;
    }
    return isValid;
  }
    // se houver erros, invalid
  function limparErros() {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('form input').forEach(el => el.classList.remove('invalid'));
  }
  // mascara telefone, remove tudo que não é numero, adiciona parenteses e hifens conforme o usuario digita
  telefoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    e.target.value = value.slice(0, 15);
  });

  [nomeInput, emailInput, telefoneInput, enderecoInput].forEach(input => {
    input.addEventListener('input', () => input.classList.remove('invalid'));
  });

  // valida o formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('usuarioId').value;
    const nomeCompleto = document.getElementById('nomeCompleto').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const endereco = document.getElementById('endereco').value;

    if (!validarFormulario()) return;

    if (id) {
      // Editar
      const index = usuarios.findIndex(u => u.id == id); 
      usuarios[index] = { id, nomeCompleto, email, telefone, endereco };
      alert('Usuário atualizado com sucesso!');
    } else {
      // Incluir
      const novoUsuario = { id: gerarNovoId(), nomeCompleto, email, telefone, endereco, senha: "senha_padrao_temporaria" };
      usuarios.push(novoUsuario);
      alert('Usuário cadastrado com sucesso!');
    }

    salvarUsuarios();
    resetarFormulario();
    listarUsuarios(buscaInput.value);
  });

  // Listener para o botão Cancelar
  document.getElementById('btnCancelar').addEventListener('click', resetarFormulario);

  // Listener para a barra de busca
  buscaInput.addEventListener('input', (e) => {
    listarUsuarios(e.target.value);
  });

  // Carregar usuários ao abrir a página
  listarUsuarios();
  document.getElementById('nomeCompleto').focus();
}

// Livros
// detecta a página Livros, dados carregados do localStorage, sortconfig controla a ordem da classificacao da tabela
if (document.getElementById('livroForm')) {
  const form = document.getElementById('livroForm');
  const buscaInput = document.getElementById('buscaLivro');
  const formTitle = document.getElementById('formTitle');
  const btnSalvar = document.getElementById('btnSalvar');
  const contadorLivros = document.getElementById('contadorLivros');
  let sortConfig = { key: 'id', direction: 'asc' };
  let livros = JSON.parse(localStorage.getItem('livros')) || [];

  // Função para salvar livros no localStorage
  function salvarLivros() {
    localStorage.setItem('livros', JSON.stringify(livros));
  }

  // Função para gerar ID
  function gerarNovoId() {
    if (livros.length === 0) {
      return 1;
    }
    // Encontra o maior ID existente e adiciona 1
    return Math.max(...livros.map(l => l.id)) + 1;
  }

  // Função para listar
  async function listarLivros(filtro = '', sortKey = sortConfig.key, sortDirection = sortConfig.direction) {
    const tabela = document.getElementById('tabelaLivros');
    tabela.innerHTML = '';
    const filtroLowerCase = filtro.toLowerCase();

    let livrosFiltrados = livros.filter(l => 
      l.titulo.toLowerCase().includes(filtroLowerCase) ||
      l.autor.toLowerCase().includes(filtroLowerCase) ||
      (l.editora && l.editora.toLowerCase().includes(filtroLowerCase)) ||
      l.categoria.toLowerCase().includes(filtroLowerCase)
    );

    // Ordenação
    livrosFiltrados.sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    // Atualiza contador
    const total = livrosFiltrados.length;
    if (total === 1) {
      contadorLivros.textContent = '1 livro cadastrado';
    } else {
      contadorLivros.textContent = `${total} livros cadastrados`;
    }

    if (livrosFiltrados.length === 0) {
      tabela.innerHTML = '<tr><td colspan="7" style="text-align:center;">Nenhum livro encontrado.</td></tr>';
    } else {
      livrosFiltrados.forEach(l => {
      tabela.innerHTML += `
        <tr>
          <td>${l.id}</td>
          <td>${l.titulo}</td>
          <td>${l.autor}</td>
          <td>${l.editora}</td>
          <td>${l.anoPublicacao}</td>
          <td>${l.categoria}</td>
          <td>
            <button class="btn-secondary" onclick="editarLivro('${l.id}')" title="Editar"><span class="icon">✏️</span></button>
            <button class="btn-delete" onclick="excluirLivro('${l.id}')" title="Excluir"><span class="icon">🗑️</span></button>
          </td>
        </tr>
      `;
      });
    }
  }

  // Função para editar livros
  window.editarLivro = function(id) {
    const livro = livros.find(l => l.id == id);
    document.getElementById('livroId').value = id;
    document.getElementById('titulo').value = livro.titulo;
    document.getElementById('autor').value = livro.autor;
    document.getElementById('editora').value = livro.editora;
    document.getElementById('anoPublicacao').value = livro.anoPublicacao;
    document.getElementById('categoria').value = livro.categoria;

    // Atualiza para modo de edição
    formTitle.textContent = 'Editando Livro';
    btnSalvar.textContent = 'Atualizar';
    document.getElementById('btnCancelar').style.display = 'inline-block';
    document.getElementById('titulo').focus();
  }

  // Função para limpar o formulário e voltar ao modo de adição
  function resetarFormulario() {
    form.reset();
    document.getElementById('livroId').value = '';
    formTitle.textContent = 'Adicionar Livro';
    btnSalvar.textContent = 'Salvar';
    document.getElementById('btnCancelar').style.display = 'none';
    document.getElementById('titulo').focus();
    limparErrosLivro();
  }

  // Função para excluir livros
  window.excluirLivro = async function(id) {
    if (confirm('Deseja realmente excluir este livro?')) {
      // O 'id' vindo do HTML é uma string. Se o id original era null, ele virá como a string 'null'.
      if (id === 'null') {
        // Filtra para remover os livros cujo id é de fato null.
        livros = livros.filter(l => l.id !== null);
      } else {
        const idNumerico = parseInt(id, 10);
        livros = livros.filter(l => l.id != idNumerico); // Usar != para ser menos estrito
      }
      salvarLivros();
      listarLivros(buscaInput.value, sortConfig.key, sortConfig.direction);
    }
  }

  // VALIDAÇÃO, garante que o ano de publicação é valido
  function validarFormularioLivro() {
    let isValid = true;
    limparErrosLivro();
    const anoInput = document.getElementById('anoPublicacao');
    const ano = parseInt(anoInput.value, 10);
    const anoAtual = new Date().getFullYear();

    if (isNaN(ano) || ano < 1500 || ano > anoAtual) {
      document.getElementById('anoError').textContent = `O ano deve ser entre 1500 e ${anoAtual}.`;
      anoInput.classList.add('invalid');
      isValid = false;
    }
    return isValid;
  }

  function limparErrosLivro() {
    document.getElementById('anoError').textContent = '';
    document.getElementById('anoPublicacao').classList.remove('invalid');
  }

  // Captura do formulário, novo ou edição
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('livroId').value;
    const titulo = document.getElementById('titulo').value;
    const autor = document.getElementById('autor').value;
    const editora = document.getElementById('editora').value;
    const anoPublicacao = document.getElementById('anoPublicacao').value;
    const categoria = document.getElementById('categoria').value;

    if (!validarFormularioLivro()) return;

    if (id) {
      // Editar
      const index = livros.findIndex(l => l.id == id); // Usar == para comparar string com número
      livros[index] = { id: parseInt(id, 10), titulo, autor, editora, anoPublicacao, categoria };
      alert('Livro atualizado com sucesso!');
    } else {
      // Incluir
      const novoLivro = { id: gerarNovoId(), titulo, autor, editora, anoPublicacao, categoria };
      livros.push(novoLivro);
      alert('Livro cadastrado com sucesso!');
    }
    salvarLivros();
    resetarFormulario();
    listarLivros(buscaInput.value);
  });

  // Listener para o botão Cancelar
  document.getElementById('btnCancelar').addEventListener('click', resetarFormulario);

  // Listener para a barra de busca
  buscaInput.addEventListener('input', (e) => {
    listarLivros(e.target.value, sortConfig.key, sortConfig.direction);
  });

  // Listeners para ordenação da tabela
  document.querySelectorAll('#lista-section th[data-sort]').forEach(header => {
    header.addEventListener('click', () => {
      const sortKey = header.getAttribute('data-sort');
      if (sortConfig.key === sortKey) {
        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
      } else {
        sortConfig.key = sortKey;
        sortConfig.direction = 'asc';
      }
      listarLivros(buscaInput.value, sortConfig.key, sortConfig.direction);
    });
  });

  // Carregar livros ao abrir a página
  listarLivros();
  document.getElementById('titulo').focus();
}

// EMPRESTIMOS
// Verifica a página de empréstimos
if (document.getElementById('emprestimoForm')) {
  const form = document.getElementById('emprestimoForm');
  const buscaInput = document.getElementById('buscaEmprestimo');
  let sortConfig = { key: 'dataEmprestimo', direction: 'desc' };
  const PRAZO_DEVOLUCAO_DIAS = 14;

  let emprestimos = JSON.parse(localStorage.getItem('emprestimos')) || [];

  // Função para salvar empréstimos no localStorage
  function salvarEmprestimos() {
    localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
  }

  // Função para gerar ID
  function gerarNovoId() {
    if (emprestimos.length === 0) {
      return 1;
    }
    // Encontra o maior ID existente e adiciona 1
    return Math.max(...emprestimos.map(e => e.id)) + 1;
  }

  // Popula o select de usuários
  async function carregarUsuarios() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const select = document.getElementById('usuarioSelect');
    select.innerHTML = '<option value="" disabled selected>Selecione o usuário...</option>';
    usuarios.forEach(u => {
      select.innerHTML += `<option value="${u.id}">${u.nomeCompleto}</option>`;
    });
  }

  // Popula o select de livros
  async function carregarLivros() {
    const livros = JSON.parse(localStorage.getItem('livros')) || [];
    const livrosEmprestadosIds = emprestimos.filter(e => e.status === 'Emprestado').map(e => e.livroId);
    const select = document.getElementById('livroSelect');
    select.innerHTML = '<option value="" disabled selected>Selecione o livro...</option>';
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
  async function listarEmprestimos(filtro = '', sortKey = sortConfig.key, sortDirection = sortConfig.direction) {
    const todosUsuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const todosLivros = JSON.parse(localStorage.getItem('livros')) || [];
    const tabela = document.getElementById('tabelaEmprestimos');
    tabela.innerHTML = '';
    const filtroLowerCase = filtro.toLowerCase();

    // Calcula status de atraso dinamicamente
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    emprestimos.forEach(e => {
      if (e.status === 'Emprestado') {
        const dataEmprestimo = new Date(e.dataEmprestimo);
        const dataDevolucaoEsperada = new Date(dataEmprestimo);
        dataDevolucaoEsperada.setDate(dataDevolucaoEsperada.getDate() + PRAZO_DEVOLUCAO_DIAS);
        if (hoje > dataDevolucaoEsperada) {
          e.status = 'Atrasado';
        }
      }
    });

    let emprestimosFiltrados = emprestimos.map(e => {
      const usuario = todosUsuarios.find(u => u.id == e.usuarioId) || { nomeCompleto: 'N/A' };
      const livro = todosLivros.find(l => l.id == e.livroId) || { titulo: 'N/A' };
      return { ...e, nomeUsuario: usuario.nomeCompleto, tituloLivro: livro.titulo };
    }).filter(e => 
      e.nomeUsuario.toLowerCase().includes(filtroLowerCase) ||
      e.tituloLivro.toLowerCase().includes(filtroLowerCase) ||
      e.status.toLowerCase().includes(filtroLowerCase)
    );

    // Ordenação
    emprestimosFiltrados.sort((a, b) => {
      const valA = sortKey === 'usuario' ? a.nomeUsuario : (sortKey === 'livro' ? a.tituloLivro : a[sortKey]);
      const valB = sortKey === 'usuario' ? b.nomeUsuario : (sortKey === 'livro' ? b.tituloLivro : b[sortKey]);
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    // Atualiza resumo
    const ativos = emprestimos.filter(e => e.status === 'Emprestado').length;
    const atrasados = emprestimos.filter(e => e.status === 'Atrasado').length;
    document.getElementById('summaryAtivos').textContent = `${ativos} Empréstimos Ativos`;
    document.getElementById('summaryAtrasados').textContent = `${atrasados} Empréstimos Atrasados`;

    if (emprestimosFiltrados.length === 0) {
      tabela.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum registro encontrado.</td></tr>';
      return;
    }

    emprestimosFiltrados.forEach(e => {
      tabela.innerHTML += `
        <tr class="status-${e.status.toLowerCase()}">
          <td>${e.nomeUsuario}</td>
          <td>${e.tituloLivro}</td>
          <td>${formatarData(e.dataEmprestimo)}</td>
          <td>${e.dataDevolucao ? formatarData(e.dataDevolucao) : '—'}</td>
          <td><span class="status ${e.status.toLowerCase()}">${e.status}</span></td>
          <td>
            ${e.status !== 'Devolvido' ? `<button class="btn-finish" onclick="finalizarEmprestimo('${e.id}')" title="Finalizar Empréstimo">✅</button>` : ''}
            <button class="btn-delete" onclick="excluirEmprestimo('${e.id}')" title="Excluir Registro">🗑️</button>
          </td>
        </tr>
      `;
    });
  }

  // Marca um empréstimo como "Devolvido"
  window.finalizarEmprestimo = async function(id) {
    if (confirm('Deseja marcar este livro como devolvido?')) {
      const idNumerico = parseInt(id, 10);
      const index = emprestimos.findIndex(e => e.id === idNumerico);
      if (index !== -1) {
        emprestimos[index].status = 'Devolvido';
        emprestimos[index].dataDevolucao = new Date().toISOString().split('T')[0]; // Salva a data de hoje
        salvarEmprestimos();
        listarEmprestimos();
        carregarLivros(); // Recarrega os livros para disponibilizar o devolvido
      }
    }
  }

  // Exclui um registro de empréstimo
  window.excluirEmprestimo = async function(id) {
    if (confirm('Deseja realmente excluir este registro do histórico? Esta ação não pode ser desfeita.')) {
      // O 'id' vindo do HTML é uma string. Se o id original era null, ele virá como a string 'null'.
      if (id === 'null' || id === 'undefined') {
        // Filtra para remover os empréstimos cujo id é de fato null ou undefined.
        emprestimos = emprestimos.filter(e => e.id !== null && e.id !== undefined);
      } else {
        const idNumerico = parseInt(id, 10);
        emprestimos = emprestimos.filter(e => e.id != idNumerico); // Usar != para ser menos estrito
      }
      salvarEmprestimos();
      listarEmprestimos();
      carregarLivros(); // Recarrega a lista de livros para garantir consistência
    }
  }

  // Listener do formulário para criar novos empréstimos
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emprestimo = {
      id: gerarNovoId(),
      usuarioId: document.getElementById('usuarioSelect').value,
      livroId: document.getElementById('livroSelect').value,
      dataEmprestimo: document.getElementById('dataEmprestimo').value,
      dataDevolucao: document.getElementById('dataDevolucao').value || null,
      status: document.getElementById('status').value,
    };

    if (!emprestimo.usuarioId || !emprestimo.livroId) {
      alert('Por favor, selecione um usuário e um livro válidos.');
      return;
    }

    emprestimos.push(emprestimo);
    salvarEmprestimos();
    
    form.reset();
    document.getElementById('status').value = 'Emprestado'; // Reseta para o padrão
    document.getElementById('dataEmprestimo').valueAsDate = new Date();
    alert('Empréstimo registrado com sucesso!');
    listarEmprestimos(buscaInput.value, sortConfig.key, sortConfig.direction);
    carregarLivros(); // Recarrega a lista de livros disponíveis
  });

  // Carregamento inicial
  carregarUsuarios();
  carregarLivros();
  listarEmprestimos();
  document.getElementById('dataEmprestimo').valueAsDate = new Date(); // Define a data de hoje como padrão

  // Listener para a barra de busca
  buscaInput.addEventListener('input', (e) => {
    listarEmprestimos(e.target.value, sortConfig.key, sortConfig.direction);
  });

  // Listeners para ordenação da tabela
  document.querySelectorAll('#lista-section th[data-sort]').forEach(header => {
    header.addEventListener('click', () => {
      const sortKey = header.getAttribute('data-sort');
      if (sortConfig.key === sortKey) {
        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
      } else {
        sortConfig.key = sortKey;
        sortConfig.direction = 'asc';
      }
      listarEmprestimos(buscaInput.value, sortConfig.key, sortConfig.direction);
    });
  });
}
