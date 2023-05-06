## Telegram Lambdas



### Lambda Handlers

#### Bind Chat Handler
Binds telegram group chat with nodde's subscription

#### Generate Invite Code Handler
Generates new invite code

#### Get Invite Link Status Handler
Gets invite link status

Request format
``` json
{
    "address": <string>, // User address
    "subscription_id": <string> // Subscription identifier
}
```

Possible responses

``` json
{
    "status": "NOT_GENERATED"
}
```
Meaning: Invite code wasn't generated yet

``` json
{
    "status": "CODE_GENERATED",
    "code": "inv95d8e0bbdd90bd2bbf11d4ed5747649c5cd6dbb4848df2a71bc6245b145623
}
```

Meaning: Code generated, but invite link not fetched yet


``` json
{
    "status": "CODE_USED",
}
```

Meaning: The user already used this code


#### Telegram Webhook Handler



