// Elementos do DOM
const studentTableBodyEl = document.getElementById('studentTableBody');
const selectedStudentNameEl = document.getElementById('selectedStudentName');
const selectedStudentGradeEl = document.getElementById('selectedStudentGrade');
const feedbackFormEl = document.getElementById('feedbackForm');
const feedbackTextAreaEl = document.getElementById('feedbackText');
const recommendationsResultEl = document.getElementById('recommendationsResult');
const roleToggleButton = document.getElementById('roleToggle'); // Botão para mudar para Aluno

// Log para verificar se o botão foi encontrado
console.log("avaliacao.js: roleToggleButton elemento do DOM:", roleToggleButton);

let currentSelectedStudent = null;
const mockStudents = [
    { id: 101, name: "Jonathan", grade: 9.5 }, { id: 102, name: "João", grade: 10.00 },
    { id: 103, name: "Juarez", grade: 4.50 }, { id: 104, name: "Joel", grade: 9.0 },
    { id: 105, name: "Noemia", grade: 0.0 }, { id: 106, name: "Kleber", grade: 7.50 }
];

function applyRole(newRole) {
    console.log("[applyRole] Função chamada com newRole:", newRole);
    localStorage.setItem('userRole', newRole);
    console.log("[applyRole] localStorage 'userRole' definido para:", localStorage.getItem('userRole'));

    if (newRole === 'student') {
        // Se estamos na página de avaliação e o objetivo é ir para aluno, redirecionamos.
        if (window.location.pathname.includes('avaliacao.html')) {
            console.log("[applyRole] Redirecionando de avaliacao.html para aluno_materiais.html");
            window.location.href = 'aluno_materiais.html';
        } else {
            console.log("[applyRole] newRole é 'student', mas não está na página avaliacao.html. Sem redirecionamento daqui.");
        }
    }
    // O texto do botão é atualizado no DOMContentLoaded para esta página,
    // ou pela lógica de aluno_materiais.js se a navegação ocorrer para lá.
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("[DOMContentLoaded] Evento iniciado.");

    let currentRole = localStorage.getItem('userRole');
    console.log("[DOMContentLoaded] 'userRole' inicial do localStorage:", currentRole);

    const isCurrentPageTeacherPage = window.location.pathname.includes('avaliacao.html');
    console.log("[DOMContentLoaded] isCurrentPageTeacherPage (esta é avaliacao.html?):", isCurrentPageTeacherPage);

    if (!currentRole) {
        // Se não há role, e estamos na página de professor, define como 'teacher'.
        // Se estivéssemos na página de aluno, definiria como 'student'.
        currentRole = isCurrentPageTeacherPage ? 'teacher' : 'student';
        localStorage.setItem('userRole', currentRole);
        console.log("[DOMContentLoaded] 'userRole' não definido, setado para:", currentRole);
    }

    // Lógica de redirecionamento crucial:
    // Se o role é 'student' E estamos na página do professor (avaliacao.html), redireciona para aluno.
    if (currentRole === 'student' && isCurrentPageTeacherPage) {
        console.log("[DOMContentLoaded] Role é 'student' mas está na página do professor. Redirecionando para aluno_materiais.html...");
        window.location.href = 'aluno_materiais.html';
        return; // Para a execução do restante do script desta página.
    }
    // O redirecionamento de 'teacher' na página de aluno seria feito pelo script de aluno_materiais.js.

    // Configuração do botão roleToggle
    if (roleToggleButton) {
        console.log("[DOMContentLoaded] Configurando roleToggleButton.");
        // Nesta página (avaliacao.html), o botão sempre deve permitir ir para a visão de 'Aluno'.
        roleToggleButton.textContent = 'Aluno';
        roleToggleButton.addEventListener('click', () => {
            console.log("[roleToggleButton Click] Botão 'Aluno' clicado.");
            // Ao clicar, o objetivo é se tornar 'student' e ir para a página de aluno.
            applyRole('student');
        });
        console.log("[DOMContentLoaded] Event listener adicionado ao roleToggleButton.");
    } else {
        console.error("[DOMContentLoaded] ERRO - roleToggleButton (id='roleToggle') não encontrado no DOM!");
    }

    // Só executa a lógica específica da página de avaliação se estivermos nela
    // e se não tivermos sido redirecionados.
    if (isCurrentPageTeacherPage) {
        console.log("[DOMContentLoaded] Executando lógica específica da página de avaliação do professor.");
        if (studentTableBodyEl) {
            populateStudentList();
        } else {
            console.warn("[DOMContentLoaded] studentTableBodyEl não encontrado.");
        }

        if (mockStudents.length > 0) {
            const lastSelectedStudentId = localStorage.getItem('lastSelectedStudentId');
            let studentToSelect = mockStudents[0];
            if (lastSelectedStudentId) {
                const foundStudent = mockStudents.find(s => s.id.toString() === lastSelectedStudentId);
                if (foundStudent) studentToSelect = foundStudent;
            }

            if (typeof selectStudent === "function" && selectedStudentNameEl && selectedStudentGradeEl && feedbackFormEl) {
                selectStudent(studentToSelect);

                const difficulties = localStorage.getItem(`studentFeedback_${studentToSelect.id}`);
                if (difficulties && feedbackTextAreaEl) {
                    feedbackTextAreaEl.value = difficulties;
                }
                const storedRecs = localStorage.getItem('recommendations');
                const storedInfo = localStorage.getItem('studentInfo');
                if (storedRecs && storedInfo && recommendationsResultEl) {
                    try {
                        const info = JSON.parse(storedInfo);
                        if (info.studentId === studentToSelect.id) {
                           if (typeof displayStudentRecommendations === "function") displayStudentRecommendations(JSON.parse(storedRecs));
                        }
                    } catch(e){ console.error("Error loading previous recommendations on DOMContentLoaded", e); }
                }
            } else {
                console.error("[DOMContentLoaded] Elementos necessários para selectStudent não foram encontrados.");
            }
        }
    } else {
        console.log("[DOMContentLoaded] Não é a página de avaliação do professor (isCurrentPageTeacherPage é false), pulando lógica específica.");
    }
    console.log("[DOMContentLoaded] Evento finalizado.");
});

