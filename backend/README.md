# My Torah Today Backend

## Dependencies and local development

Python 3.12 dependencies are defined in `Pipfile` and resolved in `Pipfile.lock`.
Run the dependency commands from `backend/` with `PIPENV_VENV_IN_PROJECT=1` to use
the local `backend/.venv` (in PowerShell: `$env:PIPENV_VENV_IN_PROJECT = "1"`).
After changing dependencies, run `python -m pipenv lock`, then regenerate the
deployment requirements with `python -m pipenv requirements --exclude-index > requirements.txt`.
Install the locked environment with `python -m pipenv sync`.

Debug pages are disabled by default. Set `DJANGO_DEBUG=true` in the local
`backend/.env` to enable them when using `manage.py` for local development.
Production must supply `DJANGO_SECRET_KEY` through the environment; startup fails
when it is missing and debug is disabled. Local debug mode supplies a development
key when no key is configured.

Allowed hosts default to `mttbackend-production.up.railway.app`, `localhost`,
`127.0.0.1`, and `[::1]`. A configured `RAILWAY_APP_URL` adds its hostname.
Set `DJANGO_ALLOWED_HOSTS` to a comma-separated list to replace those defaults
for a custom deployment.

## Tests

From `backend/` with the virtualenv active, run `python run_tests.py`. From the
repository root on Windows, run
`backend/.venv/Scripts/python.exe backend/run_tests.py`.
The runner supplies a test-only secret, skips `.env` loading, and forces an
in-memory SQLite database before Django starts. It runs the API, video, user,
and topic suites without connecting to the configured application database.

## Purpose of application

The purpose of the app is to provide a simple and modest backend to the My Torah Today web app for user management and to give users the abilty to save videos that they like and to create video lists for themselves and for the community.

## Structure of the app

The app is structured in a manner of seperation of conserns so all api related code is in the 'api' app and all user related app e.g. models of user content is in the 'users' app.

### 'api' app

The 'api' app has a serializer file and handles in the views file all api requests using the serializers in the serializer file.

All api endpoints are handled in the urls.py file in the 'api' app.

### 'users' app

The users app has a models file that handles all datasets and an admin file for the admin site interface.

## Functions of the full backend app

### User management

Client can register by making a post request to the register api endpoint and can log in by making a post request to the login api endpoint and log out by making a post request to the logout api endpoint.

#### API endpoints for user management

User api is managed by djoser

* **api/auth/users**
* * POST for user registration (sign up)
  * GET requires authentication
  * * Admin token: returns all users
    * User token: return user info
* **auth/users/{user_id}**  - GET DELETE PUT PATCH
* * Admin token: can be used on any user
  * User token: can be used for own user_id and works as /users/me see below
* **auth/users/me**  -  GET PUT PATCH DELETE requires authentication
* **auth/token/login** - POST takes username and password and returns token
* **auth/token/logout** -  POST takes token and expires token and it cannot be used anymore

### Content management

Client can save videos to a users personal saved list or can create a new list - public or private - and save to videos to created list/s.

#### API endpoints

Content APIs

* **api/user-saved-videos/** requires token authentication
* * GET retrieve all
  * POST saves a video takes a video_id in body
  * **/{save_id}/**
  * * GET retrieves one instance
    * DELETE destroys instance
* **api/videos/**
* * GET lists all videos
  * ?video_id
  * ?search
  * ?topic, ?topic__name, ?topic__name__iexact
  * ?subtopic, ?subtopic__name
  * ?views, ?views__gte, ?views__lte, ?views__range
  * ?likes, ?likes__gte, ?likes__lte, ?likes__range
  * POST saves on or more videos
  * **/{id}/**
  * * GET retrives one video
    * PUT updates on video
    * DELETE Admin token required to delete one video

##### To be defined later

user video lists

## What this app might have

* The app might also host the data of all videos and serve it per API call
* The app might also keep track of likes and comments on videos   


