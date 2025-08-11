# start frontend (Next.js dev)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$web = Join-Path $root 'v0'

if (!(Test-Path $web)) {
  Write-Error "Folder not found: $web"
  exit 1
}

Push-Location $web
try {
  if (Test-Path 'package-lock.json') {
    npm ci
  } else {
    npm install
  }
  npm run dev
} finally {
  Pop-Location
}
