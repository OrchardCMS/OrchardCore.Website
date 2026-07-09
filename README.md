# Orchard Core Website

This is the repository of <https://orchardcore.net/>. You can work with it locally and deploy it to Azure.

## Running the app locally

You can just launch the web app (like with <kbd>Ctrl</kbd>+<kbd>F5</kbd> in Visual Studio) and it will just work. It utilizes [Auto Setup](https://docs.orchardcore.net/en/latest/reference/modules/AutoSetup/) to initialize the site with content used for local development.

You can log in with `admin` and `Passsword1!`.

To reinitialize the site, just delete the `OrchardCore.Web/App_Data` folder, or use the `Reset-Local.ps1` from the root.

## Deploying to Azure

The `deploy` GitHub Actions workflow deploys the app automatically. Any commit to `main` will trigger it, but you can trigger it manually too for any branch.

## Getting access to Azure resources

The website runs under an Azure subscription sponsored by .NET Foundation. To work with the website's code and deploy it, you don't need to access the Azure resources. Should you need to for some reason, do the following.

Create an issue to ask for access, elaborating why you need it. Once you get it, the first time you'll need to start by using [this direct link](https://portal.azure.com/#@dotnetfoundation.org/resource/subscriptions/997e7c30-fd83-4b3d-bcf5-492e194f9b98/resourceGroups/orchardsites/overview) to access our resource group. You'll be prompted to register to the .NET Foundation Entra ID tenant. After that, you'll be able to access the resource group directly from the Azure portal too, by switching directories.

Monitoring alerts are sent to contact@orchardcore.net. These include availability tests notifying us if the site is down.

## Getting access to the live site's admin

Do you want to manage the site's content right there online? Create an issue to ask for access, elaborating why you need it.
