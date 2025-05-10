document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos do DOM para esta página (materiais_de_apoio.html)
    const roleToggleButton = document.getElementById('roleToggle');
    const difficultyDisplayEl = document.getElementById('difficultyDisplay');
    const materialsListContainerEl = document.getElementById('materialsListContainer');
    const materialSearchInputEl = document.getElementById('materialSearch');
    // const themeToggleButton = document.getElementById('themeToggle'); // Removido se o tema for fixo aqui

    console.log("aluno_materiais.js: Script iniciado.");
    console.log("aluno_materiais.js: roleToggleButton encontrado no DOM?", roleToggleButton);
    // console.log("aluno_materiais.js: themeToggleButton encontrado no DOM?", themeToggleButton);

    // Lógica de Tema (se você decidir mantê-la para esta página)
    /*
    function applyTheme(theme) {
        if (themeToggleButton) {
            document.body.classList.toggle('light-mode', theme === 'light');
            themeToggleButton.textContent = theme === 'light' ? 'Dark' : 'Light';
            localStorage.setItem('theme', theme);
        }
    }
    if (themeToggleButton) {
        const savedTheme = localStorage.getItem('theme') || 'dark'; // Ou 'light' se for o padrão da imagem
        applyTheme(savedTheme);
        themeToggleButton.addEventListener('click', () => {
            applyTheme(document.body.classList.contains('light-mode') ? 'dark' : 'light');
        });
    }
    */

    // Função para definir o 'userRole' e redirecionar
    function applyRole(newRole) {
        console.log("[aluno_materiais.js applyRole] Função chamada com newRole:", newRole);
        localStorage.setItem('userRole', newRole);
        console.log("[aluno_materiais.js applyRole] localStorage 'userRole' definido para:", localStorage.getItem('userRole'));

        // Atualiza o texto do botão IMEDIATAMENTE, se ele existir
        if (roleToggleButton) {
            roleToggleButton.textContent = newRole === 'student' ? 'Professor' : 'Aluno';
            console.log("[aluno_materiais.js applyRole] Texto do botão atualizado para:", roleToggleButton.textContent);
        }

        if (newRole === 'teacher') {
            // Se estamos na página do aluno e o objetivo é ir para professor, redirecionamos.
            if (window.location.pathname.includes('materiais_de_apoio.html') || window.location.pathname.includes('aluno_')) { // Ser mais genérico para páginas de aluno
                console.log("[aluno_materiais.js applyRole] Redirecionando para avaliacao.html");
                window.location.href = 'avaliacao.html';
            } else {
                console.log("[aluno_materiais.js applyRole] newRole é 'teacher', mas não está em uma página de aluno conhecida. Sem redirecionamento daqui.");
            }
        } else if (newRole === 'student') {
            // Se por algum motivo esta função for chamada para ir para 'student' e já não estiver lá
            if (window.location.pathname.includes('avaliacao.html')) {
                console.log("[aluno_materiais.js applyRole] Redirecionando de avaliacao.html para materiais_de_apoio.html");
                window.location.href = 'materiais_de_apoio.html'; // Ou a página padrão do aluno
            }
        }
    }

    // Configuração inicial e lógica de redirecionamento no carregamento da página
    let currentRole = localStorage.getItem('userRole');
    console.log("[aluno_materiais.js DOMContentLoaded] 'userRole' inicial do localStorage:", currentRole);

    const isCurrentPageStudentArea = window.location.pathname.includes('materiais_de_apoio.html') || window.location.pathname.includes('aluno_');
    // Assumindo que 'avaliacao.html' é a única página de professor principal
    const isCurrentPageTeacherPage = window.location.pathname.includes('avaliacao.html');

    console.log("[aluno_materiais.js DOMContentLoaded] isCurrentPageStudentArea:", isCurrentPageStudentArea);
    console.log("[aluno_materiais.js DOMContentLoaded] isCurrentPageTeacherPage:", isCurrentPageTeacherPage);

    if (!currentRole) {
        // Se não há role, e estamos nesta página (que é de aluno), define como 'student'.
        currentRole = isCurrentPageStudentArea ? 'student' : 'teacher';
        localStorage.setItem('userRole', currentRole);
        console.log("[aluno_materiais.js DOMContentLoaded] 'userRole' não definido, setado para:", currentRole);
    }

    // Lógica de redirecionamento crucial:
    if (currentRole === 'teacher' && isCurrentPageStudentArea) {
        console.log("[aluno_materiais.js DOMContentLoaded] Role é 'teacher' mas está na página de aluno. Redirecionando para avaliacao.html...");
        window.location.href = 'avaliacao.html';
        return; // Para a execução do restante do script desta página.
    } else if (currentRole === 'student' && isCurrentPageTeacherPage) {
        console.log("[aluno_materiais.js DOMContentLoaded] Role é 'student' mas está na página do professor. Redirecionando para materiais_de_apoio.html...");
        window.location.href = 'materiais_de_apoio.html'; // Ou a página padrão do aluno
        return;
    }

    // Configuração do botão roleToggle
    if (roleToggleButton) {
        console.log("[aluno_materiais.js DOMContentLoaded] Configurando roleToggleButton.");
        // Se estamos na página do aluno, o botão deve permitir ir para a visão de 'Professor'.
        roleToggleButton.textContent = 'Professor';
        roleToggleButton.addEventListener('click', () => {
            console.log("[aluno_materiais.js roleToggleButton Click] Botão 'Professor' clicado.");
            // Ao clicar, o objetivo é se tornar 'teacher' e ir para a página de avaliação.
            applyRole('teacher');
        });
        console.log("[aluno_materiais.js DOMContentLoaded] Event listener adicionado ao roleToggleButton.");
    } else {
        console.error("[aluno_materiais.js DOMContentLoaded] ERRO - roleToggleButton (id='roleToggle') não encontrado no DOM!");
    }

    // Lógica específica da página de materiais de apoio do aluno
    if (isCurrentPageStudentArea) {
        console.log("[aluno_materiais.js DOMContentLoaded] Executando lógica da página de materiais de apoio do aluno.");
        if (typeof loadStudentContextAndDisplayMaterials === "function") {
            loadStudentContextAndDisplayMaterials();
        }

        if (materialSearchInputEl) {
            materialSearchInputEl.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const studentInfo = JSON.parse(localStorage.getItem('studentInfo'));
                const professorDifficulties = studentInfo ? studentInfo.difficulties : "";
                if (typeof filterAndDisplayMaterials === "function") {
                    filterAndDisplayMaterials(professorDifficulties, searchTerm);
                }
            });
        }
    }
    console.log("[aluno_materiais.js DOMContentLoaded] Evento finalizado.");

}); // Fim do DOMContentLoaded


