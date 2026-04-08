output "bucket_id" {
  description = "ID (name) of the S3 bucket"
  value       = aws_s3_bucket.this.id
}

output "bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.this.arn
}

output "bucket_domain_name" {
  description = "Domain name of the bucket"
  value       = aws_s3_bucket.this.bucket_domain_name
}

output "bucket_regional_domain_name" {
  description = "Regional domain name of the bucket"
  value       = aws_s3_bucket.this.bucket_regional_domain_name
}

output "bucket_region" {
  description = "Region the bucket resides in"
  value       = aws_s3_bucket.this.region
}

output "bucket_hosted_zone_id" {
  description = "Route 53 hosted zone ID for the bucket region"
  value       = aws_s3_bucket.this.hosted_zone_id
}
