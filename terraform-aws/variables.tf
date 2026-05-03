
# ──────────────────────────────────────────────────────────────────────────────
# Provider / Region
# ──────────────────────────────────────────────────────────────────────────────

variable "aws_region" {
  description = "AWS region to deploy resources in."
  type        = string
  default     = "us-east-1"

  validation {
    condition     = can(regex("^[a-z]{2}-[a-z]+-[0-9]$", var.aws_region))
    error_message = "Must be a valid AWS region identifier, e.g. 'us-east-1'."
  }
}

variable "aws_profile" {
  description = "Named AWS CLI profile to use for authentication. Leave empty to use environment credentials."
  type        = string
  default     = ""
}

# ──────────────────────────────────────────────────────────────────────────────
# Global Tags
# ──────────────────────────────────────────────────────────────────────────────

variable "project" {
  description = "Short project identifier used in resource names and tags."
  type        = string
  default     = "lms"
}

variable "environment" {
  description = "Deployment environment (dev | staging | prod)."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod."
  }
}

variable "owner" {
  description = "Team or person responsible for this infrastructure."
  type        = string
  default     = "group14"
}

# ──────────────────────────────────────────────────────────────────────────────
# Networking
# ──────────────────────────────────────────────────────────────────────────────

variable "vpc_name" {
  description = "Name tag applied to the VPC."
  type        = string
  default     = "vpc-vm-lms"
}

variable "vpc_cidr" {
  description = "IPv4 CIDR block for the VPC."
  type        = string
  default     = "10.1.0.0/16"

  validation {
    condition     = can(cidrnetmask(var.vpc_cidr))
    error_message = "vpc_cidr must be a valid CIDR block, e.g. '10.1.0.0/16'."
  }
}

variable "subnet_name" {
  description = "Name tag applied to the public subnet."
  type        = string
  default     = "subnet-vm-lms"
}

variable "subnet_cidr" {
  description = "IPv4 CIDR block for the public subnet (must be a subset of vpc_cidr)."
  type        = string
  default     = "10.1.1.0/24"

  validation {
    condition     = can(cidrnetmask(var.subnet_cidr))
    error_message = "subnet_cidr must be a valid CIDR block, e.g. '10.1.1.0/24'."
  }
}

variable "igw_name" {
  description = "Name tag applied to the Internet Gateway."
  type        = string
  default     = "igw-vm-lms"
}

variable "route_table_name" {
  description = "Name tag applied to the public route table."
  type        = string
  default     = "rt-vm-lms"
}

# ──────────────────────────────────────────────────────────────────────────────
# Security Group
# ──────────────────────────────────────────────────────────────────────────────

variable "security_group_name" {
  description = "Name applied to the EC2 security group."
  type        = string
  default     = "sg-vm-lms"
}

variable "allowed_ssh_cidrs" {
  description = "List of CIDR blocks permitted to reach port 22 (SSH). Restrict this in production."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# ──────────────────────────────────────────────────────────────────────────────
# EC2 Instance
# ──────────────────────────────────────────────────────────────────────────────

variable "vm_name" {
  description = "Name tag applied to the EC2 instance."
  type        = string
  default     = "linux-vm-lms"
}

variable "instance_type" {
  description = "EC2 instance type (e.g. t2.micro, t3.small)."
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "Name of the pre-existing AWS EC2 Key Pair used for SSH access."
  type        = string
  sensitive   = true
}

variable "admin_username" {
  description = "Default SSH login username. For Ubuntu AMIs this is always 'ubuntu'."
  type        = string
  default     = "ubuntu"
}

variable "volume_size" {
  description = "Size (in GiB) of the root EBS volume attached to the EC2 instance."
  type        = number
  default     = 20

  validation {
    condition     = var.volume_size >= 8 && var.volume_size <= 1000
    error_message = "volume_size must be between 8 and 1000 GiB."
  }
}

variable "volume_type" {
  description = "EBS volume type (gp3 recommended for best price/performance)."
  type        = string
  default     = "gp3"

  validation {
    condition     = contains(["gp2", "gp3", "io1", "io2", "sc1", "st1"], var.volume_type)
    error_message = "volume_type must be a valid EBS type: gp2, gp3, io1, io2, sc1, or st1."
  }
}
