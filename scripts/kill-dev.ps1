Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Output "Todos os processos Node encerrados."
