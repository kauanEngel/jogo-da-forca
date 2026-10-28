
const words = [
  { word: "COWBOY", category: "FAROESTE", hint: "Pessoa que trabalha com gado no Velho Oeste." },
  { word: "SALOON", category: "LUGARES", hint: "Bar típico dos filmes de faroeste." },
  { word: "XERIFE", category: "PERSONAGENS", hint: "Autoridade que mantém a lei na cidade." },
  { word: "CAVALO", category: "ANIMAIS", hint: "Companheiro de viagem do cowboy." },
  { word: "DESERTO", category: "PAISAGEM", hint: "Lugar seco, com pouca chuva e muita areia." },
  { word: "REVOLVER", category: "OBJETOS", hint: "Arma curta que aparece em histórias de faroeste." },
  { word: "DILIGENCIA", category: "TRANSPORTE", hint: "Carruagem usada para transportar pessoas e cargas." },
  { word: "BANDIDO", category: "PERSONAGENS", hint: "Fora da lei procurado pelo xerife." },
  { word: "CHAPEU", category: "ROUPAS", hint: "Acessório clássico na cabeça do cowboy." },
  { word: "FERRADURA", category: "OBJETOS", hint: "Peça de metal presa ao casco do cavalo." },
  { word: "CACTO", category: "NATUREZA", hint: "Planta espinhosa comum em regiões áridas." },
  { word: "DUELO", category: "FAROESTE", hint: "Confronto entre dois rivais." },
  { word: "POKER", category: "JOGOS", hint: "Jogo de cartas famoso nos saloons." },
  { word: "ESTRADA", category: "PAISAGEM", hint: "Caminho que cruza o deserto e liga cidades." }
];

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Ordem das partes que desaparecem a cada erro.
const parts = [
  "rightLeg",
  "leftLeg",
  "rightArm",
  "leftArm",
  "bodyPart",
  "headPart"
];

let current;
let guessed;
let mistakes = 0;
let score = 0;
let hintUsed = false;
let locked = false;

const $ = id => document.getElementById(id);
const keyboard = $("keyboard");

// Inicia ou reinicia a rodada.
function newGame() {
  current = words[Math.floor(Math.random() * words.length)];
  guessed = new Set();
  mistakes = 0;
  hintUsed = false;
  locked = false;

  $("category").textContent = `CATEGORIA: ${current.category}`;
  $("message").textContent = "Escolha uma letra, forasteiro...";
  $("message").style.color = "";

  $("overlay").classList.add("hidden");

  $("hintBtn").disabled = false;
  $("hintBtn").style.opacity = "1";

  // Limpa e recria o teclado.
  keyboard.innerHTML = "";

  alphabet.forEach(letter => {
    const btn = document.createElement("button");

    btn.className = "key";
    btn.textContent = letter;
    btn.setAttribute("aria-label", `Letra ${letter}`);

    btn.addEventListener("click", () => guess(letter, btn));

    keyboard.appendChild(btn);
  });

  // Restaura todas as partes do cowboy.
  parts.forEach(id => {
    const parte = $(id);

    if (!parte) return;

    parte.style.animation = "none";
    parte.classList.remove("removed");

    parte.style.opacity = "";
    parte.style.visibility = "";
    parte.style.transform = "";
    parte.style.display = "";

    // Atualiza o desenho antes de remover a animação anterior.
    void parte.getBoundingClientRect();

    parte.style.animation = "";
  });

  // Limpa o progresso da rodada anterior.
  document.querySelectorAll(".progress-step").forEach(el => {
    el.classList.remove("done", "active");
  });

  updateWord();
  updateHud();
}

