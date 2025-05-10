provider "aws" {
  region = "us-west-1"
}

terraform {
  backend "s3" {
    bucket = "green-team-terraform-state"
    key    = "terraform.tfstate"
    region = "us-west-1"
  }
}