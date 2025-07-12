var location string = resourceGroup().location
var resourceToken string = uniqueString(resourceGroup().id, location)

// Should switch to https://github.com/Azure/bicep-registry-modules/tree/main/avm/res/web/static-site
resource site 'Microsoft.Web/staticSites@2024-11-01' = {
  location: location
  name: 'swa-personal-site-${resourceToken}'
  kind: 'app,linux'
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    enterpriseGradeCdnStatus: 'disabled'
  }
}

output personalSiteResourceName string = site.name
output personalSiteUri string = 'https://${site.properties.defaultHostname}'
