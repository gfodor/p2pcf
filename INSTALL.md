# Installing Cloudflare Worker

Setting up the worker is a few simple steps.

### Create a Cloudflare account

Go to https://www.cloudflare.com/ and create an account.

### Set up the R2 bucket

1. In the Cloudflare console, go to R2:

![r2dialog](https://user-images.githubusercontent.com/220020/181828844-79ebca11-2901-43bf-a3d5-d7c8d15dd0ec.png)

2. Click Create Bucket

![image](https://user-images.githubusercontent.com/220020/181828972-ddc40644-3e38-417c-b221-9eaf2f005123.png)

3. Enter any bucket name you want (we use `p2pcf`)

![image](https://user-images.githubusercontent.com/220020/181829058-89634166-158c-4e18-a30f-e75d78fa1a58.png)

4. Hit "Create Bucket"

### Create the Cloudflare Worker

1. In the Cloudflare console, go to `Workers` in the main navigation:

![image](https://user-images.githubusercontent.com/220020/181829226-a3ee9598-b6cc-47b6-95c0-a3a38789c9b2.png)

2. Then, `Create a Service`

![image](https://user-images.githubusercontent.com/220020/181829338-cc3c0dd0-e26d-47e5-9c9f-48fb10a2d180.png)

4. Enter any service name you want (we use `p2pcf`). Leave the starter type as `HTTP Handler`. Press `Create service`.

![image](https://user-images.githubusercontent.com/220020/181829602-fa8c0b40-7e1f-445b-bfe0-434be2081ebd.png)

#### Bind the worker to R2

1. In your Worker's view, click the `Settings` tab:

![image](https://user-images.githubusercontent.com/220020/181829834-c19e78f2-9b13-4e59-811c-aaddf7eaf148.png)

2. Click `Variables` on the left:

![image](https://user-images.githubusercontent.com/220020/181830031-767df019-70bc-44a8-bb98-79179cb07abb.png)

3. Scroll down to `R2 Bucket Bindings` and click `Add Binding`:

![image](https://user-images.githubusercontent.com/220020/181830146-bb3ba1cf-8321-439c-ab80-3565d3a72834.png)

4. Choose any binding name you want (we use `BUCKET`), and choose the bucket you created earlier. Click `Save`.

![image](https://user-images.githubusercontent.com/220020/181830368-fc79fc27-521a-4fbd-acd4-ae5c88d99d4e.png)

7. Now, copy the [worker source](https://github.com/gfodor/p2pcf/blob/master/src/worker.js) from https://github.com/gfodor/p2pcf/blob/master/src/worker.js (Click Raw to more easily copy it)

#### Deploy the worker code

1. Go back to your worker's settings. Click `Workers` in the main navigation:

![image](https://user-images.githubusercontent.com/220020/181829226-a3ee9598-b6cc-47b6-95c0-a3a38789c9b2.png)

2. Click on your worker:

![image](https://user-images.githubusercontent.com/220020/181830606-20322fe4-fdc8-409d-b5eb-a002b6cb22e5.png)

3. Click on `Quick Edit`

![image](https://user-images.githubusercontent.com/220020/181830731-a9e17ed9-43fe-4e1d-b5c7-6e66f7f51bdc.png)

4.
6. 
## 
https://github.com/gfodor/p2pcf/blob/master/src/worker.js
