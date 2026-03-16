
variable "location" {
  description = "Azure region"
  default     = "westus"
}
 
variable "resource_group_name" {
  description = "Name of the resource group"
  default     = "rg-vm-lms"
}
 
variable "vnet_name" {
  description = "Virtual Network name"
  default     = "vnet-vm-lms"
}
 
variable "subnet_name" {
  description = "Subnet name"
  default     = "subnet-vm-lms"
}
 
variable "public_ip_name" {
  description = "Public IP name"
  default     = "pip-vm-lms"
}
 
variable "nic_name" {
  description = "Network Interface name"
  default     = "nic-vm-lms"
}
 
variable "vm_name" {
  description = "Linux VM name"
  default     = "linux-vm-lms"
}
 
variable "vm_size" {
  description = "Size of the VM"
  default     = "Standard_F2"
}
 
variable "admin_username" {
  description = "Admin username for VM"
}
 
variable "admin_password" {
  description = "Admin password for VM"
  type        = string
  sensitive   = true
}
 
variable "automanage_name" {
  description = "Automanage configuration name"
  default     = "automanage-vm-lms"
}
 