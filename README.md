# Shopee API

This is a simple API for getting product data from Shopee.

## Usage

```bash
curl -X GET "http://localhost:8000/shopee/product?url=https://shopee.tw/---i.31188538.19323502897"
```



## Installation

```bash
pip install -r requirements.txt
```

## Running the API

```bash
uvicorn shopee_api:app --reload
```


## API Documentation

The API documentation is available at `http://localhost:8000/docs`.


### How does it work now?
- I've made a custom chrome extension to import and export the cookies. So, I will login from a new account and export the cookies and save it in the extension folder with the name "shopee_cookie.json" and then when the browser loads it will automatically load the cookies and the account will be logged in. (Can automate this process to login from a new account and export the cookies and save it in the extension folder with the name "shopee_cookie.json" and then when the browser loads it will automatically load the cookies and the account will be logged in.)

- It gets all the calls that are being made in the background while the page is loading using cdp events and it looks for the main API that contains the product data. Out of all the XHR requests, it looks for the one that contains the url "api/v4/pdp/get_pc?" and then it will get the response and parse it to get the product data.




### 📝 Description
> There are many issues which we need to handle to get a production ready API:

#### Issue 1: Shopee Captcha


It is a very unique captcha to solve and there is no way to solve it using any library. So, the best solution would be to use machine learning to solve it. I found a way to solve it temporarily by using https://www.sadcaptcha.com/shopee-captcha-solver but it doesn't work most of the time. So, we need to find a better solution or train a model to solve it.


#### Issue 2: Random Errors 


Shopee throws some random error and there is no way to control when the error occurs. Tried multiple ways to identify the error and handle it but still no luck. 


### Approaches That I Took 

1. Tried to make a reverse proxy to make a mirror site of shopee to scrape the data from it but it was not working. Stuck on unlimited captcha. Used cloudflare worker to make the reverse proxy and here is the url - https://broken-leaf-7d0e.shinealom.workers.dev/

2. Used mitmproxy to intercept the requests and responses and find the data from their internal API. But, was having trouble with SSL certificate. So, will have to bypass SSL Pinning.

