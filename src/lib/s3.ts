import AWS from 'aws-sdk';

// this function contains the function to actually load in the s3 configuration

export async function uploadToS3(file: File){
    try {
        AWS.config.update({                                            //configuring the AWS object, after configuring it we can use s3 objkect
            accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY
        });
        const s3 = new AWS.S3({                                        // ubder s3 object we passed params nd region object which configures the s3 bucket
            params: {
                Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME
            },
            region: "eu-north-1"
        })

        const file_key = 'uploads/' + Date.now().toString() + file.name.replace(' ' , '-')

        const params = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
            Key: file_key,
            Body: file
        }

        const upload = s3.putObject(params).on('httpDownloadProgress', evt => {                 //progress check
            console.log("Uploading to s3...", parseInt(((evt.loaded*100)/evt.total).toString())) + "%"
        }).promise()

        await upload.then(data => {
            console.log('successfully uploaded to S3!', file_key)
        })

        return Promise.resolve({
            file_key,
            file_name: file.name
        })

    } catch (error) {
        console.log(error);
    }
}

export function getS3Url(file_key: string){                     //utility function to get the s3 url from file key which i willuse to show it on the chat screen
    const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.eu-north-1.amazonaws.com/${file_key}` 
    return url;
}

