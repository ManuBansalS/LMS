
# Locals — common tags & computed values
locals {
  # Availability zone derived from the chosen region (uses the "a" AZ by default).
  availability_zone = "${var.aws_region}a"
}

# 1. VPC
resource "aws_vpc" "vpc_vm_lms" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = var.vpc_name
  }
}

# 2. Internet Gateway (equivalent to Azure's default outbound internet access)
resource "aws_internet_gateway" "igw_vm_lms" {
  vpc_id = aws_vpc.vpc_vm_lms.id

  tags = {
    Name = var.igw_name
  }
}

# 3. Public Subnet
resource "aws_subnet" "subnet_vm_lms" {
  vpc_id                  = aws_vpc.vpc_vm_lms.id
  cidr_block              = var.subnet_cidr
  availability_zone       = local.availability_zone
  map_public_ip_on_launch = true

  tags = {
    Name = var.subnet_name
  }
}

# 4. Route Table — routes all outbound traffic through the Internet Gateway
resource "aws_route_table" "rt_vm_lms" {
  vpc_id = aws_vpc.vpc_vm_lms.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw_vm_lms.id
  }

  tags = {
    Name = var.route_table_name
  }
}

# 5. Associate Route Table ↔ Public Subnet
resource "aws_route_table_association" "rta_vm_lms" {
  subnet_id      = aws_subnet.subnet_vm_lms.id
  route_table_id = aws_route_table.rt_vm_lms.id
}

# 6. Security Group (equivalent to Azure Network Security Group)
#    Opens: 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (NestJS/FastAPI API)
resource "aws_security_group" "sg_vm_lms" {
  name        = var.security_group_name
  description = "Allow SSH, HTTP, HTTPS, and application API traffic"
  vpc_id      = aws_vpc.vpc_vm_lms.id

  # Inbound
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidrs
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "NestJS / FastAPI application port"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = var.security_group_name
  }
}

# 7. AMI Data Source — latest Ubuntu 22.04 LTS (Jammy)
data "aws_ami" "ubuntu_22_04" {
  most_recent = true
  owners      = ["099720109477"] # Canonical's official AWS account

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}

# 8. EC2 Instance
resource "aws_instance" "linux_vm_lms" {
  ami                    = data.aws_ami.ubuntu_22_04.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.subnet_vm_lms.id
  vpc_security_group_ids = [aws_security_group.sg_vm_lms.id]
  key_name               = var.key_name

  root_block_device {
    volume_size           = var.volume_size
    volume_type           = var.volume_type
    delete_on_termination = true

    tags = {
      Name = "${var.vm_name}-root-disk"
    }
  }

  tags = {
    Name = var.vm_name
  }
}

# 9. Elastic IP (Permanent Public IP)
resource "aws_eip" "eip_vm_lms" {
  instance = aws_instance.linux_vm_lms.id
  domain   = "vpc"

  tags = {
    Name        = "eip-vm-lms"
    Environment = var.environment
    Project     = var.project
  }
}
