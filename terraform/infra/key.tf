resource "tls_private_key" "lb_ssh_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}
