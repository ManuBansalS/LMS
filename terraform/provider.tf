terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=4.1.0"
    }
  }

  backend "azurerm" {
     storage_account_name = "group14tfstorage"
     resource_group_name  = "group14_mini_project"
     container_name       = "group14-tfstate-storage"
     key                  = "terraform.tfstate"
  } 
}


provider "azurerm" {
  features {}
}