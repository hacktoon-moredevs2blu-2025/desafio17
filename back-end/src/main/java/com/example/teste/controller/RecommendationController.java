package com.example.teste.controller; // Mude o pacote se necessário

 // Importa o serviço principal
import com.example.teste.model.RecommendedMaterial;
import com.example.teste.model.TeacherInput;
import com.example.teste.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity; // Para retornar respostas HTTP
import org.springframework.web.bind.annotation.*; // Anotações web

import java.util.List;

@RestController // Indica que esta classe é um controlador REST
@RequestMapping("/api/recommendations") // Define o caminho base para os endpoints aqui
public class RecommendationController {

    private final RecommendationService recommendationService;

    // O Spring cuida de "conectar" (injetar) o RecommendationService aqui
    @Autowired // Anotação para injeção de dependência
    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    /**
     * Endpoint para receber as dificuldades do professor e gerar recomendações.
     * Responde a requisições POST para /api/recommendations/generate.
     * Recebe um objeto TeacherInput no corpo da requisição (como JSON).
     * @param teacherInput Os dados de entrada do professor (ID do aluno e dificuldades).
     * @return Uma resposta HTTP contendo uma lista de RecommendedMaterial sugeridos.
     */
    @PostMapping("/generate") // Mapeia requisições POST para este caminho
    public ResponseEntity<List<RecommendedMaterial>> generateRecommendations(@RequestBody TeacherInput teacherInput) {
        // Log para ver os dados recebidos
        System.out.println("RecommendationController: Recebida solicitação para aluno ID: " + teacherInput.getStudentId() +
                " com dificuldades: " + teacherInput.getDifficulties());

        // Chama o serviço para processar e obter as recomendações
        List<RecommendedMaterial> recommendations = recommendationService.generateRecommendations(
                teacherInput.getStudentId(),
                teacherInput.getDifficulties(),
                teacherInput.getGrade()

        );

        // Retorna a lista de materiais sugeridos com status HTTP 200 OK
        return ResponseEntity.ok(recommendations);
    }
}
