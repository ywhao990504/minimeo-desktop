# start backend (Flask) using project venv
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$venvPy = Join-Path $root '.venv\Scripts\python.exe'
$server = Join-Path $root 'server.py'

if (!(Test-Path $venvPy)) {
  Write-Error "Project venv not found: $venvPy`nCreate it first: python -m venv .venv (or via pyenv)"
  exit 1
}

Push-Location $root
try {
  & $venvPy -m pip install -r "$root\requirements.txt" | Out-Null
  & $venvPy $server
} finally {
  Pop-Location
}
