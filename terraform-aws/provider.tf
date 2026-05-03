terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state stored in S3 (equivalent to Azure Blob Storage backend).
  # Create the S3 bucket and DynamoDB table before running `terraform init`.
  backend "s3" {
    bucket         = "group14-tfstate-storage-aws"  # Must be globally unique
    key            = "lms/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    use_lockfile   = true
  }
}

provider "aws" {
  region  = var.aws_region

  # Uses a named CLI profile when set; falls back to env-var / instance-role auth when empty.
  profile = var.aws_profile != "" ? var.aws_profile : null

  default_tags {
    tags = {
      Project     = var.project
      Environment = var.environment
      Owner       = var.owner
      ManagedBy   = "Terraform"
    }
  }
}
