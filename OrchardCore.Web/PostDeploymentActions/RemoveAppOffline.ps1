Remove-Item -Path '../../../wwwroot/app_offline.htm'

# Removing this script so the next deployment of the app_offline.htm won't get deleted.
Remove-Item -Path $MyInvocation.MyCommand.Path -Force