// Verifica a letra escolhida.
function guess(letter, btn) {
  if (locked || guessed.has(letter)) return;

  guessed.add(letter);
  btn.disabled = true;

  if (current.word.includes(letter)) {
    btn.classList.add("correct");

    const messages = [
      "Boa! Acertou em cheio!",
      "Essa letra vale ouro, parceiro!",
      "Muito bem, pistoleiro!"
    ];

    $("message").textContent =
      messages[Math.floor(Math.random() * messages.length)];

    $("message").style.color = "#c8ef9e";

    score += 10;

    // Vitória: todas as letras foram descobertas.
    if ([...current.word].every(ch => guessed.has(ch))) {
      score += 50;
      updateWord();
      updateHud();
      finish(true);
      return;
    }
  } else {
    btn.classList.add("wrong");
    mistakes++;

    // Faz desaparecer uma parte do cowboy.
    const partId = parts[mistakes - 1];
    const parte = $(partId);

    if (parte) {
      parte.classList.add("removed");
      parte.style.animation = "partFall 0.55s ease-in forwards";
    }

    $("message").textContent =
      mistakes >= 6
        ? "Seis erros... o duelo acabou!"
        : "Errou! O cowboy perdeu uma parte!";

    $("message").style.color = "#ff9a77";

    if (mistakes >= 6) {
      updateWord(true);
      updateHud();
      finish(false);
      return;
    }
  }

  updateWord();
  updateHud();
}

// Desenha as letras da palavra secreta.
function updateWord(reveal = false) {
  const holder = $("word");
  holder.innerHTML = "";

  [...current.word].forEach(letter => {
    const span = document.createElement("span");

    span.className = "word-letter";

    if (guessed.has(letter) || reveal) {
      span.classList.add("reveal");
      span.textContent = letter;
    } else {
      span.textContent = " ";
    }

    holder.appendChild(span);
  });
}

// Atualiza a pontuação, os corações e o progresso.
function updateHud() {
  $("score").textContent = String(score).padStart(4, "0");

  $("hearts").innerHTML = Array.from({ length: 6 }, (_, i) => {
    return `<span class="${i < mistakes ? "heart-lost" : ""}">♥</span>`;
  }).join(" ");

  document.querySelectorAll(".progress-step").forEach(el => {
    const step = Number(el.dataset.step);

    el.classList.toggle("done", step <= mistakes);
    el.classList.toggle(
      "active",
      step === mistakes + 1 && mistakes < 6
    );
  });
}

// Mostra o resultado da rodada.
function finish(won) {
  locked = true;

  $("endIcon").textContent = won ? "★" : "☠";
  $("endTitle").textContent = won
    ? "VITÓRIA, PARCEIRO!"
    : "FIM DE JOGO!";

  $("endText").innerHTML = won
    ? `Você descobriu <strong>${current.word}</strong> e ganhou 50 pontos de bônus!<br>O saloon inteiro está comemorando.`
    : `A palavra era <strong>${current.word}</strong>.<br>Não desanime: até os melhores xerifes erram um duelo.`;

  $("overlay").classList.remove("hidden");
}

// Botão de dica.
$("hintBtn").addEventListener("click", () => {
  if (locked) {
    $("message").textContent = "Comece uma nova rodada, parceiro.";
    return;
  }

  if (hintUsed) {
    $("message").textContent = "A dica já foi usada nesta rodada!";
    return;
  }

  hintUsed = true;
  score = Math.max(0, score - 5);

  $("message").textContent = "DICA: " + current.hint;
  $("message").style.color = "#ffe0a0";

  $("hintBtn").disabled = true;
  $("hintBtn").style.opacity = "0.55";

  updateHud();
});

// Botão para jogar novamente.
$("newGame").addEventListener("click", newGame);

// Animação da parte que cai.
const style = document.createElement("style");

style.textContent = `
@keyframes partFall {
  0% {
    transform: translateY(0) rotate(0);
    opacity: 1;
  }

  45% {
    transform: translateY(20px) rotate(12deg);
    opacity: 0.9;
  }

  100% {
    transform: translateY(45px) rotate(24deg);
    opacity: 0;
  }
}`;

document.head.appendChild(style);

// Começa a primeira rodada.
newGame();