// Função para carregar dificuldades do professor e exibir materiais
function loadStudentContextAndDisplayMaterials() {
    const difficultyDisplayEl = document.getElementById('difficultyDisplay'); // Obtém novamente, pode ter sido definido depois
    const studentInfoString = localStorage.getItem('studentInfo');
    let professorDifficulties = "";

    if (difficultyDisplayEl) {
        if (studentInfoString) {
            try {
                const studentInfo = JSON.parse(studentInfoString);
                if (studentInfo.difficulties && studentInfo.difficulties.trim() !== "") {
                    difficultyDisplayEl.value = studentInfo.difficulties;
                    professorDifficulties = studentInfo.difficulties;
                } else {
                    difficultyDisplayEl.value = "Nenhuma dificuldade específica registrada pelo professor.";
                }
                console.log("[loadStudentContext] Dificuldades do professor carregadas:", studentInfo.difficulties);
            } catch (e) {
                console.error("[loadStudentContext] Erro ao parsear studentInfo:", e);
                difficultyDisplayEl.value = "Erro ao carregar dificuldades.";
            }
        } else {
            console.log("[loadStudentContext] Nenhuma studentInfo encontrada.");
            difficultyDisplayEl.value = "Nenhuma avaliação do professor encontrada para exibir dificuldades.";
        }
    } else {
        console.warn("[loadStudentContext] difficultyDisplayEl não encontrado.");
    }
    filterAndDisplayMaterials(professorDifficulties, ""); // Exibe materiais iniciais
}

