import pulumi
from pulumi_azure_native import storage
from pulumi_azure_native import resources

# Create an Azure Resource Group
resource_group = resources.ResourceGroup("resource_group")

main_virtual_network = azure.network.VirtualNetwork("mainVirtualNetwork",
    address_spaces=["10.0.0.0/16"],
    resource_group_name=resource_group.name)
    
internal = azure.network.Subnet("internal",
    resource_group_name=resource_group.name,
    virtual_network_name=main_virtual_network.name,
    address_prefixes=["10.0.2.0/24"])
