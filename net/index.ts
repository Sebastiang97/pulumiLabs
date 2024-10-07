import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage";
import azure from "@pulumi/azure"

// Create an Azure Resource Group
const resourceGroup = new resources.ResourceGroup("resourceGroup");

// Create an Azure resource (Storage Account)
const storageAccount = new storage.StorageAccount("sa", {
    resourceGroupName: resourceGroup.name,
    sku: {
        name: storage.SkuName.Standard_LRS,
    },
    kind: storage.Kind.StorageV2,
});

// Export the primary key of the Storage Account
const storageAccountKeys = storage.listStorageAccountKeysOutput({
    resourceGroupName: resourceGroup.name,
    accountName: storageAccount.name
});

const virtualNetwork = new azure.network.VirtualNetwork("my-virtual-network", {
    addressSpaces: ["10.0.0.0/16"],
    resourceGroupName: resourceGroup.name,
});

// Crea una subred dentro de la red virtual
const subnet = new azure.network.Subnet("my-subnet", {
    addressPrefix: "10.0.1.0/24",
    virtualNetworkName: virtualNetwork.name,
    resourceGroupName: resourceGroup.name,
});

export const primaryStorageKey = storageAccountKeys.keys[0].value;
