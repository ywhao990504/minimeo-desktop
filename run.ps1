# launch both backend and frontend in separate PowerShell windows
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$back = Join-Path $root 'run-back.ps1'
$front = Join-Path $root 'run-front.ps1'

if (!(Test-Path $back)) { Write-Error "Missing $back"; exit 1 }
if (!(Test-Path $front)) { Write-Error "Missing $front"; exit 1 }

Start-Process powershell -ArgumentList '-NoExit',"-ExecutionPolicy Bypass","-File `"$back`""
Start-Process powershell -ArgumentList '-NoExit',"-ExecutionPolicy Bypass","-File `"$front`""
