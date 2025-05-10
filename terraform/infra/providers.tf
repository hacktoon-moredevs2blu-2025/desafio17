provider "aws" {
  region = "us-east-1"
}

terraform {
  backend "s3" {
    bucket = "green-team-terraform-state"
    key    = "terraform.tfstate"
    region = "us-west-1"
  }
}