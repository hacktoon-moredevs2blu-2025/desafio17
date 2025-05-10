const express = require('express');
const cors = require('cors');
// const fs = require('fs'); // Não precisamos mais do File System
// const path = require('path'); // Não precisamos mais do Path

const app = express();
const PORT = 8080;

// Middleware - DEVE VIR ANTES DAS ROTAS
app.use(cors()); // Habilita CORS para todas as rotas
app.use(express.json()); // Permite que o Express parseie corpos de requisição application/json

// Materiais de estudo embutidos diretamente no código
const allMaterials = [
    {
        "id": "mat001",
        "title": "Fundamentos de Programação: Variáveis e Tipos de Dados",
        "type": "Vídeo",
        "link": "https://example.com/video/vars-types",
        "keywords": ["fundamentos", "variáveis", "tipos de dados", "iniciante", "programação básica"],
        "minGrade": 0,
        "maxGrade": 4.9
    },
    {
        "id": "mat002",
        "title": "Estruturas de Controle: If/Else e Switch",
        "type": "Artigo",
        "link": "https://example.com/article/control-flow",
        "keywords": ["fundamentos", "if", "else", "switch", "lógica", "controle de fluxo"],
        "minGrade": 0,
        "maxGrade": 6.9
    },
    {
        "id": "mat003",
        "title": "Dominando Loops: For e While",
        "type": "Tutorial Interativo",
        "link": "https://example.com/tutorial/loops",
        "keywords": ["loops", "for", "while", "repetição", "estrutura de dados", "iteração"],
        "minGrade": 3,
        "maxGrade": 7.9
    },
    {
        "id": "mat004",
        "title": "Introdução a Funções e Modularização",
        "type": "Vídeo",
        "link": "https://example.com/video/functions",
        "keywords": ["funções", "modularização", "organização", "boas práticas", "procedimentos"],
        "minGrade": 5,
        "maxGrade": 10
    },
    {
        "id": "mat_ts001", // Material para teste de TypeScript
        "title": "Introdução ao TypeScript para Iniciantes",
        "type": "Artigo",
        "link": "https://example.com/intro-typescript",
        "keywords": ["typescript", "tipagem", "javascript", "frontend"],
        "minGrade": 0,
        "maxGrade": 7.0 // Ajustado para incluir nota 4 e 7
    },
    {
        "id": "mat_angular001", // Material para teste de Angular
        "title": "Primeiros Passos com Angular",
        "type": "Curso Online",
        "link": "https://example.com/angular-basics",
        "keywords": ["angular", "framework", "frontend", "componentes", "typescript"],
        "minGrade": 6,
        "maxGrade": 10
    },
    {
        "id": "gen001", // Material genérico por nota
        "title": "Revisão Geral de Programação Intermediária",
        "type": "Vídeo",
        "link": "http://example.com/general-review-intermediate",
        "keywords": [], // Sem keywords específicas, depende da nota
        "minGrade": 4,  // Compatível com nota 4
        "maxGrade": 7.9
    }
];
console.log(`Backend: ${allMaterials.length} materiais embutidos carregados.`);


// Endpoint para gerar recomendações
app.post('/api/recommendations/generate', (req, res) => {
    console.log('\n--- Backend: Nova Requisição em /api/recommendations/generate ---');
    console.log('Backend - Conteúdo bruto de req.body:', req.body);

    const { studentId, grade, difficulties } = req.body;

    console.log(`Backend - Dados desestruturados: studentId: ${studentId}, grade: ${grade} (Tipo: ${typeof grade}), difficulties: "${difficulties}" (Tipo: ${typeof difficulties})`);

    if (grade === undefined || difficulties === undefined || studentId === undefined) {
        console.log("Backend - Erro: Campos 'studentId', 'grade' e 'difficulties' são obrigatórios e não foram recebidos corretamente.");
        return res.status(400).json({ message: "Campos 'studentId', 'grade' e 'difficulties' são obrigatórios." });
    }

    const numericGrade = parseFloat(grade);
    if (isNaN(numericGrade)) {
        console.log(`Backend - Erro: O campo 'grade' recebido ("${grade}") não é um número válido.`);
        return res.status(400).json({ message: "O campo 'grade' deve ser um número." });
    }

    let recommendedMaterials = [];
    const difficultiesLower = typeof difficulties === 'string' ? difficulties.toLowerCase() : "";

    console.log(`Backend - Iniciando lógica de recomendação para nota: ${numericGrade}, dificuldades (lower): "${difficultiesLower}"`);

    allMaterials.forEach(material => {
        // console.log(`Backend - Checando material: ${material.title} (ID: ${material.id})`);
        // console.log(`           Condições: minGrade=${material.minGrade}, maxGrade=${material.maxGrade}, keywords=${JSON.stringify(material.keywords)}`);

        let matchesGrade = (numericGrade >= material.minGrade && numericGrade <= material.maxGrade);
        let matchesKeywords = false;

        if (difficultiesLower.trim() !== "") {
            if (material.keywords && material.keywords.length > 0) {
                matchesKeywords = material.keywords.some(keyword => difficultiesLower.includes(keyword.toLowerCase()));
            }
        } else { // Se não há dificuldades especificadas pelo professor
            // Considera um "match" de keywords para materiais que não têm keywords (materiais genéricos baseados em nota)
            // Ou se o material tiver keywords, não será um match se difficulties estiver vazio (a menos que queira outra lógica)
            matchesKeywords = (!material.keywords || material.keywords.length === 0);
        }
        
        // console.log(`           matchesGrade: ${matchesGrade}, matchesKeywords: ${matchesKeywords}`);

        let shouldAdd = false;
        if (matchesGrade) {
            if (difficultiesLower.trim() === "") { // Sem dificuldades do aluno
                // Adiciona se o material não tiver keywords (genérico por nota)
                if (!material.keywords || material.keywords.length === 0) {
                    shouldAdd = true;
                }
            } else { // Com dificuldades do aluno
                // Adiciona se as keywords do material baterem com as dificuldades
                if (material.keywords && material.keywords.length > 0 && matchesKeywords) {
                    shouldAdd = true;
                }
                // Opcional: Adicionar também materiais genéricos por nota mesmo se houver dificuldades?
                // else if ((!material.keywords || material.keywords.length === 0) && matchesGrade) {
                //    shouldAdd = true; // Exemplo: sempre adiciona genéricos se a nota bater
                // }
            }
        }
        
        // console.log(`           shouldAdd: ${shouldAdd}`);

        if (shouldAdd) {
            if (!recommendedMaterials.find(rec => rec.id === material.id)) { // Evita duplicatas
                // console.log(`           >>> ADICIONANDO MATERIAL: ${material.title}`);
                recommendedMaterials.push({
                    id: material.id,
                    title: material.title,
                    type: material.type,
                    link: material.link
                });
            }
        }
    });

    console.log('Backend - Materiais recomendados para enviar ao frontend:', JSON.stringify(recommendedMaterials, null, 2));
    console.log('--- Backend: Fim da Requisição ---');

    res.status(200).json(recommendedMaterials);
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
    console.log(`Aguardando requisições do frontend em http://localhost:${PORT}/api/recommendations/generate`);
});