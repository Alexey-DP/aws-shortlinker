# Serverless ShortLinker

Serverless AWS API for creating short links. Registered users can create short links for long URLs with a validity period: one-time, 1, 3 or 7 days. After the expiration of the link, the user will receive an email notification.

## Setup project

[Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

Create a new IAM user in your AWS account.

In terminal:

`aws configure`

Enter your programmatic credentials

Install serverless:

`npm install -g serverless`

Clone this project

Generate pair keys using open SSL commands:

`openssl genrsa -des3 -out private.pem 2048`

`openssl rsa -in private.pem -outform PEM -pubout -out public.pem`

`openssl rsa -in private.pem -out plain_private.pem`

Copy `private` and `public` :

`cat plain_private.pem`

`cat public.pem`

Set environments to `.env` file:

`RSA_PRIVATE_KEY=<private.pem>`

`RSA_PUBLIC_KEY=<public.pem>`

`TOKEN_TTL_MINUTES=<token ttl>`

`EMAIL_FROM=<email to send notification>`

Deploy API:

`sls deploy`

## API functional:

DynamoDB is used as the main data storage.

### Routes:

`POST $/auth/register` - register new users

Required in the request:

Boby:
`{
  "email": "string",
  "password": "string"
}`

Response:
`{
  "token": "string"
}`

`POST $/auth/login` - login

Required in the request:

Boby:
`{
  "email": "string",
  "password": "string"
}`

Response:
`{
  "token": "string"
}`

`POST $/` - create a new short link

Required in the request:

Headers: `Authorization: 'Bearer <token>'`

Boby:
`{
  "originalLink": "url",
  "ttl": "once" | "1" | "3" | "5"
}`

Response:
`{
  "link": "string"
}`

`GET $/:shortLinkId` - go to original link

`DELETE $/:shortLinkId` - deactivate short link

Required in the request:

Headers: `Authorization: 'Bearer <token>'`

`GET $/links` - get user's links

Required in the request:

Headers: `Authorization: 'Bearer <token>'`

Response:
`{
  "links": "array"
}`

### Notifications

The API uses AWS SES to send notifications when a link has expired. AWS SQS is used as a queue for sending emails.

!!! For sending user's email must be verified on AWS SES.

### Auto remove expired links

Lambda function with cron is used to remove expired links once a day.

## API testing

To test the API using requests, run the application locally and use the swagger:

`npm start`

Or you can check out the app [here](https://dxf13daxt5.execute-api.eu-north-1.amazonaws.com/swagger)
