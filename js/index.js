"use strict";
const pulumi = require("@pulumi/pulumi");
const azure = require("@pulumi/azure");

const resourceGroup = new azure.core.ResourceGroup("my-rg", {
    location: "eastus",
});

const virtualNetwork = new azure.network.VirtualNetwork("my-vnet", {
    resourceGroupName: resourceGroup.name,
    addressSpaces: ["10.0.0.0/16"],
});

const subnet = new azure.network.Subnet("my-subnet", {
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: virtualNetwork.name,
    addressPrefixes: ["10.0.1.0/24"],
});

exports.vnetName = virtualNetwork.name;
exports.subnetName = subnet.name;
exports.subnetAddressPrefix = subnet.addressPrefix;