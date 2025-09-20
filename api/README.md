# Usage

## 1. Install dependencies

```sh
pip install -r requirements.txt
```

## 2. Start RavenDB (required for database)

Make sure RavenDB is running. You can start it using Docker:

```sh
docker-compose up ravendb
```

## 3. Run the FastAPI app

```sh
uvicorn main:app --reload
```

The API will be available at [http://localhost:8000](http://localhost:8000).