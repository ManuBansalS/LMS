# ──────────────────────────────────────────────────────────────────────────────
# EC2 Instance Outputs
# ──────────────────────────────────────────────────────────────────────────────

output "vm_public_ip" {
  description = "Public IP of the EC2 instance. Use this as VM_HOST in your GitHub Actions secrets."
  value       = aws_instance.linux_vm_lms.public_ip
}

output "vm_private_ip" {
  description = "Private IP of the EC2 instance within the VPC."
  value       = aws_instance.linux_vm_lms.private_ip
}

output "vm_id" {
  description = "Unique AWS instance ID of the EC2 instance."
  value       = aws_instance.linux_vm_lms.id
}

output "vm_availability_zone" {
  description = "Availability Zone where the EC2 instance is deployed."
  value       = aws_instance.linux_vm_lms.availability_zone
}

output "ssh_connection_string" {
  description = "Ready-to-use SSH command to connect to the instance."
  value       = "ssh -i <your-key.pem> ${var.admin_username}@${aws_instance.linux_vm_lms.public_ip}"
}

# ──────────────────────────────────────────────────────────────────────────────
# Networking Outputs
# ──────────────────────────────────────────────────────────────────────────────

output "vpc_id" {
  description = "ID of the created VPC."
  value       = aws_vpc.vpc_vm_lms.id
}

output "subnet_id" {
  description = "ID of the public subnet."
  value       = aws_subnet.subnet_vm_lms.id
}

output "security_group_id" {
  description = "ID of the EC2 security group."
  value       = aws_security_group.sg_vm_lms.id
}

output "internet_gateway_id" {
  description = "ID of the Internet Gateway attached to the VPC."
  value       = aws_internet_gateway.igw_vm_lms.id
}

# ──────────────────────────────────────────────────────────────────────────────
# AMI Output
# ──────────────────────────────────────────────────────────────────────────────

output "ami_id" {
  description = "Ubuntu 22.04 LTS AMI ID that was resolved and used."
  value       = data.aws_ami.ubuntu_22_04.id
}
