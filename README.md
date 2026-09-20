# Orchard Core Website

This is the repository of <https://orchardcore.net/>. You can work with it locally and deploy it to Azure.

## Running the app locally

You can just launch the web app (like with <kbd>Ctrl</kbd>+<kbd>F5</kbd> in Visual Studio) and it will just work. It utilizes [Auto Setup](https://docs.orchardcore.net/en/latest/reference/modules/AutoSetup/) to initialize the site with content used for local development.

You can log in with `admin` and `Password1!`.

To reinitialize the site, just delete the `OrchardCore.Web/App_Data` folder, or use the `Reset-Local.ps1` from the root.

## Deploying to Azure

The `deploy` GitHub Actions workflow deploys the app automatically. Any commit to `main` will trigger it, but you can trigger it manually too for any branch.

If you ever need to deactive the app temporarily, you can do that by opening the Advanced Tools from the Azure Portal, then copying the `site/wwwroot/AppOffline/app_offline.htm` file to `site/wwwroot`. This will show a maintenance page, keeping something visible while still stopping the app from running. To reactivate it, just delete the `app_offline.htm` file.

## Getting access to Azure resources

The website runs under an Azure subscription sponsored by .NET Foundation. To work with the website's code and deploy it, you don't need to access the Azure resources. Should you need to for some reason, do the following.

Create an issue to ask for access, elaborating why you need it. Once you get it, the first time you'll need to start by using [this direct link](https://portal.azure.com/#@dotnetfoundation.org/resource/subscriptions/997e7c30-fd83-4b3d-bcf5-492e194f9b98/resourceGroups/orchardsites/overview) to access our resource group. You'll be prompted to register to the .NET Foundation Entra ID tenant. After that, you'll be able to access the resource group directly from the Azure portal too, by switching directories.

Monitoring alerts are sent to contact@orchardcore.net. These include availability tests notifying us if the site is down.

## Getting access to the live site's admin

Do you want to manage the site's content right there online? Create an issue to ask for access, elaborating why you need it.

## Receiving messages sent to contact@orchardcore.net

The central e-mail address contact@orchardcore.net is managed using [Cloudflare Email Service](https://developers.cloudflare.com/email-service/)’s [Email Routing feature](https://developers.cloudflare.com/email-service/get-started/route-emails/), under the Orchard Core account. If you want to add a new e-mail address receiving messages sent to it, then do the following:

1. Add the recipient as a [destination address](https://dash.cloudflare.com/3ebd7f17873dbce2300d6d425677602f/email-service/routing/71191c564ace082f8c0238e635a4f6b8/destination-addresses).
2. Wait for the recipient to verify the address.
3. The actual forwarding is done by our [Destination Worker]https://dash.cloudflare.com/3ebd7f17873dbce2300d6d425677602f/email-service/routing/71191c564ace082f8c0238e635a4f6b8/destination-workers). [Edit its code](https://dash.cloudflare.com/3ebd7f17873dbce2300d6d425677602f/workers/services/edit/forward-to-maintainers/production) to add the recipient among the others.
