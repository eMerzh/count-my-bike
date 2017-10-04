# -*- coding: utf-8 -*-

import csv
import datetime
import os
import time
from StringIO import StringIO

import requests
from dotenv import find_dotenv, load_dotenv
from peewee import *

load_dotenv(find_dotenv())

db = MySQLDatabase(os.environ.get("DB_NAME"), user=os.environ.get("DB_USER"),
                   host=os.environ.get("DB_HOST"), password=os.environ.get("DB_PASS"), charset='utf8mb4')

API_URL = 'http://data-mobility.brussels/geoserver/bm_bike/wfs?service=wfs&version=1.1.0&request=GetFeature&typeName=bm_bike:rt_counting&outputFormat=csv'


class BikeCounter(Model):
    class Meta:
        database = db

    gid = IntegerField()
    FID = TextField()

    # City
    mu_fr = TextField()
    mu_nl = TextField()

    # Other infos
    info_fr = TextField()
    info_nl = TextField()

    # Address
    road_fr = TextField()
    loc_fr = TextField()
    housenr = TextField()
    road_nl = TextField()
    loc_nl = TextField()
    pccp = TextField()

    geom = TextField()

    # Counter info
    counter_id = TextField()
    # Placement
    lane_name = TextField()
    lane_no = TextField()

    # Counter
    day_cnt = IntegerField()
    hour_cnt = IntegerField()
    year_cnt = IntegerField()
    year_cnt_delta = IntegerField()

    cnt_date = DateTimeField()

    created_date = DateTimeField(default=datetime.datetime.now, index=True)
    last_seen_date = DateTimeField(default=datetime.datetime.now)


def fetch():
    """ Fetch counter from api and persist it """
    db.connect()
    BikeCounter.create_table(fail_silently=True)

    response = requests.get(API_URL)

    f = StringIO(response.text.encode('utf8'))
    reader = csv.DictReader(f, delimiter=',')
    for row in reader:
        try:
            last_counter = (
                BikeCounter
                .select()
                .where(BikeCounter.counter_id == row['counter_id'])
                .order_by(BikeCounter.created_date.desc())
                .get()
            )
        except BikeCounter.DoesNotExist:
            last_counter = None

        delta = 0
        if last_counter:
            ctn_date = datetime.datetime.fromtimestamp(time.mktime(time.strptime(row['cnt_date'], "%Y-%m-%dT%H:%M:%S")))

            delta = int(row['year_cnt']) - last_counter.year_cnt
            if last_counter.cnt_date == ctn_date:
                last_counter.last_seen_date = datetime.datetime.now()
                last_counter.save()
                continue

        item = BikeCounter.create(year_cnt_delta=delta, **row)

        item.save()


if __name__ == "__main__":
    fetch()
