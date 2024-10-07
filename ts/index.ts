import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure";
import * as azure_native from "@pulumi/azure-native";

// Crea un nuevo grupo de recursos
const resourceGroup = new azure.core.ResourceGroup("vmResourceGroup", {
    location: "eastus",
});

const virtualNetwork = new azure.network.VirtualNetwork("vnetVM", {
    resourceGroupName: resourceGroup.name,
    addressSpaces: ["10.0.0.0/16"],
});

const subnet = new azure.network.Subnet("subnetVM", {
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: virtualNetwork.name,
    addressPrefixes: ["10.0.1.0/24"],
});

const script = `#!/bin/bash
echo "Hola, mundo!" > index.html`;

const script2 = `
#!/bin/bash
# Use this for your user data (script from top to bottom)
# install httpd (Linux 2 version)
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd
echo "<h1>Hello World from $(hostname -f)</h1>> /var/www/html/index.html
`


const nsg = new azure.network.NetworkSecurityGroup("nsgVM", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
});

// Abre el puerto 80 para tráfico entrante
const allowHTTPInbound = new azure.network.NetworkSecurityRule("allow-http-inboundVM", {
    resourceGroupName: resourceGroup.name,
    networkSecurityGroupName: nsg.name,
    priority: 100,
    direction: "Inbound",
    access: "Allow",
    protocol: "Tcp",
    sourceAddressPrefix: "*",
    sourcePortRange: "*",
    destinationAddressPrefix: "*",
    destinationPortRange: "80",
});

// Cierra todos los puertos para tráfico saliente
const denyAllOutbound = new azure.network.NetworkSecurityRule("deny-all-outboundVM", {
    resourceGroupName: resourceGroup.name,
    networkSecurityGroupName: nsg.name,
    priority: 200,
    direction: "Outbound",
    access: "Deny",
    protocol: "*",
    sourceAddressPrefix: "*",
    sourcePortRange: "*",
    destinationAddressPrefix: "*",
    destinationPortRange: "*",
});

const publicIp = new azure_native.network.PublicIPAddress('public-ipVM', {
    resourceGroupName: resourceGroup.name,
    publicIPAllocationMethod: 'Dynamic'
});

const nic = new azure_native.network.NetworkInterface("nicVm", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    ipConfigurations: [{
        name: "ipconfig",
        subnet: { id: subnet.id },
        privateIPAllocationMethod: "Dynamic",
        publicIPAddress: { id: publicIp.id }
    }],
});

const nsgAssociation = new azure.network.NetworkInterfaceSecurityGroupAssociation("nsg-associationVM", {
    networkInterfaceId: nic.id,
    networkSecurityGroupId: nsg.id,
});

// Crea una nueva Virtual Machine
const vm = new azure.compute.VirtualMachine("vm", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    vmSize: "Standard_B1ls",
    storageImageReference: {
        publisher: "Canonical",
        offer: "UbuntuServer",
        sku: "18.04-LTS",
        version: "latest"
    },
    networkProfile: {
        networkInterfaces: [{
            id: nic.id,
        }],
    },
    storageOsDisk: {
        name: "vm",
        createOption: "FromImage",
    },
    osProfile: {
        computerName: "hostname",
        adminUsername: "adminuser",
        adminPassword: "password123",
        customData: Buffer.from(script).toString('base64')
    },
    networkInterfaceIds: [nic.id],
});



exports.virtualMachineName = vm.name;
