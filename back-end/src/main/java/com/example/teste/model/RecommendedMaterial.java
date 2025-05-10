package com.example.teste.model;


public class RecommendedMaterial {
    private String title;  // Título do material
    private String type;   // Tipo do material (vídeo, artigo, exercício, etc.)
    private String link;   // Link para o material


    public RecommendedMaterial(String title, String type, String link) {
        this.title = title;
        this.type = type;
        this.link = link;
    }

    // Getters e Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    @Override
    public String toString() {
        return "RecommendedMaterial{" +
                "title='" + title + '\'' +
                ", type='" + type + '\'' +
                ", link='" + link + '\'' +
                '}';
    }
}