var location string = resourceGroup().location
var resourceToken string = uniqueString(resourceGroup().id, location)

resource staticSite 'Microsoft.Web/staticSites@2024-11-01' = {
  location: location
  name: 'swa-personal-site-${resourceToken}'
}

