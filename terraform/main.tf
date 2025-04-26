terraform {
  required_providers {
    oci = {
      source  = "hashicorp/oci"
      version = "~> 4.0"
    }
  }
}

provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}

variable "tenancy_ocid" {}
variable "user_ocid" {}
variable "fingerprint" {}
variable "private_key_path" {}
variable "region" {}
variable "compartment_id" {}
variable "availability_domain" {}
variable "image_id" {}
variable "ssh_public_key_path" {}

resource "oci_core_virtual_network" "vcn" {
  compartment_id = var.compartment_id
  display_name   = "sensorium-vcn"
  cidr_block     = "10.0.0.0/16"
}

resource "oci_core_internet_gateway" "igw" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_virtual_network.vcn.id
  display_name   = "sensorium-igw"
  is_enabled     = true
}

resource "oci_core_route_table" "rt" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_virtual_network.vcn.id

  route_rules {
    cidr_block        = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.igw.id
  }
}

resource "oci_core_security_list" "sec" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_virtual_network.vcn.id

  ingress_security_rules {
    protocol = "6" # TCP
    source   = "0.0.0.0/0"
    tcp_options { min = 22 max = 22 }
  }
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options { min = 6443 max = 6443 }
  }
  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
  }
}

resource "oci_core_subnet" "subnet" {
  compartment_id      = var.compartment_id
  vcn_id              = oci_core_virtual_network.vcn.id
  display_name        = "sensorium-subnet"
  cidr_block          = "10.0.1.0/24"
  route_table_id      = oci_core_route_table.rt.id
  security_list_ids   = [oci_core_security_list.sec.id]
  availability_domain = var.availability_domain
}

resource "oci_core_instance" "k3s" {
  compartment_id      = var.compartment_id
  availability_domain = var.availability_domain
  shape               = "VM.Standard.A1.Flex"
  display_name        = "sensorium-k3s"

  create_vnic_details {
    subnet_id        = oci_core_subnet.subnet.id
    assign_public_ip = true
  }

  metadata = {
    ssh_authorized_keys = file(var.ssh_public_key_path)
    user_data           = base64encode(<<-EOF
#!/bin/bash
curl -sfL https://get.k3s.io | INSTALL_K3S_CHANNEL=v1.24 sh -
EOF
    )
  }

  source_details {
    source_type = "image"
    image_id    = var.image_id
  }
}
