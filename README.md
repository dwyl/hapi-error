# hapi-error

Intercept errors in your Hapi web app/api and send a *useful* message to the client.

## *Why*?

By default, `Hapi` does not give people *friendly* error messages.
This plugin/readme will show you how to display consistent, friendly & useful
error messages in your Hapi apps.

## *What*?

Under the hood, Hapi uses `Boom` to handle errors.
These errors are returned as JSON

If a URL/Endpoint does not exist a `404` is displayed:
![hapi-login-404-error](https://cloud.githubusercontent.com/assets/194400/14770263/06bdc6dc-0a65-11e6-9f9b-80944711a4f1.png)

When a person/client attmpts to access a "*restricted*" endpoint without
the proper authentication/authorisation a `401` error is shown:

![hapi-login-401-error](https://cloud.githubusercontent.com/assets/194400/14770276/57022f20-0a65-11e6-86de-d9b8e456b344.png)

And if an *unknown* error occurs on the server, a `500` error is *thrown*:

![localhost-500-error](https://cloud.githubusercontent.com/assets/194400/14770517/98a4b6d6-0a6b-11e6-8448-4b66e3df9a9a.png)



But it does have a *useful* error object we can use.

```js
console.log(request.response);
```
A typical `Boom` error has the format:
```js
{ [Error: 500]
  isBoom: true,
  isServer: true,
  data: null,
  output:
   { statusCode: 500,
     payload:
      { statusCode: 500,
        error: 'Internal Server Error',
        message: 'An internal server error occurred' },
     headers: {} },
  reformat: [Function] }
```
