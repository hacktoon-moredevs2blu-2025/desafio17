package com.example.teste.service;

import com.example.teste.model.RecommendedMaterial;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class RecommendationService {

    private final RecommendationAIService recommendationAIService;

    @Autowired
    public RecommendationService(RecommendationAIService recommendationAIService) {
        this.recommendationAIService = recommendationAIService;
    }


     //Gera recomendações de materiais complementares com base nas dificuldades do aluno.
    public List<RecommendedMaterial> generateRecommendations(Long studentId, String difficulties, double grade) {
        // Se a nota for >= 7.5, não precisa de recomendações
        if (grade >= 7.5) {
            return new ArrayList<>();
        }

        // PASSO 1: Obter resposta bruta da IA
        String aiResponse = recommendationAIService.getSuggestedTopicsFromAI(difficulties);

        // PASSO 2: Processar a resposta para extrair materiais
        List<RecommendedMaterial> recommendedMaterials = extractMaterialsFromAIResponse(aiResponse);

        return recommendedMaterials;
    }


    //Extrai materiais recomendados da resposta da IA
    private List<RecommendedMaterial> extractMaterialsFromAIResponse(String aiResponse) {
        // Caso 1: Resposta vazia
        if (aiResponse == null || aiResponse.isEmpty()) {
            return new ArrayList<>();
        }

        // Caso 2: Resposta em formato de API Gemini (conteúdo bruto)
        if (aiResponse.contains("candidates") || aiResponse.contains("text=")) {
            // Extrai apenas o texto relevante da resposta
            Pattern textPattern = Pattern.compile("text=([^}]+)}");
            Matcher textMatcher = textPattern.matcher(aiResponse);

            if (textMatcher.find()) {
                // Remove a parte "text=" e atualiza aiResponse
                aiResponse = textMatcher.group(1).trim();
            }
        }

        // Caso 3: Resposta contém materiais recomendados no formato esperado
        if (aiResponse.contains("RecommendedMaterial")) {
            return extractRecommendedMaterialsFromString(aiResponse);
        }

        // Caso 4: Resposta contém apenas lista de tópicos
        List<RecommendedMaterial> materials = new ArrayList<>();

        // Determina se os tópicos estão separados por vírgulas ou quebras de linha
        String[] topics;
        if (aiResponse.contains(",")) {
            topics = aiResponse.split(",");
        } else {
            topics = aiResponse.split("\n");
        }

        // Para cada tópico, cria um material recomendado
        for (String topic : topics) {
            String topicTrim = topic.trim();
            if (!topicTrim.isEmpty()) {
                String normalizedTopic = topicTrim.toLowerCase()
                        .replace(" ", "-")
                        .replace(".", "")
                        .replace(",", "")
                        .replace("ç", "c")
                        .replace("á", "a")
                        .replace("é", "e")
                        .replace("í", "i")
                        .replace("ó", "o")
                        .replace("ú", "u")
                        .replace("ã", "a")
                        .replace("õ", "o");

                materials.add(new RecommendedMaterial(
                        topicTrim,
                        determineContentType(topicTrim),
                        "/materials/" + normalizedTopic
                ));
            }
        }

        return materials;
    }

    /**
     * Determina o tipo de conteúdo mais adequado com base no tópico.
     */
    private String determineContentType(String topic) {
        String lowerTopic = topic.toLowerCase();

        if (lowerTopic.contains("exercício") || lowerTopic.contains("exercicio") ||
                lowerTopic.contains("prática") || lowerTopic.contains("pratica")) {
            return "exercise";
        } else if (lowerTopic.contains("vídeo") || lowerTopic.contains("video") ||
                lowerTopic.contains("aula")) {
            return "video";
        } else if (lowerTopic.contains("quiz") || lowerTopic.contains("teste")) {
            return "quiz";
        } else {
            return "article";
        }
    }

    /**
     * Extrai objetos RecommendedMaterial de uma string formatada.
     *
     * @param input A string contendo descrições de materiais recomendados.
     * @return Lista de objetos RecommendedMaterial.
     */
    private List<RecommendedMaterial> extractRecommendedMaterialsFromString(String input) {
        List<RecommendedMaterial> materials = new ArrayList<>();

        // Remove colchetes iniciais e finais, se existirem
        String cleanInput = input.trim();
        if (cleanInput.startsWith("[")) {
            cleanInput = cleanInput.substring(1);
        }
        if (cleanInput.endsWith("]")) {
            cleanInput = cleanInput.substring(0, cleanInput.length() - 1);
        }

        // Padrão para extrair objetos RecommendedMaterial completos
        Pattern pattern = Pattern.compile("RecommendedMaterial\\{([^}]+)\\}");
        Matcher matcher = pattern.matcher(cleanInput);

        while (matcher.find()) {
            String content = matcher.group(1);
            String title = null;
            String type = null;
            String link = null;

            // Extrai os valores de title, type e link
            Pattern propPattern = Pattern.compile("(title|type|link)='([^']+)'");
            Matcher propMatcher = propPattern.matcher(content);

            while (propMatcher.find()) {
                String key = propMatcher.group(1);
                String value = propMatcher.group(2);

                if ("title".equals(key)) {
                    title = value;
                } else if ("type".equals(key)) {
                    type = value.toLowerCase();  // Normaliza para lowercase
                } else if ("link".equals(key)) {
                    link = value;
                }
            }

            // Cria um novo RecommendedMaterial se todos os campos forem encontrados
            if (title != null) {
                // Se type ou link estiverem faltando, use valores padrão
                if (type == null) {
                    type = determineContentType(title);
                }

                if (link == null) {
                    String normalizedTitle = title.toLowerCase()
                            .replace(" ", "-")
                            .replace(".", "")
                            .replace(",", "")
                            .replace("ç", "c")
                            .replace("á", "a")
                            .replace("é", "e")
                            .replace("í", "i")
                            .replace("ó", "o")
                            .replace("ú", "u")
                            .replace("ã", "a")
                            .replace("õ", "o");

                    link = "/materials/" + normalizedTitle;
                }

                // Normalizar os tipos
                switch (type.toLowerCase()) {
                    case "artigo":
                    case "texto":
                        type = "article";
                        break;
                    case "vídeo":
                    case "video":
                    case "aula":
                        type = "video";
                        break;
                    case "exercicio":
                    case "exercícios":
                    case "exercicios":
                    case "exercício":
                        type = "exercise";
                        break;
                    case "quiz":
                    case "teste":
                    case "avaliação":
                    case "avaliacao":
                        type = "quiz";
                        break;
                }

                materials.add(new RecommendedMaterial(title, type, link));
            }
        }

        return materials;
    }
}