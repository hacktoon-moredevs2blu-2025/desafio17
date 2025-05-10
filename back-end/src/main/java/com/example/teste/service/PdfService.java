package com.example.teste.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
@Service
public class PdfService {

    public PDDocument carregarPdfDaResources(String nomeArquivo) throws IOException {
        Resource resource = new ClassPathResource("pdfs/" + nomeArquivo);
        try (InputStream is = resource.getInputStream()) {
            return PDDocument.load(is);
        }
    }

    public String extrairTextoDoPdf(String nomeArquivo) {
        try (PDDocument doc = carregarPdfDaResources(nomeArquivo)) {
            return new PDFTextStripper().getText(doc);
        } catch (IOException e) {
            e.printStackTrace();
            return "";
        }
    }
}
