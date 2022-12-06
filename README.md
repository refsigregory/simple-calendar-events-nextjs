#Simple Calendar with NextJS

Still in progres....


## Getting Started

First, run the development server:

```bash
npm install
# or
yarn install
```
and

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Endpoints
This version using Text File to save data, this is the availabe endpoints:

- List Events
[GET] `http://localhost:3000/api/events`

- Add New Events
[POST] `http://localhost:3000/api/events/add`


```
{
    "name": "asdasd",
    "color": "blue",
    "days": [1, 2, 3]
}
```

- Delete Events
[POST] `http://localhost:3000/api/events/delete`

```
{
    "id": "1ffc465c-d531-41d6-8499-d29fbf6b89bc"
}
```