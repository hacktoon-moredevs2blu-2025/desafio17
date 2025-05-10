##############################################
# REDE: VPC, SUBNET, GATEWAY, ROUTE TABLE
##############################################

# Busca pela imagem mais recente do Ubuntu 22.04 LTS
data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

# VPC principal
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

# Subnet pública
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-west-1c"
  map_public_ip_on_launch = true
}

# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
}

# Route Table com rota para a Internet
resource "aws_route_table" "rt" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

# Associação da Route Table à Subnet pública
resource "aws_route_table_association" "rta" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.rt.id
}

##############################################
# SEGURANÇA: SECURITY GROUP
##############################################

# Permite acesso HTTP
resource "aws_security_group" "allow_ssh_http" {
  name        = "allow_http"
  description = "Permite trafego HTTP (porta 80)"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
  from_port   = 8080
  to_port     = 8080
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
}
}

##############################################
# INSTÂNCIA EC2 + Elastic IP
##############################################

resource "aws_instance" "app_server" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = "t2.micro"
  associate_public_ip_address = true
  subnet_id                   = aws_subnet.public_subnet.id
  vpc_security_group_ids      = [aws_security_group.allow_ssh_http.id]
  key_name                    = aws_key_pair.lb_ssh_green_team_key_pair.key_name

  user_data = file("startup.sh")

  tags = {
    Name = "GreenTeaApp"
  }
}

# Criacao da chave SSH que sera usada para conexao na instancia
resource "tls_private_key" "lb_ssh_key" {
  algorithm = "RSA"
  rsa_bits  = 2048
}
resource "aws_key_pair" "lb_ssh_green_team_key_pair" {
  key_name   = "green_team_key_pair"
  public_key = tls_private_key.lb_ssh_key.public_key_openssh
}

resource "local_file" "ssh_key_file" {
  content         = tls_private_key.lb_ssh_key.private_key_pem
  filename        = "./green_team_key_pair.pem"
  file_permission = "0600"
}


# Elastic IP fixo para a EC2
resource "aws_eip" "app_eip" {
  instance = aws_instance.app_server.id
  vpc      = true
}

##############################################
# DNS: ROUTE 53 (REGISTRO A)
##############################################

resource "aws_route53_zone" "subzone" {
  name = "greenteam.devopssc.com.br"
}

data "aws_route53_zone" "parent" {
  name         = "devopssc.com.br."
  private_zone = false
}

resource "aws_route53_record" "delegate_subdomain" {
  zone_id = data.aws_route53_zone.parent.zone_id
  name    = "greenteam.devopssc.com.br"
  type    = "NS"
  ttl     = 300
  records = aws_route53_zone.subzone.name_servers
}

resource "aws_route53_record" "greenteam_a" {
  zone_id = aws_route53_zone.subzone.zone_id
  name    = "greenteam.devopssc.com.br"
  type    = "A"
  ttl     = 300
  records = [aws_eip.app_eip.public_ip]
}