// --- Funções restantes (populateStudentList, selectStudent, submit, displayStudentRecommendations) ---
// Mantenha as versões dessas funções que já incluem os logs de depuração para a chamada fetch,
// pois elas são separadas da lógica do botão de role.

function populateStudentList() {
    if (!studentTableBodyEl) {
        // console.error("avaliacao.js: studentTableBodyEl não encontrado para populateStudentList.");
        return;
    }
    studentTableBodyEl.innerHTML = '';
    mockStudents.forEach(student => {
        const row = studentTableBodyEl.insertRow();
        row.insertCell().textContent = student.name;
        const gradeCell = row.insertCell();
        gradeCell.textContent = student.grade.toFixed(student.grade % 1 === 0 ? 0 : 2);
        const optionsCell = row.insertCell();
        optionsCell.innerHTML = `<span class="options-icon">⋮</span>`;
        row.addEventListener('click', () => selectStudent(student));
    });
    // console.log("avaliacao.js: populateStudentList executado.");
}

function selectStudent(student) {
    // console.log("avaliacao.js: selectStudent chamado para:", student ? student.name : "N/A");
    if (!selectedStudentNameEl || !selectedStudentGradeEl || !feedbackFormEl || !feedbackTextAreaEl || !recommendationsResultEl) {
        // console.error("avaliacao.js: Um ou mais elementos para selectStudent não encontrados.");
        return;
    }

    currentSelectedStudent = student;
    localStorage.setItem('lastSelectedStudentId', student.id.toString());

    selectedStudentNameEl.textContent = student.name;
    selectedStudentGradeEl.textContent = `Nota: ${student.grade.toFixed(student.grade % 1 === 0 ? 0 : (student.grade.toString().includes('.') ? 2 : 0))}`;
    feedbackFormEl.classList.remove('hidden');

    const savedFeedback = localStorage.getItem(`studentFeedback_${student.id}`);
    feedbackTextAreaEl.value = savedFeedback || '';

    recommendationsResultEl.classList.add('hidden');
    recommendationsResultEl.innerHTML = '';
    const storedRecs = localStorage.getItem('recommendations');
    const storedInfo = localStorage.getItem('studentInfo');
    if (storedRecs && storedInfo) {
        try {
            const info = JSON.parse(storedInfo);
            if (info.studentId === student.id) {
                if (typeof displayStudentRecommendations === "function") displayStudentRecommendations(JSON.parse(storedRecs));
            }
        } catch (e) {
            // console.error("Error parsing stored recommendations/info on student select:", e);
        }
    }
}

