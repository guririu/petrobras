// main.js: Lida com busca rápida por palavra-chave na home

document.getElementById('buscar-link').addEventListener('click', function (e) {
  e.preventDefault();
  const termo = prompt("Digite uma palavra-chave (ex: matemática, português, petróleo):");
  if (termo && termo.trim().length > 2) {
    // Encaminha para provas.html na busca
    window.location.href = "provas.html?busca=" + encodeURIComponent(termo.trim());
  }
});
