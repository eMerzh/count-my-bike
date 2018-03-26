# -*- coding: utf-8 -*-

from contextlib import contextmanager
import os

from fabric.api import *
from fabric.contrib.project import rsync_project

# the user to use for the remote commands
env.user = 'server'
# the servers where the commands are executed
env.hosts = ['myserver.net']
env.path = '/home/countMyBike/'
# Sentry Url for release
env.sentry_url = 'https://sentry.io/api/hooks/release/builtin/1212/1212/'
# Gi branch to deploy
env.git_branch = 'HEAD'


def compile_front():
    """ Install deps and compile the frontend code with yarn """
    with lcd('frontend'):
        local('yarn install')
        local('yarn build')
        local('cp -r dist/* ../dist/public/')


def compile_back():
    with lcd('backend'):
        local('cp main.py ../dist/')
        local('cp env.dist ../dist/')
        local('cp requirements.txt ../dist/')


def sync():
    """ Synchronize project with webserver """

    rsync_project(env.path,
                  exclude=['.git', '.env', '*.pyc', 'venv', 'data.json',
                           '.DS_Store', '.vscode', 'node_modules', 'public/data.json'],
                  local_dir='dist/')


def register_deployment():
    """ Register the deployement at sentry """

    if env.sentry_url:
        last_revision = local('git rev-parse {}'.format(env.git_branch), capture=True)
        local("""curl {0} \
               -X POST \
               -H "Content-Type: application/json" \
               -d '{{"version": "{1}"}}'
              """.format(env.sentry_url, last_revision)
              )


def save_current_revision():
    last_revision = local('git rev-parse {}'.format(env.git_branch), capture=True)
    local('echo {} > dist/revision.txt'.format(last_revision))


def pack():
    local('mkdir -p dist/public')
    execute(compile_front)
    execute(compile_back)


def install_requirements():
    with virtualenv():
        run('pip install -r requirements.txt')


def deploy():
    pack()
    execute(sync)
    install_requirements()
    register_deployment()
    # cleanup
    local('rm -r dist/')


def run_crawl():
    with virtualenv():
        run('python main.py')


@contextmanager
def local_virtualenv():
    activate = 'source venv/bin/activate'
    with prefix(activate):
        yield


@contextmanager
def virtualenv():
    activate = 'source {}/bin/activate'.format(os.path.join(env.path, 'venv'))
    with cd(env.path):
        with prefix(activate):
            yield
