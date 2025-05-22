import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3'
import { config } from 'dotenv'
config()

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})

const command = new ListBucketsCommand({})

client.send(command).then((data) => {
  console.log(data)
})
