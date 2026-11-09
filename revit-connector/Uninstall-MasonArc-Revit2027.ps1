$ErrorActionPreference='Stop'
if (Get-Process -Name Revit -ErrorAction SilentlyContinue) { throw "Close Revit before uninstalling." }
$manifest=Join-Path $env:APPDATA "Autodesk\Revit\Addins\2027\MasonArc2027.addin"
$appDir=Join-Path $env:LOCALAPPDATA 'MasonAndArc\Revit2027'
if(Test-Path -LiteralPath $manifest){Remove-Item -LiteralPath $manifest -Force}
if(Test-Path -LiteralPath $appDir){Remove-Item -LiteralPath $appDir -Recurse -Force}
Write-Host "Mason & Arc Revit 2027 Connector uninstalled. Stored pairing token remains in Roaming AppData and must be revoked from OS if no longer needed."
