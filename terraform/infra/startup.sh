#!/bin/bash
sudo apt update -y
sudo apt install -y nginx openjdk-17-jdk unzip

# Rodar o backend, se existir
nohup java -jar /home/ubuntu/app/app.jar > /home/ubuntu/app.log 2>&1 &

# Configurar sudo sem senha
echo 'ubuntu ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/90-cloud-init-users
chmod 440 /etc/sudoers.d/90-cloud-init-users
