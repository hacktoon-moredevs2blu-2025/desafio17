package com.example.teste.model; // Mude o pacote se necessário


public class TeacherInput {

    private Long studentId; // Um identificador para o aluno

    public TeacherInput(Long studentId,double grade, String difficulties) {
        this.studentId = studentId;
        this.difficulties = difficulties;
        this.grade = grade;
    }

    public double getGrade() {
        return grade;
    }

    public void setGrade(double grade) {
        this.grade = grade;
    }

    public String getDifficulties() {
        return difficulties;
    }

    public void setDifficulties(String difficulties) {
        this.difficulties = difficulties;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    private String difficulties;

    private double grade;

    @Override
    public String toString() {
        return "TeacherInput{" +
                "studentId=" + studentId +
                ", difficulties='" + difficulties + '\'' +
                '}';
    }
}