// Função para filtrar e exibir materiais
function filterAndDisplayMaterials(professorDifficultiesText, searchTerm) {
    const materialsListContainerEl = document.getElementById('materialsListContainer');
    if (!materialsListContainerEl) {
        console.error("[filterAndDisplayMaterials] materialsListContainerEl não encontrado.");
        return;
    }

    const professorKeywords = professorDifficultiesText ? professorDifficultiesText.toLowerCase().split(/\s+|,|\.|;/).filter(k => k.length > 2) : [];
    const searchKeywords = searchTerm ? searchTerm.toLowerCase().split(/\s+/).filter(k => k.length > 1) : [];

    console.log("[filterAndDisplayMaterials] Filtro com Dificuldades Prof:", professorKeywords, "Busca:", searchKeywords);

    const professorRecommendedMaterialsString = localStorage.getItem('recommendations');
    let professorRecommendedItems = [];
    if (professorRecommendedMaterialsString) {
        try {
            professorRecommendedItems = JSON.parse(professorRecommendedMaterialsString);
            console.log("[filterAndDisplayMaterials] Recomendações diretas do prof:", professorRecommendedItems);
        } catch (e) { console.error("Erro ao parsear 'recommendations' do localStorage:", e); }
    }

    let finalMaterialsToShow = [];
    const allAvailableMaterials = getAllAvailableMaterials(); // Pega a lista completa

    // 1. Adiciona recomendações diretas do professor que correspondem ao termo de busca
    professorRecommendedItems.forEach(profRec => {
        const matchesSearch = searchKeywords.length === 0 || searchKeywords.some(sk =>
            (profRec.title && profRec.title.toLowerCase().includes(sk)) ||
            (profRec.type && profRec.type.toLowerCase().includes(sk))
        );
        if (matchesSearch) {
            if (!finalMaterialsToShow.find(fm => fm.title === profRec.title && fm.link === profRec.link)) {
                finalMaterialsToShow.push({ ...profRec, recommendedByProfessor: true, id: profRec.id || profRec.title }); // Garante um ID
            }
        }
    });

    // 2. Filtra todos os materiais disponíveis
    allAvailableMaterials.forEach(material => {
        const titleLower = material.title.toLowerCase();
        const typeLower = material.type.toLowerCase();
        const materialKeywordsLower = material.keywords.map(k => k.toLowerCase());

        const alreadyAddedAsProfRec = finalMaterialsToShow.find(fm => fm.id === material.id && fm.recommendedByProfessor);
        if (alreadyAddedAsProfRec) return; // Já adicionado como recomendação direta

        let matchesSearch = searchKeywords.length === 0 || searchKeywords.some(sk =>
            titleLower.includes(sk) || typeLower.includes(sk) || materialKeywordsLower.some(mk => mk.includes(sk))
        );

        let matchesProfessorDifficulties = professorKeywords.length === 0 || professorKeywords.some(pk =>
            materialKeywordsLower.some(mk => mk.includes(pk)) || titleLower.includes(pk)
        );

        if (searchKeywords.length > 0) { // Prioriza termo de busca
            if (matchesSearch) {
                if (!finalMaterialsToShow.find(fm => fm.id === material.id)) { // Evita duplicar se já estava por outra lógica
                    finalMaterialsToShow.push({ ...material, recommendedByProfessor: false });
                }
            }
        } else { // Sem busca, usa dificuldades do professor
            if (matchesProfessorDifficulties) {
                 if (!finalMaterialsToShow.find(fm => fm.id === material.id)) {
                    finalMaterialsToShow.push({ ...material, recommendedByProfessor: false });
                 }
            }
        }
    });
    
    // Uma última checagem para remover duplicatas por id, caso a lógica anterior não tenha pego
    const uniqueIds = new Set();
    finalMaterialsToShow = finalMaterialsToShow.filter(el => {
        const duplicate = uniqueIds.has(el.id);
        uniqueIds.add(el.id);
        return !duplicate;
    });

    renderMaterials(finalMaterialsToShow, materialsListContainerEl);
}

// Função que retorna todos os materiais (a mesma que estava no materials_de_apoio.js)
function getAllAvailableMaterials() {
    return [
        { id: "mat001", title: "Fundamentos: Variáveis e Tipos", type: "Vídeo", link: "#vars-types", keywords: ["fundamentos", "variáveis", "tipos", "básico", "programação"] },
        { id: "mat002", title: "Estruturas de Controle: If/Else", type: "Artigo", link: "#control-flow", keywords: ["if", "else", "lógica", "decisão", "programação"] },
        { id: "mat003", title: "Dominando Loops: For e While", type: "Tutorial", link: "#loops", keywords: ["loops", "for", "while", "repetição", "iteração", "typescript"] },
        { id: "mat004", title: "Introdução a Funções", type: "Vídeo", link: "#functions", keywords: ["funções", "modularização", "métodos", "typescript"] },
        { id: "mat_ts001", title: "TypeScript para Iniciantes", type: "Artigo", link: "#intro-typescript", keywords: ["typescript", "tipagem", "javascript", "frontend"] },
        { id: "mat_angular001", title: "Primeiros Passos com Angular", type: "Curso", link: "#angular-basics", keywords: ["angular", "framework", "frontend", "typescript", "componentes"] },
        { id: "gen001", title: "Revisão Geral Intermediária", type: "Vídeo", link: "#general-review", keywords: ["revisão", "geral", "intermediário"] },
        { id: "frac001", title: "Exercícios Básicos de Frações", type: "Exercício", link: "#fracoes-exerc", keywords: ["matemática", "frações", "básico"] },
        { id: "porc001", title: "O que é Porcentagem?", type: "Artigo", link: "#porcentagem-oquee", keywords: ["matemática", "porcentagem", "conceito"] },
        { id: "porc002", title: "Como calcular Porcentagem", type: "Vídeo", link: "#porcentagem-calcular", keywords: ["matemática", "porcentagem", "cálculo"] }
    ];
}

// Função para renderizar os materiais na lista
function renderMaterials(materials, container) {
    if (!container) {
        console.error("[renderMaterials] Container não encontrado.");
        return;
    }
    container.innerHTML = '';

    if (!materials || materials.length === 0) {
        container.innerHTML = '<p class="no-materials-found">Nenhum material encontrado para os critérios atuais.</p>';
        return;
    }

    materials.forEach(material => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'material-item';
        if (material.recommendedByProfessor) {
            itemDiv.classList.add('professor-recommended');
        }
        itemDiv.innerHTML = `
            <div class="material-info">
                <span class="material-title">${material.title || 'Sem Título'}</span>
                <span class="material-type">${material.type || 'N/A'}</span>
            </div>
            <a href="${material.link || '#'}" target="_blank" rel="noopener noreferrer" class="material-action-icon">
                <img src="icons/play.svg" alt="Acessar">
            </a>
        `;
        container.appendChild(itemDiv);
    });
    console.log("[renderMaterials] Materiais renderizados:", materials.length);
}