// Script responsável pela abertura do Dropdown
function toggleAnswer(id, event) {
    event.preventDefault(); // Impede que o comportamento padrão aconteça (como recarregar a página)
  
    var answer = document.getElementById('answer' + id);
    var arrow = answer.previousElementSibling.querySelector('.arrow'); // Seleciona a seta
  
    // Alterna a visibilidade da resposta e a rotação da seta
    if (answer.style.display === 'block') {
        answer.style.display = 'none';
        arrow.style.transform = 'rotate(90deg)'; // Seta para direita (fechada)
    } else {
        answer.style.display = 'block';
        arrow.style.transform = 'rotate(270deg)'; // Seta para baixo (expandida)
    }
  }