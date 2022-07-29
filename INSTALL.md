# Installing the P2PCF Cloudflare Worker

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

4. Click `Create Bucket`

![image](https://user-images.githubusercontent.com/220020/181828972-ddc40644-3e38-417c-b221-9eaf2f005123.png)

### Create the Cloudflare Worker

1. In the Cloudflare console, go to `Workers` in the main navigation:

![image](https://user-images.githubusercontent.com/220020/181829226-a3ee9598-b6cc-47b6-95c0-a3a38789c9b2.png)

2. Then, `Create a Service`

![image](https://user-images.githubusercontent.com/220020/181829338-cc3c0dd0-e26d-47e5-9c9f-48fb10a2d180.png)

4. Enter any service name you want (we use `p2pcf`). Leave the starter type as `HTTP Handler`. Press `Create service`.

![image](https://user-images.githubusercontent.com/220020/181829602-fa8c0b40-7e1f-445b-bfe0-434be2081ebd.png)

#### Bind the worker to R2

1. In your Worker's view, click the `Settings` tab:

![image](https://user-images.githubusercontent.com/220020/181831046-55f4e631-a895-4607-86b9-ee12c7fdd76a.png)

2. Click `Variables` on the left:

![image](https://user-images.githubusercontent.com/220020/181831117-2c33e8b6-95e4-4919-9bb1-0e3ecc3f39b8.png)

3. Scroll down to `R2 Bucket Bindings` and click `Add Binding`:

![image](https://user-images.githubusercontent.com/220020/181830146-bb3ba1cf-8321-439c-ab80-3565d3a72834.png)

4. Choose any binding name you want (we use `BUCKET`), and choose the bucket you created earlier. Click `Save`.

![image](https://user-images.githubusercontent.com/220020/181830368-fc79fc27-521a-4fbd-acd4-ae5c88d99d4e.png)

#### Deploy the worker code

1. Go back to your worker's settings. Click `Workers` in the main navigation:

![image](https://user-images.githubusercontent.com/220020/181829226-a3ee9598-b6cc-47b6-95c0-a3a38789c9b2.png)

2. Click on your worker:

![image](https://user-images.githubusercontent.com/220020/181830606-20322fe4-fdc8-409d-b5eb-a002b6cb22e5.png)

3. Click on `Quick Edit`. This will open the code editor.

![image](https://user-images.githubusercontent.com/220020/181830731-a9e17ed9-43fe-4e1d-b5c7-6e66f7f51bdc.png)

4. Now, in a separate tab, open the [worker source](https://github.com/gfodor/p2pcf/blob/master/src/worker.js) from https://github.com/gfodor/p2pcf/blob/master/src/worker.js and copy it. (Click `Raw` to get the raw text.)

5. Paste it into the editor, click `Save and Deploy`, and click to confirm the deployment.

![image](https://user-images.githubusercontent.com/220020/181831397-54f780ca-9ac5-4265-8254-d606c1178760.png)

6. Your worker is now deployed and ready to be used. Hit the URL to your worker to make sure it's working:

![image](https://user-images.githubusercontent.com/220020/181832545-e5306fa4-b408-41e0-be07-027dc4eeab41.png)

7. (Optional) You can add two other optional variables in the `Environment Variables` in `Settings` to increase the security of your worker.
 - `ALLOWED_ORIGINS`: A comma-separated list of origins that will be allowed to access the worker. If you're not offering a public worker, this is recommended.
   - Example: `https://mysite.com,https://app.mysite.com` would limit use of the worker to secured sites running on `mysite.com` or `app.mysite.com`.
 - `ORIGIN_QUOTA`: Number of joins per month to allow for any origin not specified in `ALLOWED_ORIGINS`. If you're offering a public worker, this is recommended to rate limit public usage. The default is 1000.
   - Example: `100` would limit use of the worker to 100 joins per month from any origin.

#### Use your worker in your code

The URL to your worker can be found at the top of the console view of your worker:

![image](https://user-images.githubusercontent.com/220020/181832545-e5306fa4-b408-41e0-be07-027dc4eeab41.png)

To use your worker in your client code, specify it as the `workerUrl` in the options passed to the `P2PCF` constructor:

```
import P2PCF from 'p2pcf'

const p2pcf = new P2PCF('MyUsername', 'MyRoom', { workerUrl: "https://p2pcf.myworker.workers.dev/" })
```

That's it! You now have a free (or cheap) WebRTC signalling server that will stay up as long as Cloudflare is working.
