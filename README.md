# Snipets

Each component of the app should have its own README on how to run it.

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