# Count My Bike

Nice visualisation of Bike counter in Brussel.


## Data source

Count My Bike is based on http://opendatastore.brussels Bike counting pole Data.
The data are under the [Brussels OpenData License](http://cirb.brussels/fr/nos-solutions/urbis-solutions/licence-urbis-open-data)

## Installation

You need python2 and mysql database to host the data fetching part and only a webserver to host the visualisation part.

first create a virtualenv:

`virtualenv venv`

`source venv/bin/activate`

then install python requirements :

`pip install -r requirements.txt `

then add configuration in the .env file:

`cp  env.dist .env`

then a run (probably with a cron)

`python main.py`

you can then serve the "public" folder with any web server :)

## License

Yet to define
