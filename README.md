# Snipets

A little project to save snippets from any text you can select in your browser.

# Usage

## Web app and API

The web app and the api are quite low maintenance, write out a .env file with variables from the .env.dist. And then, at the root of the project run: 
```sh
docker compose up -d
```
The containers should spin up once the docker images are built.

You should see docs at localhost:{API_PORT}/docs and a small web UI at localhost:{WEB_PORT}

## RavenDB

Here's the tricky part: you might have to open up the RavenDB UI and create a database called SnippetsDB.
Apologies in advance if you have to go through RavenDB's website and ask for a certificate.

If anyone else than me ever uses this, I'll migrate to postgres.

## Chrome extension

You made it back to the easy part! Build the ChromeExt project, it takes about two lines of npm commands.

Then upload the files to chrome, in your extension settings. For more info, see the Readme file in the ChromeExt folder.

# ?

Thank you for reading if you made it this far, this has been a fun little project. I hope it proves interesting if not useful.

Adios ✌️

# Troubleshooting

## Error saving snippet: Received unsuccessful response and couldn't recover from it. Also, no record of exceptions per failed nodes. This is weird and should not happen.

Spin up the ravendb container and create the following database: SnippetsDB.

## Docker may not have the rights to write to your ravendb data folder

```sh
sudo chown -R 1000:1000 ./data/ravendb
```
Or if you get lazy:

```sh
sudo chmod -R 777 ./data/ravendb
```