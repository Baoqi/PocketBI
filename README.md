# **PocketBI**

PocketBI is an easy-to-use low-memory-requirement BI tool! It can run on fly.io free tier shared-cpu-1x VM (256MB memory). 

Note: This project's source code is mainly modified from https://github.com/shzlw/poli/ and port it to work with https://github.com/pocketbase/pocketbase


## Why PocketBI

I have some personal data collected in sqlite & postgres, I want to have a simple BI tool to check it from time to time (7 * 24 hour), I wonder whether this can be done free of charge. 

For the hosting part, I use fly.io's free tier (it can host up to 3 shared-cpu-1x VM (256MB memory each)).

For the BI part, I found https://github.com/shzlw/poli/ is simple yet useful. But the Java & Sprint Boot will make it require more memory to run.

Later, I found https://github.com/pocketbase/pocketbase, "Open Source realtime backend in 1 file".

So, can I combine PocketBase with Poli? Then it comes this PocketBI.


## Start from source code

Requirement:
  - Node.js (version 16.x +) + yarn
  - GoLang (version 19.x +)

How to build:
  1. Build front end: go to web-app folder, and run "yarn build", the generated files will be inside  PocketBI/pb_public
  2. Build backend: in project's root folder, run: `go build .`, it will generate an executable file: pocketbi

Then, run the following command to start server:
```
./pocketbi serve
```

## Quick Start
After start PocketBI, do the following steps

### Step 1. Create a PocketBase Admin account

Open "http://localhost:8090/_/", and create an admin user for manage the whole system.

![image](/images/pocketbase_create_admin_user.png)

### Step 2. Create a Normal User account, which can be used to access BI application

After Step 1, after login to "http://localhost:8090/_/", you can create a normal user account, which can be used to access BI application.

![image](/images/pocketbase_create_normal_user.png)

### Step 3. Login to main site (http://localhost:8090/) by the normal user account

![image](/images/pocketbi_login.png)

### Step 4. Create a new data source

![image](/images/pocketbi_create_datasource.png)

currently, PocketBI support sqlite, clickhouse http and postgres. (more will be added later)

For Sqlite, the connection string is like:
```
sqlite:file:/pb_data/data.db?mode=ro
```

For Clickhouse, the connection string is like:
```
http://127.0.0.1:8123/default?user=default&password=xxxxxx
```

For Postgres, the connection string is like:
```
postgres://user_name:password@your_db_host:5432/public?sslmode=require
```

### Step 5. Create a new Report

You can then create visualizations based on the data source you created. like:

![image](/images/pocketbi_card_edit.png)

and create a report by adding more components:

![image](/images/pocketbi_report_edit.png)

For more details, please check https://shzlw.github.io/poli/

Poli support the following visualizations types:
  - Static
    - Text
    - Image
    - Iframe
    - Html
  - Chart
    - Table
    - Pie
    - Line
    - Bar
    - Area
    - Card
    - Funnel
    - Treemap
    - Heatmap
    - Kanban
  - Filter
    - Slicer
    - Single
    - Date Picker

## Documentation

  - For PocketBase part (access from http://localhost:8090/_/ ), please check: https://pocketbase.io/docs/

  - For Poli part(access from http://localhost:8090/) please check https://shzlw.github.io/poli/


## License

MIT License

