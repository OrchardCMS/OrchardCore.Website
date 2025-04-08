# orchardproject.net files

The `web.config` file in this folder is just to redirect all requests from the old orchardproject.net site to orchardcore.net. This is only necessary until we can manage the domain in Cloudflare and set up a simple redirect rule there. See https://github.com/OrchardCMS/OrchardCore/issues/17679 for further details.

The file can be deployed to the [Azure Web App](https://portal.azure.com/#@dotnetfoundation.org/resource/subscriptions/997e7c30-fd83-4b3d-bcf5-492e194f9b98/resourceGroups/orchardsites/providers/Microsoft.Web/sites/orcharddotnet/appServices) via FTP or Kudu, but it's not really meant to ever change.