if (feedbackFormEl) {
    feedbackFormEl.addEventListener('submit', async function(event) {
        event.preventDefault();
        if (!currentSelectedStudent) {
            alert('Nenhum aluno selecionado.');
            return;
        }
        const difficulties = feedbackTextAreaEl.value.trim();

        // console.log("Frontend: currentSelectedStudent ANTES de enviar:", JSON.stringify(currentSelectedStudent, null, 2));
        // console.log("Frontend: currentSelectedStudent.grade:", currentSelectedStudent ? currentSelectedStudent.grade : 'N/A', "(Tipo:", currentSelectedStudent ? typeof currentSelectedStudent.grade : 'N/A', ")");
        // console.log("Frontend: difficulties:", difficulties, "(Tipo:", typeof difficulties, ")");

        const payload = {
            studentId: currentSelectedStudent.id,
            grade: currentSelectedStudent.grade,
            difficulties: difficulties
        };
        // console.log("Frontend: Payload que será enviado para o backend:", JSON.stringify(payload, null, 2));

        if (recommendationsResultEl) {
            recommendationsResultEl.innerHTML = `<p style="color: var(--text-on-light-bg);">Buscando recomendações...</p>`;
            recommendationsResultEl.classList.remove('hidden');
        }
        
        localStorage.setItem(`studentFeedback_${currentSelectedStudent.id}`, difficulties);

        try {
            const response = await fetch('http://localhost:8080/api/recommendations/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let errorMsg = `Erro HTTP: ${response.status}`;
                let errorDetails = '';
                try {
                    const errorData = await response.json();
                    errorDetails = errorData.message || JSON.stringify(errorData);
                } catch (e) {
                    errorDetails = await response.text();
                }
                errorMsg += ` - ${errorDetails || 'Resposta de erro desconhecida do servidor.'}`;
                throw new Error(errorMsg);
            }

            const recommendations = await response.json();
            localStorage.setItem('recommendations', JSON.stringify(recommendations));
            localStorage.setItem('studentInfo', JSON.stringify({
                studentId: currentSelectedStudent.id,
                studentName: currentSelectedStudent.name,
                grade: currentSelectedStudent.grade,
                difficulties: difficulties
            }));
            if (typeof displayStudentRecommendations === "function") displayStudentRecommendations(recommendations);
        } catch (error) {
            console.error('Erro ao gerar sugestões:', error);
            if (recommendationsResultEl) {
                recommendationsResultEl.innerHTML = `<p style="color: red;">Erro ao buscar sugestões: ${error.message}</p>`;
            }
        }
    });
} else {
    // console.warn("avaliacao.js: feedbackFormEl não encontrado, listener de submit não adicionado.");
}

function displayStudentRecommendations(recommendations) {
    if (!recommendationsResultEl) {
        // console.error("avaliacao.js: recommendationsResultEl não encontrado para displayStudentRecommendations.");
        return;
    }
    recommendationsResultEl.innerHTML = `<h4 style="color: var(--text-on-light-bg); margin-top:0;">Materiais Sugeridos:</h4>`;
    if (!recommendations || recommendations.length === 0) {
        recommendationsResultEl.innerHTML += `<p style="color: var(--text-on-light-bg);">Nenhum material específico sugerido.</p>`;
    } else {
        recommendations.forEach(rec => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'material-item';
            itemDiv.innerHTML = `
                <div class="info">
                    <span class="title">${rec.title || 'Sem Título'}</span>
                    <span class="type">${rec.type || 'N/A'}</span>
                </div>
                <a href="${rec.link || '#'}" target="_blank" rel="noopener noreferrer" class="action-icon">►</a>`;
            recommendationsResultEl.appendChild(itemDiv);
        });
    }
    recommendationsResultEl.classList.remove('hidden');
    // console.log("avaliacao.js: displayStudentRecommendations executado.");
}