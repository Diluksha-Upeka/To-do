# Verify S3 bucket exists and has correct permissions
$bucketName = "todo-app-terraform-state"
$region = "eu-north-1"

# Check if bucket exists
$bucketExists = aws s3api head-bucket --bucket $bucketName --region $region 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Bucket does not exist. Creating bucket..."
    aws s3api create-bucket --bucket $bucketName --region $region --create-bucket-configuration LocationConstraint=$region
    
    # Enable versioning
    aws s3api put-bucket-versioning --bucket $bucketName --versioning-configuration Status=Enabled
    
    # Enable encryption
    aws s3api put-bucket-encryption --bucket $bucketName --server-side-encryption-configuration '{
        "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }
        ]
    }'
    
    # Block public access
    aws s3api put-public-access-block --bucket $bucketName --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
    
    Write-Host "Bucket created and configured successfully!"
} else {
    Write-Host "Bucket already exists. Verifying configuration..."
    
    # Verify versioning
    $versioning = aws s3api get-bucket-versioning --bucket $bucketName
    if (-not ($versioning -match "Enabled")) {
        Write-Host "Enabling versioning..."
        aws s3api put-bucket-versioning --bucket $bucketName --versioning-configuration Status=Enabled
    }
    
    # Verify encryption
    $encryption = aws s3api get-bucket-encryption --bucket $bucketName 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Enabling encryption..."
        aws s3api put-bucket-encryption --bucket $bucketName --server-side-encryption-configuration '{
            "Rules": [
                {
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                }
            ]
        }'
    }
    
    Write-Host "Bucket configuration verified!"
} 