package com.example.teste.service; // Mude o pacote se necessário

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service // Indica que esta classe é um serviço
public class RecommendationAIService {

    private final WebClient webClient;
    private final String apiKey;
    @Autowired
    private PdfService pdfService;

    // Construtor que recebe a URL e a chave da API do Gemini e o WebClient.Builder
    public RecommendationAIService(
            @Value("${gemini.api.url}") String url, // Pega a URL do application.properties/yml
            @Value("${gemini.api.key}") String apiKey, // Pega a chave da API
            WebClient.Builder webClientBuilder) {
        this.pdfService = pdfService;
        this.apiKey = apiKey;
        this.webClient = webClientBuilder

                .baseUrl(url) // Define a URL base para as requisições
                .build();
    }

    /**
     * Envia a descrição das dificuldades para a IA e obtém sugestões de tópicos.
     * @param difficulties A descrição das dificuldades do aluno fornecida pelo professor.
     * @return Uma string com a resposta da IA (espera-se que sejam tópicos separados por vírgula).
     */
    public String getSuggestedTopicsFromAI(String difficulties) {
        String texto = "";
        try (PDDocument doc = pdfService.carregarPdfDaResources("recursosAprendizado.pdf")) {
            // agora você pode extrair texto, modificar, etc.
            texto = new PDFTextStripper().getText(doc);
            System.out.println(texto);
        } catch (Exception e) {
            e.printStackTrace();
        }


        // Construa o prompt específico para o seu caso de uso
        String prompt = String.format(
                "🔥 **INSTRUÇÕES DEFINITIVAS - PRIORIDADE ABSOLUTA PDF** 🔥\n\n" +

                        "// FLUXO OBRIGATÓRIO (SEGUIR ORDEM):\n" +
                        "1️⃣ **ANÁLISE DO PDF PRIMEIRO**\n" +
                        "   - Procurar por correspondências EXATAS de: '%s'\n" +
                        "   - Aceitar APENAS seções/exercícios que combinem 100%% com os tópicos\n" +
                        "   - Exemplo VÁLIDO: Dificuldade='Angular' → PDF tem 'Capítulo 3: Angular (p.12)'\n" +
                        "   - Exemplo INVÁLIDO: Dificuldade='Angular' → PDF tem 'Introdução a Java'\n\n" +

                        "2️⃣ **BUSCA EXTERNA (SOMENTE SE PDF FALHAR)**\n" +
                        "   - Ativar APENAS se:\n" +
                        "     a) PDF NÃO tiver NENHUM recurso relevante\n" +
                        "     b) PDF tiver MENOS de 5 recursos (completar com externos)\n\n" +

                        "3️⃣ **FORMATO FINAL (SEM FALHAS):**\n" +
                        "   - MÍNIMO 5 ITENS (combinar PDF + externos se necessário)\n" +
                        "   - Formato JAVA ESTRITO (sem variações):\n" +
                        "     [\n" +
                        "       RecommendedMaterial{title='TÍTULO EXATO', type='Exercicio', link='PÁGINA 5'},\n" +
                        "       RecommendedMaterial{title='Guia Oficial', type='Artigo', link='https://exemplo.com'}\n" +
                        "     ]\n\n" +

                        "// EXEMPLOS PRÁTICOS:\n" +
                        "▬▬▬▬▬▬▬▬▬▬▬▬ CENÁRIO 1: PDF RELEVANTE ▬▬▬▬▬▬▬▬▬▬▬▬\n" +
                        "Dificuldade: 'Componentes Angular'\n" +
                        "PDF: 'Seção 5: Componentes (p.20) | Exercício 7: Prática Angular (p.22)'\n" +
                        "Saída:\n" +
                        "[\n" +
                        "  RecommendedMaterial{title='Seção 5: Componentes', type='Artigo', link='p.20'},\n" +
                        "  RecommendedMaterial{title='Exercício 7: Prática Angular', type='Exercicio', link='p.22'},\n" +
                        "  RecommendedMaterial{title='Documentação Angular', type='Artigo', link='https://angular.io/docs'},\n" +
                        "  RecommendedMaterial{title='Tutorial Components', type='Video', link='https://youtu.be/angular-components'},\n" +
                        "  RecommendedMaterial{title='Projetos Práticos', type='Exercicio', link='https://github.com/angular-projects'}\n" +
                        "]\n\n" +

                        "▬▬▬▬▬▬▬▬▬▬▬▬ CENÁRIO 2: PDF IRRELEVANTE ▬▬▬▬▬▬▬▬▬▬▬▬\n" +
                        "Dificuldade: 'React Hooks'\n" +
                        "PDF: 'Guia de Java Básico (p.1-50)'\n" +
                        "Saída:\n" +
                        "[\n" +
                        "  RecommendedMaterial{title='Documentação React Hooks', type='Artigo', link='https://pt-br.react.dev/reference/react/hooks'},\n" +
                        "  RecommendedMaterial{title='Curso Hooks Práticos', type='Video', link='https://youtube.com/react-hooks-course'},\n" +
                        "  RecommendedMaterial{title='Exercícios Interativos', type='Exercicio', link='https://exercism.org/tracks/react/hooks'},\n" +
                        "  RecommendedMaterial{title='Padrões Avançados', type='Artigo', link='https://react-patterns.com/hooks'},\n" +
                        "  RecommendedMaterial{title='Hooks em Projetos Reais', type='Artigo', link='https://github.com/react-realworld-examples'}\n" +
                        "]\n\n" +

                        "▬▬▬▬▬▬▬▬▬▬▬▬ TEXTO COMPLETO DO PDF ▬▬▬▬▬▬▬▬▬▬▬▬\n" +
                        "%s\n\n" +

                        "⚠️ **PENALIDADES SE:**\n" +
                        "- Lista tiver menos de 5 itens\n" +
                        "- Incluir recursos não relacionados\n" +
                        "- Usar formato diferente",
                difficulties,
                texto
        );
        System.out.println("RecommendationAIService: Enviando prompt para IA: " + prompt);

        // Adaptação do seu código original para enviar o prompt para a API do Gemini
        Map<String,Object> payload = Map.of(
                "contents", new Object[]{ Map.of("parts", new Object[]{ Map.of("text", prompt) }) }
        );

        // Faz a requisição POST para a API do Gemini
        Map<?,?> response = webClient.post()
                .uri(uriBuilder -> uriBuilder.queryParam("key", apiKey).build()) // Adiciona a chave na URL
                .contentType(MediaType.APPLICATION_JSON) // Define o tipo de conteúdo como JSON
                .bodyValue(payload) // Define o corpo da requisição com o prompt
                .retrieve() // Inicia a recuperação da resposta
                .bodyToMono(Map.class) // Espera que a resposta seja um Mono<Map>
                .block(); // Bloqueia esperando a resposta (ok para este caso simples, mas em apps maiores considere reatividade)

        System.out.println("RecommendationAIService: Resposta bruta da IA: " + response);

        // Processa a resposta para extrair o texto gerado pela IA
        try {
            var candidates = (List<?>) response.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                System.err.println("RecommendationAIService: Resposta da IA não contém 'candidates'. Resposta completa: " + response);
                return ""; // Retorna vazio se não houver candidatos
            }
            var firstCandidate = (Map<?,?>) candidates.get(0);
            if (firstCandidate == null) {
                System.err.println("RecommendationAIService: Primeiro candidato é nulo.");
                return "";
            }
            var content = (Map<?,?>) firstCandidate.get("content");
            if (content == null) {
                System.err.println("RecommendationAIService: Candidato não contém 'content'.");
                return "";
            }
            var parts = (List<?>) content.get("parts");
            if (parts == null || parts.isEmpty()) {
                System.err.println("RecommendationAIService: Content não contém 'parts'.");
                return "";
            }
            var firstPart = (Map<?,?>) parts.get(0);
            if (firstPart == null) {
                System.err.println("RecommendationAIService: Primeira parte é nula.");
                return "";
            }
            return firstPart.get("text").toString(); // Extrai o texto da resposta
        } catch (Exception e) {
            System.err.println("RecommendationAIService: Erro ao processar resposta da IA: " + e.getMessage());
            e.printStackTrace();
            return ""; // Retorna vazio em caso de erro
        }
    }
}