3. Using normal selenium and pickle to save the session and load it later. But, it was banning the account so, I had to find a way to bypass the browser fingerprint. Used `undetected-chromedriver` to bypass the browser fingerprint (Works at a basic level but will have to use https://fp.bablosoft.com to make stable and production ready multi accounts for multiple profiles).

4. Tried to make the direct API call to get the data from their internal API:

```bash
curl --request GET \
  --url 'https://shopee.tw/api/v4/pdp/get_pc?item_id=23873341214&shop_id=285438373&tz_offset_minutes=330&detail_level=0' \
  --header 'Cookie: __LOCALE__null=TW; csrftoken=tryuuDVtOZkMazhnre7HbltZocBkDl43; _QPWSDCXHZQA=51a0f348-b03f-456d-d821-c20f40cde2e9; REC7iLP4Q=32f7f3bd-8a33-4ad6-bebe-00bab14b12b2; _sapid=6942dd1dc4800f7a6c1f111fbbd2523709009841c936fd7727db00d6; SPC_F=ZaoliDWp4u7JXkz6oobS6uhd3GsutBSW; REC_T_ID=125611b6-ffff-11ef-ad1e-9a3da28a030b; SPC_SI=p7zOZwAAAAA2NThyM1prcYAsAgAAAAAAdFY5dHhzS1o=; SPC_SEC_SI=v1-R3EwcDdYZ3lBM3hHVkw2Obl/ZHPMsEIbNUcGvrCvBMRE5EyAprKlQQz7vbNw+pS8U7hW/YasAX5j4OGnKtsa9/2kmYkKVMP3xxA7dUsiHyk=; SPC_CDS_CHAT=90f82c7e-90c7-416d-924b-dda2804582e2; SPC_CLIENTID=WmFvbGlEV3A0dTdKibtmangnompxziwo; SPC_ST=.ZFB0Y2pTYlh2ZXVBSnlrY8Nzs4SaV2P76KO8xd3H7OHwqAEiyoarUQkvMrd4cGzlEOjFxa0+Ok22momUqU8a7CCZ5GtohjVOaR+FARsu8BOh9jb8TDKjROfORKf3vl6mHvS5aUk+gfUecIzCyN48W84Fhk9cLufPWsAEYlK0W6p54Gi29Y1IkFzLvisBizG3S9tiH/OvQXfTjs84hBXmwX2sD68MugjLYfIX1jpZWCHpJRp04kg5plX0BRNqhkjE; SPC_U=1497196157; SPC_R_T_IV=aFlnVHdxYlNJZGFJZDlZZw==; SPC_T_ID=RrZQgsx1dpJWwNftPi1XWgeikTQYSmEw9Y+MZGe9PFAdqfl4+BRVgQFic+IWdsXvuMPDtuBtZ/UDxWhXE9CzGj4M42YKAUmxokqJz5+vUv/QEoskMYH8v8AEhsovrw5Ookmc6f6Q7DYHMQPIVg0TKqe/En8tKiyF7NO3YvH641s=; SPC_T_IV=aFlnVHdxYlNJZGFJZDlZZw==; SPC_R_T_ID=RrZQgsx1dpJWwNftPi1XWgeikTQYSmEw9Y+MZGe9PFAdqfl4+BRVgQFic+IWdsXvuMPDtuBtZ/UDxWhXE9CzGj4M42YKAUmxokqJz5+vUv/QEoskMYH8v8AEhsovrw5Ookmc6f6Q7DYHMQPIVg0TKqe/En8tKiyF7NO3YvH641s=; AC_CERT_D=U2FsdGVkX18rYWKjNz2wTokCv1xhqiQZ2iaP4e8npRLxDttOy1PG0thcILDscGMe2UFD/k95UXVw+TYH2EqZch1A+sQSrPa31AduECmA1siSxdT7cYQTeHVi4HLHO1FJFG//uc4Wt5TOmHEwFtva7LEF371JebsRnG1KGZaoD1fBbmVJWqv0cQQqjpDiHTRVXFBKnIxqKMdIR15QXmTRT9UpplEdFr4KytugG9+q73wcE8FtIkPb/1kMhnaJsdI+XRF0nFOsfz+kobWtrJSOYwEoQNDNWrQnWfhrkydkdeBkYN6sGKBxpaTyaaEXust699Ae824LVM85T78CPxx6lTZ/cNC0/jLLOaUPjRY+Byb5HqFJiz9At+wbT9BZEAMa1wGT+5bpHvr4c0jTzX3GXexKM0zMBdANJQvA+EVVEvQIX/yPcnEIquT1vFHYjAIQbUtXw400Is34uf/hJnJwU7VHnb+3fH37tBP4HfpwCRQPk4PZMLjH5YyISqHFpdWwJpeHBn/mChStQNFjenBibukcg1S0ChfsUpPBw0BWw++qK9nI5iRHQSzXoP8JAFSz07j04yxxVrV544CHa0621rBN7wMiF2M00H2H0r581bWZhX/p/H0SQMH688hBoCSRpZCN6MeAOOziXW5rh6DhW5rdzEFSrZJtXPWlV6TjooSjHtHGflzuk+pjMa4rjzP0GEohxFbqW+i6KSfRRF+NPGewNgh/ixSqful90TEEfzOMxmSzlkWQWJ7Kufhh218jJdNgX4eFh3hmTkVjsEg/gcqgzHYL60dVQNLHuE4RPZVW544v6IjI4YRSDeGXa+O1SSUoJM7Kx/V5dCPHxffC0JRrJp44Zro5bnvf61oeVHapstiPk+paws8K4hgUiSE5Vb+SZ/1Lk2aU2eTmt1PTSs7oaAS50yaMgLKrzIbkcso2iBl44qvSAn3TPHgJF5ernd71vjokVL8gL6G5ToKZN5H1iLoT0OOMwZjyF1UoiIN+D7djJfbC0IC3fiFeoto9iRMbabUvpUlScE+C3MOmfFl/uS0Mw2pXgaWSG53plbxnBFnon3rReZeMqsjPnWOUPKpuBI4nWlX+NPOznnEuCg==; SPC_EC=.YWdnY1VESXRrRUt0RjZnQ5H8Gxi3vry1J9T4HxV1ehrsmiOiTF3ZrYrLF/UEoX38ksCQxo8SWEajzMd6U2TUznExUUgzvsxZ+CKcHa+l8zObkZGWyteSDBRqXGEeSEWnk1S/4FbrtmPRzWYANb3O3ljISL7i1Nvh63H2XSeZCvOI/5ZXPtSJuKaQpZUQCdKcoTj5VRG5V3oCRM9uU+MqrtQJyKqAE2oGQcgdt9T2ovO3rMdE7SRuQwRIKFz8l2WS' \
  --header 'accept: application/json' \
  --header 'accept-language: en-US,en-IN;q=0.9,en;q=0.8' \
  --header 'af-ac-enc-dat: b006a8aa3c11ceaa' \
  --header 'af-ac-enc-sz-token: ' \
  --header 'content-type: application/json' \
  --header 'd-nonptcha-sync: AAAGzTOeRs4A|6|BJhz3t9vEjXBz0=' \
  --header 'priority: u=1, i' \
  --header 'referer: https://shopee.tw/---i.285438373.23873341214' \
  --header 'sec-ch-ua: "Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"' \
  --header 'sec-ch-ua-mobile: ?0' \
  --header 'sec-ch-ua-platform: "Linux"' \
  --header 'sec-fetch-dest: empty' \
  --header 'sec-fetch-mode: cors' \
  --header 'sec-fetch-site: same-origin' \
  --header 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36' \
  --header 'x-api-source: pc' \
  --header 'x-csrftoken: tryuuDVtOZkMazhnre7HbltZocBkDl43' \
  --header 'x-requested-with: XMLHttpRequest' \
  --header 'x-sap-ri: 1ec4d267253592b58044773305015319ec66ea7cd090acc94ef8' \
  --header 'x-sap-sec: G0+1oHKvEo2PONxUP0/UPNQUY0/hPRlUnq/mP7KU6q3FP7/UU07MPBvUAq/SPRnU90/3PNEUgY6aPdvU007UPMEUyY6FPLvU3q3tPQEUl038P6/Uto6iP2/UT03LPBIUu0/TPMQUJq6vPBQUwY6tP+fUK03gP+EUO03yPLfUG0/8P2vUpY7hP/OUI03MPN/UQ0/LP/QU20/PPLBUMY/rPMxUFY/UP34oVmnUP06s1sUfj123PMKUO0/Uj0BUP20JqFfUP06SbYwZto/UOdc2acs6fdWUNeWc3zOUP07rUeEeUMpMR8UZh2h42sT1GRoVIAvPPq/Uh0BUP0/UPBkhoHIMP06tmoX4P0O0bjTeT0BUP0/UPLtpXrKiP0/UPIYhekqmPq/U70KUP0/UP7xQ6KW/d0/UP0sT6pDUP0/v60KUP07XLnl6pwq3w0QUP2ow/oKp0tv3Q0KUP0/U8LWfWYu5P2JScylcSEGPPq/U10QUP0/UPKh3Pq/UP07Hgo3WoMJ7yvYkB0BUP0/UhcEZPo/UCHB5dEXmXilen+4CDfUcOC4qJX+Fu/HZw7ryfjTKmN6Tfr1W2TAq9w0Nwho2KqLAaTIhMh2e7C1eHFyhFcY9bPs2nfMfFxRwRiHuRm6ZduBZc9lpAEtedKE14t63plWDF3bX7+4vfBWyS+o0UiEv9cAASY3sjzqUDB7TtOOyB4lZYdig4b4PkwfmMneipMtjGl7HsFlv8FkS/Al6Yi0zi4+KpTD7Qpg3YRWbW2J57VR+aKOjjzSmpD1Fxk+ofgu0d4OlNXZ1XGLEAUFHjHPH97ysdZSckV67WtnkGEj4drA3TK1debfbKeU9fSwr0bdup2L4b+EV2qYPuWxlAbksQiZ06Dzzgv7woildMUSs9mItP0/U8NTWIoxUP074mFKtMXFvGVCvP073Fa9Y18sDO2xlJ7RFEu4OQCYLhfIitWqGisA9OfisMtnn2lc8aEkoPTa0xbKxIQiqhiQ8syEhxB3aZXsVdE/dovN+ttTy7qOEflST++s+dYqVB5KA6Q72nurP1yjELfZF4TOezmrSl/Ehpan4lmP7tbKyzcsAkC2sVDiwXTbOCYWYjqwxV/T5JYXOi1R8L+RXhuHeNVsPr3em4sAM2W0T65uCwmHpxlO/vqP+OiVwSUOQaFJOJ4Ax6Scx/0S6TGmnYg92lqjgV5V6Ap6VU93813U1IwjuTlIpTllFNckuUEh0ZqhfLlL0qINIie8OpBQ8u6kQvrrbwBUO3W8IGk4UVi4MVJ0TmmXsgy6IYr5HHPNDOEhc8mB6sjBqa+4IN7lexT8YqRHFO1adnComMEeQmy6uohg6Wq6vZyLnAEhWTvG8nRQG31ga4QlUrHcdO+0D+eYYIpaWcjQUP0/tP0/UPHL8yoEUP03bNhzOP0/UP0QUP035/q/UNY/UP38rrTeXbhsd3veeu7yGRHmPMsbOKMOBSSUvSQ3HVxFzIbQOY/T23qGYPLAOKPJLr2FPPRFubsU1J2LH1nRKShhXBsR9BFCIQ0xDP0/xP0/U6SWSYvkMShMZMvdJhXZZSwOUP0/UP0/UP0/UP0/UP0/UP0/Ur0/UPdlKPYkjz2tRP0/UP0xUP0/cEhC0ExscLo/UP0/FP0/USC38X0jl4elFP0/ULEs/HEKLKhEUP0/Ur0/UP63vHlLPV/CiP0/UPK==' \
  --header 'x-shopee-language: zh-Hant' \
  --header 'x-sz-sdk-version: 1.12.17' \
  --cookie 'SPC_ST=.ZFB0Y2pTYlh2ZXVBSnlrY8Nzs4SaV2P76KO8xd3H7OHwqAEiyoarUQkvMrd4cGzlEOjFxa0%2BOk22momUqU8a7CCZ5GtohjVOaR%2BFARsu8BOh9jb8TDKjROfORKf3vl6mHvS5aUk%2BgfUecIzCyN48W84Fhk9cLufPWsAEYlK0W6p54Gi29Y1IkFzLvisBizG3S9tiH%2FOvQXfTjs84hBXmwX2sD68MugjLYfIX1jpZWCHpJRp04kg5plX0BRNqhkjE; SPC_U=1497196157; SPC_EC=.UHVoSEo0N0V2clBnbjVaeU0fqLqAJiL6nDXVqKeN%2B%2Bgg3K3SiTjuwDXhkKP9g0O6Xyn8oxS6tiD25KT9UaT8X92h3Qw62U9EMwRNWA5DfGnHnayBjkHnD1YPNgnEtTkasPsmJ3oprODGYYFMoby0B8ijeBT5Eq8HAo54%2BGy9hvKxDgomEke2jxcPiXrTXl83vxonehLdbxB79B7U9tYOYcie%2BgHhp288TaTL9LdaQiglInFPwr6PWvhIREjGwcwW; SPC_R_T_ID=RrZQgsx1dpJWwNftPi1XWgeikTQYSmEw9Y%2BMZGe9PFAdqfl4%2BBRVgQFic%2BIWdsXvuMPDtuBtZ%2FUDxWhXE9CzGj4M42YKAUmxokqJz5%2BvUv%2FQEoskMYH8v8AEhsovrw5Ookmc6f6Q7DYHMQPIVg0TKqe%2FEn8tKiyF7NO3YvH641s%3D; SPC_R_T_IV=aFlnVHdxYlNJZGFJZDlZZw%3D%3D; SPC_T_ID=RrZQgsx1dpJWwNftPi1XWgeikTQYSmEw9Y%2BMZGe9PFAdqfl4%2BBRVgQFic%2BIWdsXvuMPDtuBtZ%2FUDxWhXE9CzGj4M42YKAUmxokqJz5%2BvUv%2FQEoskMYH8v8AEhsovrw5Ookmc6f6Q7DYHMQPIVg0TKqe%2FEn8tKiyF7NO3YvH641s%3D; SPC_T_IV=aFlnVHdxYlNJZGFJZDlZZw%3D%3D; SPC_SI=p7zOZwAAAAA2NThyM1prcYAsAgAAAAAAdFY5dHhzS1o%3D'
```

However, this direct API approach requires several dynamic security tokens that are generated by Shopee's Security SDK:
- `af-ac-enc-dat`
- `af-ac-enc-sz-token`
- `x-sap-access-f`
- `x-sap-access-s`
- `x-sap-access-t`

These tokens are generated client-side using JavaScript from their SDK (located at `https://deo.shopeemobile.com/shopee/web-sdk/js/live/*.js`). The generation logic is obfuscated and would require significant reverse engineering effort to replicate.





### Alternative Approaches(Things we can try!)

1. Can try to use burpsuite with Frida to intercept the requests and responses and find the data from their internal API. 

2. Reverse engineer their whole internal API (will take time)

3. Try anti detect browsers or browser fingerpriting to work with multiple accounts.

4. Find out the primary cause of those random erros and try to bypass it.


## Note : It is a complex project and will take time to figure everything out and make it production ready. Also, it is very sensitive and each wrong move just bans the account.


## Notes

- The API is using the `undetected-chromedriver` library to get the product data.
- The API is using the `uvicorn` library to run the API.
- The API is using the `fastapi` library to create the API.
- The API is using the `selenium` library to get the product data.

