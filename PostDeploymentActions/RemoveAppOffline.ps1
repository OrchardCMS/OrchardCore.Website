$wwwrootPath = Join-Path $env:HOME 'wwwroot'
$appOfflinePath = Join-Path $wwwrootPath 'app_offline.htm'
$markerFilePath = Join-Path $wwwrootPath 'app_offline-was-last-deployment.txt'

Write-Output "The path of the wwwroot folder: $wwwrootPath."

Get-ChildItem -Path $wwwrootPath -Recurse | ForEach-Object { Write-Output $_.FullName }

if (Test-Path -Path $markerFilePath)
{
    Write-Output 'Marker file found; this is the second deployment. Deleting marker and app_offline.htm.'

    Remove-Item -Path $markerFilePath
    Remove-Item -Path $appOfflinePath
}
elseif (Test-Path -Path $appOfflinePath)
{
    Write-Output 'An app_offline.htm file found; this is the first deployment. Creating marker file.'

    New-Item -Path $markerFilePath -ItemType File -Force
}
else
{
    Write-Output 'No app_offline.htm or marker file found; this is unexpected.'
}
