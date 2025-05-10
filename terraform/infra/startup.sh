#!/bin/bash
sudo apt update -y
sudo apt install -y nginx openjdk-17-jdk unzip
# Supondo que Angular esteja buildado e copiado para /var/www/html
# Supondo que o JAR esteja em /home/ubuntu/app/app.jar
nohup java -jar /home/ubuntu/app/app.jar > /home/ubuntu/app.log 2>&1 &
