# Create inventory directory if it doesn't exist
$inventoryPath = "ansible.jenkins\inventory"
if (-not (Test-Path $inventoryPath)) {
    New-Item -ItemType Directory -Path $inventoryPath -Force
}

# Copy .pem file to inventory directory
$pemSource = "TODO.pem"
$pemDest = "$inventoryPath\TODO.pem"
Copy-Item -Path $pemSource -Destination $pemDest -Force

# Set file permissions (Windows equivalent of chmod 400)
$acl = Get-Acl $pemDest
$acl.SetAccessRuleProtection($true, $false)
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule("$env:USERNAME", "Read", "Allow")
$acl.AddAccessRule($rule)
Set-Acl -Path $pemDest -AclObject $acl

Write-Host "PEM file setup completed successfully!"
Write-Host "File location: $pemDest" 