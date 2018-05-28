# -*- coding: utf-8 -*-

import csv
import json
import os
import time
from datetime import datetime, timedelta
from StringIO import StringIO

import requests
from dotenv import find_dotenv, load_dotenv
from peewee import *
from raven import Client
from weatherbit.api import Api

load_dotenv(find_dotenv())


if os.environ.get('SENTRY_DSN'):
    sentry = Client(os.environ.get('SENTRY_DSN'))

db = MySQLDatabase(os.environ.get("DB_NAME"), user=os.environ.get("DB_USER"),
                   host=os.environ.get("DB_HOST"), password=os.environ.get("DB_PASS"), charset='utf8mb4')

weather_api = Api(os.environ.get('WEATHER_API_KEY'))

API_URL = 'http://data-mobility.brussels/geoserver/bm_bike/wfs?service=wfs&version=1.1.0&request=GetFeature&typeName=bm_bike:rt_counting&outputFormat=csv'
EXPORT_PATH = os.path.join(os.path.dirname(__file__), 'public/data.json')
API_TIMEOUT = os.environ.get("API_TIMEOUT", 30)


class BikeCounter(Model):
    """ Contains the counting data, almost mimic the api fields """
    class Meta:
        """ Meta class for peewee db """
        database = db

    gid = TextField(default='')
    device_name = TextField(default='')
    road_nl = TextField(default='')
    road_fr = TextField(default='')
    road_en = TextField(default='')
    descr_nl = TextField(default='')
    descr_fr = TextField(default='')
    descr_en = TextField(default='')
    FID = TextField()

    # Counter
    day_cnt = IntegerField()
    hour_cnt = IntegerField()
    year_cnt = IntegerField()
    year_cnt_delta = IntegerField()

    cnt_time = DateTimeField()

    # Meteo Fields
    precipitation = FloatField(null=True)  # in mm , last 3h
    temperature = FloatField(null=True)  # in c°

    created_date = DateTimeField(default=datetime.now, index=True)
    last_seen_date = DateTimeField(default=datetime.now)

def fetch():
    """ Fetch counter from api and persist it """
    db.connect()
    BikeCounter.create_table(fail_silently=True)

    response = requests.get(API_URL, timeout=API_TIMEOUT)
    w_response = weather_api.get_current(city="Brussels", country="Belgium")
    f = StringIO(response.text.encode('utf8'))
    reader = csv.DictReader(f, delimiter=',')
    for row in reader:
        try:
            last_counter = (
                BikeCounter
                .select()
                .where(BikeCounter.device_name == row['device_name'])
                .order_by(BikeCounter.created_date.desc())
                .get()
            )
        except BikeCounter.DoesNotExist:
            last_counter = None

        delta = 0
        if last_counter:
            ctn_time = datetime.fromtimestamp(time.mktime(time.strptime(row['cnt_time'], "%Y-%m-%dT%H:%M:%S")))

            delta = int(row['year_cnt']) - last_counter.year_cnt
            if last_counter.cnt_time == ctn_time:
                last_counter.last_seen_date = datetime.now()
                last_counter.save()
                continue
        row['gid'] = row['id']
        del row['id']

        item = BikeCounter.create(
            year_cnt_delta=delta,
            precipitation=w_response.points[-1].precip,
            temperature=w_response.points[-1].temp,
            **row
        )

        item.save()


def fetch_count(start, end):
    """ Fetch the number of cyclist during this period """
    return BikeCounter.select(fn.coalesce(fn.sum(BikeCounter.year_cnt_delta), 0)) \
        .where(BikeCounter.created_date.between(start, end)) \
        .scalar()


def export():
    """ Export all pumped data to file """
    data = {'ts': [], 'hour': {}, 'day': {}, 'week': {}, 'month': {}}
    query = BikeCounter.select(fn.Unix_Timestamp(BikeCounter.created_date).alias('tick'), BikeCounter.year_cnt_delta)
    today = datetime.now()
    # Put im Time Serie
    for row in query:
        data['ts'].append([row.tick * 1000, row.year_cnt_delta])

    # TODO: WROOOONG check last_seen_date TOO
    data['hour']['counter'] = BikeCounter.select(
        BikeCounter.hour_cnt).order_by(BikeCounter.created_date.desc()).scalar()

    old_counter = fetch_count(datetime.now() - timedelta(hours=2), datetime.now() - timedelta(hours=1))
    new_counter = fetch_count(datetime.now() - timedelta(hours=1), datetime.now())
    if old_counter == 0:
        trend = 0
    else:
        trend = ((new_counter - old_counter) / old_counter) * 100
    data['hour']['trend'] = int(trend)

    data['day']['counter'] = BikeCounter.select(
        BikeCounter.day_cnt).order_by(BikeCounter.created_date.desc()).scalar()
    old_counter = fetch_count(datetime.now() - timedelta(days=2), datetime.now() - timedelta(days=1))
    new_counter = fetch_count(datetime.now() - timedelta(days=1), datetime.now())
    if old_counter == 0:
        trend = 0
    else:
        trend = ((new_counter - old_counter) / old_counter) * 100
    data['day']['trend'] = int(trend)

    start_of_week = (today - timedelta(days=today.weekday())).date()
    start_of_month = (today - timedelta(days=today.weekday())).date()

    data['week']['counter'] = int(fetch_count(start_of_week, datetime.now()))
    data['month']['counter'] = int(fetch_count(start_of_month, datetime.now()))
    # Dump it to disk
    with open(EXPORT_PATH, 'w') as outfile:
        json.dump(data, outfile)


if __name__ == "__main__":
    fetch()
    export()
