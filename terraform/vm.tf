
resource "azurerm_resource_group" "rg_vm_lms" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_virtual_network" "vnet_vm_lms" {
  name                = var.vnet_name
  address_space       = ["10.1.0.0/16"]
  location            = azurerm_resource_group.rg_vm_lms.location
  resource_group_name = azurerm_resource_group.rg_vm_lms.name
}

resource "azurerm_subnet" "subnet_vm_lms" {
  name                 = var.subnet_name
  resource_group_name  = azurerm_resource_group.rg_vm_lms.name
  virtual_network_name = azurerm_virtual_network.vnet_vm_lms.name
  address_prefixes     = ["10.1.1.0/24"]
}

resource "azurerm_public_ip" "pip_vm_lms" {
  name                = var.public_ip_name
  location            = azurerm_resource_group.rg_vm_lms.location
  resource_group_name = azurerm_resource_group.rg_vm_lms.name
  allocation_method   = "Static"
  sku = "Standard"
}
 

resource "azurerm_network_interface" "nic_vm_lms" {
  name                = var.nic_name
  location            = azurerm_resource_group.rg_vm_lms.location
  resource_group_name = azurerm_resource_group.rg_vm_lms.name
 
  ip_configuration {
    name                          = "ipconfig-vm-project"
    subnet_id                     = azurerm_subnet.subnet_vm_lms.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.pip_vm_lms.id
  }
}

resource "azurerm_linux_virtual_machine" "linux_vm_lms" {
  name                = var.vm_name
  resource_group_name = azurerm_resource_group.rg_vm_lms.name
  location            = azurerm_resource_group.rg_vm_lms.location
  size                = var.vm_size
  admin_username      = var.admin_username
  admin_password      = var.admin_password
  disable_password_authentication = false
  network_interface_ids = [
    azurerm_network_interface.nic_vm_lms.id,
  ]
 
  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }
 
  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }
}

 
