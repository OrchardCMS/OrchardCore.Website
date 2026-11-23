# Add CrestApps to the footer partners (existing sites)

New sites get CrestApps from `content.recipe.json`. This package adds it to a site that already exists, such as the live one, where the setup recipe doesn't run again.

It uploads `partners/crestapps.png` to the media library and updates the footer's **Partner promo** widget so its partner list includes CrestApps. The widget keeps its ContentItemId, layer, zone and position, and the previous version stays in its version history.

## Before you import

The recipe updates the widget by its ContentItemId, and that id is different on every site, so you need to set it once:

1. In the admin, go to **Design → Widgets**, open **Partner promo (English)** in the *Footer Top* zone, and copy the id from the address bar (`/Admin/Contents/ContentItems/<id>/Edit`).
2. In `recipe.json`, replace `REPLACE-WITH-THE-PARTNER-PROMO-WIDGET-ID` in the `partnerPromoContentItemId` variable with that id. If you skip this, the import fails with a message saying so and changes nothing in the widget.

The widget is replaced with the content in this recipe (heading, intro, button and the five partners), so if the live widget was edited after the site was set up, carry those edits over into `recipe.json` first.

## Import

1. Zip `recipe.json` and `crestapps.png` so they're at the root of the zip, not in a folder:

   ```powershell
   Compress-Archive -Path recipe.json, crestapps.png -DestinationPath add-crestapps-partner.zip
   ```

2. In the admin, open **Tools → Deployments → Package Import** (`/Admin/DeploymentPlan/Import/Index`) and upload the zip. This needs the `OrchardCore.Deployment` feature to be enabled.
3. Check the site footer: CrestApps should appear after Pirsch.
