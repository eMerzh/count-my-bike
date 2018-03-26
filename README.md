# Count My Bike

Nice visualisation of Bike counter in Brussel.

## Data source

Count My Bike is based on http://opendatastore.brussels Bike counting pole Data.
The data are under the
[Brussels OpenData License](http://cirb.brussels/fr/nos-solutions/urbis-solutions/licence-urbis-open-data)

Meteo : [weatherbit](http://weatherbit.io)

## Installation

### Backend

You need python2 and mysql database to host the data fetching part and only a
webserver to host the visualisation part.

first create a virtualenv:

`virtualenv venv`

`source venv/bin/activate`

then install python requirements :

`pip install -r backend/requirements.txt`

then add configuration in the .env file:

`cp backend/env.dist backend/.env`

then a run (probably with a cron)

`python backend/main.py`

### Frontend

To run the frontend you must have yarn installed and go to the `frontend` directory
then

`yarn install`

and

`yarn serve` or `yarn build` ( build create a deployable file )

then serve the `dist` folder (and be sure to have `data.json` exported by the backend at the root)

## Quick Todo:

*   [ ] Remove Lorem ipsum
*   [ ] Add Smart city + Cyclop links ?
*   [ ] Deploy story

### Wishlist

*   [ ] Responsive
*   [ ] Ensure Timezone ready-ness
*   [ ] Backend Code cleanup
*   [ ] FallBack when API fails ( vrai-o-tron, ...)

## Contributors

*   [Brice Maron](https://github.com/eMerzh)
*   [David Thurion](https://github.com/davidthurion)
*   [Grégoire Leeuwerck](https://github.com/leeuwerck)
*   [Alex T.](https://github.com/schokolex)

## License

Yet to define
