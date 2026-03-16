output "vm_public_ip" {
  value = azurerm_public_ip.pip_vm_lms.ip_address
}

output "vm_private_ip" {
  value = azurerm_network_interface.nic_vm_lms.private_ip_address
}

output "vm_id" {
  value = azurerm_linux_virtual_machine.linux_vm_lms.id
}