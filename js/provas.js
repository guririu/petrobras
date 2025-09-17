// provas.js: Exibe a lista de provas, com filtros por ano/cargo e busca por palavra-chave

const urlParams = new URLSearchParams(window.location.search);
const filtrarPor = urlParams.get('por'); // "cargo" ou null
const termoBusca = urlParams.get('busca'); // palavra-chave

// Carrega provas e questões do JSON
Promise.all([
  fetch('data/provas.json').then(r => r.json()),
  fetch('data/questoes.json').then(r => r.json())
]).then(([provas, questoes]) => {
  let provasFiltradas = provas;
  let titulo = "Escolha a Prova";

  if (termoBusca) {
    // Busca por palavra-chave nas questões
    const questoesEncontradas = questoes.filter(q =>
      q.enunciado.toLowerCase().includes(termoBusca.toLowerCase()) ||
      (q.palavrasChave || []).some(palavra =>
        palavra.toLowerCase().includes(termoBusca.toLowerCase())
      )
    );
    const provaIds = [...new Set(questoesEncontradas.map(q => q.provaId))];
    provasFiltradas = provas.filter(p => provaIds.includes(p.id));
    titulo = `Resultados para "${termoBusca}"`;
    if (provasFiltradas.length === 0) {
      document.getElementById('lista-provas').innerHTML = "<li>Nenhuma prova encontrada.</li>";
      document.getElementById('titulo-selecao').textContent = titulo;
      return;
    }
  } else if (filtrarPor === "cargo") {
    // Agrupa por cargo
    const cargos = [...new Set(provas.map(p => p.cargo))];
    titulo = "Selecione o Cargo";
    document.getElementById('filtros').innerHTML = cargos.map(cargo =>
      `<button class="button" onclick="filtrarCargo('${cargo}')">${cargo}</button>`
    ).join(" ");
    document.getElementById('lista-provas').innerHTML = "";
    document.getElementById('titulo-selecao').textContent = titulo;
    return;
  }

  document.getElementById('titulo-selecao').textContent = titulo;
  document.getElementById('filtros').innerHTML = "";

  // Lista provas
  document.getElementById('lista-provas').innerHTML = provasFiltradas.map(prova =>
    `<li>
      <strong>${prova.titulo}</strong><br>
      Ano: ${prova.ano}, Cargo: ${prova.cargo}, Banca: ${prova.banca}<br>
      <a class="button" href="questao.html?prova=${prova.id}">Ver questões</a>
    </li>`
  ).join("");
});

function filtrarCargo(cargo) {
  window.location.href = "provas.html?busca=" + encodeURIComponent(cargo);
}

// Link buscar rápida
document.getElementById('buscar-link').addEventListener('click', function (e) {
  e.preventDefault();
  const termo = prompt("Digite uma palavra-chave (ex: matemática, português, petróleo):");
  if (termo && termo.trim().length > 2) {
    window.location.href = "provas.html?busca=" + encodeURIComponent(termo.trim());
  }
});
