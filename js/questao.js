// questao.js: Exibe questões da prova, quiz interativo, e comentários

const urlParams = new URLSearchParams(window.location.search);
const provaId = urlParams.get('prova');

let acertos = 0, erros = 0;

Promise.all([
  fetch('data/provas.json').then(r => r.json()),
  fetch('data/questoes.json').then(r => r.json())
]).then(([provas, questoes]) => {
  const prova = provas.find(p => p.id === provaId);
  const questoesProva = questoes.filter(q => prova.questoes.includes(q.id));

  if (!prova || questoesProva.length === 0) {
    document.getElementById('quiz-container').innerHTML = "<p>Prova não encontrada.</p>";
    return;
  }

  let html = `<h2>${prova.titulo}</h2>
    <div class="contadores"><span>Acertos: <span id="count-acertos">0</span></span>
    <span>Erros: <span id="count-erros">0</span></span></div>
    <div id="questoes-list"></div>`;

  document.getElementById('quiz-container').innerHTML = html;

  const questoesList = document.getElementById('questoes-list');
  questoesList.innerHTML = questoesProva.map((q, idx) => renderQuestao(q, idx)).join("");

  // Adiciona eventos para quiz
  questoesProva.forEach((q, idx) => {
    document.getElementById(`verificar-${q.id}`).addEventListener('click', function () {
      const selecionada = document.querySelector(`input[name="alt-${q.id}"]:checked`);
      if (!selecionada) return alert("Selecione uma alternativa.");

      const resposta = parseInt(selecionada.value);
      const feedbackEl = document.getElementById(`feedback-${q.id}`);
      if (resposta === q.resposta) {
        feedbackEl.textContent = "Correto!";
        feedbackEl.className = "feedback correto";
        acertos++;
      } else {
        feedbackEl.textContent = `Incorreto. Resposta correta: ${q.alternativas[q.resposta]}`;
        feedbackEl.className = "feedback incorreto";
        erros++;
      }
      document.getElementById('count-acertos').textContent = acertos;
      document.getElementById('count-erros').textContent = erros;
      // Impede nova resposta
      document.querySelectorAll(`input[name="alt-${q.id}"]`).forEach(el => el.disabled = true);
      this.disabled = true;
    });

    // Comentários
    carregarComentarios(q.id);
    document.getElementById(`form-${q.id}`).addEventListener('submit', function (e) {
      e.preventDefault();
      const nome = this.elements["nome"].value || "Anônimo";
      const texto = this.elements["texto"].value;
      if (texto.trim().length < 5) return alert("Comentário muito curto.");
      salvarComentario(q.id, nome, texto);
      this.reset();
      carregarComentarios(q.id);
    });
  });
});

// Gera HTML de uma questão do quiz
function renderQuestao(q, idx) {
  return `
  <div class="quiz-question">
    <div><strong>Questão ${idx + 1}:</strong> ${q.enunciado}</div>
    <div class="alternativas">
      ${q.alternativas.map((alt, i) =>
        `<label><input type="radio" name="alt-${q.id}" value="${i}"/> ${alt}</label>`
      ).join("")}
    </div>
    <button class="button" id="verificar-${q.id}">Verificar resposta</button>
    <div id="feedback-${q.id}" class="feedback"></div>
    <div class="comentarios" id="comentarios-${q.id}">
      <h4>Comentários</h4>
      <form class="form-comentario" id="form-${q.id}">
        <input type="text" name="nome" placeholder="Seu nome (opcional)"/>
        <textarea name="texto" placeholder="Deixe seu comentário explicando sua resolução..." required></textarea>
        <button class="button" type="submit">Comentar</button>
      </form>
      <div id="lista-comentarios-${q.id}"></div>
    </div>
  </div>
  `;
}

// Armazena comentários no localStorage por questão
function salvarComentario(questaoId, nome, texto) {
  const key = `comentarios_${questaoId}`;
  const comentarios = JSON.parse(localStorage.getItem(key) || "[]");
  comentarios.push({
    nome,
    texto,
    data: new Date().toLocaleString()
  });
  localStorage.setItem(key, JSON.stringify(comentarios));
}

function carregarComentarios(questaoId) {
  const key = `comentarios_${questaoId}`;
  const comentarios = JSON.parse(localStorage.getItem(key) || "[]");
  document.getElementById(`lista-comentarios-${questaoId}`).innerHTML =
    comentarios.length === 0 ? "<em>Seja o primeiro a comentar!</em>" :
    comentarios.map(c =>
      `<div class="comentario"><strong>${c.nome}</strong> (${c.data}):<br>${c.texto}</div>`
    ).join("");
}

// Link buscar rápida
document.getElementById('buscar-link').addEventListener('click', function (e) {
  e.preventDefault();
  const termo = prompt("Digite uma palavra-chave (ex: matemática, português, petróleo):");
  if (termo && termo.trim().length > 2) {
    window.location.href = "provas.html?busca=" + encodeURIComponent(termo.trim());
  }
});
