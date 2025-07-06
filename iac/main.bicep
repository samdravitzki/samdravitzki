targetScope = 'subscription'

param location string = ''

var resourceToken = uniqueString(subscription().subscriptionId, location)

resource personalSiteRg 'Microsoft.Resources/resourceGroups@2025-04-01' = {
  name: 'rg-personal-site-${resourceToken}'
  location: location
}
