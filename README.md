# not-so-social
social media automation pipeline

<h3>Steps to run on local machine</h3>

1. Install node.js - download installer from <a href ='https://nodejs.org/en/download/'>here </a> 
2. Install dev dependencies by running following command in the terminal (make sure terminal / cmd opened in the 'not-so-social' folder).
    ``` 
    user: path\to\cloned-folder\not-so-social> npm install 
    ```
3. Before running the app, you need to set env variables. (this needs to be set everytime you start a new cmd)
    ```
    #on windows cmd
    user: path\to\cloned-folder\not-so-social> set APP_ID=YOUR_APP_ID
    user: path\to\cloned-folder\not-so-social>
    user: path\to\cloned-folder\not-so-social> set HASH_SECRET=HASH_SECRET
    user: path\to\cloned-folder\not-so-social>
    user: path\to\cloned-folder\not-so-social> set LOCAL_STORE_PATH=PATH
    user: path\to\cloned-folder\not-so-social> 
    ```
4. To start electron app you can either use it's default run command. 
    ```
    user: path\to\cloned-folder\not-so-social> electron . 
    ```
   or, you can use the npm start command (preferred).
    ```
    user: path\to\cloned-folder\not-so-social> npm start 
    ```


<h3>Folder structure</h3>

```
|
|--- config
|        |--- index.js (config file)
|
|--- resources
|        |--- css (all css files)
|        |--- html (all html files)
|        |--- icons (any icons)
|
|--- src
|        |--- components (all ui related backend code)
|        |--- utils (all utility code e.g. api calls)
|
|--- test (unit testing code)
|        
|--- app.js (entry point of app)
|        
|--- index.css (stylesheets for app.js)
|        
|--- index.html (html for app.js)
|        
|--- LICENSE
|        
|--- package-lock.json
|        
|--- package.json
|        
|--- README.md
```

